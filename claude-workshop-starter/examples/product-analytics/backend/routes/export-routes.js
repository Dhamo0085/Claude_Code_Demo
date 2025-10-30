/**
 * Export Routes for Product Analytics
 * REST API endpoints for data export functionality
 */

const express = require('express');
const router = express.Router();
const ExportUtility = require('../utils/export');

// Initialize export utility
// Note: In production, inject database instance via middleware or dependency injection
let exportUtility;

function initializeExporter(database) {
  exportUtility = new ExportUtility(database);
  return exportUtility;
}

// Middleware to ensure exporter is initialized
function ensureExporter(req, res, next) {
  if (!exportUtility) {
    return res.status(500).json({
      error: 'Export utility not initialized',
      message: 'Please initialize the export utility with a database instance'
    });
  }
  next();
}

// ==================== CSV Export Endpoints ====================

/**
 * GET /api/export/events/csv
 * Export events to CSV format
 * Query params: startDate, endDate, eventName, userId, deviceType, country
 */
router.get('/events/csv', ensureExporter, async (req, res) => {
  try {
    const { startDate, endDate, eventName, userId, deviceType, country } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'startDate and endDate are required'
      });
    }

    const filters = {};
    if (eventName) filters.eventName = eventName;
    if (userId) filters.userId = userId;
    if (deviceType) filters.deviceType = deviceType;
    if (country) filters.country = country;

    const csv = await exportUtility.exportEventsToCSV(startDate, endDate, filters);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="events_${startDate}_${endDate}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export events CSV error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * GET /api/export/users/csv
 * Export users to CSV format
 * Query params: cohortId, createdAfter, lastSeenAfter
 */
router.get('/users/csv', ensureExporter, async (req, res) => {
  try {
    const { cohortId, createdAfter, lastSeenAfter } = req.query;

    const filters = {};
    if (cohortId) filters.cohortId = cohortId;
    if (createdAfter) filters.createdAfter = createdAfter;
    if (lastSeenAfter) filters.lastSeenAfter = lastSeenAfter;

    const csv = await exportUtility.exportUsersToCSV(filters);

    const timestamp = new Date().toISOString().split('T')[0];
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="users_${timestamp}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export users CSV error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * GET /api/export/reports/:reportType/csv
 * Export analytics report to CSV
 * Params: reportType (daily_activity, event_summary, user_engagement)
 * Query params: startDate, endDate
 */
router.get('/reports/:reportType/csv', ensureExporter, async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate } = req.query;

    const validReportTypes = ['daily_activity', 'event_summary', 'user_engagement'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        error: 'Invalid report type',
        message: `Report type must be one of: ${validReportTypes.join(', ')}`
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'startDate and endDate are required'
      });
    }

    const csv = await exportUtility.exportAnalyticsReport(reportType, { startDate, endDate });

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${reportType}_${startDate}_${endDate}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export report CSV error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

// ==================== JSON Export Endpoints ====================

/**
 * GET /api/export/json/:dataType
 * Export data to JSON format
 * Params: dataType (events, users, analytics, cohorts)
 * Query params: vary by dataType
 */
router.get('/json/:dataType', ensureExporter, async (req, res) => {
  try {
    const { dataType } = req.params;
    const filters = req.query;

    const validDataTypes = ['events', 'users', 'analytics', 'cohorts'];
    if (!validDataTypes.includes(dataType)) {
      return res.status(400).json({
        error: 'Invalid data type',
        message: `Data type must be one of: ${validDataTypes.join(', ')}`
      });
    }

    const jsonData = await exportUtility.exportToJSON(dataType, filters);

    res.json(jsonData);
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

// ==================== Investor Report Endpoints ====================

/**
 * GET /api/export/investor-report
 * Generate comprehensive investor report in HTML format
 * Query params: startDate, endDate
 */
router.get('/investor-report', ensureExporter, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'startDate and endDate are required'
      });
    }

    const html = await exportUtility.generateInvestorReport(startDate, endDate);

    res.header('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Generate investor report error:', error);
    res.status(500).json({
      error: 'Report generation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/export/investor-report/download
 * Download investor report as HTML file
 * Query params: startDate, endDate
 */
router.get('/investor-report/download', ensureExporter, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'startDate and endDate are required'
      });
    }

    const html = await exportUtility.generateInvestorReport(startDate, endDate);

    res.header('Content-Type', 'text/html; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="investor_report_${startDate}_${endDate}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Download investor report error:', error);
    res.status(500).json({
      error: 'Report download failed',
      message: error.message
    });
  }
});

