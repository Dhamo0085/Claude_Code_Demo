/**
 * Export Utility Module for Product Analytics
 * Provides comprehensive export functionality for investors and stakeholders
 * Supports CSV, JSON, PDF, and Excel formats
 */

const fs = require('fs');
const path = require('path');

class ExportUtility {
  constructor(database) {
    this.db = database;
  }

  // ==================== CSV Export Methods ====================

  /**
   * Export events to CSV format
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {object} filters - Optional filters { eventName, userId, deviceType, country }
   * @returns {string} CSV formatted string
   */
  async exportEventsToCSV(startDate, endDate, filters = {}) {
    try {
      // Build SQL query based on filters
      let sql = `SELECT
        id,
        event_name,
        user_id,
        timestamp,
        properties,
        session_id,
        page_url,
        referrer,
        device_type,
        browser,
        country,
        city
      FROM events
      WHERE timestamp BETWEEN ? AND ?`;

      const params = [startDate, endDate];

      if (filters.eventName) {
        sql += ' AND event_name = ?';
        params.push(filters.eventName);
      }

      if (filters.userId) {
        sql += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters.deviceType) {
        sql += ' AND device_type = ?';
        params.push(filters.deviceType);
      }

      if (filters.country) {
        sql += ' AND country = ?';
        params.push(filters.country);
      }

      sql += ' ORDER BY timestamp DESC';

      const events = await this.db.all(sql, params);

      // Format CSV with headers
      const headers = [
        'Event ID',
        'Event Name',
        'User ID',
        'Timestamp',
        'Properties',
        'Session ID',
        'Page URL',
        'Referrer',
        'Device Type',
        'Browser',
        'Country',
        'City'
      ];

      let csv = headers.join(',') + '\n';

      // Add data rows
      events.forEach(event => {
        const row = [
          event.id,
          this.escapeCsvField(event.event_name),
          this.escapeCsvField(event.user_id),
          this.formatDateTime(event.timestamp),
          this.escapeCsvField(event.properties || '{}'),
          this.escapeCsvField(event.session_id || ''),
          this.escapeCsvField(event.page_url || ''),
          this.escapeCsvField(event.referrer || ''),
          this.escapeCsvField(event.device_type || ''),
          this.escapeCsvField(event.browser || ''),
          this.escapeCsvField(event.country || ''),
          this.escapeCsvField(event.city || '')
        ];
        csv += row.join(',') + '\n';
      });

      return csv;
    } catch (error) {
      throw new Error(`Failed to export events to CSV: ${error.message}`);
    }
  }

