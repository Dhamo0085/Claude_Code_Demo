# A/B Test Analyzer Module

## Overview

A production-ready, statistically rigorous A/B test analysis module for product analytics. This module provides comprehensive tools for tracking experiments, calculating statistical significance, and generating automated recommendations.

## Files

- **ab-test-analyzer.js** (26KB, 768 lines)
  - Core module with all analysis methods
  - Statistical significance testing using chi-square
  - Wilson score confidence intervals
  - Time series analysis
  - Automated recommendations

- **ab-test-analyzer.example.js** (3.7KB)
  - Complete working example
  - Sample data generation
  - Demonstrates all features
  - Run: `node ab-test-analyzer.example.js`

- **ab-test-analyzer.test.js** (16KB)
  - Comprehensive test suite with 15 tests
  - Edge case handling
  - Validation of statistical methods
  - Run: `node ab-test-analyzer.test.js`

- **AB_TEST_ANALYZER_DOCS.md** (15KB)
  - Complete API documentation
  - Statistical method explanations
  - Best practices guide
  - Integration examples

- **AB_TEST_QUICK_START.md** (7.5KB)
  - 5-minute setup guide
  - Common use cases
  - Decision matrix
  - Troubleshooting tips

## Quick Start

```javascript
const Database = require('./database');
const ABTestAnalyzer = require('./analytics/ab-test-analyzer');

// Initialize
const db = new Database('./analytics.db');
await db.initialize();
const analyzer = new ABTestAnalyzer(db);

// Analyze experiment
const recommendation = await analyzer.getRecommendation('exp_001');
console.log(`Action: ${recommendation.action}`);
console.log(`Winner: ${recommendation.recommended_variant}`);
```

## Key Features

### 1. Statistical Rigor
- Chi-square test for independence
- Wilson score confidence intervals
- P-value calculations
- Proper handling of sample sizes

### 2. Comprehensive Analysis
- Experiment results with all metrics
- Variant comparison (head-to-head)
- Time series tracking (hourly/daily/weekly)
- Statistical significance testing
- Automated recommendations

### 3. Production Ready
- Comprehensive error handling
- Input validation
- Edge case handling (0% and 100% conversion)
- Efficient database queries
- Clean, documented code

### 4. Business-Friendly
- Automated recommendations with clear actions
- Plain-language interpretations
- Next steps guidance
- Confidence levels (low/medium/high)

## API Methods

### Core Analysis
```javascript
// Get all experiment data
analyzer.getExperimentResults(experimentId)

// Statistical significance test
analyzer.calculateSignificance(experimentId)

// Head-to-head comparison
analyzer.getVariantComparison(experimentId)

// Time series data
analyzer.getExperimentTimeSeries(experimentId, 'day')

// Automated recommendation
analyzer.getRecommendation(experimentId)
```

## Statistical Methods

### Chi-Square Test
Tests whether conversion rates differ significantly between variants.

- **Null Hypothesis**: All variants have the same conversion rate
- **Significance Level**: p < 0.05 (95% confidence)
- **Output**: p-value, chi-square statistic, degrees of freedom

### Confidence Intervals
Wilson score method for accurate confidence intervals.

- **Confidence Level**: 95% (configurable)
- **Method**: Wilson score interval
- **Better than**: Normal approximation for edge cases

### Sample Size Requirements
- **Minimum**: 100 users + 10 conversions per variant
- **Recommended**: 300+ users for reliable results
- **Duration**: 1-2 weeks minimum to capture patterns

## Decision Framework

| P-Value | Sample Size | Recommendation |
|---------|-------------|----------------|
| < 0.05  | Sufficient  | ✓ Deploy winner |
| 0.05-0.20 | Sufficient | → Continue testing |
| > 0.50  | Sufficient  | = No clear winner |
| Any     | Insufficient | ⏳ Keep running |

## Example Output

### Experiment Results
```json
{
  "experiment_name": "Checkout Button Test",
  "variants": [
    {
      "variant": "variant_a",
      "total_users": 1000,
      "conversions": 220,
      "conversion_rate": 22.0,
      "confidence_interval": {
        "lower": 19.5,
        "upper": 24.5
      }
    }
  ],
  "aggregate": {
    "total_users": 3000,
    "total_conversions": 540,
    "overall_conversion_rate": 18.0
  }
}
```

### Statistical Significance
```json
{
  "is_significant": true,
  "p_value": 0.0234,
  "chi_square": 8.456,
  "best_variant": {
    "name": "variant_a",
    "conversion_rate": 22.0
  },
  "interpretation": "Strong evidence of difference between variants (p < 0.05)"
}
```

### Recommendation
```json
{
  "action": "implement_winner",
  "confidence": "high",
  "recommended_variant": "variant_a",
  "recommendations": [
    {
      "type": "success",
      "message": "Implement variant 'variant_a' - statistically significant winner detected.",
      "details": "variant_a shows 46.7% improvement with p-value of 0.0234."
    }
  ],
  "next_steps": [
    "1. Prepare deployment of winning variant to all users",
    "2. Monitor metrics closely during rollout",
    "3. Document learnings for future experiments"
  ]
}
```

## Testing

### Run Example
```bash
node ab-test-analyzer.example.js
```

