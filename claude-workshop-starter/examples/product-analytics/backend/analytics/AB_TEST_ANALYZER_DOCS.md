# A/B Test Analyzer Module Documentation

## Overview

The A/B Test Analyzer is a comprehensive statistical analysis module for evaluating A/B test experiments. It provides production-ready methods for calculating statistical significance, comparing variants, tracking metrics over time, and generating automated recommendations.

## Features

- **Statistical Significance Testing**: Chi-square tests with p-values
- **Confidence Intervals**: Wilson score intervals for conversion rates
- **Variant Comparison**: Head-to-head performance analysis
- **Time Series Analysis**: Track metrics over time with customizable granularity
- **Automated Recommendations**: Data-driven suggestions for experiment decisions
- **Production-Ready**: Comprehensive error handling and validation

## Installation

```javascript
const Database = require('./database');
const ABTestAnalyzer = require('./analytics/ab-test-analyzer');

const db = new Database('./analytics.db');
await db.initialize();

const analyzer = new ABTestAnalyzer(db);
```

## Core Methods

### 1. getExperimentResults(experimentId)

Get comprehensive results for an experiment including all variants and their performance metrics.

**Parameters:**
- `experimentId` (string): The unique identifier for the experiment

**Returns:**
```javascript
{
  experiment_id: "exp_123",
  experiment_name: "Button Color Test",
  description: "Testing button colors",
  status: "running",
  goal_event: "purchase_completed",
  start_date: "2025-10-15T00:00:00Z",
  end_date: null,
  variants: [
    {
      variant: "control",
      total_users: 1000,
      conversions: 150,
      conversion_rate: 15.0,
      confidence_interval: {
        lower: 12.8,
        upper: 17.2
      },
      avg_time_to_conversion_hours: 2.5
    }
  ],
  aggregate: {
    total_users: 3000,
    total_conversions: 500,
    overall_conversion_rate: 16.67
  }
}
```

**Example:**
```javascript
const results = await analyzer.getExperimentResults('exp_checkout_button');
console.log(`Total users: ${results.aggregate.total_users}`);
console.log(`Best variant: ${results.variants[0].variant}`);
```

---

### 2. calculateSignificance(experimentId)

Calculate statistical significance between variants using chi-square test.

**Parameters:**
- `experimentId` (string): The unique identifier for the experiment

**Returns:**
```javascript
{
  experiment_id: "exp_123",
  experiment_name: "Button Color Test",
  is_significant: true,
  p_value: 0.0234,
  chi_square: 8.456,
  degrees_of_freedom: 2,
  best_variant: {
    name: "variant_a",
    conversion_rate: 18.5,
    sample_size: 1000
  },
  confidence_level: 95,
  interpretation: "Strong evidence of difference between variants (p < 0.05)"
}
```

**Example:**
```javascript
const significance = await analyzer.calculateSignificance('exp_checkout_button');

if (significance.is_significant) {
  console.log(`Winner detected: ${significance.best_variant.name}`);
  console.log(`P-value: ${significance.p_value}`);
} else {
  console.log('No significant difference yet - continue testing');
}
```

**Interpretation:**
- `p_value < 0.05`: Statistically significant (can make decision with 95% confidence)
- `p_value < 0.01`: Very strong evidence of difference
- `p_value > 0.05`: Not statistically significant (need more data)

---

### 3. getVariantComparison(experimentId)

Compare all variants head-to-head against the best performing variant.

**Parameters:**
- `experimentId` (string): The unique identifier for the experiment

**Returns:**
```javascript
{
  experiment_id: "exp_123",
  experiment_name: "Button Color Test",
  best_variant: {
    name: "variant_a",
    conversion_rate: 18.5,
    total_users: 1000,
    conversions: 185,
    confidence_interval: {
      lower: 16.1,
      upper: 20.9
    }
  },
  comparisons: [
    {
      variant: "control",
      conversion_rate: 15.0,
      difference_from_best: 3.5,
      relative_lift: 23.33,
      confidence_intervals_overlap: false,
      likely_worse: true
    }
  ],
  summary: {
    total_variants_compared: 3,
    best_variant: "variant_a",
    significantly_worse_variants: 1,
    average_difference: 2.8
  }
}
```

**Example:**
```javascript
const comparison = await analyzer.getVariantComparison('exp_checkout_button');

console.log(`Best variant: ${comparison.best_variant.name}`);
console.log(`Conversion rate: ${comparison.best_variant.conversion_rate}%`);

comparison.comparisons.forEach(comp => {
  console.log(`${comp.variant}: ${comp.relative_lift}% worse`);
});
```

---

### 4. getExperimentTimeSeries(experimentId, granularity)

