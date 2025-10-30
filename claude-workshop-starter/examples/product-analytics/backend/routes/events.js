/**
 * Events API Routes
 *
 * Handles event tracking, ingestion, and querying for product analytics.
 * All events are stored in the events table and linked to users.
 */

const express = require('express');

/**
 * Creates and configures the events router
 * @param {Database} db - Database instance
 * @returns {express.Router} Configured Express router
 */
module.exports = function(db) {
  const router = express.Router();

  /**
   * POST /api/events/track
   *
   * Track a single event for analytics
   *
   * Request body:
   * {
   *   event_name: string (required) - Name of the event (e.g., "page_view", "button_click")
   *   user_id: string (required) - Unique identifier for the user
   *   properties: object (optional) - Custom event properties
   *   session_id: string (optional) - Session identifier
   *   page_url: string (optional) - Current page URL
   *   referrer: string (optional) - Referrer URL
   *   device_type: string (optional) - Device type (mobile, tablet, desktop)
   *   browser: string (optional) - Browser name
   *   country: string (optional) - User country
   *   city: string (optional) - User city
   * }
   *
   * Response: { success: true, event_id: number }
   */
  router.post('/track', async (req, res) => {
    try {
      const {
        event_name,
        user_id,
        properties = {},
        session_id,
        page_url,
        referrer,
        device_type,
        browser,
        country,
        city
      } = req.body;

      // Validation
      if (!event_name || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'event_name and user_id are required'
        });
      }

      // Ensure user exists (create if not)
      await db.getUserOrCreate(user_id, {
        properties: {}
      });

      // Track the event
      const result = await db.trackEvent({
        event_name,
        user_id,
        properties,
        session_id,
        page_url,
        referrer,
        device_type,
        browser,
        country,
        city
      });

      res.json({
        success: true,
        event_id: result.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error tracking event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track event',
        message: error.message
      });
    }
  });

  /**
   * POST /api/events/batch
   *
   * Track multiple events in a single request for efficiency
   *
   * Request body:
   * {
   *   events: [
   *     {
   *       event_name: string,
   *       user_id: string,
   *       properties: object,
   *       // ... other event fields
   *     }
   *   ]
   * }
   *
   * Response: { success: true, tracked_count: number, failed_count: number }
   */
  router.post('/batch', async (req, res) => {
    try {
      const { events } = req.body;

      // Validation
      if (!events || !Array.isArray(events)) {
        return res.status(400).json({
          success: false,
          error: 'events array is required'
        });
      }

      if (events.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'events array cannot be empty'
        });
      }

      if (events.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 100 events per batch request'
        });
      }

      const results = [];
      const errors = [];

      // Track each event
      for (const event of events) {
        try {
          if (!event.event_name || !event.user_id) {
            errors.push({
              event,
              error: 'event_name and user_id are required'
            });
            continue;
          }

          // Ensure user exists
          await db.getUserOrCreate(event.user_id, {
            properties: {}
          });

          // Track the event
          const result = await db.trackEvent(event);
          results.push({ event_id: result.id });

        } catch (error) {
          errors.push({
            event,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        tracked_count: results.length,
        failed_count: errors.length,
        results: results,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      console.error('Error tracking batch events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track batch events',
        message: error.message
      });
    }
  });

  /**
   * GET /api/events
   *
   * Query events with various filters
   *
   * Query parameters:
   * - event_name: Filter by event name
   * - user_id: Filter by user ID
   * - start_date: Start date (ISO format)
   * - end_date: End date (ISO format)
   * - limit: Maximum number of results (default: 100, max: 1000)
   * - offset: Pagination offset (default: 0)
   * - device_type: Filter by device type
   * - country: Filter by country
   *
   * Response: { success: true, events: [...], count: number, total: number }
   */
  router.get('/', async (req, res) => {
    try {
      const {
        event_name,
        user_id,
        start_date,
        end_date,
        limit = 100,
        offset = 0,
        device_type,
        country,
        session_id
      } = req.query;

      // Validate and sanitize limit
      const parsedLimit = Math.min(parseInt(limit) || 100, 1000);
      const parsedOffset = parseInt(offset) || 0;

      // Build query
      let sql = 'SELECT * FROM events WHERE 1=1';
      const params = [];

      if (event_name) {
        sql += ' AND event_name = ?';
        params.push(event_name);
      }

      if (user_id) {
        sql += ' AND user_id = ?';
        params.push(user_id);
      }

      if (device_type) {
        sql += ' AND device_type = ?';
        params.push(device_type);
      }

      if (country) {
        sql += ' AND country = ?';
        params.push(country);
      }

      if (session_id) {
        sql += ' AND session_id = ?';
        params.push(session_id);
      }

      if (start_date) {
        sql += ' AND timestamp >= ?';
        params.push(start_date);
      }

      if (end_date) {
        sql += ' AND timestamp <= ?';
        params.push(end_date);
      }

      // Get total count
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
      const countResult = await db.get(countSql, params);
      const total = countResult.count;

      // Add ordering and pagination
      sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(parsedLimit, parsedOffset);

      // Execute query
      const events = await db.all(sql, params);

      // Parse JSON properties
      const parsedEvents = events.map(event => ({
        ...event,
        properties: event.properties ? JSON.parse(event.properties) : {}
      }));

      res.json({
        success: true,
        events: parsedEvents,
        count: parsedEvents.length,
        total: total,
        offset: parsedOffset,
        limit: parsedLimit
      });

    } catch (error) {
      console.error('Error querying events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to query events',
        message: error.message
      });
    }
  });

  /**
   * GET /api/events/summary
   *
   * Get event summary statistics
   *
   * Query parameters:
   * - start_date: Start date (ISO format)
   * - end_date: End date (ISO format)
   *
   * Response: {
   *   success: true,
   *   summary: {
   *     total_events: number,
   *     unique_users: number,
   *     unique_sessions: number,
   *     top_events: [...],
   *     events_by_device: {...},
   *     events_by_country: {...}
   *   }
   * }
   */
  router.get('/summary', async (req, res) => {
    try {
      const {
        start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date = new Date().toISOString()
      } = req.query;

      // Total events
      const totalEventsResult = await db.get(
        'SELECT COUNT(*) as count FROM events WHERE timestamp BETWEEN ? AND ?',
        [start_date, end_date]
      );
      const totalEvents = totalEventsResult.count;

      // Unique users
      const uniqueUsersResult = await db.get(
        'SELECT COUNT(DISTINCT user_id) as count FROM events WHERE timestamp BETWEEN ? AND ?',
        [start_date, end_date]
      );
      const uniqueUsers = uniqueUsersResult.count;

      // Unique sessions
      const uniqueSessionsResult = await db.get(
        'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE timestamp BETWEEN ? AND ? AND session_id IS NOT NULL',
        [start_date, end_date]
      );
      const uniqueSessions = uniqueSessionsResult.count;

      // Top events
      const topEvents = await db.all(
        `SELECT
          event_name,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
         FROM events
         WHERE timestamp BETWEEN ? AND ?
         GROUP BY event_name
         ORDER BY count DESC
         LIMIT 10`,
        [start_date, end_date]
      );

      // Events by device type
      const eventsByDevice = await db.all(
        `SELECT
          device_type,
          COUNT(*) as count
         FROM events
         WHERE timestamp BETWEEN ? AND ?
         AND device_type IS NOT NULL
         GROUP BY device_type
         ORDER BY count DESC`,
        [start_date, end_date]
      );

      // Events by country
      const eventsByCountry = await db.all(
        `SELECT
          country,
          COUNT(*) as count
         FROM events
         WHERE timestamp BETWEEN ? AND ?
         AND country IS NOT NULL
         GROUP BY country
         ORDER BY count DESC
         LIMIT 10`,
        [start_date, end_date]
      );

      // Events over time (daily)
      const eventsOverTime = await db.all(
        `SELECT
          DATE(timestamp) as date,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
         FROM events
         WHERE timestamp BETWEEN ? AND ?
         GROUP BY DATE(timestamp)
         ORDER BY date ASC`,
        [start_date, end_date]
      );

      res.json({
        success: true,
        summary: {
          total_events: totalEvents,
          unique_users: uniqueUsers,
          unique_sessions: uniqueSessions,
          date_range: {
            start: start_date,
            end: end_date
          },
          top_events: topEvents,
          events_by_device: eventsByDevice.reduce((acc, item) => {
            acc[item.device_type] = item.count;
            return acc;
          }, {}),
          events_by_country: eventsByCountry.reduce((acc, item) => {
            acc[item.country] = item.count;
            return acc;
          }, {}),
          events_over_time: eventsOverTime
        }
      });

    } catch (error) {
      console.error('Error generating event summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate event summary',
        message: error.message
      });
    }
  });

  return router;
};
