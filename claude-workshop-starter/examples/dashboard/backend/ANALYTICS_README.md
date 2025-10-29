# Analytics & Reporting System Documentation

## Overview

The Analytics & Reporting System provides comprehensive executive reporting, conversion prediction, and stakeholder communication capabilities for the Enterprise B2B Pilot Program Manager.

## Architecture

### Core Components

1. **Analytics Engine** (`/analytics/`)
   - `predictor.js` - ML-style conversion prediction algorithm
   - `aggregator.js` - Data aggregation for executive dashboards
   - `value-calculator.js` - Financial ROI and value calculations

2. **Report Generators** (`/reports/`)
   - `executive-template.js` - Board-ready executive summaries
   - `stakeholder-updates.js` - Weekly updates and progress reports

3. **Utilities** (`/utils/`)
   - `export.js` - CSV, JSON, and PDF export functionality

4. **API Routes** (`/routes/`)
   - `reports.js` - RESTful API endpoints for all analytics

## Conversion Prediction Algorithm

### Overview
The conversion prediction algorithm uses weighted scoring to predict the likelihood that a pilot will convert to a paying customer.

### Scoring Weights (Total: 100%)

| Factor | Weight | Description |
|--------|--------|-------------|
| Success Criteria Completion | 35% | Percentage of success criteria achieved (weighted) |
| Stakeholder Engagement | 25% | Average engagement level with recency multiplier |
| Timeline Progress | 20% | Whether criteria progress matches timeline progress |
| Contract Value | 10% | Higher value deals get slight boost |
| Industry Success Rate | 10% | Historical success rate for this industry |

### Algorithm Formula

```javascript
// Base Score Calculation
baseScore =
  (criteriaScore * 35) +
  (stakeholderScore * 25) +
  (timelineScore * 20) +
  (valueScore * 10) +
  (industryScore * 10)

// Apply Risk Multipliers
finalScore = baseScore * riskMultipliers

// Ensure 0-100 range
conversionProbability = Math.max(0, Math.min(100, finalScore))
```

### Risk Factors (Applied as Multipliers)

| Risk | Condition | Multiplier | Impact |
|------|-----------|------------|--------|
| Deadline Approaching | < 14 days remaining + < 80% complete | 0.7 | -30% |
| Stakeholder Disengaged | No contact in > 7 days | 0.8 | -20% |
| Low Health Score | Health score < 50 | 0.6 | -40% |
| Criteria Stalled | < 30% complete with < 30 days left | 0.75 | -25% |

### Factor Calculations

#### 1. Success Criteria Score (0-1)
```javascript
criteriaScore = completedWeight / totalWeight
```
- Uses weighted completion based on criteria importance
- Returns 0.5 if no criteria defined (neutral)

#### 2. Stakeholder Engagement Score (0-1)
```javascript
engagementValues = { High: 1.0, Medium: 0.6, Low: 0.3, Unresponsive: 0.1 }
recencyMultiplier = {
  < 7 days: 1.0,
  7-14 days: 0.85,
  14-30 days: 0.7,
  > 30 days: 0.5
}
stakeholderScore = average(engagementValue * recencyMultiplier)
```

#### 3. Timeline Progress Score (0-1)
```javascript
timeProgress = daysElapsed / totalDays
criteriaProgress = completedWeight / totalWeight

if (criteriaProgress >= timeProgress) {
  score = 1.0  // On or ahead of schedule
} else {
  gap = timeProgress - criteriaProgress
  score = max(0, 1 - (gap * 1.5))  // 1.5x penalty for being behind
}
```

#### 4. Contract Value Score (0-1)
```javascript
if (value >= $1M) return 1.0
if (value >= $500K) return 0.7
if (value >= $250K) return 0.5
if (value >= $100K) return 0.3
return 0.2
```

#### 5. Industry Success Score (0-1)
```javascript
industryRates = {
  Technology: 0.75,
  Financial Services: 0.72,
  Healthcare: 0.68,
  Manufacturing: 0.70,
  Retail: 0.65,
  Education: 0.60,
  Other: 0.65
}
```

### Example Prediction

**Input:**
- Success Criteria: 4 criteria, 3 completed (75% weighted completion)
- Stakeholders: 3 high engagement, last contact 5 days ago
- Timeline: 60 days total, 30 days elapsed, 75% complete (ahead of schedule)
- Contract Value: $1.2M ARR
- Industry: Technology

**Calculation:**
```javascript
criteriaScore = 0.75        // 75% complete
stakeholderScore = 1.0      // All high engagement, recent contact
timelineScore = 1.0         // Ahead of schedule
valueScore = 1.0            // > $1M
industryScore = 0.75        // Technology

baseScore = (0.75 * 35) + (1.0 * 25) + (1.0 * 20) + (1.0 * 10) + (0.75 * 10)
         = 26.25 + 25 + 20 + 10 + 7.5
         = 88.75

// No risk factors apply
finalScore = 88.75

Result: 89% conversion probability (Strong)
```

