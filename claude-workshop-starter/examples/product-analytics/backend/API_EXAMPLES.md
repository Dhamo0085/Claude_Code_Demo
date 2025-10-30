# API Usage Examples

Complete examples for testing all major endpoints of the Product Analytics API.

## Prerequisites

Make sure the server is running:
```bash
npm start
```

Server should be available at: `http://localhost:3001`

---

## 1. Event Tracking

### Track a Single Event

```bash
curl -X POST http://localhost:3001/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "button_clicked",
    "user_id": "user_12345",
    "user_email": "john@example.com",
    "user_name": "John Doe",
    "properties": {
      "button_id": "signup_cta",
      "page": "homepage"
    },
    "session_id": "session_abc123",
    "page_url": "/",
    "referrer": "https://google.com",
    "device_type": "desktop",
    "browser": "Chrome",
    "country": "United States",
    "city": "New York"
  }'
```

### Query Events by Date Range

```bash
curl "http://localhost:3001/api/events?start_date=2024-01-01&end_date=2024-12-31&event_name=signup"
```

### Get Event Count

```bash
curl "http://localhost:3001/api/events/count?event_name=dashboard_viewed&start_date=2024-01-01&end_date=2024-12-31"
```

---

## 2. User Management

### Create a User

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user_new_123",
    "email": "newuser@example.com",
    "name": "New User",
    "properties": {
      "plan": "pro",
      "source": "organic",
      "company": "Acme Corp"
    },
    "cohort_id": "power_users"
  }'
```

### Get User by ID

```bash
curl http://localhost:3001/api/users/user_new_123
```

### List All Users

```bash
curl "http://localhost:3001/api/users?limit=10&offset=0"
```

### Get User Statistics

```bash
curl "http://localhost:3001/api/users/stats?start_date=2024-01-01&end_date=2024-12-31"
```

---

## 3. Funnel Analysis

### Analyze a Funnel

```bash
curl -X POST http://localhost:3001/api/funnels/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      "signup",
      "email_verified",
      "profile_completed",
      "first_project_created"
    ],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

### Analyze Funnel for Specific Cohort

```bash
curl -X POST http://localhost:3001/api/funnels/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["signup", "email_verified", "first_project_created"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "cohort_id": "power_users"
  }'
```

### Get Funnel Step Timings

```bash
curl -X POST http://localhost:3001/api/funnels/timings \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["signup", "email_verified", "first_project_created"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

### Get Funnel Breakdown by Property

```bash
curl -X POST http://localhost:3001/api/funnels/breakdown \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["signup", "email_verified", "first_project_created"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "breakdown_property": "device_type"
  }'
```

### List Saved Funnels

```bash
curl http://localhost:3001/api/funnels
```

### Create a Saved Funnel

```bash
curl -X POST http://localhost:3001/api/funnels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Funnel",
    "description": "Track user activation",
    "steps": ["signup", "dashboard_viewed", "project_created"],
    "created_by": "admin"
  }'
```

---

## 4. Retention Analysis

### Get Cohort Retention (Weekly)

```bash
curl "http://localhost:3001/api/retention?cohort_size=week&periods=12"
```

### Get Cohort Retention (Monthly)

```bash
curl "http://localhost:3001/api/retention?cohort_size=month&periods=6"
```

### Get Day-N Retention

```bash
curl "http://localhost:3001/api/retention/day-n?days=1,7,14,30"
```

### Get Churn Rate

```bash
# Weekly churn
curl "http://localhost:3001/api/retention/churn?period=week"

# Monthly churn
curl "http://localhost:3001/api/retention/churn?period=month"
```

### Get Segmented Retention

```bash
curl "http://localhost:3001/api/retention/segmented?property=plan&cohort_size=week"
```

---

## 5. User Journey Analysis

### Get Top User Paths

```bash
curl "http://localhost:3001/api/journeys/top-paths?max_steps=5&limit=10"
```

### Get Top Paths Starting from Specific Event

```bash
curl "http://localhost:3001/api/journeys/top-paths?start_event=dashboard_viewed&max_steps=5&limit=10"
```

### Get User's Journey

```bash
curl "http://localhost:3001/api/journeys/user/user_12345?limit=100"
```

### Get Conversion Paths to Goal

```bash
curl "http://localhost:3001/api/journeys/conversion-paths?goal_event=subscription_purchased&before_steps=5&limit=10"
```

### Get Next Events After an Event

```bash
curl "http://localhost:3001/api/journeys/next-events?event_name=dashboard_viewed&depth=3"
```

### Get Drop-off Points

```bash
curl "http://localhost:3001/api/journeys/drop-offs?min_events=2"
```

### Get Session Statistics

```bash
curl http://localhost:3001/api/journeys/session-stats
```

---

## 6. Feature Adoption Tracking

### Get Feature Adoption Rate Over Time

```bash
curl "http://localhost:3001/api/features/adoption?event=ai_assistant_used&start_date=2024-01-01&end_date=2024-12-31&granularity=week"
```

### Get Cumulative Adoption

```bash
curl "http://localhost:3001/api/features/cumulative?event=ai_assistant_used&launch_date=2024-01-01"
```

### Get Feature Stickiness (DAU/MAU)

```bash
curl "http://localhost:3001/api/features/stickiness?event=ai_assistant_used"

