/**
 * Routes Index
 *
 * Exports all route modules for easy import in the main server file.
 * Each route module is a factory function that takes the database instance
 * and returns a configured Express router.
 */

const eventsRouter = require('./events');
const analyticsRouter = require('./analytics');
const usersRouter = require('./users');

/**
 * Initialize all routes with the database instance
 * @param {Database} db - Database instance
 * @returns {Object} Object containing all configured routers
 */
function initializeRoutes(db) {
  return {
    events: eventsRouter(db),
    analytics: analyticsRouter(db),
    users: usersRouter(db)
  };
}

module.exports = {
  initializeRoutes,
  eventsRouter,
  analyticsRouter,
  usersRouter
};