## API Endpoints

### Executive Reports

#### GET /api/reports/executive
Generate comprehensive executive summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "generatedAt": "2025-01-15T10:30:00Z",
    "overview": {
      "activePilots": 6,
      "totalPipelineValue": 8500000,
      "projectedConversions": 4200000,
      "atRiskCount": 2,
      "conversionRate": 75,
      "avgTimeToClose": 90
    },
    "highlights": [
      "Top opportunity: Enterprise Corp ($2M ARR, 95% conversion probability)",
      "2 pilots at risk requiring immediate attention"
    ],
    "topOpportunities": [...],
    "quarterlyForecast": [...],
    "actionItems": [...]
  }
}
```

### Pipeline Analysis

#### GET /api/reports/pipeline
Get pipeline analysis and trends.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPipelineValue": 8500000,
    "conversionRate": { "rate": 75, "converted": 3, "total": 4 },
    "topIndustries": [...],
    "riskDistribution": {...},
    "trends": [...],
    "statusBreakdown": {...}
  }
}
```

### Conversion Forecast

#### GET /api/reports/conversion-forecast
Revenue forecast with conversion probabilities.

**Response:**
```json
{
  "success": true,
  "data": {
    "quarterlyForecast": [
      {
        "quarter": "Q1 2025",
        "pilotsClosing": 3,
        "projectedRevenue": 4200000,
        "bestCase": 5500000,
        "pilots": [...]
      }
    ],
    "totalPipeline": 8500000,
    "weightedForecast": 5200000,
    "confidence": {
      "high": 3500000,
      "medium": 2000000,
      "low": 1500000
    }
  }
}
```

### Pilot-Specific Reports

#### GET /api/reports/pilot/:id/prediction
Get conversion prediction for specific pilot.

**Response:**
```json
{
  "success": true,
  "data": {
    "pilotId": 1,
    "company": "Enterprise Corp",
    "prediction": {
      "conversionProbability": 95,
      "baseScore": 98,
      "factors": {
        "criteriaCompletion": 90,
        "stakeholderEngagement": 100,
        "timelineProgress": 100,
        "contractValue": 100,
        "industrySuccess": 75
      },
      "risks": [],
      "recommendation": {
        "status": "strong",
        "action": "Continue current trajectory",
        "priority": "low"
      }
    }
  }
}
```

#### GET /api/reports/pilot/:id/value-analysis
Financial value analysis for specific pilot.

**Query Parameters:**
- `pilotCost` (optional) - Cost to run pilot (default: 50000)

**Response:**
```json
{
  "success": true,
  "data": {
    "pilotId": 1,
    "company": "Enterprise Corp",
    "arrProjection": 2000000,
    "roi": {
      "pilotCost": 50000,
      "projectedARR": 2000000,
      "expectedRevenue": 1900000,
      "firstYearProfit": 1520000,
      "roi": 2940,
      "roiCategory": "Excellent",
      "threeYearLTV": 5200000,
      "ltvToCAC": 104,
      "breakEvenMonths": 1
    },
    "annualProjection": [...],
    "payback": {
      "paybackMonths": 1,
      "paybackYears": 0.1,
      "paybackCategory": "Excellent"
    },
    "expansion": {...}
  }
}
```

### Stakeholder Updates

#### GET /api/reports/stakeholder-updates/:pilotId/weekly
Generate weekly update for stakeholders.

**Response:**
```json
{
  "success": true,
  "data": {
    "pilotId": 1,
    "company": "Enterprise Corp",
    "weekEnding": "2025-01-15",
    "status": "Active",
    "healthScore": 95,
    "progress": {
      "overallCompletion": 75,
      "timeElapsed": 50,
      "daysRemaining": 45,
      "onTrack": true
    },
    "achievements": ["Integration completed", "50 users onboarded"],
    "blockers": [],
    "nextSteps": [...]
  }
}
```

#### GET /api/reports/stakeholder-updates/:pilotId/progress
Generate comprehensive progress report.

**Response:**
```json
{
  "success": true,
  "data": {
    "pilot": {...},
    "timeline": {...},
    "criteria": {...},
    "stakeholders": [...],
    "prediction": {...},
    "executiveSummary": "Enterprise Corp pilot is on track..."
  }
}
```

### Analytics Overview