  /**
   * Export users to CSV format
   * @param {object} filters - Optional filters { cohortId, createdAfter, lastSeenAfter }
   * @returns {string} CSV formatted string
   */
  async exportUsersToCSV(filters = {}) {
    try {
      let sql = `SELECT
        id,
        email,
        name,
        created_at,
        last_seen,
        properties,
        cohort_id
      FROM users
      WHERE 1=1`;

      const params = [];

      if (filters.cohortId) {
        sql += ' AND cohort_id = ?';
        params.push(filters.cohortId);
      }

      if (filters.createdAfter) {
        sql += ' AND created_at >= ?';
        params.push(filters.createdAfter);
      }

      if (filters.lastSeenAfter) {
        sql += ' AND last_seen >= ?';
        params.push(filters.lastSeenAfter);
      }

      sql += ' ORDER BY created_at DESC';

      const users = await this.db.all(sql, params);

      // Get event counts for each user
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const eventCount = await this.db.get(
            'SELECT COUNT(*) as count FROM events WHERE user_id = ?',
            [user.id]
          );
          return { ...user, event_count: eventCount.count };
        })
      );

      // Format CSV with headers
      const headers = [
        'User ID',
        'Email',
        'Name',
        'Created At',
        'Last Seen',
        'Total Events',
        'Cohort ID',
        'Properties'
      ];

      let csv = headers.join(',') + '\n';

      // Add data rows
      usersWithStats.forEach(user => {
        const row = [
          this.escapeCsvField(user.id),
          this.escapeCsvField(user.email || ''),
          this.escapeCsvField(user.name || ''),
          this.formatDateTime(user.created_at),
          this.formatDateTime(user.last_seen),
          user.event_count,
          this.escapeCsvField(user.cohort_id || ''),
          this.escapeCsvField(user.properties || '{}')
        ];
        csv += row.join(',') + '\n';
      });

      return csv;
    } catch (error) {
      throw new Error(`Failed to export users to CSV: ${error.message}`);
    }
  }

  /**
   * Export analytics report to CSV
   * @param {string} reportType - Type of report: 'daily_activity', 'event_summary', 'user_engagement'
   * @param {object} options - Report options { startDate, endDate, groupBy }
   * @returns {string} CSV formatted string
   */
  async exportAnalyticsReport(reportType, options = {}) {
    const { startDate, endDate } = options;

    switch (reportType) {
      case 'daily_activity':
        return await this.exportDailyActivityReport(startDate, endDate);

      case 'event_summary':
        return await this.exportEventSummaryReport(startDate, endDate);

      case 'user_engagement':
        return await this.exportUserEngagementReport(startDate, endDate);

      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  async exportDailyActivityReport(startDate, endDate) {
    const sql = `
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as total_sessions
      FROM events
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;

    const data = await this.db.all(sql, [startDate, endDate]);

    const headers = ['Date', 'Total Events', 'Unique Users', 'Total Sessions', 'Avg Events per User'];
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
      const avgEventsPerUser = (row.total_events / row.unique_users).toFixed(2);
      csv += [
        row.date,
        row.total_events,
        row.unique_users,
        row.total_sessions,
        avgEventsPerUser
      ].join(',') + '\n';
    });

    return csv;
  }

  async exportEventSummaryReport(startDate, endDate) {
    const sql = `
      SELECT
        event_name,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT DATE(timestamp)) as days_active
      FROM events
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY event_name
      ORDER BY event_count DESC
    `;

    const data = await this.db.all(sql, [startDate, endDate]);

    const headers = ['Event Name', 'Total Count', 'Unique Users', 'Days Active', 'Avg per User'];
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
      const avgPerUser = (row.event_count / row.unique_users).toFixed(2);
      csv += [
        this.escapeCsvField(row.event_name),
        row.event_count,
        row.unique_users,
        row.days_active,
        avgPerUser
      ].join(',') + '\n';
    });

    return csv;
  }

  async exportUserEngagementReport(startDate, endDate) {
    const sql = `
      SELECT
        user_id,
        COUNT(*) as total_events,
        COUNT(DISTINCT DATE(timestamp)) as active_days,
        COUNT(DISTINCT session_id) as sessions,
        MIN(timestamp) as first_event,
        MAX(timestamp) as last_event
      FROM events
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY user_id
      ORDER BY total_events DESC
    `;

    const data = await this.db.all(sql, [startDate, endDate]);

    const headers = ['User ID', 'Total Events', 'Active Days', 'Sessions', 'First Event', 'Last Event', 'Avg Events per Day'];
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
      const avgPerDay = (row.total_events / row.active_days).toFixed(2);
      csv += [
        this.escapeCsvField(row.user_id),
        row.total_events,
        row.active_days,
        row.sessions,
        this.formatDateTime(row.first_event),
        this.formatDateTime(row.last_event),
        avgPerDay
      ].join(',') + '\n';
    });

    return csv;
  }

  // ==================== JSON Export Methods ====================

  /**
   * Export data to JSON format
   * @param {string} dataType - Type of data: 'events', 'users', 'analytics', 'cohorts'
   * @param {object} filters - Filters specific to data type
   * @returns {object} JSON object
   */
  async exportToJSON(dataType, filters = {}) {
    try {
      let data;

      switch (dataType) {
        case 'events':
          data = await this.exportEventsJSON(filters);
          break;

        case 'users':
          data = await this.exportUsersJSON(filters);
          break;

        case 'analytics':
          data = await this.exportAnalyticsJSON(filters);
          break;

        case 'cohorts':
          data = await this.exportCohortsJSON();
          break;

        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      return {
        exportDate: new Date().toISOString(),
        dataType,
        filters,
        recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
        data
      };
    } catch (error) {
      throw new Error(`Failed to export to JSON: ${error.message}`);
    }
  }

  async exportEventsJSON(filters) {
    const { startDate, endDate, eventName, userId } = filters;

    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (startDate && endDate) {
      sql += ' AND timestamp BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (eventName) {
      sql += ' AND event_name = ?';
      params.push(eventName);
    }

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY timestamp DESC';

    const events = await this.db.all(sql, params);

    // Parse JSON properties
    return events.map(event => ({
      ...event,
      properties: event.properties ? JSON.parse(event.properties) : {}
    }));
  }

  async exportUsersJSON(filters) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (filters.cohortId) {
      sql += ' AND cohort_id = ?';
      params.push(filters.cohortId);
    }

    const users = await this.db.all(sql, params);

    // Parse JSON properties and add event counts
    return await Promise.all(
      users.map(async (user) => {
        const eventCount = await this.db.get(
          'SELECT COUNT(*) as count FROM events WHERE user_id = ?',
          [user.id]
        );
        return {
          ...user,
          properties: user.properties ? JSON.parse(user.properties) : {},
          totalEvents: eventCount.count
        };
      })
    );
  }

  async exportAnalyticsJSON(filters) {
    const { startDate, endDate } = filters;

    const [
      totalEvents,
      uniqueUsers,
      topEvents,
      deviceBreakdown,
      countryBreakdown
    ] = await Promise.all([
      this.db.get(
        'SELECT COUNT(*) as count FROM events WHERE timestamp BETWEEN ? AND ?',
        [startDate, endDate]
      ),
      this.db.get(
        'SELECT COUNT(DISTINCT user_id) as count FROM events WHERE timestamp BETWEEN ? AND ?',
        [startDate, endDate]
      ),
      this.db.all(
        `SELECT event_name, COUNT(*) as count
         FROM events
         WHERE timestamp BETWEEN ? AND ?
         GROUP BY event_name
         ORDER BY count DESC
         LIMIT 10`,
        [startDate, endDate]
      ),
      this.db.all(
        `SELECT device_type, COUNT(*) as count
         FROM events
         WHERE timestamp BETWEEN ? AND ?
         GROUP BY device_type`,
        [startDate, endDate]
      ),
      this.db.all(
        `SELECT country, COUNT(*) as count
         FROM events
         WHERE timestamp BETWEEN ? AND ?
         GROUP BY country
         ORDER BY count DESC
         LIMIT 10`,
        [startDate, endDate]
      )
    ]);

    return {
      summary: {
        totalEvents: totalEvents.count,
        uniqueUsers: uniqueUsers.count,
        averageEventsPerUser: (totalEvents.count / uniqueUsers.count).toFixed(2)
      },
      topEvents,
      deviceBreakdown,
      countryBreakdown,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
  }

  async exportCohortsJSON() {
    const cohorts = await this.db.all('SELECT * FROM cohorts');

    return await Promise.all(
      cohorts.map(async (cohort) => {
        const users = await this.db.all(
          'SELECT id, email, name FROM users WHERE cohort_id = ?',
          [cohort.id]
        );
        return {
          ...cohort,
          criteria: cohort.criteria ? JSON.parse(cohort.criteria) : {},
          users
        };
      })
    );
  }

  // ==================== PDF Report Generation ====================

  /**
   * Generate comprehensive investor report in HTML format (ready for PDF conversion)
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {string} HTML formatted report
   */
  async generateInvestorReport(startDate, endDate) {
    try {
      // Gather all necessary data
      const [
        overviewStats,
        growthMetrics,
        engagementMetrics,
        topEvents,
        userGrowth,
        retentionData,
        deviceBreakdown,
        geoData
      ] = await Promise.all([
        this.getOverviewStats(startDate, endDate),
        this.getGrowthMetrics(startDate, endDate),
        this.getEngagementMetrics(startDate, endDate),
        this.getTopEvents(startDate, endDate),
        this.getUserGrowthData(startDate, endDate),
        this.getRetentionData(startDate, endDate),
        this.getDeviceBreakdown(startDate, endDate),
        this.getGeoData(startDate, endDate)
      ]);

      // Generate HTML report
      const html = this.generateInvestorReportHTML({
        startDate,
        endDate,
        overviewStats,
        growthMetrics,
        engagementMetrics,
        topEvents,
        userGrowth,
        retentionData,
        deviceBreakdown,
        geoData,
        generatedAt: new Date().toISOString()
      });

      return html;
    } catch (error) {
      throw new Error(`Failed to generate investor report: ${error.message}`);
    }
  }

  async getOverviewStats(startDate, endDate) {
    const [events, users, sessions] = await Promise.all([
      this.db.get(
        'SELECT COUNT(*) as count FROM events WHERE timestamp BETWEEN ? AND ?',
        [startDate, endDate]
      ),
      this.db.get(
        'SELECT COUNT(DISTINCT user_id) as count FROM events WHERE timestamp BETWEEN ? AND ?',
        [startDate, endDate]
      ),
      this.db.get(
        'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE timestamp BETWEEN ? AND ?',
        [startDate, endDate]
      )
    ]);

    return {
      totalEvents: events.count,
      activeUsers: users.count,
      totalSessions: sessions.count,
      avgEventsPerUser: users.count > 0 ? (events.count / users.count).toFixed(2) : 0,
      avgSessionsPerUser: users.count > 0 ? (sessions.count / users.count).toFixed(2) : 0
    };
  }

  async getGrowthMetrics(startDate, endDate) {
    const newUsers = await this.db.get(
      'SELECT COUNT(*) as count FROM users WHERE created_at BETWEEN ? AND ?',
      [startDate, endDate]
    );

    const totalUsers = await this.db.get('SELECT COUNT(*) as count FROM users');

    return {
      newUsers: newUsers.count,
      totalUsers: totalUsers.count,
      growthRate: totalUsers.count > 0
        ? ((newUsers.count / totalUsers.count) * 100).toFixed(2)
        : 0
    };
  }

  async getEngagementMetrics(startDate, endDate) {
    const dailyActive = await this.db.all(
      `SELECT DATE(timestamp) as date, COUNT(DISTINCT user_id) as dau
       FROM events
       WHERE timestamp BETWEEN ? AND ?
       GROUP BY DATE(timestamp)`,
      [startDate, endDate]
    );

    const avgDAU = dailyActive.length > 0
      ? (dailyActive.reduce((sum, day) => sum + day.dau, 0) / dailyActive.length).toFixed(0)
      : 0;

    return {
      averageDailyActiveUsers: avgDAU,
      dailyActivityData: dailyActive
    };
  }

  async getTopEvents(startDate, endDate) {
    return await this.db.all(
      `SELECT
        event_name,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM events WHERE timestamp BETWEEN ? AND ?), 2) as percentage
       FROM events
       WHERE timestamp BETWEEN ? AND ?
       GROUP BY event_name
       ORDER BY count DESC
       LIMIT 10`,
      [startDate, endDate, startDate, endDate]
    );
  }

  async getUserGrowthData(startDate, endDate) {
    return await this.db.all(
      `SELECT DATE(created_at) as date, COUNT(*) as new_users
       FROM users
       WHERE created_at BETWEEN ? AND ?
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [startDate, endDate]
    );
  }

  async getRetentionData(startDate, endDate) {
    const sql = `
      SELECT
        DATE(timestamp) as date,
        COUNT(DISTINCT user_id) as returning_users
      FROM events
      WHERE user_id IN (
        SELECT DISTINCT user_id
        FROM events
        WHERE timestamp < ?
      )
      AND timestamp BETWEEN ? AND ?
      GROUP BY DATE(timestamp)
    `;

    return await this.db.all(sql, [startDate, startDate, endDate]);
  }

  async getDeviceBreakdown(startDate, endDate) {
    return await this.db.all(
      `SELECT
        device_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM events WHERE timestamp BETWEEN ? AND ?), 2) as percentage
       FROM events
       WHERE timestamp BETWEEN ? AND ?
       GROUP BY device_type
       ORDER BY count DESC`,
      [startDate, endDate, startDate, endDate]
    );
  }

  async getGeoData(startDate, endDate) {
    return await this.db.all(
      `SELECT
        country,
        COUNT(DISTINCT user_id) as users,
        COUNT(*) as events
       FROM events
       WHERE timestamp BETWEEN ? AND ? AND country IS NOT NULL
       GROUP BY country
       ORDER BY users DESC
       LIMIT 10`,
      [startDate, endDate]
    );
  }

  generateInvestorReportHTML(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Analytics - Investor Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            padding: 40px;
        }

        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
        }

        .report-header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }

        .report-title {
            font-size: 36px;
            font-weight: 700;
            color: #0a0a0a;
            margin-bottom: 10px;
        }

        .report-subtitle {
            font-size: 18px;
            color: #737373;
            margin-bottom: 20px;
        }

        .report-meta {
            display: flex;
            gap: 30px;
            font-size: 14px;
            color: #737373;
        }

        .section {
            margin-bottom: 50px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 24px;
            font-weight: 600;
            color: #0a0a0a;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e5e5;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: #f8f9fa;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 24px;
            transition: all 0.2s;
        }

        .metric-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }

        .metric-label {
            font-size: 14px;
            color: #737373;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .metric-value {
            font-size: 32px;
            font-weight: 700;
            color: #0a0a0a;
            margin-bottom: 4px;
        }

        .metric-change {
            font-size: 14px;
            font-weight: 600;
        }

        .metric-change.positive {
            color: #10b981;
        }

        .metric-change.negative {
            color: #ef4444;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .data-table thead {
            background: #f8f9fa;
        }

        .data-table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #0a0a0a;
            border-bottom: 2px solid #e5e5e5;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #e5e5e5;
            color: #404040;
        }

        .data-table tr:hover {
            background: #f8f9fa;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e5e5;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }

        .progress-fill {
            height: 100%;
            background: #3b82f6;
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        .insight-box {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .insight-title {
            font-weight: 600;
            color: #0a0a0a;
            margin-bottom: 8px;
        }

        .insight-text {
            color: #404040;
            line-height: 1.6;
        }

        .chart-placeholder {
            background: #f8f9fa;
            border: 2px dashed #d4d4d4;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            color: #737373;
            margin: 20px 0;
        }

        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e5e5;
            text-align: center;
            color: #737373;
            font-size: 14px;
        }

        @media print {
            body {
                padding: 20px;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="report-header">
            <h1 class="report-title">Product Analytics Report</h1>
            <p class="report-subtitle">Comprehensive Performance Overview for Investors & Stakeholders</p>
            <div class="report-meta">
                <div><strong>Report Period:</strong> ${this.formatDate(data.startDate)} - ${this.formatDate(data.endDate)}</div>
                <div><strong>Generated:</strong> ${this.formatDateTime(data.generatedAt)}</div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="section">
            <h2 class="section-title">Executive Summary</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Total Events</div>
                    <div class="metric-value">${this.formatNumber(data.overviewStats.totalEvents)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Active Users</div>
                    <div class="metric-value">${this.formatNumber(data.overviewStats.activeUsers)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Total Sessions</div>
                    <div class="metric-value">${this.formatNumber(data.overviewStats.totalSessions)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Avg Events/User</div>
                    <div class="metric-value">${data.overviewStats.avgEventsPerUser}</div>
                </div>
            </div>

            <div class="insight-box">
                <div class="insight-title">Key Insight</div>
                <div class="insight-text">
                    During the reporting period, we tracked ${this.formatNumber(data.overviewStats.totalEvents)} events
                    from ${this.formatNumber(data.overviewStats.activeUsers)} active users across
                    ${this.formatNumber(data.overviewStats.totalSessions)} sessions, demonstrating
                    strong engagement with an average of ${data.overviewStats.avgEventsPerUser} events per user.
                </div>
            </div>
        </div>

        <!-- Growth Metrics -->
        <div class="section">
            <h2 class="section-title">Growth & Acquisition</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">New Users</div>
                    <div class="metric-value">${this.formatNumber(data.growthMetrics.newUsers)}</div>
                    <div class="metric-change positive">+${data.growthMetrics.growthRate}% growth</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Total Users</div>
                    <div class="metric-value">${this.formatNumber(data.growthMetrics.totalUsers)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Avg Daily Active Users</div>
                    <div class="metric-value">${this.formatNumber(data.engagementMetrics.averageDailyActiveUsers)}</div>
                </div>
            </div>

            <div class="chart-placeholder">
                User Growth Chart - ${data.userGrowth.length} days of data
                <br><small>Peak: ${Math.max(...data.userGrowth.map(d => d.new_users))} new users in a single day</small>
            </div>
        </div>

        <!-- Top Events -->
        <div class="section">
            <h2 class="section-title">Top Events & User Actions</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Total Count</th>
                        <th>Unique Users</th>
                        <th>% of Total</th>
                        <th>Distribution</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.topEvents.map(event => `
                        <tr>
                            <td><strong>${event.event_name}</strong></td>
                            <td>${this.formatNumber(event.count)}</td>
                            <td>${this.formatNumber(event.unique_users)}</td>
                            <td>${event.percentage}%</td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${event.percentage}%"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Device & Geography -->
        <div class="section">
            <h2 class="section-title">Platform & Geography Analytics</h2>

            <h3 style="margin: 20px 0 15px 0; color: #404040;">Device Breakdown</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Device Type</th>
                        <th>Event Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.deviceBreakdown.map(device => `
                        <tr>
                            <td><strong>${device.device_type || 'Unknown'}</strong></td>
                            <td>${this.formatNumber(device.count)}</td>
                            <td>${device.percentage}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3 style="margin: 30px 0 15px 0; color: #404040;">Top Geographic Markets</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Country</th>
                        <th>Active Users</th>
                        <th>Total Events</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.geoData.map(geo => `
                        <tr>
                            <td><strong>${geo.country}</strong></td>
                            <td>${this.formatNumber(geo.users)}</td>
                            <td>${this.formatNumber(geo.events)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Retention -->
        <div class="section">
            <h2 class="section-title">User Retention & Engagement</h2>
            <div class="insight-box">
                <div class="insight-title">Retention Analysis</div>
                <div class="insight-text">
                    Tracked ${data.retentionData.length} days of retention data showing consistent user return patterns.
                    ${data.retentionData.length > 0 ? `Average returning users per day: ${Math.round(data.retentionData.reduce((sum, day) => sum + day.returning_users, 0) / data.retentionData.length)}` : ''}
                </div>
            </div>

            <div class="chart-placeholder">
                Retention Curve - ${data.retentionData.length} days tracked
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Confidential Information</strong></p>
            <p>This report contains proprietary analytics data. Distribution without authorization is prohibited.</p>
            <p style="margin-top: 10px;">Generated by Product Analytics Platform on ${this.formatDateTime(data.generatedAt)}</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  // ==================== Excel Export Methods ====================

  /**
   * Export data to Excel-compatible CSV format with multiple sheets
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {object} Object containing multiple CSV sheets
   */
  async exportToExcel(startDate, endDate) {
    try {
      const sheets = {
        'Overview': await this.generateOverviewSheet(startDate, endDate),
        'Events': await this.exportEventsToCSV(startDate, endDate),
        'Users': await this.exportUsersToCSV(),
        'Daily Activity': await this.exportDailyActivityReport(startDate, endDate),
        'Event Summary': await this.exportEventSummaryReport(startDate, endDate)
      };

      return sheets;
    } catch (error) {
      throw new Error(`Failed to export to Excel: ${error.message}`);
    }
  }

  async generateOverviewSheet(startDate, endDate) {
    const stats = await this.getOverviewStats(startDate, endDate);
    const growth = await this.getGrowthMetrics(startDate, endDate);

    let csv = 'Metric,Value\n';
    csv += `Report Period,${this.formatDate(startDate)} to ${this.formatDate(endDate)}\n`;
    csv += `Generated At,${this.formatDateTime(new Date().toISOString())}\n`;
    csv += '\n';
    csv += 'Activity Metrics,\n';
    csv += `Total Events,${stats.totalEvents}\n`;
    csv += `Active Users,${stats.activeUsers}\n`;
    csv += `Total Sessions,${stats.totalSessions}\n`;
    csv += `Average Events per User,${stats.avgEventsPerUser}\n`;
    csv += `Average Sessions per User,${stats.avgSessionsPerUser}\n`;
    csv += '\n';
    csv += 'Growth Metrics,\n';
    csv += `New Users,${growth.newUsers}\n`;
    csv += `Total Users,${growth.totalUsers}\n`;
    csv += `Growth Rate,${growth.growthRate}%\n`;

    return csv;
  }

  // ==================== Helper Methods ====================

  /**
   * Escape CSV field to handle commas, quotes, and newlines
   */
  escapeCsvField(field) {
    if (field === null || field === undefined) return '';

    const stringField = String(field);

    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return '"' + stringField.replace(/"/g, '""') + '"';
    }

    return stringField;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format datetime for display
   */
  formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format number with commas
   */
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('en-US');
  }

  /**
   * Save export to file
   */
  async saveToFile(content, filename, directory = './exports') {
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      const filepath = path.join(directory, filename);
      fs.writeFileSync(filepath, content, 'utf8');

      return filepath;
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(prefix, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}_${timestamp}.${extension}`;
  }
}

module.exports = ExportUtility;
