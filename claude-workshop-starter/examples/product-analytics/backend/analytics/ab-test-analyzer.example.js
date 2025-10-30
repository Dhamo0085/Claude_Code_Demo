// Example usage of ABTestAnalyzer
// This file demonstrates how to use the A/B test analyzer module

const Database = require('../database');
const ABTestAnalyzer = require('./ab-test-analyzer');

async function runExample() {
  // Initialize database
  const db = new Database('./analytics-example.db');
  await db.initialize();

  // Create analyzer instance
  const analyzer = new ABTestAnalyzer(db);

  // Example: Create an experiment
  const experimentId = 'exp_checkout_button_test';
  await db.run(
    `INSERT OR REPLACE INTO experiments (id, name, description, status, variants, start_date, goal_event)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      experimentId,
      'Checkout Button Color Test',
      'Testing different button colors for checkout conversion',
      'running',
      JSON.stringify(['control', 'variant_a', 'variant_b']),
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      'purchase_completed'
    ]
  );

  // Simulate user assignments and events
  console.log('Setting up sample data...');
  const variants = ['control', 'variant_a', 'variant_b'];

  for (let i = 0; i < 300; i++) {
    const userId = `user_${i}`;
    const variant = variants[i % 3];

    // Create user
    await db.createUser({
      id: userId,
      email: `user${i}@example.com`,
      name: `User ${i}`
    });

    // Assign to experiment
    await db.run(
      `INSERT OR IGNORE INTO experiment_assignments (experiment_id, user_id, variant, assigned_at)
       VALUES (?, ?, ?, ?)`,
      [
        experimentId,
        userId,
        variant,
        new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
      ]
    );

    // Simulate conversions (variant_a performs better)
    const conversionRate = variant === 'control' ? 0.15 : variant === 'variant_a' ? 0.22 : 0.17;
    if (Math.random() < conversionRate) {
      await db.trackEvent({
        event_name: 'purchase_completed',
        user_id: userId,
        properties: { amount: Math.random() * 100 + 50 },
        session_id: `session_${userId}`,
        device_type: 'desktop'
      });
    }
  }

  console.log('\n=== A/B Test Analysis Examples ===\n');

  // 1. Get comprehensive experiment results
  console.log('1. Getting Experiment Results...');
  const results = await analyzer.getExperimentResults(experimentId);
  console.log(JSON.stringify(results, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // 2. Calculate statistical significance
  console.log('2. Calculating Statistical Significance...');
  const significance = await analyzer.calculateSignificance(experimentId);
  console.log(JSON.stringify(significance, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // 3. Compare variants
  console.log('3. Comparing Variants...');
  const comparison = await analyzer.getVariantComparison(experimentId);
  console.log(JSON.stringify(comparison, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // 4. Get time series data
  console.log('4. Getting Time Series (Daily)...');
  const timeSeries = await analyzer.getExperimentTimeSeries(experimentId, 'day');
  console.log(JSON.stringify(timeSeries, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // 5. Get recommendation
  console.log('5. Getting Automated Recommendation...');
  const recommendation = await analyzer.getRecommendation(experimentId);
  console.log(JSON.stringify(recommendation, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // Clean up
  await db.close();
  console.log('\nExample completed successfully!');
}

// Run the example
if (require.main === module) {
  runExample().catch(error => {
    console.error('Error running example:', error);
    process.exit(1);
  });
}

module.exports = { runExample };