// ==================== Excel Export Endpoints ====================

/**
 * GET /api/export/excel
 * Export data in Excel-compatible format (multiple CSV sheets)
 * Query params: startDate, endDate
 */
router.get('/excel', ensureExporter, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'startDate and endDate are required'
      });
    }

    const sheets = await exportUtility.exportToExcel(startDate, endDate);

    // Return as JSON with sheet names and data
    // In production, you might want to use a library like 'xlsx' to generate actual Excel files
    res.json({
      exportDate: new Date().toISOString(),
      dateRange: { startDate, endDate },
      sheets: Object.keys(sheets),
      note: 'Import each sheet into Excel as a separate CSV file',
      data: sheets
    });
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * GET /api/export/excel/:sheetName
 * Download specific Excel sheet as CSV
 * Params: sheetName
 * Query params: startDate, endDate
 */
router.get('/excel/:sheetName', ensureExporter, async (req, res) => {
  try {
    const { sheetName } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'startDate and endDate are required'
      });
    }

    const sheets = await exportUtility.exportToExcel(startDate, endDate);

    if (!sheets[sheetName]) {
      return res.status(404).json({
        error: 'Sheet not found',
        message: `Available sheets: ${Object.keys(sheets).join(', ')}`
      });
    }

    const sanitizedName = sheetName.toLowerCase().replace(/\s+/g, '_');
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${sanitizedName}_${startDate}_${endDate}.csv"`);
    res.send(sheets[sheetName]);
  } catch (error) {
    console.error('Export Excel sheet error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

// ==================== Utility Endpoints ====================

/**
 * GET /api/export/formats
 * List available export formats and endpoints
 */
router.get('/formats', (req, res) => {
  res.json({
    formats: {
      csv: {
        description: 'Comma-separated values format for spreadsheets',
        endpoints: [
          'GET /api/export/events/csv',
          'GET /api/export/users/csv',
          'GET /api/export/reports/:reportType/csv'
        ]
      },
      json: {
        description: 'JSON format for API integrations',
        endpoints: [
          'GET /api/export/json/:dataType'
        ]
      },
      html: {
        description: 'HTML investor reports (convertible to PDF)',
        endpoints: [
          'GET /api/export/investor-report',
          'GET /api/export/investor-report/download'
        ]
      },
      excel: {
        description: 'Excel-compatible multi-sheet exports',
        endpoints: [
          'GET /api/export/excel',
          'GET /api/export/excel/:sheetName'
        ]
      }
    },
    reportTypes: [
      'daily_activity',
      'event_summary',
      'user_engagement'
    ],
    dataTypes: [
      'events',
      'users',
      'analytics',
      'cohorts'
    ]
  });
});

/**
 * POST /api/export/custom
 * Create custom export with specific configuration
 * Body: { format, dataType, filters, options }
 */
router.post('/custom', ensureExporter, async (req, res) => {
  try {
    const { format, dataType, filters = {}, options = {} } = req.body;

    if (!format || !dataType) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'format and dataType are required'
      });
    }

    let result;

    switch (format.toLowerCase()) {
      case 'csv':
        if (dataType === 'events') {
          result = await exportUtility.exportEventsToCSV(
            filters.startDate,
            filters.endDate,
            filters
          );
          res.header('Content-Type', 'text/csv');
        } else if (dataType === 'users') {
          result = await exportUtility.exportUsersToCSV(filters);
          res.header('Content-Type', 'text/csv');
        }
        break;

      case 'json':
        result = await exportUtility.exportToJSON(dataType, filters);
        res.header('Content-Type', 'application/json');
        break;

      default:
        return res.status(400).json({
          error: 'Unsupported format',
          message: 'Supported formats: csv, json'
        });
    }

    res.send(result);
  } catch (error) {
    console.error('Custom export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

// ==================== Health Check ====================

/**
 * GET /api/export/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    exportUtility: exportUtility ? 'initialized' : 'not initialized',
    timestamp: new Date().toISOString()
  });
});

// Export router and initialization function
module.exports = {
  router,
  initializeExporter
};
