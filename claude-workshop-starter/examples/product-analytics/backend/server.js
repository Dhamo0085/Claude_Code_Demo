const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import database and analytics modules
const Database = require('./database');
const FunnelAnalyzer = require('./analytics/funnel-analyzer');
const CohortRetention = require('./analytics/cohort-retention');
const JourneyMapper = require('./analytics/journey-mapper');
const FeatureAdoption = require('./analytics/feature-adoption');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database and analytics modules
const db = new Database('./analytics.db');
let funnelAnalyzer;
let cohortRetention;
let journeyMapper;
let featureAdoption;

// Initialize database
async function initializeDatabase() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');

    // Initialize analytics modules
    funnelAnalyzer = new FunnelAnalyzer(db);
    cohortRetention = new CohortRetention(db);
    journeyMapper = new JourneyMapper(db);
    featureAdoption = new FeatureAdoption(db);

    console.log('Analytics modules initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// Root endpoint - API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Product Analytics API',
    version: '1.0.0',
    description: 'Analytics platform with event tracking, funnels, cohorts, and experiments',
    endpoints: {
      health: 'GET /health',
      events: {
        track: 'POST /api/events/track',
        query: 'GET /api/events?start_date=&end_date=&event_name=',
        count: 'GET /api/events/count?event_name=&start_date=&end_date='
      },
      users: {
        create: 'POST /api/users',
        get: 'GET /api/users/:userId',
        list: 'GET /api/users',
        stats: 'GET /api/users/stats'
      },
      funnels: {
        analyze: 'POST /api/funnels/analyze',
        list: 'GET /api/funnels',
        create: 'POST /api/funnels',
        timings: 'POST /api/funnels/timings',
        breakdown: 'POST /api/funnels/breakdown'
      },
      retention: {
        analyze: 'GET /api/retention?cohort_size=week&periods=12',
        dayN: 'GET /api/retention/day-n?days=1,7,30',
        churn: 'GET /api/retention/churn?period=month',
        segmented: 'GET /api/retention/segmented?property=plan'
      },
      journeys: {
        topPaths: 'GET /api/journeys/top-paths?max_steps=5&limit=10',
        userJourney: 'GET /api/journeys/user/:userId',
        conversionPaths: 'GET /api/journeys/conversion-paths?goal_event=purchase',
        nextEvents: 'GET /api/journeys/next-events?event_name=page_view',
        dropOffs: 'GET /api/journeys/drop-offs',
        sessionStats: 'GET /api/journeys/session-stats'
      },
      features: {
        adoption: 'GET /api/features/adoption?event=&start_date=&end_date=',
        cumulative: 'GET /api/features/cumulative?event=&launch_date=',
        stickiness: 'GET /api/features/stickiness?event=&date=',
        powerUsers: 'GET /api/features/power-users?event=&start_date=&end_date=',
        distribution: 'GET /api/features/distribution?event=&start_date=&end_date=',
        cohortComparison: 'GET /api/features/cohort-comparison?event=',
        timeToAdoption: 'GET /api/features/time-to-adoption?event='
      },
      cohorts: {
        list: 'GET /api/cohorts',
        create: 'POST /api/cohorts',
        get: 'GET /api/cohorts/:cohortId'
      },
      experiments: {
        list: 'GET /api/experiments',
        create: 'POST /api/experiments',
        get: 'GET /api/experiments/:experimentId',
        assign: 'POST /api/experiments/:experimentId/assign',
        results: 'GET /api/experiments/:experimentId/results'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: db.db ? 'connected' : 'disconnected'
  });
});

// ============================================================================
// EVENT TRACKING ROUTES
// ============================================================================

