/**
 * Export Utility - Usage Examples
 * Demonstrates how to use the export functionality for various scenarios
 */

const Database = require('../database');
const ExportUtility = require('./export');

// Initialize database and export utility
const db = new Database('./analytics.db');
const exporter = new ExportUtility(db);

/**
 * Example 1: Export Events to CSV
 * Perfect for analyzing raw event data in Excel or Google Sheets
 */
async function example1_ExportEventsToCSV() {
  console.log('\n=== Example 1: Export Events to CSV ===\n');

  try {
    await db.initialize();

    const startDate = '2024-01-01';
    const endDate = '2024-12-31';

    // Export all events
    const allEventsCSV = await exporter.exportEventsToCSV(startDate, endDate);

    // Save to file
    const filename = exporter.generateFilename('events', 'csv');
    const filepath = await exporter.saveToFile(allEventsCSV, filename);
    console.log(`✓ All events exported to: ${filepath}`);

    // Export with filters
    const filteredEventsCSV = await exporter.exportEventsToCSV(
      startDate,
      endDate,
      {
        eventName: 'page_view',
        deviceType: 'mobile'
      }
    );

    const filteredFilename = exporter.generateFilename('mobile_page_views', 'csv');
    const filteredFilepath = await exporter.saveToFile(filteredEventsCSV, filteredFilename);
    console.log(`✓ Filtered events exported to: ${filteredFilepath}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

/**
 * Example 2: Export Users to CSV
 * Great for CRM integration or user analysis
 */
async function example2_ExportUsersToCSV() {
  console.log('\n=== Example 2: Export Users to CSV ===\n');

  try {
    await db.initialize();

    // Export all users
    const usersCSV = await exporter.exportUsersToCSV();
    const filename = exporter.generateFilename('users', 'csv');
    const filepath = await exporter.saveToFile(usersCSV, filename);
    console.log(`✓ Users exported to: ${filepath}`);

    // Export users by cohort
    const cohortUsersCSV = await exporter.exportUsersToCSV({
      cohortId: 'premium-users'
    });
    const cohortFilename = exporter.generateFilename('premium_users', 'csv');
    const cohortFilepath = await exporter.saveToFile(cohortUsersCSV, cohortFilename);
    console.log(`✓ Cohort users exported to: ${cohortFilepath}`);

    // Export recent active users
    const activeUsersCSV = await exporter.exportUsersToCSV({
      lastSeenAfter: '2024-10-01'
    });
    const activeFilename = exporter.generateFilename('active_users', 'csv');
    const activeFilepath = await exporter.saveToFile(activeUsersCSV, activeFilename);
    console.log(`✓ Active users exported to: ${activeFilepath}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

/**
 * Example 3: Export Analytics Reports
 * Various pre-built reports for different stakeholders
 */
async function example3_ExportAnalyticsReports() {
  console.log('\n=== Example 3: Export Analytics Reports ===\n');

  try {
    await db.initialize();

    const startDate = '2024-10-01';
    const endDate = '2024-10-31';

    // Daily Activity Report
    const dailyActivityCSV = await exporter.exportAnalyticsReport(
      'daily_activity',
      { startDate, endDate }
    );
    const dailyFilename = exporter.generateFilename('daily_activity', 'csv');
    await exporter.saveToFile(dailyActivityCSV, dailyFilename);
    console.log(`✓ Daily activity report exported`);

    // Event Summary Report
    const eventSummaryCSV = await exporter.exportAnalyticsReport(
      'event_summary',
      { startDate, endDate }
    );
    const eventFilename = exporter.generateFilename('event_summary', 'csv');
    await exporter.saveToFile(eventSummaryCSV, eventFilename);
    console.log(`✓ Event summary report exported`);

    // User Engagement Report
    const engagementCSV = await exporter.exportAnalyticsReport(
      'user_engagement',
      { startDate, endDate }
    );
    const engagementFilename = exporter.generateFilename('user_engagement', 'csv');
    await exporter.saveToFile(engagementCSV, engagementFilename);
    console.log(`✓ User engagement report exported`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

/**
 * Example 4: Export to JSON for API Integration
 * Perfect for feeding data into other systems or dashboards
 */
async function example4_ExportToJSON() {
  console.log('\n=== Example 4: Export to JSON ===\n');

  try {
    await db.initialize();

    const startDate = '2024-10-01';
    const endDate = '2024-10-31';

    // Export events as JSON
    const eventsJSON = await exporter.exportToJSON('events', {
      startDate,
      endDate,
      eventName: 'purchase'
    });
    const eventsFilename = exporter.generateFilename('events', 'json');
    await exporter.saveToFile(JSON.stringify(eventsJSON, null, 2), eventsFilename);
    console.log(`✓ Events JSON exported (${eventsJSON.recordCount} records)`);

    // Export users as JSON
    const usersJSON = await exporter.exportToJSON('users', {
      cohortId: 'premium-users'
    });
    const usersFilename = exporter.generateFilename('users', 'json');
    await exporter.saveToFile(JSON.stringify(usersJSON, null, 2), usersFilename);
    console.log(`✓ Users JSON exported (${usersJSON.recordCount} records)`);

    // Export analytics summary as JSON
    const analyticsJSON = await exporter.exportToJSON('analytics', {
      startDate,
      endDate
    });
    const analyticsFilename = exporter.generateFilename('analytics_summary', 'json');
    await exporter.saveToFile(JSON.stringify(analyticsJSON, null, 2), analyticsFilename);
    console.log(`✓ Analytics summary JSON exported`);
    console.log(`  - Total Events: ${analyticsJSON.data.summary.totalEvents}`);
    console.log(`  - Unique Users: ${analyticsJSON.data.summary.uniqueUsers}`);

    // Export cohorts as JSON
    const cohortsJSON = await exporter.exportToJSON('cohorts');
    const cohortsFilename = exporter.generateFilename('cohorts', 'json');
    await exporter.saveToFile(JSON.stringify(cohortsJSON, null, 2), cohortsFilename);
    console.log(`✓ Cohorts JSON exported (${cohortsJSON.recordCount} cohorts)`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

/**
 * Example 5: Generate Investor Report (HTML/PDF)
 * Comprehensive report with all key metrics for investors
 */
async function example5_GenerateInvestorReport() {
  console.log('\n=== Example 5: Generate Investor Report ===\n');

  try {
    await db.initialize();

    const startDate = '2024-10-01';
    const endDate = '2024-10-31';

    // Generate comprehensive investor report
    const reportHTML = await exporter.generateInvestorReport(startDate, endDate);

    // Save as HTML (can be converted to PDF using tools like Puppeteer)
    const filename = exporter.generateFilename('investor_report', 'html');
    const filepath = await exporter.saveToFile(reportHTML, filename);
    console.log(`✓ Investor report generated: ${filepath}`);
    console.log(`  Open this file in a browser to view`);
    console.log(`  Convert to PDF: Print > Save as PDF`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

/**
 * Example 6: Export to Excel Format
 * Multiple sheets in Excel-compatible format
 */
async function example6_ExportToExcel() {
  console.log('\n=== Example 6: Export to Excel Format ===\n');

  try {
    await db.initialize();

    const startDate = '2024-10-01';
    const endDate = '2024-10-31';

    // Generate Excel export with multiple sheets
    const excelSheets = await exporter.exportToExcel(startDate, endDate);

    // Save each sheet as a separate CSV file
    // (In a real implementation, you could use a library like 'xlsx' to create actual Excel files)
    for (const [sheetName, csvContent] of Object.entries(excelSheets)) {
      const sanitizedName = sheetName.toLowerCase().replace(/\s+/g, '_');
      const filename = exporter.generateFilename(`excel_${sanitizedName}`, 'csv');
      await exporter.saveToFile(csvContent, filename);
      console.log(`✓ Sheet "${sheetName}" exported`);
    }

    console.log('\n  Tip: Import these CSV files into Excel on separate sheets');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

/**
 * Example 7: Scheduled Exports
 * Automate regular exports for stakeholders
 */
async function example7_ScheduledExports() {
  console.log('\n=== Example 7: Scheduled Export Automation ===\n');

  try {
    await db.initialize();

    // Calculate date ranges for common periods
    const today = new Date();
    const lastWeek = {
      start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
    };

    console.log('Weekly Stakeholder Report:');
    const weeklyReport = await exporter.exportAnalyticsReport(
      'daily_activity',
      { startDate: lastWeek.start, endDate: lastWeek.end }
    );
    const weeklyFilename = exporter.generateFilename('weekly_report', 'csv');
    await exporter.saveToFile(weeklyReport, weeklyFilename);
    console.log(`✓ Weekly report saved: ${weeklyFilename}`);

    console.log('\nMonthly Investor Report:');
    const monthlyReport = await exporter.generateInvestorReport(
      lastMonth.start,
      lastMonth.end
    );
    const monthlyFilename = exporter.generateFilename('monthly_investor_report', 'html');
    await exporter.saveToFile(monthlyReport, monthlyFilename);
    console.log(`✓ Monthly report saved: ${monthlyFilename}`);

    console.log('\n  Schedule these functions with cron or a task scheduler');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

/**
 * Example 8: Custom Export Pipeline
 * Combine multiple exports for a complete data package
 */
async function example8_CustomExportPipeline() {
  console.log('\n=== Example 8: Custom Export Pipeline ===\n');

  try {
    await db.initialize();

    const startDate = '2024-10-01';
    const endDate = '2024-10-31';

    console.log('Creating comprehensive export package...\n');

    // 1. Executive Summary (HTML)
    const investorReport = await exporter.generateInvestorReport(startDate, endDate);
    await exporter.saveToFile(
      investorReport,
      'package_1_executive_summary.html',
      './exports/package'
    );
    console.log('✓ 1. Executive Summary (HTML)');

    // 2. Detailed Analytics (JSON)
    const analyticsJSON = await exporter.exportToJSON('analytics', { startDate, endDate });
    await exporter.saveToFile(
      JSON.stringify(analyticsJSON, null, 2),
      'package_2_analytics_data.json',
      './exports/package'
    );
    console.log('✓ 2. Analytics Data (JSON)');

    // 3. Event Log (CSV)
    const eventsCSV = await exporter.exportEventsToCSV(startDate, endDate);
    await exporter.saveToFile(
      eventsCSV,
      'package_3_event_log.csv',
      './exports/package'
    );
    console.log('✓ 3. Event Log (CSV)');

    // 4. User Database (CSV)
    const usersCSV = await exporter.exportUsersToCSV();
    await exporter.saveToFile(
      usersCSV,
      'package_4_user_database.csv',
      './exports/package'
    );
    console.log('✓ 4. User Database (CSV)');

    // 5. Excel Sheets
    const excelSheets = await exporter.exportToExcel(startDate, endDate);
    for (const [sheetName, content] of Object.entries(excelSheets)) {
      const sanitizedName = sheetName.toLowerCase().replace(/\s+/g, '_');
      await exporter.saveToFile(
        content,
        `package_5_excel_${sanitizedName}.csv`,
        './exports/package'
      );
    }
    console.log('✓ 5. Excel Worksheets (Multiple CSVs)');

    console.log('\n✓ Complete export package created in ./exports/package/');
    console.log('  Ready to share with investors and stakeholders!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.close();
  }
}

// ==================== Run Examples ====================

// Uncomment the example you want to run:

// example1_ExportEventsToCSV();
// example2_ExportUsersToCSV();
// example3_ExportAnalyticsReports();
// example4_ExportToJSON();
// example5_GenerateInvestorReport();
// example6_ExportToExcel();
// example7_ScheduledExports();
// example8_CustomExportPipeline();

// Or run all examples in sequence:
async function runAllExamples() {
  await example1_ExportEventsToCSV();
  await example2_ExportUsersToCSV();
  await example3_ExportAnalyticsReports();
  await example4_ExportToJSON();
  await example5_GenerateInvestorReport();
  await example6_ExportToExcel();
  await example7_ScheduledExports();
  await example8_CustomExportPipeline();

  console.log('\n=== All Examples Completed ===\n');
}

// Uncomment to run all examples:
// runAllExamples();

module.exports = {
  example1_ExportEventsToCSV,
  example2_ExportUsersToCSV,
  example3_ExportAnalyticsReports,
  example4_ExportToJSON,
  example5_GenerateInvestorReport,
  example6_ExportToExcel,
  example7_ScheduledExports,
  example8_CustomExportPipeline,
  runAllExamples
};
