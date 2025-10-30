# API Testing Guide

Quick reference for testing the Product Analytics API endpoints using cURL or any HTTP client.

## Base URL

```
http://localhost:3000
```

## Prerequisites

1. Start the server:
```bash
node server.js
```

2. Verify server is running:
```bash
curl http://localhost:3000/health
```

---

## Events Endpoints

### Track Single Event

```bash
curl -X POST http://localhost:3000/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "page_view",
    "user_id": "user123",
    "properties": {
      "page": "homepage",
      "referrer": "google"
    },
    "session_id": "session456",
    "device_type": "mobile",
    "browser": "Chrome",
    "country": "US"
  }'
```

### Track Batch Events

```bash
curl -X POST http://localhost:3000/api/events/batch \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "event_name": "button_click",
        "user_id": "user123",
        "properties": {"button": "signup"}
      },
      {
        "event_name": "page_view",
        "user_id": "user456",
        "properties": {"page": "pricing"}
      }
    ]
  }'
```

### Query Events

```bash
# Get all events
curl http://localhost:3000/api/events?limit=10

# Filter by event name
curl http://localhost:3000/api/events?event_name=page_view&limit=20

# Filter by user
curl http://localhost:3000/api/events?user_id=user123

# Filter by date range
curl "http://localhost:3000/api/events?start_date=2025-10-01T00:00:00Z&end_date=2025-10-31T23:59:59Z"

# Filter by device type
curl http://localhost:3000/api/events?device_type=mobile

# Multiple filters with pagination
curl "http://localhost:3000/api/events?event_name=button_click&device_type=mobile&limit=50&offset=0"
```

### Event Summary

```bash
# Last 30 days (default)
curl http://localhost:3000/api/events/summary

# Custom date range
curl "http://localhost:3000/api/events/summary?start_date=2025-10-01T00:00:00Z&end_date=2025-10-31T23:59:59Z"
```

---

## Analytics Endpoints

### Funnel Analysis

First, create a funnel in the database:
```sql
INSERT INTO funnels (name, description, steps) VALUES
  ('Signup Funnel', 'Main signup conversion funnel',
   '["page_view", "button_click", "signup_complete"]');
```

Then analyze it:
```bash
# Basic funnel analysis
curl http://localhost:3000/api/analytics/funnels/1

# With date range
curl "http://localhost:3000/api/analytics/funnels/1?start_date=2025-10-01&end_date=2025-10-31"

# With timings
curl "http://localhost:3000/api/analytics/funnels/1?include_timings=true"

# With breakdown by device
curl "http://localhost:3000/api/analytics/funnels/1?breakdown=device_type"

# With cohort filter
curl "http://localhost:3000/api/analytics/funnels/1?cohort_id=premium_users"
```

### Retention Analysis

```bash
# Weekly retention (default)
curl http://localhost:3000/api/analytics/retention

# Daily retention
curl "http://localhost:3000/api/analytics/retention?period=day&num_periods=30"

# Monthly retention
curl "http://localhost:3000/api/analytics/retention?period=month&num_periods=12"

# With specific retention event
curl "http://localhost:3000/api/analytics/retention?retention_event=daily_active&period=week"

# Custom date range
curl "http://localhost:3000/api/analytics/retention?start_date=2025-01-01&end_date=2025-10-31&period=month"
```

### User Journeys

```bash
# Basic journey analysis
curl http://localhost:3000/api/analytics/journeys

# With max steps
curl "http://localhost:3000/api/analytics/journeys?max_steps=5&min_frequency=10"

# With start and end events
curl "http://localhost:3000/api/analytics/journeys?start_event=landing_page&end_event=signup_complete"

# Custom date range
curl "http://localhost:3000/api/analytics/journeys?start_date=2025-10-01&end_date=2025-10-31"
```

### Feature Adoption

First, create a feature in the database:
```sql
INSERT INTO features (id, name, description, launch_date, target_event) VALUES
  ('dashboard_v2', 'Dashboard V2', 'New dashboard redesign',
   '2025-10-01', 'dashboard_view');
```

Then analyze adoption:
```bash
# Basic feature adoption
curl http://localhost:3000/api/analytics/features/dashboard_v2

# With custom date range
curl "http://localhost:3000/api/analytics/features/dashboard_v2?start_date=2025-10-01&end_date=2025-10-31"

# Filter by cohort
curl "http://localhost:3000/api/analytics/features/dashboard_v2?cohort_id=early_adopters"
```

### A/B Test Experiments

First, create an experiment:
```sql
INSERT INTO experiments (id, name, description, status, variants, goal_event, start_date) VALUES
  ('btn_color_test', 'Button Color Test', 'Testing blue vs green signup button',
   'running', '["control", "variant_a"]', 'signup_complete', '2025-10-01');
```

And assign users to variants:
```sql
INSERT INTO experiment_assignments (experiment_id, user_id, variant) VALUES
  ('btn_color_test', 'user123', 'control'),
  ('btn_color_test', 'user456', 'variant_a');
```

Then analyze results:
```bash
# Basic experiment results
curl http://localhost:3000/api/analytics/experiments/btn_color_test

# With custom date range
curl "http://localhost:3000/api/analytics/experiments/btn_color_test?start_date=2025-10-01&end_date=2025-10-31"

# With different confidence level
curl "http://localhost:3000/api/analytics/experiments/btn_color_test?confidence_level=99"
```

