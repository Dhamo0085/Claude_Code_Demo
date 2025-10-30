# Export Utility Documentation

## Overview

The Export Utility module provides comprehensive data export functionality for the Product Analytics platform. It enables investors, stakeholders, and team members to extract and analyze data in multiple formats including CSV, JSON, PDF, and Excel.

## Features

- **CSV Exports**: Raw data exports perfect for spreadsheet analysis
- **JSON Exports**: Structured data for API integrations and data pipelines
- **PDF Reports**: Professional investor-ready reports with key metrics and insights
- **Excel Format**: Multi-sheet exports for comprehensive Excel analysis
- **Flexible Filtering**: Filter data by date ranges, user segments, event types, and more
- **Professional Formatting**: Investor-ready presentation with charts and insights

## Installation

```javascript
const Database = require('../database');
const ExportUtility = require('./export');

// Initialize
const db = new Database('./analytics.db');
const exporter = new ExportUtility(db);

await db.initialize();
```

## Core Methods

### 1. CSV Export Methods

#### `exportEventsToCSV(startDate, endDate, filters)`

Export events in CSV format with optional filters.

**Parameters:**
- `startDate` (string): Start date in ISO format (e.g., '2024-01-01')
- `endDate` (string): End date in ISO format
- `filters` (object, optional):
  - `eventName`: Filter by specific event name
  - `userId`: Filter by user ID
  - `deviceType`: Filter by device type
  - `country`: Filter by country

**Returns:** CSV formatted string

**Example:**
```javascript
// Export all events
const csv = await exporter.exportEventsToCSV('2024-01-01', '2024-12-31');

// Export with filters
const mobileEvents = await exporter.exportEventsToCSV(
  '2024-01-01',
  '2024-12-31',
  { deviceType: 'mobile', eventName: 'page_view' }
);
```

**CSV Columns:**
- Event ID
- Event Name
- User ID
- Timestamp
- Properties (JSON)
- Session ID
- Page URL
- Referrer
- Device Type
- Browser
- Country
- City

---

#### `exportUsersToCSV(filters)`

Export users in CSV format with engagement metrics.

**Parameters:**
- `filters` (object, optional):
  - `cohortId`: Filter by cohort
  - `createdAfter`: Filter users created after date
  - `lastSeenAfter`: Filter users active after date

**Returns:** CSV formatted string

**Example:**
```javascript
// Export all users
const users = await exporter.exportUsersToCSV();

// Export premium cohort
const premium = await exporter.exportUsersToCSV({ cohortId: 'premium-users' });

// Export recently active users
const active = await exporter.exportUsersToCSV({ lastSeenAfter: '2024-10-01' });
```

**CSV Columns:**
- User ID
- Email
- Name
- Created At
- Last Seen
- Total Events
- Cohort ID
- Properties (JSON)

---

#### `exportAnalyticsReport(reportType, options)`

Generate pre-built analytics reports in CSV format.

**Parameters:**
- `reportType` (string): Type of report
  - `'daily_activity'`: Daily activity metrics
  - `'event_summary'`: Event statistics and distribution
  - `'user_engagement'`: User engagement metrics
- `options` (object):
  - `startDate`: Start date
  - `endDate`: End date

**Returns:** CSV formatted string

**Example:**
```javascript
// Daily activity report
const dailyReport = await exporter.exportAnalyticsReport(
  'daily_activity',
  { startDate: '2024-10-01', endDate: '2024-10-31' }
);

// Event summary report
const eventReport = await exporter.exportAnalyticsReport(
  'event_summary',
  { startDate: '2024-10-01', endDate: '2024-10-31' }
);

// User engagement report
const engagementReport = await exporter.exportAnalyticsReport(
  'user_engagement',
  { startDate: '2024-10-01', endDate: '2024-10-31' }
);
```

**Report Types:**

**Daily Activity Report Columns:**
- Date
- Total Events
- Unique Users
- Total Sessions
- Avg Events per User

**Event Summary Report Columns:**
- Event Name
- Total Count
- Unique Users
- Days Active
- Avg per User

**User Engagement Report Columns:**
- User ID
- Total Events
- Active Days
- Sessions
- First Event
- Last Event
- Avg Events per Day

---

### 2. JSON Export Methods

#### `exportToJSON(dataType, filters)`

Export data in JSON format for API integrations.

**Parameters:**
- `dataType` (string): Type of data to export
  - `'events'`: Event data
  - `'users'`: User data
  - `'analytics'`: Analytics summary
  - `'cohorts'`: Cohort data
- `filters` (object): Filters specific to data type

**Returns:** JSON object with metadata