#### GET /api/reports/analytics/overview
Get comprehensive analytics overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "criteriaCompletion": {
      "totalCriteria": 24,
      "achieved": 18,
      "inProgress": 4,
      "atRisk": 2,
      "avgCompletionRate": 75
    },
    "stakeholderEngagement": {
      "total": 18,
      "high": 10,
      "medium": 6,
      "low": 2,
      "avgStakeholdersPerPilot": 3.0
    },
    "industryPerformance": [...],
    "statusBreakdown": {...}
  }
}
```

### Export Endpoints

#### GET /api/reports/export/csv
Export all pilots to CSV.

**Returns:** CSV file download

#### GET /api/reports/export/detailed-csv
Export pilots with criteria and stakeholders to CSV.

**Returns:** CSV file download

#### GET /api/reports/export/json
Export executive report to JSON.

**Returns:** JSON file download

#### GET /api/reports/export/pdf
Export executive report as text (PDF-ready).

**Returns:** Text file download

#### GET /api/reports/export/pipeline-summary
Export pipeline summary to CSV.

**Returns:** CSV file download

## Sample Executive Report Output

```
════════════════════════════════════════════════════════════════════════════════
PILOT PROGRAM EXECUTIVE REPORT
════════════════════════════════════════════════════════════════════════════════

Generated: 1/15/2025, 10:30:00 AM

────────────────────────────────────────────────────────────────────────────────
EXECUTIVE OVERVIEW
────────────────────────────────────────────────────────────────────────────────

Active Pilots:              6
Total Pipeline Value:       $8,500,000
Projected Conversions:      $4,200,000
At-Risk Pilots:             2
Historical Conversion Rate: 75%
Avg Time to Close:          90 days

────────────────────────────────────────────────────────────────────────────────
KEY HIGHLIGHTS
────────────────────────────────────────────────────────────────────────────────

1. Top opportunity: Enterprise Corp ($2M ARR, 95% conversion probability)
2. 2 pilots at risk requiring immediate attention
3. Q1 2025 conversion forecast: $4.2M ARR

────────────────────────────────────────────────────────────────────────────────
RISK DISTRIBUTION
────────────────────────────────────────────────────────────────────────────────

Strong    (80%+):  2 pilots
Moderate  (60-79%): 2 pilots
At Risk   (40-59%): 1 pilots
Critical  (<40%):   1 pilots

────────────────────────────────────────────────────────────────────────────────
TOP OPPORTUNITIES
────────────────────────────────────────────────────────────────────────────────

1. Enterprise Corp
   ARR Value:              $2,000,000
   Conversion Probability: 95%
   Expected Value:         $1,900,000
   Health Score:           95%
   Days Remaining:         45

2. Acme Financial
   ARR Value:              $1,500,000
   Conversion Probability: 88%
   Expected Value:         $1,320,000
   Health Score:           88%
   Days Remaining:         60

────────────────────────────────────────────────────────────────────────────────
ACTION ITEMS
────────────────────────────────────────────────────────────────────────────────

URGENT:
  ⚠️  MedTech Solutions at critical risk (35% probability) - immediate escalation required
      No stakeholder contact in 14 days; Low health score at 45%

HIGH PRIORITY:
  •  RetailTech Inc closing in 14 days - final push needed
     Only 60% criteria complete

════════════════════════════════════════════════════════════════════════════════
END OF REPORT
════════════════════════════════════════════════════════════════════════════════
```

## Usage Examples

### Get Executive Summary
```bash
curl http://localhost:3000/api/reports/executive
```

### Get Conversion Prediction for Pilot
```bash
curl http://localhost:3000/api/reports/pilot/1/prediction
```

### Export to CSV
```bash
curl http://localhost:3000/api/reports/export/csv -o pilots.csv
```

### Generate Weekly Update
```bash
curl http://localhost:3000/api/reports/stakeholder-updates/1/weekly
```

## Integration with Existing Backend

The analytics system integrates seamlessly with the existing pilot management backend:

1. **Database Layer** - Uses the existing SQLite database and Database class
2. **API Routes** - Adds new `/api/reports` endpoints alongside existing routes
3. **No Breaking Changes** - All existing functionality remains intact
4. **Shared Data** - Leverages existing pilots, criteria, stakeholders, and metrics

## Performance Considerations

- **Caching**: Consider implementing Redis caching for executive reports
- **Query Optimization**: Aggregation queries use database indexes
- **Async Operations**: All database operations use async/await
- **Pagination**: Large exports may benefit from streaming

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live dashboard updates
2. **Machine Learning**: Train actual ML model on historical data
3. **Predictive Analytics**: Forecast future pipeline based on trends
4. **Custom Reports**: User-defined report templates
5. **Automated Alerts**: Email/Slack notifications for at-risk pilots

## Files Created

```
backend/
├── analytics/
│   ├── predictor.js           # Conversion prediction algorithm
│   ├── aggregator.js          # Data aggregation
│   └── value-calculator.js    # Financial calculations
├── reports/
│   ├── executive-template.js  # Executive report generator
│   └── stakeholder-updates.js # Stakeholder communications
├── utils/
│   └── export.js              # Export utilities (CSV, JSON, PDF)
└── routes/
    └── reports.js             # API endpoints
```

## Support

For questions or issues with the analytics system, refer to:
- API Documentation: http://localhost:3000
- Main README: ../README.md
- Database Schema: ../schema.sql
