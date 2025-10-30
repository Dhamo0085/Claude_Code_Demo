/**
 * Integration Example
 * Shows how to integrate the Export Utility into your Express application
 */

const express = require('express');
const Database = require('../database');
const { router: exportRouter, initializeExporter } = require('../routes/export-routes');

// ==================== Basic Integration ====================

async function setupBasicIntegration() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database
  const db = new Database('./analytics.db');
  await db.initialize();

  // Initialize export utility with database
  initializeExporter(db);

  // Mount export routes
  app.use('/api/export', exportRouter);

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Export endpoints available at http://localhost:${PORT}/api/export`);
  });

  return app;
}

// ==================== Advanced Integration with Authentication ====================

async function setupAdvancedIntegration() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS configuration (if needed)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // Initialize database
  const db = new Database('./analytics.db');
  await db.initialize();

  // Initialize export utility
  initializeExporter(db);

  // Authentication middleware (example)
  const authenticateExport = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    // In production, validate against database or env variable
    if (!apiKey || apiKey !== process.env.EXPORT_API_KEY) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid API key required for export operations'
      });
    }

    next();
  };

  // Apply authentication to export routes
  app.use('/api/export', authenticateExport, exportRouter);

  // Rate limiting for exports (prevent abuse)
  const rateLimit = {};
  const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10;

    if (!rateLimit[ip]) {
      rateLimit[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    if (now > rateLimit[ip].resetTime) {
      rateLimit[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    if (rateLimit[ip].count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    rateLimit[ip].count++;
    next();
  };

  app.use('/api/export', rateLimitMiddleware);

  // Logging middleware for exports
  app.use('/api/export', (req, res, next) => {
    console.log(`[EXPORT] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log(`[EXPORT] User: ${req.headers['x-user-id'] || 'anonymous'}`);
    console.log(`[EXPORT] Query:`, req.query);
    next();
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Export endpoints available at http://localhost:${PORT}/api/export`);
  });

  return app;
}

// ==================== Frontend Integration Examples ====================

/**
 * Example: Download investor report button (vanilla JavaScript)
 */
function frontendExample_DownloadReport() {
  const code = `
<!-- HTML -->
<button id="downloadReportBtn">Download Investor Report</button>

<script>
document.getElementById('downloadReportBtn').addEventListener('click', async () => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-10-31';

    const response = await fetch(
      \`/api/export/investor-report/download?startDate=\${startDate}&endDate=\${endDate}\`,
      {
        headers: {
          'X-API-Key': 'your-api-key-here'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`investor_report_\${startDate}_\${endDate}.html\`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    alert('Report downloaded successfully!');
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download report');
  }
});
</script>
  `.trim();

  return code;
}

/**
 * Example: React component for export functionality
 */
function frontendExample_ReactComponent() {
  const code = `
import React, { useState } from 'react';

function ExportPanel() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '2024-10-01',
    endDate: '2024-10-31'
  });

  const exportEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        \`/api/export/events/csv?startDate=\${dateRange.startDate}&endDate=\${dateRange.endDate}\`,
        {
          headers: { 'X-API-Key': process.env.REACT_APP_API_KEY }
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`events_\${dateRange.startDate}_\${dateRange.endDate}.csv\`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const exportInvestorReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        \`/api/export/investor-report/download?startDate=\${dateRange.startDate}&endDate=\${dateRange.endDate}\`,
        {
          headers: { 'X-API-Key': process.env.REACT_APP_API_KEY }
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`investor_report_\${dateRange.startDate}_\${dateRange.endDate}.html\`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsJSON = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        \`/api/export/json/analytics?startDate=\${dateRange.startDate}&endDate=\${dateRange.endDate}\`,
        {
          headers: { 'X-API-Key': process.env.REACT_APP_API_KEY }
        }
      );

      const data = await response.json();
      console.log('Analytics data:', data);
      // Use the data in your application
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-panel">
      <h2>Export Data</h2>

      <div className="date-range">
        <label>
          Start Date:
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </label>
      </div>

      <div className="export-buttons">
        <button onClick={exportEvents} disabled={loading}>
          {loading ? 'Exporting...' : 'Export Events (CSV)'}
        </button>
        <button onClick={exportInvestorReport} disabled={loading}>
          {loading ? 'Generating...' : 'Investor Report (HTML)'}
        </button>
        <button onClick={fetchAnalyticsJSON} disabled={loading}>
          {loading ? 'Loading...' : 'View Analytics (JSON)'}
        </button>
      </div>
    </div>
  );
}

export default ExportPanel;
  `.trim();

  return code;
}

// ==================== API Client Example ====================

/**
 * Example: Node.js API client for exports
 */
class ExportAPIClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async exportEvents(startDate, endDate, filters = {}) {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...filters
    });

    const response = await fetch(`${this.baseUrl}/api/export/events/csv?${params}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.text();
  }

  async exportUsers(filters = {}) {
    const params = new URLSearchParams(filters);

    const response = await fetch(`${this.baseUrl}/api/export/users/csv?${params}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.text();
  }

  async getAnalyticsJSON(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });

    const response = await fetch(`${this.baseUrl}/api/export/json/analytics?${params}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async generateInvestorReport(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });

    const response = await fetch(`${this.baseUrl}/api/export/investor-report?${params}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
    }

    return await response.text();
  }

  async exportExcel(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });

    const response = await fetch(`${this.baseUrl}/api/export/excel?${params}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Usage example
async function useAPIClient() {
  const client = new ExportAPIClient('http://localhost:3000', 'your-api-key');

  // Export events
  const eventsCSV = await client.exportEvents('2024-10-01', '2024-10-31', {
    eventName: 'page_view'
  });
  console.log('Events exported:', eventsCSV);

  // Get analytics JSON
  const analytics = await client.getAnalyticsJSON('2024-10-01', '2024-10-31');
  console.log('Analytics:', analytics);

  // Generate investor report
  const report = await client.generateInvestorReport('2024-10-01', '2024-10-31');
  console.log('Report generated:', report);
}

// ==================== Testing Examples ====================

/**
 * Example: Jest tests for export functionality
 */
function testExample() {
  const code = `
const request = require('supertest');
const app = require('../app'); // Your Express app

describe('Export API', () => {
  const apiKey = process.env.EXPORT_API_KEY;

  describe('GET /api/export/events/csv', () => {
    it('should export events as CSV', async () => {
      const response = await request(app)
        .get('/api/export/events/csv')
        .query({ startDate: '2024-10-01', endDate: '2024-10-31' })
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect('Content-Type', /csv/);

      expect(response.text).toContain('Event ID');
      expect(response.text).toContain('Event Name');
    });

    it('should require date parameters', async () => {
      const response = await request(app)
        .get('/api/export/events/csv')
        .set('X-API-Key', apiKey)
        .expect(400);

      expect(response.body.error).toBe('Missing required parameters');
    });
  });

  describe('GET /api/export/json/analytics', () => {
    it('should return analytics JSON', async () => {
      const response = await request(app)
        .get('/api/export/json/analytics')
        .query({ startDate: '2024-10-01', endDate: '2024-10-31' })
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.dataType).toBe('analytics');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  describe('GET /api/export/investor-report', () => {
    it('should generate HTML investor report', async () => {
      const response = await request(app)
        .get('/api/export/investor-report')
        .query({ startDate: '2024-10-01', endDate: '2024-10-31' })
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('Product Analytics Report');
      expect(response.text).toContain('Executive Summary');
    });
  });
});
  `.trim();

  return code;
}

// ==================== Main Execution ====================

if (require.main === module) {
  console.log('Export Utility Integration Examples');
  console.log('=====================================\n');

  console.log('1. Basic Integration:');
  console.log('   Run: setupBasicIntegration()');
  console.log('');

  console.log('2. Advanced Integration with Auth:');
  console.log('   Run: setupAdvancedIntegration()');
  console.log('');

  console.log('3. Frontend Integration:');
  console.log('   React Component:', frontendExample_ReactComponent());
  console.log('');

  console.log('4. API Client:');
  console.log('   Use ExportAPIClient class');
  console.log('');

  // Uncomment to run:
  // setupBasicIntegration();
  // setupAdvancedIntegration();
}

module.exports = {
  setupBasicIntegration,
  setupAdvancedIntegration,
  ExportAPIClient,
  frontendExample_DownloadReport,
  frontendExample_ReactComponent,
  testExample
};
