# Conversion Prediction Algorithm - Example Walkthrough

## Scenario: Enterprise Corp Pilot Evaluation

### Input Data

**Pilot Information:**
- Company: Enterprise Corp
- Industry: Technology
- Start Date: 45 days ago
- End Date: 45 days from now
- Total Duration: 90 days
- Contract Value: $2,000,000 ARR
- Current Health Score: 95%

**Success Criteria (4 criteria):**
1. ✅ Onboard 50 users (Weight: 20) - **Achieved**
2. ✅ Process 1000 transactions (Weight: 30) - **Achieved**
3. ✅ Integrate with CRM (Weight: 25) - **Achieved**
4. ⏳ Generate ROI report (Weight: 25) - **In Progress**

**Stakeholders (3 people):**
1. Sarah Johnson, VP Engineering - High engagement, last contact: 2 days ago
2. Robert Chen, CTO - High engagement, last contact: 3 days ago
3. Amanda Lee, Product Manager - Medium engagement, last contact: 5 days ago

---

## Step-by-Step Calculation

### 1. Success Criteria Score

```javascript
Total Weight: 20 + 30 + 25 + 25 = 100
Completed Weight: 20 + 30 + 25 = 75

criteriaScore = 75 / 100 = 0.75 (75%)
```

**Result:** 0.75

---

### 2. Stakeholder Engagement Score

```javascript
// Individual stakeholder scores with recency
Sarah Johnson:
  - Engagement: High = 1.0
  - Last contact: 2 days ago → recency: 1.0
  - Score: 1.0 × 1.0 = 1.0

Robert Chen:
  - Engagement: High = 1.0
  - Last contact: 3 days ago → recency: 1.0
  - Score: 1.0 × 1.0 = 1.0

Amanda Lee:
  - Engagement: Medium = 0.6
  - Last contact: 5 days ago → recency: 1.0
  - Score: 0.6 × 1.0 = 0.6

Average: (1.0 + 1.0 + 0.6) / 3 = 0.867
```

**Result:** 0.867 (87%)

---

### 3. Timeline Progress Score

```javascript
Time Elapsed: 45 days
Total Duration: 90 days
Time Progress: 45 / 90 = 0.50 (50%)

Criteria Progress: 0.75 (75%)

// Criteria progress (75%) exceeds time progress (50%)
// This means we're ahead of schedule!

timelineScore = 1.0
```

**Result:** 1.0 (100% - Ahead of schedule)

---

### 4. Contract Value Score

```javascript
Contract Value: $2,000,000

// Value >= $1,000,000
valueScore = 1.0
```

**Result:** 1.0 (100%)

---

### 5. Industry Success Score

```javascript
Industry: Technology
Historical Success Rate: 75%

industryScore = 0.75
```

**Result:** 0.75 (75%)

---

## Base Score Calculation

```javascript
baseScore =
  (criteriaScore × 35) +
  (stakeholderScore × 25) +
  (timelineScore × 20) +
  (valueScore × 10) +
  (industryScore × 10)

baseScore =
  (0.75 × 35) +
  (0.867 × 25) +
  (1.0 × 20) +
  (1.0 × 10) +
  (0.75 × 10)

baseScore =
  26.25 +
  21.67 +
  20.0 +
  10.0 +
  7.5

baseScore = 85.42
```

**Base Score:** 85.42%

---

## Risk Factor Analysis

### Check for Risk Conditions:

1. **Deadline Approaching** (< 14 days remaining + < 80% complete)
   - Days remaining: 45
   - Criteria complete: 75%
   - ❌ NOT APPLICABLE (45 days > 14 days)

2. **Stakeholder Disengaged** (No contact in > 7 days)
   - Most recent contact: 2 days ago
   - ❌ NOT APPLICABLE (2 days < 7 days)

3. **Low Health Score** (Health score < 50)
   - Current health score: 95%
   - ❌ NOT APPLICABLE (95% > 50%)

4. **Criteria Stalled** (< 30% complete with < 30 days remaining)
   - Criteria complete: 75%
   - Days remaining: 45
   - ❌ NOT APPLICABLE (75% > 30%)

**No risk factors apply!**

---

## Final Score

```javascript
finalScore = baseScore × riskMultipliers
finalScore = 85.42 × 1.0 (no risk factors)
finalScore = 85.42

// Round to nearest integer
conversionProbability = 85%
```

---

## Prediction Output

```json
{
  "conversionProbability": 85,
  "baseScore": 85,
  "factors": {
    "criteriaCompletion": 75,
    "stakeholderEngagement": 87,
    "timelineProgress": 100,
    "contractValue": 100,
    "industrySuccess": 75
  },
  "risks": [],
  "recommendation": {
    "status": "strong",
    "action": "Continue current trajectory. Focus on final success criteria.",
    "priority": "low"
  }
}
```

---

## Interpretation

### What This Means:

1. **85% Conversion Probability** = Strong likelihood of conversion
2. **No Active Risks** = Pilot is healthy and on track
3. **Ahead of Schedule** = 75% complete with 50% time elapsed
4. **High Stakeholder Engagement** = Key decision makers are actively involved
5. **Only 1 Criteria Remaining** = Clear path to completion

### Recommended Actions:

✅ **Continue Current Strategy** - Everything is working well
✅ **Focus on ROI Report** - Only remaining criteria
✅ **Maintain Stakeholder Engagement** - Keep current communication cadence
✅ **Monitor Health Score** - Maintain 95% level
✅ **Plan Conversion Process** - Start preparing sales/legal docs

### Expected Value:

```javascript
expectedValue = ARR × probability
expectedValue = $2,000,000 × 0.85
expectedValue = $1,700,000
```

This pilot represents **$1.7M in expected revenue** for the quarter.

---

## Comparison: At-Risk Pilot Example

### MedTech Solutions (For Contrast)

**Input Data:**
- Days remaining: 30
- Criteria complete: 25% (1 of 4 criteria)
- Stakeholder engagement: Low
- Last contact: 14 days ago
- Health score: 45%

**Calculation:**
```javascript
criteriaScore = 0.25
stakeholderScore = 0.30 (low engagement + poor recency)
timelineScore = 0.29 (far behind schedule)
valueScore = 0.7 ($800K contract)
industryScore = 0.68 (Healthcare)

baseScore =
  (0.25 × 35) + (0.30 × 25) + (0.29 × 20) + (0.7 × 10) + (0.68 × 10)
  = 8.75 + 7.5 + 5.8 + 7.0 + 6.8
  = 35.85

// Apply risk factors:
// 1. Deadline approaching: × 0.7
// 2. Stakeholder disengaged: × 0.8
// 3. Low health score: × 0.6
// 4. Criteria stalled: × 0.75

finalScore = 35.85 × 0.7 × 0.8 × 0.6 × 0.75
finalScore = 35.85 × 0.252
finalScore = 9.03

conversionProbability = 9%
```

**Result:** 9% (Critical Risk)

**Recommended Actions:**
- 🚨 **URGENT**: Immediate executive escalation
- 🚨 **URGENT**: Schedule stakeholder intervention call
- 🚨 **URGENT**: Identify and remove blockers
- 🚨 Consider pilot extension or pivot strategy

---

## Key Takeaways

1. **Enterprise Corp (85%)** - Strong pilot with clear path to conversion
2. **MedTech Solutions (9%)** - Critical situation requiring intervention
3. **Algorithm Sensitivity** - Multiple factors combine to give accurate prediction
4. **Risk Multipliers** - Compound effect can dramatically reduce probability
5. **Actionable Insights** - Clear guidance on what actions to take