**Example:**
```javascript
// Export events
const eventsJSON = await exporter.exportToJSON('events', {
  startDate: '2024-10-01',
  endDate: '2024-10-31',
  eventName: 'purchase'
});

// Export users
const usersJSON = await exporter.exportToJSON('users', {
  cohortId: 'premium-users'
});

// Export analytics summary
const analyticsJSON = await exporter.exportToJSON('analytics', {
  startDate: '2024-10-01',
  endDate: '2024-10-31'
});

// Export cohorts
const cohortsJSON = await exporter.exportToJSON('cohorts');
```

**JSON Response Format:**
```json
{
  "exportDate": "2024-10-29T10:30:00.000Z",
  "dataType": "events",
  "filters": { "startDate": "2024-10-01", "endDate": "2024-10-31" },
  "recordCount": 1523,
  "data": [ /* Array of records */ ]
}
```

**Analytics JSON Structure:**
```json
{
  "summary": {
    "totalEvents": 15234,
    "uniqueUsers": 1523,
    "averageEventsPerUser": "10.00"
  },
  "topEvents": [ /* Top 10 events */ ],
  "deviceBreakdown": [ /* Device statistics */ ],
  "countryBreakdown": [ /* Geographic data */ ],
  "dateRange": {
    "start": "2024-10-01",
    "end": "2024-10-31"
  }
}
```

---

### 3. Investor Report Generation

#### `generateInvestorReport(startDate, endDate)`

Generate a comprehensive HTML report with all key metrics, charts, and insights.

**Parameters:**
- `startDate` (string): Report start date
- `endDate` (string): Report end date

**Returns:** HTML formatted string (ready for PDF conversion)

**Example:**
```javascript
const report = await exporter.generateInvestorReport('2024-10-01', '2024-10-31');

// Save to file
await exporter.saveToFile(
  report,
  'investor_report_october_2024.html'
);

// Convert to PDF using browser: Open HTML → Print → Save as PDF
```

**Report Sections:**
1. **Executive Summary**
   - Total events, active users, sessions
   - Key performance indicators
   - Average metrics

2. **Growth & Acquisition**
   - New user signups
   - Total user base
   - Growth rate
   - User growth chart

3. **Top Events & User Actions**
   - Most popular events
   - Event distribution
   - User participation rates

4. **Platform & Geography Analytics**
   - Device breakdown
   - Top geographic markets
   - Platform statistics

5. **User Retention & Engagement**
   - Retention analysis
   - Return user patterns
   - Engagement trends

**Report Features:**
- Professional design optimized for print and PDF
- Clean, investor-ready formatting
- Data visualizations and charts
- Key insights and metrics
- Confidential watermark
- Print-optimized CSS

---

### 4. Excel Export Methods

#### `exportToExcel(startDate, endDate)`

Generate multiple CSV sheets for Excel import.

**Parameters:**
- `startDate` (string): Start date
- `endDate` (string): End date

**Returns:** Object containing multiple CSV sheets

**Example:**
```javascript
const excelSheets = await exporter.exportToExcel('2024-10-01', '2024-10-31');

// Save each sheet
for (const [sheetName, csvContent] of Object.entries(excelSheets)) {
  await exporter.saveToFile(csvContent, `${sheetName}.csv`);
}
```

**Sheets Included:**
1. **Overview**: Summary statistics and key metrics
2. **Events**: Complete event log
3. **Users**: User database with engagement metrics
4. **Daily Activity**: Day-by-day activity breakdown
5. **Event Summary**: Event statistics and analysis

---

## Helper Methods

### `saveToFile(content, filename, directory)`

Save export content to file.

**Parameters:**
- `content` (string): Content to save
- `filename` (string): Filename
- `directory` (string, optional): Directory path (default: './exports')

**Returns:** File path

**Example:**
```javascript
const csv = await exporter.exportEventsToCSV('2024-01-01', '2024-12-31');
const filepath = await exporter.saveToFile(csv, 'events.csv', './reports');
console.log(`Saved to: ${filepath}`);
```

---

### `generateFilename(prefix, extension)`

Generate timestamped filename.

**Parameters:**
- `prefix` (string): Filename prefix
- `extension` (string): File extension

**Returns:** Formatted filename

**Example:**
```javascript
const filename = exporter.generateFilename('weekly_report', 'csv');
// Output: weekly_report_2024-10-29T14-30-45.csv
```

---

## Common Use Cases

### 1. Weekly Stakeholder Report

```javascript
const today = new Date();
const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

const report = await exporter.exportAnalyticsReport('daily_activity', {
  startDate: weekAgo.toISOString().split('T')[0],
  endDate: today.toISOString().split('T')[0]
});

await exporter.saveToFile(report, 'weekly_report.csv');
```

### 2. Monthly Investor Report

```javascript
const report = await exporter.generateInvestorReport(
  '2024-10-01',
  '2024-10-31'
);

await exporter.saveToFile(report, 'investor_report_october.html');
// Convert to PDF via browser
```