---

## Users Endpoints

### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "email": "john@example.com",
    "name": "John Doe",
    "properties": {
      "plan": "premium",
      "signup_source": "google"
    },
    "cohort_id": "oct_2025"
  }'
```

### Get User Details

```bash
# Basic user info
curl http://localhost:3000/api/users/user123

# With recent events
curl "http://localhost:3000/api/users/user123?include_events=true&event_limit=20"
```

### Get User Journey

```bash
# Full journey grouped by sessions
curl http://localhost:3000/api/users/user123/journey

# Without session grouping
curl "http://localhost:3000/api/users/user123/journey?group_by_session=false"

# With date range
curl "http://localhost:3000/api/users/user123/journey?start_date=2025-10-01&end_date=2025-10-31"
```

### List Users

```bash
# List all users
curl http://localhost:3000/api/users?limit=50

# Filter by cohort
curl http://localhost:3000/api/users?cohort_id=premium_users

# Filter by creation date
curl "http://localhost:3000/api/users?created_after=2025-10-01&created_before=2025-10-31"

# Filter by activity
curl "http://localhost:3000/api/users?active_since=2025-10-20"

# With statistics
curl "http://localhost:3000/api/users?include_stats=true&limit=20"

# Sorted by last seen
curl "http://localhost:3000/api/users?sort=last_seen&order=desc&limit=20"
```

### Update User Properties

```bash
curl -X PATCH http://localhost:3000/api/users/user123/properties \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "plan": "enterprise",
      "billing_cycle": "annual"
    }
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:3000/api/users/user123
```

---

## Testing with JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Track event
async function trackEvent() {
  const response = await axios.post(`${API_BASE}/api/events/track`, {
    event_name: 'page_view',
    user_id: 'user123',
    properties: { page: 'homepage' }
  });
  console.log(response.data);
}

// Get event summary
async function getEventSummary() {
  const response = await axios.get(`${API_BASE}/api/events/summary`);
  console.log(response.data);
}

// Get user details
async function getUser(userId) {
  const response = await axios.get(`${API_BASE}/api/users/${userId}?include_events=true`);
  console.log(response.data);
}
```

---

## Testing with Python

```python
import requests

API_BASE = 'http://localhost:3000'

# Track event
def track_event():
    response = requests.post(f'{API_BASE}/api/events/track', json={
        'event_name': 'page_view',
        'user_id': 'user123',
        'properties': {'page': 'homepage'}
    })
    print(response.json())

# Get event summary
def get_event_summary():
    response = requests.get(f'{API_BASE}/api/events/summary')
    print(response.json())

# Get user details
def get_user(user_id):
    response = requests.get(f'{API_BASE}/api/users/{user_id}', params={
        'include_events': 'true'
    })
    print(response.json())
```

---

## Complete Testing Workflow

1. **Create users:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id": "user001", "email": "alice@example.com", "name": "Alice"}'

curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id": "user002", "email": "bob@example.com", "name": "Bob"}'
```

2. **Track events:**
```bash
curl -X POST http://localhost:3000/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "page_view",
    "user_id": "user001",
    "properties": {"page": "homepage"},
    "device_type": "mobile"
  }'

curl -X POST http://localhost:3000/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "button_click",
    "user_id": "user001",
    "properties": {"button": "signup"},
    "device_type": "mobile"
  }'

curl -X POST http://localhost:3000/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "signup_complete",
    "user_id": "user001",
    "properties": {"plan": "premium"},
    "device_type": "mobile"
  }'
```

3. **Query data:**
```bash
# View all events
curl http://localhost:3000/api/events

# View event summary
curl http://localhost:3000/api/events/summary

# View user journey
curl http://localhost:3000/api/users/user001/journey

# List all users
curl http://localhost:3000/api/users
```

---

## Automated Testing Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing Product Analytics API..."

# Test health endpoint
echo -e "\n1. Health Check"
curl -s $BASE_URL/health | jq

# Create user
echo -e "\n2. Creating User"
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"id": "test_user", "email": "test@example.com", "name": "Test User"}' | jq

# Track event
echo -e "\n3. Tracking Event"
curl -s -X POST $BASE_URL/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "test_event",
    "user_id": "test_user",
    "properties": {"test": true}
  }' | jq

# Get events
echo -e "\n4. Getting Events"
curl -s "$BASE_URL/api/events?limit=5" | jq

# Get event summary
echo -e "\n5. Getting Event Summary"
curl -s "$BASE_URL/api/events/summary" | jq

# Get user
echo -e "\n6. Getting User"
curl -s "$BASE_URL/api/users/test_user" | jq

echo -e "\n\nAll tests completed!"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Common Issues

### 404 Not Found
- Verify the server is running
- Check the endpoint URL is correct
- Ensure route is properly mounted

### 400 Bad Request
- Check required fields are provided
- Verify JSON format is valid
- Check data types match expected values

### 500 Internal Server Error
- Check database is initialized
- Verify database file permissions
- Check server logs for detailed error

---

## Additional Resources

- See `README.md` for complete API documentation
- See `example-usage.js` for programmatic examples
- Check server logs for debugging: `tail -f server.log`