Demonstrates all features with sample data:
- Creates test experiment with 3 variants
- Generates 300 users with realistic conversion patterns
- Shows all analysis methods in action
- Displays comprehensive results

### Run Tests
```bash
node ab-test-analyzer.test.js
```

Comprehensive test suite covering:
- ✓ Basic functionality (5 tests)
- ✓ Statistical calculations (4 tests)
- ✓ Edge cases (3 tests)
- ✓ Error handling (2 tests)
- ✓ Data validation (1 test)

**Total**: 15 tests validating all core functionality

## Integration

### Express.js API
```javascript
const express = require('express');
const app = express();

app.get('/api/experiments/:id/dashboard', async (req, res) => {
  const [results, significance, recommendation] = await Promise.all([
    analyzer.getExperimentResults(req.params.id),
    analyzer.calculateSignificance(req.params.id),
    analyzer.getRecommendation(req.params.id)
  ]);

  res.json({ results, significance, recommendation });
});
```

### React Dashboard
```javascript
function ExperimentDashboard({ experimentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/experiments/${experimentId}/dashboard`)
      .then(res => res.json())
      .then(setData);
  }, [experimentId]);

  if (!data) return <Loading />;

  return (
    <div>
      <h1>{data.results.experiment_name}</h1>

      {data.significance.is_significant && (
        <Alert type="success">
          Winner: {data.significance.best_variant.name}
        </Alert>
      )}

      <VariantChart variants={data.results.variants} />

      <Recommendations recommendations={data.recommendation.recommendations} />
    </div>
  );
}
```

## Configuration

### Thresholds
Customize statistical thresholds:

```javascript
class CustomAnalyzer extends ABTestAnalyzer {
  constructor(db) {
    super(db);
    this.CONFIDENCE_LEVEL = 0.99;  // 99% confidence
    this.MIN_SAMPLE_SIZE = 200;     // Higher minimum
    this.MIN_CONVERSIONS = 20;      // More conversions required
  }
}
```

### Caching
Add caching for high-traffic applications:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

async function getCachedResults(experimentId) {
  let results = cache.get(`exp_${experimentId}`);
  if (!results) {
    results = await analyzer.getExperimentResults(experimentId);
    cache.set(`exp_${experimentId}`, results);
  }
  return results;
}
```

## Best Practices

### 1. Pre-Test Planning
- Calculate required sample size before starting
- Define success metrics clearly
- Set minimum detectable effect (MDE)
- Plan for 1-2 week minimum duration

### 2. During Test
- Don't peek too early (wait for minimum sample size)
- Monitor for data quality issues
- Check variant balance (should be ~50/50)
- Use `getRecommendation()` for daily checks

### 3. Post-Test
- Document results and learnings
- Monitor winning variant during rollout
- Consider follow-up tests for optimization
- Archive experiment data for future reference

### 4. Common Pitfalls
- ✗ Stopping test as soon as p < 0.05 (peeking problem)
- ✗ Testing too many variants (reduces power)
- ✗ Making decisions on insufficient data
- ✓ Run for full weeks to capture patterns
- ✓ Wait for minimum sample size
- ✓ Use automated recommendations as guidance

## Performance

### Query Optimization
- All queries use indexed columns
- Efficient JOINs with proper foreign keys
- Parameterized queries prevent SQL injection
- Batch operations where possible

### Scalability
- Handles experiments with millions of users
- Time series queries optimized for large datasets
- Supports concurrent analysis of multiple experiments
- Memory-efficient statistical calculations

## Troubleshooting

### "Insufficient sample size"
**Cause**: Not enough data collected yet
**Solution**: Continue running experiment until minimums met

### High p-value (> 0.5)
**Cause**: Variants performing identically
**Solution**: Test more dramatic changes or end experiment

### Overlapping confidence intervals
**Cause**: Results not definitive yet
**Solution**: Collect more data or accept uncertainty

### Low conversion rates
**Cause**: Goal event too rare or tracking issues
**Solution**: Verify tracking, consider proxy metrics

## Resources

### Documentation
- Full API docs: `AB_TEST_ANALYZER_DOCS.md`
- Quick start: `AB_TEST_QUICK_START.md`
- This file: `AB_TEST_README.md`

### Code
- Main module: `ab-test-analyzer.js`
- Example: `ab-test-analyzer.example.js`
- Tests: `ab-test-analyzer.test.js`

### External Resources
- [Chi-Square Test Explained](https://www.statisticshowto.com/chi-square-test/)
- [Sample Size Calculator](https://www.evanmiller.org/ab-testing/sample-size.html)
- [Wilson Score Interval](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval)

## Support

### Getting Help
1. Read the documentation (start with Quick Start)
2. Run the example file to see it in action
3. Check the test file for usage patterns
4. Review inline code comments for details

### Reporting Issues
When reporting issues, include:
- Experiment configuration
- Sample size and conversion data
- Error messages (if any)
- Expected vs actual behavior

## License

Part of the Claude Code Demo Workshop.
Free to use and modify for educational purposes.

---

## Quick Links

- 📚 [Full Documentation](AB_TEST_ANALYZER_DOCS.md)
- 🚀 [Quick Start Guide](AB_TEST_QUICK_START.md)
- 💻 [Example Code](ab-test-analyzer.example.js)
- ✅ [Test Suite](ab-test-analyzer.test.js)

---

**Built with statistical rigor for production use.**
