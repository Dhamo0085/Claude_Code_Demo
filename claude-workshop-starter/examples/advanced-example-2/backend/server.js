const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database('./pilots.db');

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Pilot Program Manager API',
    version: '1.0.0'
  });
});

// API routes
const pilotsRouter = require('./routes/pilots')(db);
const metricsRouter = require('./routes/metrics')(db);
const { router: reportsRouter, initialize: initReports } = require('./routes/reports');

// Initialize reports module with database
initReports(db);

app.use('/api/pilots', pilotsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/reports', reportsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Pilot Program Manager API',
    version: '1.0.0',
    description: 'Backend API for managing B2B pilot programs',
    endpoints: {
      health: '/health',
      pilots: '/api/pilots',
      metrics: '/api/metrics',
      reports: '/api/reports'
    },
    documentation: {
      pilots: {
        'GET /api/pilots': 'List all pilots',
        'GET /api/pilots/:id': 'Get single pilot with details',
        'POST /api/pilots': 'Create new pilot',
        'PUT /api/pilots/:id': 'Update pilot',
        'DELETE /api/pilots/:id': 'Delete pilot',
        'POST /api/pilots/:id/success-criteria': 'Add success criteria',
        'PUT /api/pilots/success-criteria/:id': 'Update success criteria',
        'POST /api/pilots/:id/stakeholders': 'Add stakeholder',
        'GET /api/pilots/:id/calculate': 'Recalculate metrics'
      },
      metrics: {
        'GET /api/metrics/:pilotId': 'Get all metrics for pilot',
        'GET /api/metrics/:pilotId/type/:type': 'Get metrics by type',
        'POST /api/metrics': 'Add new metric',
        'POST /api/metrics/batch': 'Add multiple metrics',
        'GET /api/metrics/:pilotId/calculate': 'Calculate health score',
        'GET /api/metrics/:pilotId/summary': 'Get metrics summary',
        'DELETE /api/metrics/:id': 'Delete metric'
      },
      reports: {
        'GET /api/reports/executive': 'Executive summary report',
        'GET /api/reports/pipeline': 'Pipeline analysis',
        'GET /api/reports/conversion-forecast': 'Revenue forecast',
        'GET /api/reports/pilot/:id/prediction': 'Conversion prediction',
        'GET /api/reports/pilot/:id/value-analysis': 'Financial value analysis',
        'GET /api/reports/stakeholder-updates/:pilotId/weekly': 'Weekly update',
        'GET /api/reports/stakeholder-updates/:pilotId/progress': 'Progress report',
        'GET /api/reports/analytics/overview': 'Analytics overview',
        'GET /api/reports/export/csv': 'Export pilots to CSV',
        'GET /api/reports/export/detailed-csv': 'Export detailed CSV',
        'GET /api/reports/export/json': 'Export to JSON',
        'GET /api/reports/export/pdf': 'Export PDF report'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await db.initialize();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log(`  Pilot Program Manager API Server`);
      console.log('='.repeat(60));
      console.log(`  Server running on: http://localhost:${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
      console.log(`  API Documentation: http://localhost:${PORT}`);
      console.log('='.repeat(60));
      console.log('');
      console.log('Available endpoints:');
      console.log(`  Pilots:`);
      console.log(`    - GET    /api/pilots`);
      console.log(`    - GET    /api/pilots/:id`);
      console.log(`    - POST   /api/pilots`);
      console.log(`    - PUT    /api/pilots/:id`);
      console.log(`  Metrics:`);
      console.log(`    - GET    /api/metrics/:pilotId`);
      console.log(`    - POST   /api/metrics`);
      console.log(`  Reports & Analytics:`);
      console.log(`    - GET    /api/reports/executive`);
      console.log(`    - GET    /api/reports/pipeline`);
      console.log(`    - GET    /api/reports/conversion-forecast`);
      console.log(`    - GET    /api/reports/export/csv`);
      console.log('');
      console.log('Ready to accept requests!');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await db.close();
  process.exit(0);
});

// Start the server
startServer();

// Export for testing
module.exports = app;