// Track a new event
app.post('/api/events/track', async (req, res) => {
  try {
    const eventData = req.body;

    // Ensure user exists
    if (eventData.user_id) {
      await db.getUserOrCreate(eventData.user_id, {
        email: eventData.user_email,
        name: eventData.user_name
      });
    }

    const result = await db.trackEvent(eventData);
    res.json({
      success: true,
      event_id: result.id,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Query events
app.get('/api/events', async (req, res) => {
  try {
    const { start_date, end_date, event_name } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required'
      });
    }

    const events = await db.getEventsByTimeRange(start_date, end_date, event_name);
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error querying events:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get event count
app.get('/api/events/count', async (req, res) => {
  try {
    const { event_name, start_date, end_date } = req.query;

    if (!event_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'event_name, start_date, and end_date are required'
      });
    }

    const count = await db.getEventCount(event_name, start_date, end_date);
    res.json({
      success: true,
      event_name,
      count,
      start_date,
      end_date
    });
  } catch (error) {
    console.error('Error counting events:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// USER ROUTES
// ============================================================================

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const result = await db.createUser(req.body);
    res.json({
      success: true,
      user_id: req.body.id,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await db.getUser(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List users
app.get('/api/users', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const users = await db.all(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user statistics
app.get('/api/users/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required'
      });
    }

    const uniqueUsers = await db.getUniqueUsers(start_date, end_date);
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');

    res.json({
      success: true,
      total_users: totalUsers.count,
      active_users: uniqueUsers,
      start_date,
      end_date
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// FUNNEL ROUTES
// ============================================================================

// Analyze funnel
app.post('/api/funnels/analyze', async (req, res) => {
  try {
    const { steps, start_date, end_date, cohort_id } = req.body;

    if (!steps || !Array.isArray(steps) || steps.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'steps must be an array with at least 2 events'
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required'
      });
    }

    const result = await funnelAnalyzer.analyzeFunnel(steps, start_date, end_date, cohort_id);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error analyzing funnel:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get funnel timings
app.post('/api/funnels/timings', async (req, res) => {
  try {
    const { steps, start_date, end_date } = req.body;

    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        error: 'steps must be an array of event names'
      });
    }

    const timings = await funnelAnalyzer.getStepTimings(steps, start_date, end_date);
    res.json({
      success: true,
      timings
    });
  } catch (error) {
    console.error('Error getting funnel timings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get funnel breakdown
app.post('/api/funnels/breakdown', async (req, res) => {
  try {
    const { steps, start_date, end_date, breakdown_property } = req.body;

    if (!breakdown_property) {
      return res.status(400).json({
        success: false,
        error: 'breakdown_property is required (e.g., device_type, country)'
      });
    }

    const breakdown = await funnelAnalyzer.getFunnelBreakdown(
      steps,
      start_date,
      end_date,
      breakdown_property
    );

    res.json({
      success: true,
      breakdown_property,
      data: breakdown
    });
  } catch (error) {
    console.error('Error getting funnel breakdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List saved funnels
app.get('/api/funnels', async (req, res) => {
  try {
    const funnels = await db.all('SELECT * FROM funnels ORDER BY created_at DESC');
    res.json({
      success: true,
      count: funnels.length,
      funnels
    });
  } catch (error) {
    console.error('Error listing funnels:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create saved funnel
app.post('/api/funnels', async (req, res) => {
  try {
    const { name, description, steps, created_by } = req.body;

    const result = await db.run(
      'INSERT INTO funnels (name, description, steps, created_by) VALUES (?, ?, ?, ?)',
      [name, description, JSON.stringify(steps), created_by]
    );

    res.json({
      success: true,
      funnel_id: result.id,
      message: 'Funnel created successfully'
    });
  } catch (error) {
    console.error('Error creating funnel:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// RETENTION ROUTES
// ============================================================================

// Analyze retention
app.get('/api/retention', async (req, res) => {
  try {
    const { cohort_size = 'week', periods = 12 } = req.query;

    const result = await cohortRetention.analyzeRetention(cohort_size, parseInt(periods));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error analyzing retention:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Day N retention
app.get('/api/retention/day-n', async (req, res) => {
  try {
    const { days = '1,7,30' } = req.query;
    const dayArray = days.split(',').map(d => parseInt(d.trim()));

    const result = await cohortRetention.getDayNRetention(dayArray);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting day N retention:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get churn rate
app.get('/api/retention/churn', async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const result = await cohortRetention.getChurnRate(period);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting churn rate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get segmented retention
app.get('/api/retention/segmented', async (req, res) => {
  try {
    const { property, cohort_size = 'week' } = req.query;

    if (!property) {
      return res.status(400).json({
        success: false,
        error: 'property is required (e.g., plan, source)'
      });
    }

    const result = await cohortRetention.getSegmentedRetention(property, cohort_size);
    res.json({
      success: true,
      property,
      data: result
    });
  } catch (error) {
    console.error('Error getting segmented retention:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// JOURNEY ROUTES
// ============================================================================

// Get top user paths
app.get('/api/journeys/top-paths', async (req, res) => {
  try {
    const { start_event, max_steps = 5, limit = 10 } = req.query;

    const paths = await journeyMapper.getTopPaths(
      start_event,
      parseInt(max_steps),
      parseInt(limit)
    );

    res.json({
      success: true,
      count: paths.length,
      paths
    });
  } catch (error) {
    console.error('Error getting top paths:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user journey
app.get('/api/journeys/user/:userId', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const journey = await journeyMapper.getUserJourney(req.params.userId, parseInt(limit));
    res.json({
      success: true,
      data: journey
    });
  } catch (error) {
    console.error('Error getting user journey:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get conversion paths
app.get('/api/journeys/conversion-paths', async (req, res) => {
  try {
    const { goal_event, before_steps = 5, limit = 10 } = req.query;

    if (!goal_event) {
      return res.status(400).json({
        success: false,
        error: 'goal_event is required'
      });
    }

    const paths = await journeyMapper.getConversionPaths(
      goal_event,
      parseInt(before_steps),
      parseInt(limit)
    );

    res.json({
      success: true,
      goal_event,
      paths
    });
  } catch (error) {
    console.error('Error getting conversion paths:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get next events
app.get('/api/journeys/next-events', async (req, res) => {
  try {
    const { event_name, depth = 3 } = req.query;

    if (!event_name) {
      return res.status(400).json({
        success: false,
        error: 'event_name is required'
      });
    }

    const result = await journeyMapper.getNextEvents(event_name, parseInt(depth));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting next events:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get drop-off points
app.get('/api/journeys/drop-offs', async (req, res) => {
  try {
    const { min_events = 2 } = req.query;

    const dropOffs = await journeyMapper.getDropOffPoints(parseInt(min_events));
    res.json({
      success: true,
      drop_offs: dropOffs
    });
  } catch (error) {
    console.error('Error getting drop-offs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get session statistics
app.get('/api/journeys/session-stats', async (req, res) => {
  try {
    const stats = await journeyMapper.getSessionStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting session stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// FEATURE ADOPTION ROUTES
// ============================================================================

// Get feature adoption rate
app.get('/api/features/adoption', async (req, res) => {
  try {
    const { event, start_date, end_date, granularity = 'day' } = req.query;

    if (!event || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'event, start_date, and end_date are required'
      });
    }

    const result = await featureAdoption.getAdoptionRate(
      event,
      start_date,
      end_date,
      granularity
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting adoption rate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get cumulative adoption
app.get('/api/features/cumulative', async (req, res) => {
  try {
    const { event, launch_date } = req.query;

    if (!event || !launch_date) {
      return res.status(400).json({
        success: false,
        error: 'event and launch_date are required'
      });
    }

    const result = await featureAdoption.getCumulativeAdoption(event, launch_date);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting cumulative adoption:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get feature stickiness
app.get('/api/features/stickiness', async (req, res) => {
  try {
    const { event, date } = req.query;

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'event is required'
      });
    }

    const result = await featureAdoption.getFeatureStickiness(event, date);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting feature stickiness:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get power users
app.get('/api/features/power-users', async (req, res) => {
  try {
    const { event, start_date, end_date, min_usage = 10 } = req.query;

    if (!event || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'event, start_date, and end_date are required'
      });
    }

    const users = await featureAdoption.getPowerUsers(
      event,
      start_date,
      end_date,
      parseInt(min_usage)
    );

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error getting power users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get usage distribution
app.get('/api/features/distribution', async (req, res) => {
  try {
    const { event, start_date, end_date } = req.query;

    if (!event || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'event, start_date, and end_date are required'
      });
    }

    const result = await featureAdoption.getUsageDistribution(event, start_date, end_date);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting usage distribution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Compare feature across cohorts
app.get('/api/features/cohort-comparison', async (req, res) => {
  try {
    const { event } = req.query;

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'event is required'
      });
    }

    const result = await featureAdoption.compareFeatureAcrossCohorts(event);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error comparing feature across cohorts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get time to adoption
app.get('/api/features/time-to-adoption', async (req, res) => {
  try {
    const { event, limit = 100 } = req.query;

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'event is required'
      });
    }

    const result = await featureAdoption.getTimeToAdoption(event, parseInt(limit));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting time to adoption:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// COHORT ROUTES
// ============================================================================

// List cohorts
app.get('/api/cohorts', async (req, res) => {
  try {
    const cohorts = await db.all('SELECT * FROM cohorts ORDER BY created_at DESC');
    res.json({
      success: true,
      count: cohorts.length,
      cohorts
    });
  } catch (error) {
    console.error('Error listing cohorts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create cohort
app.post('/api/cohorts', async (req, res) => {
  try {
    const { id, name, description, criteria } = req.body;

    const result = await db.run(
      'INSERT INTO cohorts (id, name, description, criteria) VALUES (?, ?, ?, ?)',
      [id, name, description, JSON.stringify(criteria)]
    );

    res.json({
      success: true,
      cohort_id: id,
      message: 'Cohort created successfully'
    });
  } catch (error) {
    console.error('Error creating cohort:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get cohort by ID
app.get('/api/cohorts/:cohortId', async (req, res) => {
  try {
    const cohort = await db.get('SELECT * FROM cohorts WHERE id = ?', [req.params.cohortId]);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        error: 'Cohort not found'
      });
    }

    // Get users in cohort
    const users = await db.all('SELECT * FROM users WHERE cohort_id = ?', [req.params.cohortId]);

    res.json({
      success: true,
      cohort,
      user_count: users.length,
      users
    });
  } catch (error) {
    console.error('Error getting cohort:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// EXPERIMENT (A/B TEST) ROUTES
// ============================================================================

// List experiments
app.get('/api/experiments', async (req, res) => {
  try {
    const experiments = await db.all('SELECT * FROM experiments ORDER BY created_at DESC');
    res.json({
      success: true,
      count: experiments.length,
      experiments
    });
  } catch (error) {
    console.error('Error listing experiments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create experiment
app.post('/api/experiments', async (req, res) => {
  try {
    const { id, name, description, variants, goal_event, start_date, end_date } = req.body;

    const result = await db.run(
      `INSERT INTO experiments (id, name, description, variants, goal_event, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description, JSON.stringify(variants), goal_event, start_date, end_date]
    );

    res.json({
      success: true,
      experiment_id: id,
      message: 'Experiment created successfully'
    });
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get experiment by ID
app.get('/api/experiments/:experimentId', async (req, res) => {
  try {
    const experiment = await db.get(
      'SELECT * FROM experiments WHERE id = ?',
      [req.params.experimentId]
    );

    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: 'Experiment not found'
      });
    }

    res.json({
      success: true,
      experiment
    });
  } catch (error) {
    console.error('Error getting experiment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Assign user to experiment variant
app.post('/api/experiments/:experimentId/assign', async (req, res) => {
  try {
    const { user_id, variant } = req.body;

    if (!user_id || !variant) {
      return res.status(400).json({
        success: false,
        error: 'user_id and variant are required'
      });
    }

    // Check if already assigned
    const existing = await db.get(
      'SELECT * FROM experiment_assignments WHERE experiment_id = ? AND user_id = ?',
      [req.params.experimentId, user_id]
    );

    if (existing) {
      return res.json({
        success: true,
        variant: existing.variant,
        message: 'User already assigned to variant'
      });
    }

    // Assign to variant
    await db.run(
      'INSERT INTO experiment_assignments (experiment_id, user_id, variant) VALUES (?, ?, ?)',
      [req.params.experimentId, user_id, variant]
    );

    res.json({
      success: true,
      variant,
      message: 'User assigned to variant successfully'
    });
  } catch (error) {
    console.error('Error assigning to experiment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get experiment results
app.get('/api/experiments/:experimentId/results', async (req, res) => {
  try {
    const experiment = await db.get(
      'SELECT * FROM experiments WHERE id = ?',
      [req.params.experimentId]
    );

    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: 'Experiment not found'
      });
    }

    const variants = JSON.parse(experiment.variants);
    const results = [];

    for (const variant of variants) {
      // Get users in this variant
      const assignments = await db.all(
        'SELECT user_id FROM experiment_assignments WHERE experiment_id = ? AND variant = ?',
        [req.params.experimentId, variant]
      );

      const userIds = assignments.map(a => a.user_id);

      if (userIds.length === 0) {
        results.push({
          variant,
          user_count: 0,
          goal_count: 0,
          conversion_rate: 0
        });
        continue;
      }

      // Get goal conversions for this variant
      const conversions = await db.get(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM events
         WHERE event_name = ?
         AND user_id IN (${userIds.map(() => '?').join(',')})
         AND timestamp >= ?`,
        [experiment.goal_event, ...userIds, experiment.start_date]
      );

      const conversionRate = (conversions.count / userIds.length) * 100;

      results.push({
        variant,
        user_count: userIds.length,
        goal_count: conversions.count,
        conversion_rate: Math.round(conversionRate * 100) / 100
      });
    }

    res.json({
      success: true,
      experiment: {
        id: experiment.id,
        name: experiment.name,
        goal_event: experiment.goal_event,
        status: experiment.status
      },
      results
    });
  } catch (error) {
    console.error('Error getting experiment results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================================================
// SERVER STARTUP & SHUTDOWN
// ============================================================================

let server;

async function startServer() {
  try {
    await initializeDatabase();

    server = app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('Product Analytics API Server');
      console.log('='.repeat(60));
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('\nShutting down gracefully...');

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');

      try {
        await db.close();
        console.log('Database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('Error closing database:', error);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

module.exports = app;