Track experiment metrics over time with configurable granularity.

**Parameters:**
- `experimentId` (string): The unique identifier for the experiment
- `granularity` (string): Time granularity - 'hour', 'day', 'week', or 'month' (default: 'day')

**Returns:**
```javascript
{
  experiment_id: "exp_123",
  experiment_name: "Button Color Test",
  granularity: "day",
  variants: [
    {
      variant: "control",
      data_points: [
        {
          period: "2025-10-15",
          assignments: 100,
          conversions: 15,
          conversion_rate: 15.0,
          cumulative_assignments: 100,
          cumulative_conversions: 15,
          cumulative_conversion_rate: 15.0
        }
      ]
    }
  ],
  timeline: [
    {
      period: "2025-10-15",
      variants: {
        control: {
          assignments: 100,
          conversions: 15,
          conversion_rate: 15.0
        },
        variant_a: {
          assignments: 98,
          conversions: 18,
          conversion_rate: 18.37
        }
      }
    }
  ]
}
```

**Example:**
```javascript
// Daily granularity
const daily = await analyzer.getExperimentTimeSeries('exp_checkout_button', 'day');

// Weekly rollup
const weekly = await analyzer.getExperimentTimeSeries('exp_checkout_button', 'week');

// Hourly detail
const hourly = await analyzer.getExperimentTimeSeries('exp_checkout_button', 'hour');
```

---

### 5. getRecommendation(experimentId)

Generate automated, data-driven recommendations for experiment decisions.

**Parameters:**
- `experimentId` (string): The unique identifier for the experiment

**Returns:**
```javascript
{
  experiment_id: "exp_123",
  experiment_name: "Button Color Test",
  action: "implement_winner", // or "continue", "no_clear_winner"
  confidence: "high", // or "medium", "low"
  days_running: 14,
  is_statistically_significant: true,
  recommended_variant: "variant_a",
  recommendations: [
    {
      type: "success",
      message: "Implement variant 'variant_a' - statistically significant winner detected.",
      details: "variant_a shows 23.3% improvement with p-value of 0.0234."
    },
    {
      type: "action",
      message: "Roll out winning variant to all users.",
      details: "Expected improvement: 23.3% increase in conversion rate."
    }
  ],
  metrics_summary: {
    total_users: 3000,
    total_conversions: 500,
    best_conversion_rate: 18.5,
    p_value: 0.0234
  },
  next_steps: [
    "1. Prepare deployment of winning variant to all users",
    "2. Monitor metrics closely during rollout",
    "3. Document learnings for future experiments",
    "4. Expected outcome: 18.5% conversion rate"
  ]
}
```

**Example:**
```javascript
const recommendation = await analyzer.getRecommendation('exp_checkout_button');

console.log(`Action: ${recommendation.action}`);
console.log(`Confidence: ${recommendation.confidence}`);

recommendation.recommendations.forEach(rec => {
  console.log(`[${rec.type}] ${rec.message}`);
});

recommendation.next_steps.forEach(step => {
  console.log(step);
});
```

**Action Types:**
- `implement_winner`: Clear winner found, implement it
- `continue`: Need more data, keep running
- `no_clear_winner`: No meaningful difference, choose based on other factors

---

## Statistical Methods

### Chi-Square Test

The module uses chi-square test for independence to determine if conversion rates differ significantly between variants.

**Formula:**
```
χ² = Σ((Observed - Expected)² / Expected)
```

**Interpretation:**
- Tests null hypothesis: "All variants have the same conversion rate"
- P-value < 0.05: Reject null hypothesis (variants are different)
- P-value ≥ 0.05: Cannot reject null hypothesis (need more data)

### Confidence Intervals

Wilson score interval is used for calculating confidence intervals around conversion rates.

**Why Wilson Score?**
- More accurate than normal approximation for small sample sizes
- Handles edge cases (0% or 100% conversion) better
- Industry standard for conversion rate confidence intervals

**Formula:**
```
CI = (p + z²/2n ± z√(p(1-p)/n + z²/4n²)) / (1 + z²/n)
```

Where:
- p = observed conversion rate
- z = 1.96 (for 95% confidence)
- n = sample size

---

## Configuration

The analyzer has configurable thresholds:

```javascript
class ABTestAnalyzer {
  constructor(db) {
    this.db = db;
    this.CONFIDENCE_LEVEL = 0.95;  // 95% confidence
    this.MIN_SAMPLE_SIZE = 100;     // Minimum users per variant
    this.MIN_CONVERSIONS = 10;      // Minimum conversions per variant
  }
}
```

You can modify these by extending the class:

```javascript
class CustomAnalyzer extends ABTestAnalyzer {
  constructor(db) {
    super(db);
    this.MIN_SAMPLE_SIZE = 200;  // Require more samples
    this.CONFIDENCE_LEVEL = 0.99; // Higher confidence level
  }
}
```

---

## Best Practices

### 1. Sample Size Requirements

**Minimum Requirements:**
- 100 users per variant (configurable)
- 10 conversions per variant (configurable)

**Recommended:**
- 300+ users per variant for reliable results
- Run for at least 1-2 weeks to capture weekly patterns

### 2. When to Make Decisions

**Implement Winner When:**
- P-value < 0.05 (statistically significant)
- Minimum sample size met
- Results are business-meaningful (> 5% improvement)
- Confidence intervals don't overlap

**Continue Testing When:**
- P-value > 0.05 (not significant yet)
- Sample size below minimum
- Results show promising trends

**Stop Testing When:**
- No meaningful difference after 2+ weeks
- Results are statistically flat (p > 0.5)
- Business constraints require a decision

### 3. Common Pitfalls to Avoid

**Peeking Problem:**
- Don't stop the test as soon as you see significance
- Run for predetermined duration
- Use the recommendation system for guidance

**Multiple Comparisons:**
- Each additional variant reduces power
- Limit to 2-4 variants per test
- Use Bonferroni correction for many variants

**Insufficient Sample Size:**
- Calculate required sample size before starting
- Use power analysis (online calculators available)
- Don't make decisions on small samples

---

## Error Handling

All methods include comprehensive error handling:

```javascript
try {
  const results = await analyzer.getExperimentResults('exp_123');
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Experiment does not exist');
  } else if (error.message.includes('Insufficient')) {
    console.error('Not enough data yet');
  } else {
    console.error('Analysis failed:', error.message);
  }
}
```

---

## Integration Example

Complete integration with your application:

```javascript
const express = require('express');
const Database = require('./database');
const ABTestAnalyzer = require('./analytics/ab-test-analyzer');

const app = express();
const db = new Database('./analytics.db');
const analyzer = new ABTestAnalyzer(db);

// Initialize database
await db.initialize();

// API endpoint for experiment results
app.get('/api/experiments/:id/results', async (req, res) => {
  try {
    const results = await analyzer.getExperimentResults(req.params.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for recommendations
app.get('/api/experiments/:id/recommendation', async (req, res) => {
  try {
    const recommendation = await analyzer.getRecommendation(req.params.id);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard endpoint
app.get('/api/experiments/:id/dashboard', async (req, res) => {
  try {
    const [results, significance, comparison, recommendation] = await Promise.all([
      analyzer.getExperimentResults(req.params.id),
      analyzer.calculateSignificance(req.params.id),
      analyzer.getVariantComparison(req.params.id),
      analyzer.getRecommendation(req.params.id)
    ]);

    res.json({
      results,
      significance,
      comparison,
      recommendation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Testing

Run the example file to see the module in action:

```bash
node analytics/ab-test-analyzer.example.js
```

This will:
1. Create a sample experiment
2. Generate synthetic data
3. Run all analysis methods
4. Display comprehensive results

---

## Performance Considerations

### Database Queries

All queries are optimized with:
- Proper indexes on key columns
- Efficient JOIN operations
- Parameterized queries to prevent SQL injection

### Caching Recommendations

For high-traffic applications, consider caching:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

async function getCachedResults(experimentId) {
  const cacheKey = `exp_${experimentId}`;

  let results = cache.get(cacheKey);
  if (!results) {
    results = await analyzer.getExperimentResults(experimentId);
    cache.set(cacheKey, results);
  }

  return results;
}
```

---

## Further Reading

### Statistical Resources
- [Chi-Square Test Explained](https://www.statisticshowto.com/chi-square-test/)
- [Wilson Score Interval](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval)
- [Statistical Power](https://www.statisticshowto.com/statistical-power/)

### A/B Testing Best Practices
- [Google's A/B Testing Guide](https://support.google.com/optimize/answer/6211921)
- [Evan Miller's A/B Testing Tools](https://www.evanmiller.org/ab-testing/)
- [Optimizely's Stats Engine](https://www.optimizely.com/insights/blog/stats-engine/)

---

## License

This module is part of the Claude Code Demo Workshop and is provided as-is for educational purposes.

---

## Support

For questions or issues:
1. Check the example file for usage patterns
2. Review the inline code documentation
3. Consult the statistical resources above
4. Test with small sample data first

---

## Changelog

### Version 1.0.0 (2025-10-29)
- Initial release
- Chi-square significance testing
- Wilson score confidence intervals
- Variant comparison analysis
- Time series tracking
- Automated recommendations
- Comprehensive error handling
- Production-ready code
