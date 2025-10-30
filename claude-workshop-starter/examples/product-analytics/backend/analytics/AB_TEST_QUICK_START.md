# A/B Test Analyzer - Quick Start Guide

## 5-Minute Setup

### 1. Initialize the Analyzer

```javascript
const Database = require('./database');
const ABTestAnalyzer = require('./analytics/ab-test-analyzer');

const db = new Database('./analytics.db');
await db.initialize();
const analyzer = new ABTestAnalyzer(db);
```

### 2. Create an Experiment

```javascript
const experimentId = 'exp_signup_form';

await db.run(
  `INSERT INTO experiments (id, name, variants, goal_event, start_date)
   VALUES (?, ?, ?, ?, ?)`,
  [
    experimentId,
    'Signup Form Redesign',
    JSON.stringify(['control', 'variant_a']),
    'signup_completed',
    new Date().toISOString()
  ]
);
```

### 3. Assign Users to Variants

```javascript
// Assign a user to a variant
await db.run(
  `INSERT INTO experiment_assignments (experiment_id, user_id, variant)
   VALUES (?, ?, ?)`,
  [experimentId, 'user_123', 'variant_a']
);
```

### 4. Track Goal Events

```javascript
// Track when users complete the goal
await db.trackEvent({
  event_name: 'signup_completed',
  user_id: 'user_123',
  properties: {},
  session_id: 'session_abc'
});
```

### 5. Analyze Results

```javascript
// Get comprehensive dashboard
const results = await analyzer.getExperimentResults(experimentId);
const significance = await analyzer.calculateSignificance(experimentId);
const recommendation = await analyzer.getRecommendation(experimentId);

console.log(`Winner: ${recommendation.recommended_variant}`);
console.log(`Action: ${recommendation.action}`);
console.log(`Confidence: ${recommendation.confidence}`);
```

---

## Common Use Cases

### Use Case 1: Check if Experiment is Ready for Decision

```javascript
const recommendation = await analyzer.getRecommendation(experimentId);

if (recommendation.action === 'implement_winner') {
  console.log(`✓ Winner found: ${recommendation.recommended_variant}`);
  console.log('Deploy the winning variant!');
} else if (recommendation.action === 'continue') {
  console.log('✗ Not enough data yet. Keep running.');
} else {
  console.log('⚠ No clear winner. Consider other factors.');
}
```

### Use Case 2: Monitor Daily Performance

```javascript
const timeSeries = await analyzer.getExperimentTimeSeries(experimentId, 'day');

timeSeries.variants.forEach(variant => {
  const latest = variant.data_points[variant.data_points.length - 1];
  console.log(`${variant.variant}: ${latest.cumulative_conversion_rate}%`);
});
```

### Use Case 3: Compare Two Specific Variants

```javascript
const comparison = await analyzer.getVariantComparison(experimentId);

const best = comparison.best_variant;
const competitor = comparison.comparisons[0];

console.log(`${best.name}: ${best.conversion_rate}%`);
console.log(`${competitor.variant}: ${competitor.conversion_rate}%`);
console.log(`Difference: ${competitor.difference_from_best}pp`);
console.log(`Lift: ${competitor.relative_lift}%`);
```

### Use Case 4: Export Results to Dashboard

```javascript
async function getDashboardData(experimentId) {
  const [results, significance, comparison, timeSeries] = await Promise.all([
    analyzer.getExperimentResults(experimentId),
    analyzer.calculateSignificance(experimentId),
    analyzer.getVariantComparison(experimentId),
    analyzer.getExperimentTimeSeries(experimentId, 'day')
  ]);

  return {
    overview: {
      name: results.experiment_name,
      status: results.status,
      daysRunning: Math.floor((Date.now() - new Date(results.start_date)) / (1000 * 60 * 60 * 24)),
      totalUsers: results.aggregate.total_users
    },
    winner: {
      variant: comparison.best_variant.name,
      conversionRate: comparison.best_variant.conversion_rate,
      isSignificant: significance.is_significant,
      pValue: significance.p_value
    },
    variants: results.variants,
    chart: timeSeries.timeline,
    recommendation: await analyzer.getRecommendation(experimentId)
  };
}
```

