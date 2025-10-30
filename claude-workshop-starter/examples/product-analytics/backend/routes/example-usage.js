/**
 * Example Usage of Product Analytics API Routes
 *
 * This file demonstrates how to use all the API endpoints with sample requests.
 * Run this after starting the server to populate sample data and test endpoints.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Helper function for API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

async function runExamples() {
  console.log('Product Analytics API - Example Usage\n');
  console.log('=====================================\n');

  try {
    // 1. CREATE USERS
    console.log('1. Creating sample users...');
    const users = [
      {
        id: 'user_001',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        properties: { plan: 'premium', signup_source: 'google' }
      },
      {
        id: 'user_002',
        email: 'bob@example.com',
        name: 'Bob Smith',
        properties: { plan: 'free', signup_source: 'facebook' }
      },
      {
        id: 'user_003',
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        properties: { plan: 'premium', signup_source: 'direct' }
      }
    ];

    for (const user of users) {
      const result = await apiCall('POST', '/api/users', user);
      console.log(`  Created user: ${user.name} (${result.user.id})`);
    }
    console.log('\n');

    // 2. TRACK SINGLE EVENT
    console.log('2. Tracking single event...');
    const eventResult = await apiCall('POST', '/api/events/track', {
      event_name: 'page_view',
      user_id: 'user_001',
      properties: { page: 'homepage', referrer: 'google' },
      session_id: 'session_123',
      page_url: 'https://example.com',
      device_type: 'mobile',
      browser: 'Chrome',
      country: 'US',
      city: 'San Francisco'
    });
    console.log(`  Tracked event ID: ${eventResult.event_id}`);
    console.log('\n');

    // 3. TRACK BATCH EVENTS
    console.log('3. Tracking batch events...');
    const batchEvents = [
      {
        event_name: 'button_click',
        user_id: 'user_001',
        properties: { button: 'signup', page: 'homepage' },
        session_id: 'session_123',
        device_type: 'mobile'
      },
      {
        event_name: 'page_view',
        user_id: 'user_002',
        properties: { page: 'pricing' },
        session_id: 'session_456',
        device_type: 'desktop'
      },
      {
        event_name: 'feature_used',
        user_id: 'user_002',
        properties: { feature: 'dashboard' },
        session_id: 'session_456',
        device_type: 'desktop'
      },
      {
        event_name: 'signup_complete',
        user_id: 'user_003',
        properties: { plan: 'premium' },
        session_id: 'session_789',
        device_type: 'tablet'
      }
    ];

    const batchResult = await apiCall('POST', '/api/events/batch', { events: batchEvents });
    console.log(`  Tracked ${batchResult.tracked_count} events`);
    console.log('\n');

    // 4. QUERY EVENTS
    console.log('4. Querying events...');
    const eventsResult = await apiCall('GET', '/api/events?limit=10');
    console.log(`  Found ${eventsResult.count} events (total: ${eventsResult.total})`);
    console.log(`  Sample event: ${eventsResult.events[0]?.event_name}`);
    console.log('\n');

    // 5. GET EVENT SUMMARY
    console.log('5. Getting event summary...');
    const summaryResult = await apiCall('GET', '/api/events/summary');
    console.log(`  Total events: ${summaryResult.summary.total_events}`);
    console.log(`  Unique users: ${summaryResult.summary.unique_users}`);
    console.log(`  Unique sessions: ${summaryResult.summary.unique_sessions}`);
    console.log(`  Top events:`);
    summaryResult.summary.top_events.forEach(event => {
      console.log(`    - ${event.event_name}: ${event.count} events, ${event.unique_users} users`);
    });
    console.log('\n');

    // 6. GET USER DETAILS
    console.log('6. Getting user details...');
    const userResult = await apiCall('GET', '/api/users/user_001?include_events=true&event_limit=5');
    console.log(`  User: ${userResult.user.name}`);
    console.log(`  Total events: ${userResult.user.stats.total_events}`);
    console.log(`  Sessions: ${userResult.user.stats.session_count}`);
    if (userResult.user.recent_events) {
      console.log(`  Recent events: ${userResult.user.recent_events.length}`);
    }
    console.log('\n');

    // 7. GET USER JOURNEY
    console.log('7. Getting user journey...');
    const journeyResult = await apiCall('GET', '/api/users/user_001/journey?group_by_session=true');
    console.log(`  Total events in journey: ${journeyResult.journey.total_events}`);
    if (journeyResult.journey.sessions) {
      console.log(`  Total sessions: ${journeyResult.journey.total_sessions}`);
      journeyResult.journey.sessions.forEach((session, idx) => {
        console.log(`    Session ${idx + 1}: ${session.event_count} events, ${session.duration_minutes} mins`);
      });
    }
    console.log('\n');

    // 8. LIST USERS
    console.log('8. Listing users...');
    const usersResult = await apiCall('GET', '/api/users?limit=10&include_stats=true');
    console.log(`  Found ${usersResult.count} users (total: ${usersResult.total})`);
    usersResult.users.forEach(user => {
      console.log(`    - ${user.name}: ${user.stats?.total_events || 0} events`);
    });
    console.log('\n');

    // 9. UPDATE USER PROPERTIES
    console.log('9. Updating user properties...');
    const updateResult = await apiCall('PATCH', '/api/users/user_001/properties', {
      properties: {
        last_login: new Date().toISOString(),
        login_count: 5
      }
    });
    console.log(`  Updated properties for user: ${updateResult.user.id}`);
    console.log(`  New properties:`, updateResult.user.properties);
    console.log('\n');

    // 10. CREATE FUNNEL (requires direct DB access, shown for reference)
    console.log('10. Sample funnel analysis...');
    console.log('  Note: First create a funnel in the database:');
    console.log(`  INSERT INTO funnels (name, description, steps) VALUES`);
    console.log(`    ('Signup Funnel', 'Main signup flow', '["page_view", "button_click", "signup_complete"]');`);
    console.log('\n');

    // 11. CREATE FEATURE (requires direct DB access, shown for reference)
    console.log('11. Sample feature adoption...');
    console.log('  Note: First create a feature in the database:');
    console.log(`  INSERT INTO features (id, name, description, launch_date, target_event) VALUES`);
    console.log(`    ('dashboard_v2', 'Dashboard V2', 'New dashboard', '2025-10-01', 'feature_used');`);
    console.log('\n');

    // 12. CREATE EXPERIMENT (requires direct DB access, shown for reference)
    console.log('12. Sample A/B test...');
    console.log('  Note: First create an experiment in the database:');
    console.log(`  INSERT INTO experiments (id, name, description, status, variants, goal_event, start_date) VALUES`);
    console.log(`    ('btn_color_test', 'Button Color Test', 'Testing button colors', 'running',`);
    console.log(`     '["control", "variant_a"]', 'signup_complete', '2025-10-01');`);
    console.log('\n');

    // 13. ANALYZE USER JOURNEYS
    console.log('13. Analyzing user journeys (requires more data)...');
    try {
      const journeysResult = await apiCall('GET', '/api/analytics/journeys?max_steps=5&min_frequency=1');
      console.log(`  Common paths found: ${journeysResult.journeys.common_paths?.length || 0}`);
      console.log(`  Event sequences found: ${journeysResult.journeys.event_sequences?.length || 0}`);
    } catch (error) {
      console.log('  (Requires more event data)');
    }
    console.log('\n');

    // 14. CALCULATE RETENTION (requires more data)
    console.log('14. Calculating retention (requires more data)...');
    try {
      const retentionResult = await apiCall('GET', '/api/analytics/retention?period=day&num_periods=7');
      console.log(`  Cohorts analyzed: ${retentionResult.retention.cohorts?.length || 0}`);
    } catch (error) {
      console.log('  (Requires more historical data)');
    }
    console.log('\n');

    console.log('=====================================');
    console.log('Examples completed successfully!');
    console.log('=====================================\n');

    // Additional useful queries
    console.log('Additional useful API calls:');
    console.log('  - GET /api/events?event_name=page_view&start_date=2025-10-01');
    console.log('  - GET /api/events?user_id=user_001');
    console.log('  - GET /api/users?cohort_id=premium_users');
    console.log('  - GET /api/analytics/funnels/1?start_date=2025-10-01');
    console.log('  - GET /api/analytics/features/dashboard_v2');
    console.log('  - GET /api/analytics/experiments/btn_color_test');
    console.log('\n');

  } catch (error) {
    console.error('Error running examples:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.status === 'healthy') {
      console.log('Server is healthy. Running examples...\n');
      return true;
    }
  } catch (error) {
    console.error('Error: Server is not running or not responding.');
    console.error(`Please start the server first: node server.js`);
    return false;
  }
}

// Main execution
async function main() {
  const serverReady = await checkServer();
  if (serverReady) {
    await runExamples();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runExamples };
