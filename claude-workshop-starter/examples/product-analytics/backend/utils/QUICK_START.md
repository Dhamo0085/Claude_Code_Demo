# Export Utility - Quick Start Guide

Get started with the Product Analytics Export Utility in 5 minutes!

## Table of Contents
1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Common Scenarios](#common-scenarios)
4. [API Integration](#api-integration)
5. [Troubleshooting](#troubleshooting)

---

## Installation

### Step 1: Import the Module

```javascript
const Database = require('../database');
const ExportUtility = require('./export');
```

### Step 2: Initialize with Database

```javascript
// Initialize database
const db = new Database('./analytics.db');
await db.initialize();

// Create export utility instance
const exporter = new ExportUtility(db);
```

That's it! You're ready to start exporting data.

---

## Basic Usage

### Export Events to CSV

```javascript
// Export all events for a date range
const csv = await exporter.exportEventsToCSV('2024-10-01', '2024-10-31');

// Save to file
await exporter.saveToFile(csv, 'events.csv');
```

### Export Users to CSV

```javascript
// Export all users
const users = await exporter.exportUsersToCSV();

// Save to file
await exporter.saveToFile(users, 'users.csv');
```

### Generate Investor Report

```javascript
// Generate HTML report
const report = await exporter.generateInvestorReport('2024-10-01', '2024-10-31');

// Save to file
await exporter.saveToFile(report, 'investor_report.html');

// Open in browser and print to PDF!
```

### Export to JSON

```javascript
// Get analytics data as JSON
const data = await exporter.exportToJSON('analytics', {
  startDate: '2024-10-01',
  endDate: '2024-10-31'
});

console.log(`Total Events: ${data.data.summary.totalEvents}`);
console.log(`Unique Users: ${data.data.summary.uniqueUsers}`);
```

---

## Common Scenarios

### Scenario 1: Weekly Team Report

```javascript
async function generateWeeklyReport() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  // Generate daily activity report
  const report = await exporter.exportAnalyticsReport('daily_activity', {
    startDate,
    endDate
  });

  // Save with timestamp
  const filename = exporter.generateFilename('weekly_report', 'csv');
  await exporter.saveToFile(report, filename);

  console.log(`Weekly report saved: ${filename}`);
}

// Run it
await generateWeeklyReport();
```

### Scenario 2: Monthly Investor Update

```javascript
async function monthlyInvestorUpdate() {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const startDate = lastMonth.toISOString().split('T')[0];
  const endDate = monthEnd.toISOString().split('T')[0];

  // Generate comprehensive report
  const report = await exporter.generateInvestorReport(startDate, endDate);

  // Save with descriptive name
  const monthName = lastMonth.toLocaleString('default', { month: 'long' });
  const filename = `investor_report_${monthName}_${lastMonth.getFullYear()}.html`;
  await exporter.saveToFile(report, filename);

  console.log(`Investor report ready: ${filename}`);
}

// Run it
await monthlyInvestorUpdate();
```

### Scenario 3: Export Active Users for CRM

```javascript
async function exportActiveUsersForCRM() {
  // Export users active in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const users = await exporter.exportUsersToCSV({
    lastSeenAfter: thirtyDaysAgo.toISOString().split('T')[0]
  });

  // Save for CRM import
  await exporter.saveToFile(users, 'active_users_crm.csv');

  console.log('Active users exported for CRM import');
}

// Run it
await exportActiveUsersForCRM();
```

### Scenario 4: Filter by Event Type

```javascript
async function exportPurchaseEvents() {
  // Export only purchase events
  const purchases = await exporter.exportEventsToCSV(
    '2024-01-01',
    '2024-12-31',
    {
      eventName: 'purchase'
    }
  );

  await exporter.saveToFile(purchases, 'purchase_events.csv');

  console.log('Purchase events exported');
}

// Run it
await exportPurchaseEvents();
```

### Scenario 5: Mobile Users Analysis

```javascript
async function analyzeMobileUsers() {
  // Export mobile events
  const mobileEvents = await exporter.exportEventsToCSV(
    '2024-10-01',
    '2024-10-31',
    {
      deviceType: 'mobile'
    }
  );

  await exporter.saveToFile(mobileEvents, 'mobile_events.csv');

  console.log('Mobile events exported for analysis');
}

// Run it
await analyzeMobileUsers();
```

---

## API Integration

### Setup Express Routes

```javascript
const express = require('express');
const { router: exportRouter, initializeExporter } = require('./routes/export-routes');

const app = express();

// Initialize database and exporter
const db = new Database('./analytics.db');
await db.initialize();
initializeExporter(db);

// Mount routes
app.use('/api/export', exportRouter);

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Available Endpoints

Once your server is running, you can access:

**CSV Exports:**
- `GET /api/export/events/csv?startDate=2024-10-01&endDate=2024-10-31`
- `GET /api/export/users/csv`
- `GET /api/export/reports/daily_activity/csv?startDate=2024-10-01&endDate=2024-10-31`

**JSON Exports:**
- `GET /api/export/json/analytics?startDate=2024-10-01&endDate=2024-10-31`
- `GET /api/export/json/events?startDate=2024-10-01&endDate=2024-10-31`
- `GET /api/export/json/users`

**Investor Reports:**
- `GET /api/export/investor-report?startDate=2024-10-01&endDate=2024-10-31`
- `GET /api/export/investor-report/download?startDate=2024-10-01&endDate=2024-10-31`

**Excel Exports:**
- `GET /api/export/excel?startDate=2024-10-01&endDate=2024-10-31`

### Frontend Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Export Dashboard</title>
</head>
<body>
    <h1>Export Dashboard</h1>

    <button onclick="downloadEvents()">Export Events</button>
    <button onclick="downloadReport()">Investor Report</button>

    <script>
        async function downloadEvents() {
            const response = await fetch(
                '/api/export/events/csv?startDate=2024-10-01&endDate=2024-10-31'
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'events.csv';
            a.click();
        }

        async function downloadReport() {
            const response = await fetch(
                '/api/export/investor-report/download?startDate=2024-10-01&endDate=2024-10-31'
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'investor_report.html';
            a.click();
        }
    </script>
</body>
</html>
```

---

## Troubleshooting

### Issue: "Database not initialized"

**Solution:**
```javascript
// Make sure to initialize database before using exporter
const db = new Database('./analytics.db');
await db.initialize(); // Don't forget this!
const exporter = new ExportUtility(db);
```

### Issue: "No data in export"

**Solution:**
```javascript
// Check your date range
const events = await db.all(
  'SELECT COUNT(*) as count FROM events WHERE timestamp BETWEEN ? AND ?',
  [startDate, endDate]
);
console.log(`Found ${events[0].count} events in date range`);

// Also check date format (should be ISO: YYYY-MM-DD)
const startDate = '2024-10-01'; // Correct
// const startDate = '10/01/2024'; // Wrong!
```

### Issue: "CSV has broken columns"

**Solution:**
The utility automatically handles special characters, but if you see issues:
```javascript
// Fields with commas, quotes, or newlines are automatically escaped
// No action needed - this is handled internally
```

### Issue: "Memory error with large exports"

**Solution:**
```javascript
// Export in chunks for large datasets
async function exportInChunks() {
  const monthStart = new Date('2024-01-01');
  const monthEnd = new Date('2024-12-31');

  // Export month by month
  for (let month = 0; month < 12; month++) {
    const start = new Date(2024, month, 1);
    const end = new Date(2024, month + 1, 0);

    const csv = await exporter.exportEventsToCSV(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );

    await exporter.saveToFile(csv, `events_2024_${month + 1}.csv`);
  }
}
```

### Issue: "Investor report not showing in browser"

**Solution:**
```javascript
// Make sure the file saved correctly
const filepath = await exporter.saveToFile(report, 'report.html');
console.log(`Report saved to: ${filepath}`);

// Open with your default browser:
// Mac: open report.html
// Windows: start report.html
// Linux: xdg-open report.html
```

---

## Performance Tips

### 1. Use Appropriate Date Ranges

```javascript
// Good - Specific range
const csv = await exporter.exportEventsToCSV('2024-10-01', '2024-10-31');

// Avoid - Too large range
// const csv = await exporter.exportEventsToCSV('2020-01-01', '2024-12-31');
```

### 2. Apply Filters

```javascript
// Export only what you need
const csv = await exporter.exportEventsToCSV('2024-10-01', '2024-10-31', {
  eventName: 'page_view',
  deviceType: 'mobile'
});
```

### 3. Use JSON for API Integrations

```javascript
// CSV is for humans/spreadsheets
const csv = await exporter.exportEventsToCSV(...);

// JSON is for APIs/integrations (more efficient)
const json = await exporter.exportToJSON('analytics', {...});
```

### 4. Schedule Large Exports

```javascript
// Run during off-peak hours
const cron = require('node-cron');

// Every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  await generateDailyReport();
});
```

---

## Next Steps

1. **Explore Examples**: Check out `export-examples.js` for more use cases
2. **Read Full Docs**: See `EXPORT_README.md` for complete API reference
3. **Integration Guide**: Review `integration-example.js` for Express setup
4. **Customize**: Extend the ExportUtility class for your specific needs

---

## Quick Reference

| Task | Method | Returns |
|------|--------|---------|
| Export events | `exportEventsToCSV(start, end, filters)` | CSV string |
| Export users | `exportUsersToCSV(filters)` | CSV string |
| Analytics report | `exportAnalyticsReport(type, options)` | CSV string |
| JSON data | `exportToJSON(dataType, filters)` | JSON object |
| Investor report | `generateInvestorReport(start, end)` | HTML string |
| Excel export | `exportToExcel(start, end)` | Object with sheets |
| Save file | `saveToFile(content, filename, dir)` | File path |
| Generate filename | `generateFilename(prefix, ext)` | String |

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `EXPORT_README.md` for detailed documentation
3. Look at `export-examples.js` for usage examples
4. Contact the development team

---

**Happy Exporting!** 🚀
