// User Journey Mapping Module
// Maps common user paths and sequences

class JourneyMapper {
  constructor(db) {
    this.db = db;
  }

  // Get most common user paths
  async getTopPaths(startEvent = null, maxSteps = 5, limit = 10) {
    // Get all user sessions with event sequences
    let sql = `
      SELECT
        user_id,
        session_id,
        GROUP_CONCAT(event_name, ' -> ') as path,
        COUNT(*) as step_count
      FROM events
    `;

    const params = [];
    if (startEvent) {
      sql += ` WHERE session_id IN (
        SELECT session_id FROM events WHERE event_name = ?
      )`;
      params.push(startEvent);
    }

    sql += `
      GROUP BY user_id, session_id
      HAVING step_count <= ?
      ORDER BY timestamp
    `;
    params.push(maxSteps);

    const sessions = await this.db.all(sql, params);

    // Count path occurrences
    const pathCounts = {};
    for (const session of sessions) {
      const path = session.path;
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    }

    // Sort and return top paths
    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({
        path,
        count,
        percentage: 0 // Will calculate below
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Calculate percentages
    const total = topPaths.reduce((sum, p) => sum + p.count, 0);
    topPaths.forEach(p => {
      p.percentage = Math.round((p.count / total) * 10000) / 100;
    });

    return topPaths;
  }

  // Get detailed session path for a specific user
  async getUserJourney(userId, limit = 100) {
    const events = await this.db.all(
      `SELECT
        event_name,
        timestamp,
        session_id,
        page_url,
        properties
      FROM events
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?`,
      [userId, limit]
    );

    // Parse properties
    events.forEach(event => {
      if (event.properties) {
        try {
          event.properties = JSON.parse(event.properties);
        } catch (e) {
          event.properties = {};
        }
      }
    });

    // Group by session
    const sessions = {};
    for (const event of events) {
      if (!sessions[event.session_id]) {
        sessions[event.session_id] = [];
      }
      sessions[event.session_id].push(event);
    }

    return {
      user_id: userId,
      total_events: events.length,
      sessions: Object.entries(sessions).map(([session_id, events]) => ({
        session_id,
        event_count: events.length,
        events: events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      }))
    };
  }

  // Find conversion paths (paths that lead to a goal event)
  async getConversionPaths(goalEvent, beforeSteps = 5, limit = 10) {
    // Find all sessions that contain the goal event
    const goalSessions = await this.db.all(
      `SELECT DISTINCT session_id FROM events WHERE event_name = ?`,
      [goalEvent]
    );

    const sessionIds = goalSessions.map(s => s.session_id);
    if (sessionIds.length === 0) {
      return [];
    }

    // Get events leading up to the goal for each session
    const paths = {};

    for (const { session_id } of goalSessions) {
      const events = await this.db.all(
        `SELECT event_name, timestamp
         FROM events
         WHERE session_id = ?
         ORDER BY timestamp`,
        [session_id]
      );

      // Find the first occurrence of goal event
      const goalIndex = events.findIndex(e => e.event_name === goalEvent);
      if (goalIndex === -1) continue;

      // Get events before goal
      const beforeEvents = events
        .slice(Math.max(0, goalIndex - beforeSteps), goalIndex)
        .map(e => e.event_name);

      if (beforeEvents.length > 0) {
        const pathKey = beforeEvents.join(' -> ') + ' -> ' + goalEvent;
        paths[pathKey] = (paths[pathKey] || 0) + 1;
      }
    }

    // Sort and format results
    const result = Object.entries(paths)
      .map(([path, count]) => ({
        path,
        count,
        conversion_rate: Math.round((count / sessionIds.length) * 10000) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return result;
  }

  // Get event sequences (what typically happens after an event)
  async getNextEvents(eventName, depth = 3) {
    const result = {
      event: eventName,
      next_events: []
    };

    // Get all sessions with this event
    const sessions = await this.db.all(
      `SELECT DISTINCT session_id FROM events WHERE event_name = ?`,
      [eventName]
    );

    const nextEventCounts = {};

    for (const { session_id } of sessions) {
      const events = await this.db.all(
        `SELECT event_name, timestamp
         FROM events
         WHERE session_id = ?
         ORDER BY timestamp`,
        [session_id]
      );

      // Find occurrences of the target event
      for (let i = 0; i < events.length; i++) {
        if (events[i].event_name === eventName && i < events.length - 1) {
          // Look at next N events
          for (let j = 1; j <= depth && i + j < events.length; j++) {
            const nextEvent = events[i + j].event_name;
            const key = `step_${j}_${nextEvent}`;
            nextEventCounts[key] = (nextEventCounts[key] || 0) + 1;
          }
        }
      }
    }

    // Organize by step
    const stepData = {};
    for (const [key, count] of Object.entries(nextEventCounts)) {
      const [, step, ...eventParts] = key.split('_');
      const event = eventParts.join('_');

      if (!stepData[step]) {
        stepData[step] = [];
      }

      stepData[step].push({ event, count });
    }

    // Format and sort
    for (let i = 1; i <= depth; i++) {
      const step = stepData[i.toString()] || [];
      const sorted = step
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const total = sorted.reduce((sum, e) => sum + e.count, 0);
      result.next_events.push({
        step: i,
        events: sorted.map(e => ({
          event_name: e.event,
          count: e.count,
          percentage: Math.round((e.count / total) * 10000) / 100
        }))
      });
    }

    return result;
  }

  // Get drop-off points (where users stop their journey)
  async getDropOffPoints(minEvents = 2) {
    // Find the last event in each session
    const lastEvents = await this.db.all(`
      SELECT
        e1.event_name,
        COUNT(*) as count
      FROM events e1
      INNER JOIN (
        SELECT session_id, MAX(timestamp) as last_time
        FROM events
        GROUP BY session_id
        HAVING COUNT(*) >= ?
      ) e2 ON e1.session_id = e2.session_id AND e1.timestamp = e2.last_time
      GROUP BY e1.event_name
      ORDER BY count DESC
    `, [minEvents]);

    const total = lastEvents.reduce((sum, e) => sum + e.count, 0);

    return lastEvents.map(e => ({
      event_name: e.event_name,
      drop_off_count: e.count,
      percentage: Math.round((e.count / total) * 10000) / 100
    }));
  }

  // Get session duration statistics
  async getSessionStats() {
    const sessions = await this.db.all(`
      SELECT
        session_id,
        COUNT(*) as event_count,
        (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 24 * 60 as duration_minutes
      FROM events
      GROUP BY session_id
      HAVING event_count > 1
    `);

    if (sessions.length === 0) {
      return {
        avg_duration_minutes: 0,
        avg_events_per_session: 0,
        total_sessions: 0
      };
    }

    const avgDuration = sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length;
    const avgEvents = sessions.reduce((sum, s) => sum + s.event_count, 0) / sessions.length;

    return {
      avg_duration_minutes: Math.round(avgDuration * 100) / 100,
      avg_events_per_session: Math.round(avgEvents * 100) / 100,
      total_sessions: sessions.length
    };
  }
}

module.exports = JourneyMapper;