# For specific date
curl "http://localhost:3001/api/features/stickiness?event=ai_assistant_used&date=2024-10-15"
```

### Get Power Users of a Feature

```bash
curl "http://localhost:3001/api/features/power-users?event=ai_assistant_used&start_date=2024-01-01&end_date=2024-12-31&min_usage=10"
```

### Get Usage Distribution

```bash
curl "http://localhost:3001/api/features/distribution?event=ai_assistant_used&start_date=2024-01-01&end_date=2024-12-31"
```

### Compare Feature Across Cohorts

```bash
curl "http://localhost:3001/api/features/cohort-comparison?event=ai_assistant_used"
```

### Get Time to Feature Adoption

```bash
curl "http://localhost:3001/api/features/time-to-adoption?event=ai_assistant_used&limit=100"
```

---

## 7. Cohort Management

### List All Cohorts

```bash
curl http://localhost:3001/api/cohorts
```

### Create a Cohort

```bash
curl -X POST http://localhost:3001/api/cohorts \
  -H "Content-Type: application/json" \
  -d '{
    "id": "trial_users",
    "name": "Trial Users",
    "description": "Users on trial plans",
    "criteria": {
      "plan": "trial",
      "signup_date": "last_30_days"
    }
  }'
```

### Get Cohort Details

```bash
curl http://localhost:3001/api/cohorts/power_users
```

---

## 8. A/B Testing & Experiments

### List All Experiments

```bash
curl http://localhost:3001/api/experiments
```

### Create an Experiment

```bash
curl -X POST http://localhost:3001/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "id": "new_dashboard_test",
    "name": "New Dashboard Layout Test",
    "description": "Testing new dashboard design",
    "variants": ["control", "variant_a", "variant_b"],
    "goal_event": "dashboard_viewed",
    "start_date": "2024-10-01T00:00:00Z",
    "end_date": null
  }'
```

### Get Experiment Details

```bash
curl http://localhost:3001/api/experiments/pricing_page_test
```

### Assign User to Experiment Variant

```bash
curl -X POST http://localhost:3001/api/experiments/pricing_page_test/assign \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_12345",
    "variant": "variant_a"
  }'
```

### Get Experiment Results

```bash
curl http://localhost:3001/api/experiments/pricing_page_test/results
```

---

## 9. System Endpoints

### Health Check

```bash
curl http://localhost:3001/health
```

### API Documentation

```bash
curl http://localhost:3001/
```

---

## Common Use Cases

### Use Case 1: Track Complete User Session

```bash
# 1. User signs up
curl -X POST http://localhost:3001/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "signup",
    "user_id": "user_demo_001",
    "user_email": "demo@example.com",
    "session_id": "session_demo_001",
    "device_type": "desktop"
  }'

# 2. User verifies email
curl -X POST http://localhost:3001/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "email_verified",
    "user_id": "user_demo_001",
    "session_id": "session_demo_001"
  }'

# 3. User completes profile
curl -X POST http://localhost:3001/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "profile_completed",
    "user_id": "user_demo_001",
    "session_id": "session_demo_001"
  }'
```

### Use Case 2: Analyze Onboarding Success

```bash
# Check the onboarding funnel
curl -X POST http://localhost:3001/api/funnels/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["signup", "email_verified", "profile_completed", "first_project_created"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'

# Get time between steps
curl -X POST http://localhost:3001/api/funnels/timings \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["signup", "email_verified", "profile_completed"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

### Use Case 3: Measure Feature Success

```bash
# Get adoption rate
curl "http://localhost:3001/api/features/adoption?event=ai_assistant_used&start_date=2024-01-01&end_date=2024-12-31&granularity=week"

# Get stickiness
curl "http://localhost:3001/api/features/stickiness?event=ai_assistant_used"

# Find power users
curl "http://localhost:3001/api/features/power-users?event=ai_assistant_used&start_date=2024-01-01&end_date=2024-12-31&min_usage=20"
```

### Use Case 4: Monitor Retention

```bash
# Weekly cohort retention
curl "http://localhost:3001/api/retention?cohort_size=week&periods=12"

# Day 7 and Day 30 retention
curl "http://localhost:3001/api/retention/day-n?days=7,30"

# Current churn rate
curl "http://localhost:3001/api/retention/churn?period=month"
```

---

## Tips for Testing

1. **Use the seeded data**: The seed script creates realistic data you can query immediately
2. **Check timestamps**: Most queries require `start_date` and `end_date` parameters
3. **Date format**: Use ISO 8601 format: `2024-10-29` or `2024-10-29T00:00:00Z`
4. **Pretty print JSON**: Add `| python -m json.tool` to curl commands
5. **Save to file**: Add `> output.json` to save responses

Example with pretty printing:
```bash
curl "http://localhost:3001/api/retention?cohort_size=week&periods=8" | python -m json.tool
```

---

## Postman Collection

You can also import these examples into Postman:
1. Copy any curl command
2. Open Postman
3. Click "Import" → "Raw text"
4. Paste the curl command
5. Click "Import"

Happy testing! 🚀