---

## Decision Matrix

| Scenario | P-Value | Sample Size | Action |
|----------|---------|-------------|--------|
| Clear winner | < 0.05 | ✓ Sufficient | **Deploy winner** |
| Trending | 0.05 - 0.20 | ✓ Sufficient | Continue testing |
| No difference | > 0.50 | ✓ Sufficient | Pick simpler variant |
| Any result | Any | ✗ Insufficient | Keep running |

---

## Troubleshooting

### "Insufficient sample size" Warning

**Problem:** Not enough users or conversions

**Solution:**
```javascript
const results = await analyzer.getExperimentResults(experimentId);

results.variants.forEach(v => {
  console.log(`${v.variant}:`);
  console.log(`  Users: ${v.total_users} (need 100+)`);
  console.log(`  Conversions: ${v.conversions} (need 10+)`);
});
```

### High P-Value (> 0.5)

**Problem:** Variants performing identically

**Options:**
1. Test more dramatic changes
2. Pick variant based on cost/complexity
3. Run longer to detect small differences

### Confidence Intervals Overlap

**Problem:** Results not definitive

**Solution:**
```javascript
const comparison = await analyzer.getVariantComparison(experimentId);

comparison.comparisons.forEach(c => {
  if (c.confidence_intervals_overlap) {
    console.log(`${c.variant}: Results overlap with winner`);
    console.log('Need more data or larger effect size');
  }
});
```

---

## Sample Size Calculator

Estimate how long to run your test:

```javascript
function estimateSampleSize(baselineRate, minimumDetectableEffect, dailyTraffic) {
  // Simplified calculation - use online calculator for precise values
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  const effectSize = Math.abs(p2 - p1);

  // Rule of thumb: need ~16 / effectSize² conversions per variant
  const conversionsNeeded = Math.ceil(16 / (effectSize * effectSize));
  const usersNeeded = Math.ceil(conversionsNeeded / baselineRate);
  const daysNeeded = Math.ceil(usersNeeded / dailyTraffic);

  return {
    usersPerVariant: usersNeeded,
    conversionsPerVariant: conversionsNeeded,
    estimatedDays: daysNeeded
  };
}

// Example: 10% baseline, want to detect 20% improvement, 500 users/day
const estimate = estimateSampleSize(0.10, 0.20, 500);
console.log(`Need ${estimate.usersPerVariant} users per variant`);
console.log(`Estimated duration: ${estimate.estimatedDays} days`);
```

---

## API Quick Reference

```javascript
// Get all experiment data
analyzer.getExperimentResults(experimentId)

// Check statistical significance
analyzer.calculateSignificance(experimentId)

// Compare variants head-to-head
analyzer.getVariantComparison(experimentId)

// Get performance over time
analyzer.getExperimentTimeSeries(experimentId, 'day')

// Get automated recommendation
analyzer.getRecommendation(experimentId)
```

---

## Run Example

```bash
cd backend/analytics
node ab-test-analyzer.example.js
```

This creates a sample experiment with 300 users and shows all analysis methods in action.

---

## Next Steps

1. ✓ Set up your experiment in the database
2. ✓ Assign users to variants randomly (50/50 split)
3. ✓ Track goal event completions
4. ✓ Check results daily using `getRecommendation()`
5. ✓ Make decision when statistically significant

---

## Pro Tips

1. **Always randomize** user assignments 50/50
2. **Run for full weeks** to capture weekly patterns
3. **Don't peek too early** - wait for minimum sample size
4. **Document everything** - save experiment configs and results
5. **Test one thing** at a time for clear learnings

---

## Resources

- Full documentation: `AB_TEST_ANALYZER_DOCS.md`
- Example code: `ab-test-analyzer.example.js`
- Main module: `ab-test-analyzer.js`

---

Ready to start testing! 🚀
