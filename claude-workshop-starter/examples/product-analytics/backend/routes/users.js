/**
 * Users API Routes
 *
 * Handles user management, profile operations, and user journey tracking.
 * Users are the core entity in the analytics system.
 */

const express = require('express');
const JourneyMapper = require('../analytics/journey-mapper');

/**
 * Creates and configures the users router
 * @param {Database} db - Database instance
 * @returns {express.Router} Configured Express router
 */
module.exports = function(db) {
  const router = express.Router();

  // Initialize journey mapper for user journey tracking
  const journeyMapper = new JourneyMapper(db);

  /**
   * POST /api/users
   *
   * Create a new user or update existing user
   *
   * Request body:
   * {
   *   id: string (required) - Unique user identifier
   *   email: string (optional) - User email
   *   name: string (optional) - User name
   *   properties: object (optional) - Custom user properties
   *   cohort_id: string (optional) - Cohort assignment
   * }
   *
   * Response: { success: true, user: {...} }
   */
  router.post('/', async (req, res) => {
    try {
      const {
        id,
        email,
        name,
        properties = {},
        cohort_id
      } = req.body;

      // Validation
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'User id is required'
        });
      }

      // Check if user already exists
      const existingUser = await db.getUser(id);

      if (existingUser) {
        // Update existing user
        const updateFields = [];
        const updateParams = [];

        if (email !== undefined) {
          updateFields.push('email = ?');
          updateParams.push(email);
        }

        if (name !== undefined) {
          updateFields.push('name = ?');
          updateParams.push(name);
        }

        if (Object.keys(properties).length > 0) {
          // Merge properties
          const mergedProperties = {
            ...existingUser.properties,
            ...properties
          };
          updateFields.push('properties = ?');
          updateParams.push(JSON.stringify(mergedProperties));
        }

        if (cohort_id !== undefined) {
          updateFields.push('cohort_id = ?');
          updateParams.push(cohort_id);
        }

        if (updateFields.length > 0) {
          updateParams.push(id);
          await db.run(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateParams
          );
        }

        // Get updated user
        const user = await db.getUser(id);
        res.json({
          success: true,
          user: user,
          updated: true
        });

      } else {
        // Create new user
        await db.createUser({
          id,
          email,
          name,
          properties,
          cohort_id
        });

        const user = await db.getUser(id);
        res.json({
          success: true,
          user: user,
          created: true
        });
      }

    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create/update user',
        message: error.message
      });
    }
  });

  /**
   * GET /api/users/:id
   *
   * Get detailed user information including activity summary
   *
   * Path parameters:
   * - id: User ID
   *
   * Query parameters:
   * - include_events: Include recent events (true/false, default: false)
   * - event_limit: Number of recent events to include (default: 10)
   *
   * Response: {
   *   success: true,
   *   user: {
   *     id, email, name, created_at, last_seen, properties, cohort_id,
   *     stats: {
   *       total_events: number,
   *       first_event: timestamp,
   *       last_event: timestamp,
   *       session_count: number
   *     },
   *     recent_events: [...] (if requested)
   *   }
   * }
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        include_events = 'false',
        event_limit = 10
      } = req.query;

      // Get user
      const user = await db.getUser(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get user statistics
      const statsQuery = await db.get(
        `SELECT
          COUNT(*) as total_events,
          MIN(timestamp) as first_event,
          MAX(timestamp) as last_event,
          COUNT(DISTINCT session_id) as session_count
         FROM events
         WHERE user_id = ?`,
        [id]
      );

      const stats = {
        total_events: statsQuery.total_events,
        first_event: statsQuery.first_event,
        last_event: statsQuery.last_event,
        session_count: statsQuery.session_count
      };

      // Get recent events if requested
      let recentEvents;
      if (include_events === 'true') {
        const events = await db.all(
          `SELECT * FROM events
           WHERE user_id = ?
           ORDER BY timestamp DESC
           LIMIT ?`,
          [id, parseInt(event_limit)]
        );

        recentEvents = events.map(event => ({
          ...event,
          properties: event.properties ? JSON.parse(event.properties) : {}
        }));
      }

      // Get cohort information if user has one
      let cohort;
      if (user.cohort_id) {
        cohort = await db.get(
          'SELECT id, name, description FROM cohorts WHERE id = ?',
          [user.cohort_id]
        );
      }

      res.json({
        success: true,
        user: {
          ...user,
          stats: stats,
          cohort: cohort || undefined,
          recent_events: recentEvents || undefined
        }
      });

    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user',
        message: error.message
      });
    }
  });

  /**
   * GET /api/users/:id/journey
   *
   * Get the complete journey/timeline for a specific user
   *
   * Path parameters:
   * - id: User ID
   *
   * Query parameters:
   * - start_date: Start date (ISO format)
   * - end_date: End date (ISO format)
   * - group_by_session: Group events by session (true/false, default: true)
   *
   * Response: {
   *   success: true,
   *   journey: {
   *     user_id,
   *     total_events: number,
   *     date_range: {start, end},
   *     sessions: [{
   *       session_id,
   *       start_time,
   *       end_time,
   *       duration_minutes,
   *       event_count,
   *       events: [...]
   *     }] OR events: [...] (if not grouped by session)
   *   }
   * }
   */
  router.get('/:id/journey', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        start_date,
        end_date,
        group_by_session = 'true'
      } = req.query;

      // Verify user exists
      const user = await db.getUser(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Build query
      let sql = 'SELECT * FROM events WHERE user_id = ?';
      const params = [id];

      if (start_date) {
        sql += ' AND timestamp >= ?';
        params.push(start_date);
      }

      if (end_date) {
        sql += ' AND timestamp <= ?';
        params.push(end_date);
      }

      sql += ' ORDER BY timestamp ASC';

      // Get all events for the user
      const events = await db.all(sql, params);

      // Parse properties
      const parsedEvents = events.map(event => ({
        ...event,
        properties: event.properties ? JSON.parse(event.properties) : {}
      }));

      // Group by session if requested
      let journeyData;
      if (group_by_session === 'true') {
        const sessions = {};

        parsedEvents.forEach(event => {
          const sessionId = event.session_id || 'no_session';
          if (!sessions[sessionId]) {
            sessions[sessionId] = {
              session_id: sessionId,
              events: [],
              start_time: event.timestamp,
              end_time: event.timestamp
            };
          }
          sessions[sessionId].events.push(event);
          sessions[sessionId].end_time = event.timestamp;
        });

        // Calculate session durations
        const sessionArray = Object.values(sessions).map(session => {
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);
          const durationMinutes = (endTime - startTime) / (1000 * 60);

          return {
            session_id: session.session_id,
            start_time: session.start_time,
            end_time: session.end_time,
            duration_minutes: Math.round(durationMinutes * 100) / 100,
            event_count: session.events.length,
            events: session.events
          };
        });

        journeyData = {
          sessions: sessionArray,
          total_sessions: sessionArray.length
        };
      } else {
        journeyData = {
          events: parsedEvents
        };
      }

      res.json({
        success: true,
        journey: {
          user_id: id,
          total_events: parsedEvents.length,
          date_range: {
            start: parsedEvents[0]?.timestamp || null,
            end: parsedEvents[parsedEvents.length - 1]?.timestamp || null
          },
          ...journeyData
        }
      });

    } catch (error) {
      console.error('Error fetching user journey:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user journey',
        message: error.message
      });
    }
  });

  /**
   * GET /api/users
   *
   * List users with filters and pagination
   *
   * Query parameters:
   * - cohort_id: Filter by cohort
   * - created_after: Filter users created after date (ISO format)
   * - created_before: Filter users created before date (ISO format)
   * - active_since: Filter users active since date (ISO format)
   * - limit: Maximum number of results (default: 50, max: 1000)
   * - offset: Pagination offset (default: 0)
   * - sort: Sort field (created_at, last_seen, default: created_at)
   * - order: Sort order (asc, desc, default: desc)
   * - include_stats: Include user statistics (true/false, default: false)
   *
   * Response: {
   *   success: true,
   *   users: [...],
   *   count: number,
   *   total: number,
   *   offset: number,
   *   limit: number
   * }
   */
  router.get('/', async (req, res) => {
    try {
      const {
        cohort_id,
        created_after,
        created_before,
        active_since,
        limit = 50,
        offset = 0,
        sort = 'created_at',
        order = 'desc',
        include_stats = 'false'
      } = req.query;

      // Validate and sanitize parameters
      const parsedLimit = Math.min(parseInt(limit) || 50, 1000);
      const parsedOffset = parseInt(offset) || 0;
      const sortField = ['created_at', 'last_seen'].includes(sort) ? sort : 'created_at';
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

      // Build query
      let sql = 'SELECT * FROM users WHERE 1=1';
      const params = [];

      if (cohort_id) {
        sql += ' AND cohort_id = ?';
        params.push(cohort_id);
      }

      if (created_after) {
        sql += ' AND created_at >= ?';
        params.push(created_after);
      }

      if (created_before) {
        sql += ' AND created_at <= ?';
        params.push(created_before);
      }

      if (active_since) {
        sql += ' AND last_seen >= ?';
        params.push(active_since);
      }

      // Get total count
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
      const countResult = await db.get(countSql, params);
      const total = countResult.count;

      // Add sorting and pagination
      sql += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
      params.push(parsedLimit, parsedOffset);

      // Execute query
      const users = await db.all(sql, params);

      // Parse properties
      const parsedUsers = users.map(user => ({
        ...user,
        properties: user.properties ? JSON.parse(user.properties) : {}
      }));

      // Include stats if requested
      if (include_stats === 'true') {
        for (const user of parsedUsers) {
          const stats = await db.get(
            `SELECT
              COUNT(*) as total_events,
              COUNT(DISTINCT session_id) as session_count,
              MIN(timestamp) as first_event,
              MAX(timestamp) as last_event
             FROM events
             WHERE user_id = ?`,
            [user.id]
          );
          user.stats = stats;
        }
      }

      res.json({
        success: true,
        users: parsedUsers,
        count: parsedUsers.length,
        total: total,
        offset: parsedOffset,
        limit: parsedLimit
      });

    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list users',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/users/:id
   *
   * Delete a user and all associated data (GDPR compliance)
   *
   * Path parameters:
   * - id: User ID
   *
   * Response: { success: true, deleted: true }
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Verify user exists
      const user = await db.getUser(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Delete user events
      await db.run('DELETE FROM events WHERE user_id = ?', [id]);

      // Delete experiment assignments
      await db.run('DELETE FROM experiment_assignments WHERE user_id = ?', [id]);

      // Delete user
      await db.run('DELETE FROM users WHERE id = ?', [id]);

      res.json({
        success: true,
        deleted: true,
        user_id: id
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user',
        message: error.message
      });
    }
  });

  /**
   * PATCH /api/users/:id/properties
   *
   * Update user properties (merge with existing)
   *
   * Path parameters:
   * - id: User ID
   *
   * Request body:
   * {
   *   properties: object - Properties to merge
   * }
   *
   * Response: { success: true, user: {...} }
   */
  router.patch('/:id/properties', async (req, res) => {
    try {
      const { id } = req.params;
      const { properties } = req.body;

      if (!properties || typeof properties !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'properties object is required'
        });
      }

      // Get existing user
      const user = await db.getUser(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Merge properties
      const mergedProperties = {
        ...user.properties,
        ...properties
      };

      // Update user
      await db.run(
        'UPDATE users SET properties = ? WHERE id = ?',
        [JSON.stringify(mergedProperties), id]
      );

      // Get updated user
      const updatedUser = await db.getUser(id);

      res.json({
        success: true,
        user: updatedUser
      });

    } catch (error) {
      console.error('Error updating user properties:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user properties',
        message: error.message
      });
    }
  });

  return router;
};