### 3. User Data for CRM Import

```javascript
const users = await exporter.exportUsersToCSV({
  lastSeenAfter: '2024-10-01'
});

await exporter.saveToFile(users, 'active_users_crm_import.csv');
```

### 4. API Integration Data

```javascript
const data = await exporter.exportToJSON('analytics', {
  startDate: '2024-10-01',
  endDate: '2024-10-31'
});

// Send to external API
await fetch('https://api.example.com/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### 5. Complete Data Package

```javascript
// Create comprehensive export package
const startDate = '2024-10-01';
const endDate = '2024-10-31';

// 1. Executive summary
const report = await exporter.generateInvestorReport(startDate, endDate);
await exporter.saveToFile(report, '1_executive_summary.html', './package');

// 2. Analytics data
const analytics = await exporter.exportToJSON('analytics', { startDate, endDate });
await exporter.saveToFile(JSON.stringify(analytics, null, 2), '2_analytics.json', './package');

// 3. Event log
const events = await exporter.exportEventsToCSV(startDate, endDate);
await exporter.saveToFile(events, '3_events.csv', './package');

// 4. User database
const users = await exporter.exportUsersToCSV();
await exporter.saveToFile(users, '4_users.csv', './package');

// 5. Excel sheets
const excel = await exporter.exportToExcel(startDate, endDate);
for (const [sheet, content] of Object.entries(excel)) {
  await exporter.saveToFile(content, `5_${sheet}.csv`, './package');
}
```

---

## Automation Examples

### Scheduled Daily Export

```javascript
// Run daily at 6 AM
const cron = require('node-cron');

cron.schedule('0 6 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const report = await exporter.exportAnalyticsReport('daily_activity', {
    startDate: dateStr,
    endDate: dateStr
  });

  await exporter.saveToFile(report, `daily_${dateStr}.csv`);
  console.log(`Daily report generated for ${dateStr}`);
});
```

### Monthly Investor Report

```javascript
// Run on 1st of each month
cron.schedule('0 0 1 * *', async () => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

  const report = await exporter.generateInvestorReport(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  await exporter.saveToFile(report, `investor_report_${lastMonth.getFullYear()}_${lastMonth.getMonth() + 1}.html`);
  console.log('Monthly investor report generated');
});
```

---

## Best Practices

### 1. Date Range Selection

- Use appropriate date ranges for better performance
- For large datasets, export in smaller chunks
- Consider timezone handling for accurate reporting

### 2. File Management

- Organize exports in dated folders: `./exports/2024-10-29/`
- Use descriptive filenames with timestamps
- Archive old exports regularly
- Set up automatic cleanup for old files

### 3. Performance Optimization

- Add database indexes for frequently filtered columns
- Use filters to reduce data size
- Consider pagination for very large exports
- Run large exports during off-peak hours

### 4. Security

- Restrict access to export functionality
- Don't include sensitive data in CSV headers
- Add authentication for export endpoints
- Log all export operations for audit

### 5. Data Quality

- Validate date ranges before exporting
- Handle null values appropriately
- Escape special characters in CSV
- Include metadata in JSON exports

---

## API Integration Example

```javascript
const express = require('express');
const router = express.Router();

// Export events endpoint
router.get('/api/export/events', async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;

    if (format === 'csv') {
      const csv = await exporter.exportEventsToCSV(startDate, endDate);
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename=events_${startDate}_${endDate}.csv`);
      res.send(csv);
    } else if (format === 'json') {
      const json = await exporter.exportToJSON('events', { startDate, endDate });
      res.json(json);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate investor report endpoint
router.get('/api/export/investor-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const html = await exporter.generateInvestorReport(startDate, endDate);

    res.header('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## Troubleshooting

### Issue: Large file exports timeout

**Solution:** Implement streaming or pagination
```javascript
// Export in chunks
const chunkSize = 1000;
for (let offset = 0; offset < totalRecords; offset += chunkSize) {
  const chunk = await exportChunk(offset, chunkSize);
  // Process chunk
}
```

### Issue: Memory errors with large datasets

**Solution:** Use streaming
```javascript
const { Readable } = require('stream');

function createCSVStream(data) {
  return Readable.from(generateCSVRows(data));
}
```

### Issue: Special characters breaking CSV format

**Solution:** Use the built-in `escapeCsvField()` helper
```javascript
const escaped = exporter.escapeCsvField(fieldValue);
```

---

## Dependencies

- `fs`: File system operations
- `path`: File path handling
- `sqlite3`: Database access (via Database class)

Optional dependencies for advanced features:
- `puppeteer`: PDF generation from HTML
- `xlsx`: Native Excel file generation
- `node-cron`: Scheduled exports

---

## License

MIT

---

## Support

For issues, questions, or feature requests, please contact the development team or create an issue in the project repository.
