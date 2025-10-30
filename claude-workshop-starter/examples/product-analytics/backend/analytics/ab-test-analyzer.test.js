// Test Suite for A/B Test Analyzer
// Run with: node ab-test-analyzer.test.js

const Database = require('../database');
const ABTestAnalyzer = require('./ab-test-analyzer');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    try {
      await fn();
      this.passed++;
      console.log(`✓ ${name}`);
    } catch (error) {
      this.failed++;
      console.log(`✗ ${name}`);
      console.error(`  Error: ${error.message}`);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  assertTrue(value, message) {
    if (!value) {
      throw new Error(`${message}: expected true, got ${value}`);
    }
  }

  assertFalse(value, message) {
    if (value) {
      throw new Error(`${message}: expected false, got ${value}`);
    }
  }

  assertGreaterThan(actual, expected, message) {
    if (actual <= expected) {
      throw new Error(`${message}: expected > ${expected}, got ${actual}`);
    }
  }

  assertExists(value, message) {
    if (value === null || value === undefined) {
      throw new Error(`${message}: value should exist`);
    }
  }

  summary() {
    console.log('\n' + '='.repeat(80));
    console.log(`Tests: ${this.passed + this.failed}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log('='.repeat(80));
    return this.failed === 0;
  }
}

async function setupTestData(db, experimentId) {
  // Create experiment
  await db.run(
    `INSERT OR REPLACE INTO experiments (id, name, description, status, variants, start_date, goal_event)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      experimentId,
      'Test Experiment',
      'Testing A/B analyzer',
      'running',
      JSON.stringify(['control', 'variant_a', 'variant_b']),
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      'test_conversion'
    ]
  );

  // Create users and assignments
  const variants = ['control', 'variant_a', 'variant_b'];
  const conversionRates = {
    control: 0.15,
    variant_a: 0.22,
    variant_b: 0.17
  };

  for (let i = 0; i < 300; i++) {
    const userId = `test_user_${i}`;
    const variant = variants[i % 3];

    // Create user
    await db.createUser({
      id: userId,
      email: `test${i}@example.com`,
      name: `Test User ${i}`
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

    // Simulate conversions
    if (Math.random() < conversionRates[variant]) {
      await db.trackEvent({
        event_name: 'test_conversion',
        user_id: userId,
        properties: {},
        session_id: `session_${userId}`,
        device_type: 'desktop'
      });
    }
  }
}

async function runTests() {
  const runner = new TestRunner();
  const dbPath = './test-analytics.db';

  // Clean up old test database
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);
  await db.initialize();

  const analyzer = new ABTestAnalyzer(db);
  const experimentId = 'test_exp_001';

  console.log('Setting up test data...\n');
  await setupTestData(db, experimentId);

  console.log('Running tests...\n');

  // Test 1: Get Experiment Results
  await runner.test('getExperimentResults returns valid structure', async () => {
    const results = await analyzer.getExperimentResults(experimentId);

    runner.assertExists(results, 'Results should exist');
    runner.assertEqual(results.experiment_id, experimentId, 'Experiment ID should match');
    runner.assertEqual(results.variants.length, 3, 'Should have 3 variants');
    runner.assertExists(results.aggregate, 'Should have aggregate data');
    runner.assertGreaterThan(results.aggregate.total_users, 0, 'Should have users');
  });

  // Test 2: Variant Metrics
  await runner.test('Variants have correct metrics', async () => {
    const results = await analyzer.getExperimentResults(experimentId);

    results.variants.forEach(variant => {
      runner.assertExists(variant.variant, 'Variant should have name');
      runner.assertExists(variant.total_users, 'Variant should have user count');
      runner.assertExists(variant.conversions, 'Variant should have conversions');
      runner.assertExists(variant.conversion_rate, 'Variant should have conversion rate');
      runner.assertExists(variant.confidence_interval, 'Variant should have confidence interval');
      runner.assertGreaterThan(variant.confidence_interval.upper, variant.confidence_interval.lower,
        'Upper CI should be greater than lower CI');
    });
  });

  // Test 3: Calculate Significance
  await runner.test('calculateSignificance returns valid results', async () => {
    const significance = await analyzer.calculateSignificance(experimentId);

    runner.assertExists(significance, 'Significance should exist');
    runner.assertExists(significance.p_value, 'Should have p-value');
    runner.assertExists(significance.chi_square, 'Should have chi-square statistic');
    runner.assertExists(significance.is_significant, 'Should have significance flag');
    runner.assertExists(significance.best_variant, 'Should identify best variant');
    runner.assertTrue(significance.p_value >= 0 && significance.p_value <= 1,
      'P-value should be between 0 and 1');
  });

  // Test 4: Variant Comparison
  await runner.test('getVariantComparison compares variants correctly', async () => {
    const comparison = await analyzer.getVariantComparison(experimentId);

    runner.assertExists(comparison, 'Comparison should exist');
    runner.assertExists(comparison.best_variant, 'Should identify best variant');
    runner.assertEqual(comparison.comparisons.length, 2, 'Should compare 2 other variants to best');

    comparison.comparisons.forEach(comp => {
      runner.assertExists(comp.difference_from_best, 'Should have difference');
      runner.assertExists(comp.relative_lift, 'Should have relative lift');
      runner.assertExists(comp.confidence_intervals_overlap, 'Should check interval overlap');
    });
  });

  // Test 5: Time Series
  await runner.test('getExperimentTimeSeries returns time series data', async () => {
    const timeSeries = await analyzer.getExperimentTimeSeries(experimentId, 'day');

    runner.assertExists(timeSeries, 'Time series should exist');
    runner.assertEqual(timeSeries.granularity, 'day', 'Should have correct granularity');
    runner.assertEqual(timeSeries.variants.length, 3, 'Should have all variants');

    timeSeries.variants.forEach(variant => {
      runner.assertExists(variant.data_points, 'Variant should have data points');
      runner.assertTrue(Array.isArray(variant.data_points), 'Data points should be array');

      if (variant.data_points.length > 0) {
        const point = variant.data_points[0];
        runner.assertExists(point.period, 'Data point should have period');
        runner.assertExists(point.assignments, 'Data point should have assignments');
        runner.assertExists(point.conversions, 'Data point should have conversions');
        runner.assertExists(point.conversion_rate, 'Data point should have conversion rate');
      }
    });
  });

  // Test 6: Recommendation
  await runner.test('getRecommendation provides actionable advice', async () => {
    const recommendation = await analyzer.getRecommendation(experimentId);

    runner.assertExists(recommendation, 'Recommendation should exist');
    runner.assertExists(recommendation.action, 'Should have action');
    runner.assertExists(recommendation.confidence, 'Should have confidence level');
    runner.assertExists(recommendation.recommendations, 'Should have recommendations array');
    runner.assertTrue(Array.isArray(recommendation.recommendations),
      'Recommendations should be array');
    runner.assertExists(recommendation.next_steps, 'Should have next steps');
    runner.assertTrue(Array.isArray(recommendation.next_steps), 'Next steps should be array');

    const validActions = ['implement_winner', 'continue', 'no_clear_winner'];
    runner.assertTrue(validActions.includes(recommendation.action),
      'Action should be valid type');

    const validConfidences = ['low', 'medium', 'high'];
    runner.assertTrue(validConfidences.includes(recommendation.confidence),
      'Confidence should be valid type');
  });

  // Test 7: Confidence Intervals
  await runner.test('Confidence intervals are properly calculated', async () => {
    const results = await analyzer.getExperimentResults(experimentId);

    results.variants.forEach(variant => {
      const ci = variant.confidence_interval;

      // Check bounds
      runner.assertTrue(ci.lower >= 0, 'Lower bound should be >= 0');
      runner.assertTrue(ci.upper <= 100, 'Upper bound should be <= 100');
      runner.assertTrue(ci.lower < ci.upper, 'Lower should be less than upper');

      // Check if conversion rate is within interval
      runner.assertTrue(
        variant.conversion_rate >= ci.lower && variant.conversion_rate <= ci.upper,
        'Conversion rate should be within confidence interval'
      );
    });
  });

  // Test 8: Chi-Square Test Values
  await runner.test('Chi-square test produces valid statistics', async () => {
    const significance = await analyzer.calculateSignificance(experimentId);

    runner.assertTrue(significance.chi_square >= 0, 'Chi-square should be non-negative');
    runner.assertTrue(significance.degrees_of_freedom > 0, 'DOF should be positive');
    runner.assertEqual(significance.degrees_of_freedom, 2,
      'DOF should equal number of variants minus 1');
    runner.assertTrue(significance.p_value >= 0 && significance.p_value <= 1,
      'P-value should be probability (0-1)');
  });

  // Test 9: Edge Case - No Conversions
  await runner.test('Handles variants with zero conversions', async () => {
    const noConversionExp = 'test_exp_no_conv';

    await db.run(
      `INSERT OR REPLACE INTO experiments (id, name, variants, goal_event, start_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        noConversionExp,
        'No Conversion Test',
        JSON.stringify(['control', 'variant_a']),
        'impossible_event',
        new Date().toISOString()
      ]
    );

    // Create users with no conversions
    for (let i = 0; i < 50; i++) {
      const userId = `no_conv_user_${i}`;
      await db.createUser({ id: userId, email: `noconv${i}@test.com`, name: `User ${i}` });
      await db.run(
        `INSERT OR IGNORE INTO experiment_assignments (experiment_id, user_id, variant)
         VALUES (?, ?, ?)`,
        [noConversionExp, userId, i % 2 === 0 ? 'control' : 'variant_a']
      );
    }

    const results = await analyzer.getExperimentResults(noConversionExp);

    runner.assertEqual(results.aggregate.total_conversions, 0, 'Should have zero conversions');
    results.variants.forEach(variant => {
      runner.assertEqual(variant.conversion_rate, 0, 'Conversion rate should be 0');
    });
  });

  // Test 10: Edge Case - All Conversions
  await runner.test('Handles variants with 100% conversion', async () => {
    const allConversionExp = 'test_exp_all_conv';

    await db.run(
      `INSERT OR REPLACE INTO experiments (id, name, variants, goal_event, start_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        allConversionExp,
        'All Conversion Test',
        JSON.stringify(['control']),
        'test_event',
        new Date().toISOString()
      ]
    );

    // Create users with all conversions
    for (let i = 0; i < 50; i++) {
      const userId = `all_conv_user_${i}`;
      await db.createUser({ id: userId, email: `allconv${i}@test.com`, name: `User ${i}` });
      await db.run(
        `INSERT OR IGNORE INTO experiment_assignments (experiment_id, user_id, variant)
         VALUES (?, ?, ?)`,
        [allConversionExp, userId, 'control']
      );
      await db.trackEvent({
        event_name: 'test_event',
        user_id: userId,
        properties: {},
        session_id: `session_${userId}`
      });
    }

    const results = await analyzer.getExperimentResults(allConversionExp);

    runner.assertEqual(results.variants[0].conversion_rate, 100,
      'Conversion rate should be 100%');
    runner.assertTrue(results.variants[0].confidence_interval.upper <= 100,
      'Upper confidence interval should not exceed 100%');
  });

  // Test 11: Error Handling - Invalid Experiment
  await runner.test('Handles invalid experiment ID gracefully', async () => {
    try {
      await analyzer.getExperimentResults('nonexistent_experiment');
      runner.assertTrue(false, 'Should have thrown error');
    } catch (error) {
      runner.assertTrue(error.message.includes('not found'), 'Should throw not found error');
    }
  });

  // Test 12: Time Series Granularity
  await runner.test('Supports different time granularities', async () => {
    const granularities = ['hour', 'day', 'week'];

    for (const granularity of granularities) {
      const timeSeries = await analyzer.getExperimentTimeSeries(experimentId, granularity);
      runner.assertEqual(timeSeries.granularity, granularity,
        `Should support ${granularity} granularity`);
    }
  });

  // Test 13: Cumulative Metrics
  await runner.test('Cumulative metrics increase over time', async () => {
    const timeSeries = await analyzer.getExperimentTimeSeries(experimentId, 'day');

    timeSeries.variants.forEach(variant => {
      if (variant.data_points.length > 1) {
        for (let i = 1; i < variant.data_points.length; i++) {
          const prev = variant.data_points[i - 1];
          const curr = variant.data_points[i];

          runner.assertTrue(
            curr.cumulative_assignments >= prev.cumulative_assignments,
            'Cumulative assignments should not decrease'
          );
          runner.assertTrue(
            curr.cumulative_conversions >= prev.cumulative_conversions,
            'Cumulative conversions should not decrease'
          );
        }
      }
    });
  });

  // Test 14: Best Variant Detection
  await runner.test('Correctly identifies best performing variant', async () => {
    const comparison = await analyzer.getVariantComparison(experimentId);
    const results = await analyzer.getExperimentResults(experimentId);

    const actualBest = results.variants.reduce((best, current) =>
      current.conversion_rate > best.conversion_rate ? current : best
    );

    runner.assertEqual(comparison.best_variant.name, actualBest.variant,
      'Should identify variant with highest conversion rate');
  });

  // Test 15: Relative Lift Calculation
  await runner.test('Calculates relative lift correctly', async () => {
    const comparison = await analyzer.getVariantComparison(experimentId);
    const bestRate = comparison.best_variant.conversion_rate;

    comparison.comparisons.forEach(comp => {
      const expectedLift = ((bestRate - comp.conversion_rate) / comp.conversion_rate) * 100;
      const actualLift = comp.relative_lift;

      // Allow small floating point differences
      const difference = Math.abs(expectedLift - actualLift);
      runner.assertTrue(difference < 0.1,
        `Relative lift should be calculated correctly (diff: ${difference})`);
    });
  });

  // Clean up
  await db.close();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  return runner.summary();
}

// Run tests
if (require.main === module) {
  console.log('A/B Test Analyzer - Test Suite');
  console.log('='.repeat(80) + '\n');

  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
