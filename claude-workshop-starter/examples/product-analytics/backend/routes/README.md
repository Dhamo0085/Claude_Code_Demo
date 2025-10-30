# Product Analytics API Routes

Comprehensive Express.js API routes for product analytics. This directory contains all endpoint implementations for event tracking, analytics, and user management.

## Overview

The API is organized into three main route modules:

1. **events.js** - Event tracking and ingestion
2. **analytics.js** - Advanced analytics and reporting
3. **users.js** - User management and journey tracking

## Architecture

Each route file exports a factory function that takes a database instance and returns a configured Express router:

```javascript
const Database = require('./database');
const { initializeRoutes } = require('./routes');

const db = new Database('./analytics.db');
await db.initialize();

const routes = initializeRoutes(db);

app.use('/api/events', routes.events);
app.use('/api/analytics', routes.analytics);
app.use('/api/users', routes.users);
```

## Route Modules

### 1. Events Routes (`events.js`)

Event tracking and ingestion endpoints.

#### `POST /api/events/track`

Track a single event for analytics.

**Request Body:**
```json
{
  "event_name": "page_view",
  "user_id": "user123",
  "properties": {
    "page": "homepage",
    "referrer": "google"
  },
  "session_id": "session456",
  "page_url": "https://example.com",
  "device_type": "mobile",
  "browser": "Chrome",
  "country": "US",
  "city": "San Francisco"
}
```

**Response:**
```json
{
  "success": true,
  "event_id": 12345,
  "timestamp": "2025-10-29T10:30:00Z"
}
```

#### `POST /api/events/batch`

Track multiple events in a single request (max 100 events).

**Request Body:**
```json
{
  "events": [
    {
      "event_name": "button_click",
      "user_id": "user123",
      "properties": { "button": "signup" }
    },
    {
      "event_name": "page_view",
      "user_id": "user456",
      "properties": { "page": "pricing" }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "tracked_count": 2,
  "failed_count": 0,
  "results": [
    { "event_id": 12345 },
    { "event_id": 12346 }
  ]
}
```

#### `GET /api/events`

Query events with filters and pagination.

**Query Parameters:**
- `event_name` - Filter by event name
- `user_id` - Filter by user ID
- `start_date` - Start date (ISO format)
- `end_date` - End date (ISO format)
- `limit` - Max results (default: 100, max: 1000)
- `offset` - Pagination offset
- `device_type` - Filter by device type
- `country` - Filter by country
- `session_id` - Filter by session

**Example:**
```
GET /api/events?event_name=button_click&start_date=2025-10-01&limit=50
```

**Response:**
```json
{
  "success": true,
  "events": [...],
  "count": 50,
  "total": 1234,
  "offset": 0,
  "limit": 50
}
```

#### `GET /api/events/summary`

Get comprehensive event summary statistics.

**Query Parameters:**
- `start_date` - Start date (default: 30 days ago)
- `end_date` - End date (default: now)

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_events": 10000,
    "unique_users": 500,
    "unique_sessions": 1200,
    "date_range": {
      "start": "2025-10-01T00:00:00Z",
      "end": "2025-10-29T23:59:59Z"
    },
    "top_events": [
      {
        "event_name": "page_view",
        "count": 5000,
        "unique_users": 450
      }
    ],
    "events_by_device": {
      "mobile": 6000,
      "desktop": 4000
    },
    "events_by_country": {
      "US": 7000,
      "UK": 2000,
      "CA": 1000
    },
    "events_over_time": [
      {
        "date": "2025-10-01",
        "count": 350,
        "unique_users": 50
      }
    ]
  }
}
```

---

### 2. Analytics Routes (`analytics.js`)

Advanced analytics and reporting endpoints.

#### `GET /api/analytics/funnels/:funnelId`

Analyze conversion funnel with drop-off rates.

**Path Parameters:**
- `funnelId` - ID of the funnel to analyze

**Query Parameters:**
- `start_date` - Start date
- `end_date` - End date
- `cohort_id` - Filter by cohort
- `breakdown` - Breakdown by property (device_type, country, browser)
- `include_timings` - Include step timings (true/false)

**Response:**
```json
{
  "success": true,
  "funnel": {
    "id": 1,
    "name": "Signup Funnel",
    "description": "Main signup conversion funnel",
    "steps": [
      {
        "step": 1,
        "event_name": "landing_page",
        "user_count": 1000,
        "conversion_rate": 100,
        "drop_off_count": 0,
        "drop_off_rate": 0
      },
      {
        "step": 2,
        "event_name": "signup_page",
        "user_count": 500,
        "conversion_rate": 50,
        "drop_off_count": 500,
        "drop_off_rate": 50
      },
      {
        "step": 3,
        "event_name": "signup_complete",
        "user_count": 300,
        "conversion_rate": 60,
        "drop_off_count": 200,
        "drop_off_rate": 40
      }
    ],
    "overall_conversion": 30,
    "start_date": "2025-10-01T00:00:00Z",
    "end_date": "2025-10-29T23:59:59Z",
    "timings": [
      {
        "from_step": "landing_page",
        "to_step": "signup_page",
        "avg_minutes": 2.5,
        "median_minutes": 1.8,
        "sample_size": 500
      }
    ]
  }
}
```

#### `GET /api/analytics/retention`

Calculate cohort retention data.

**Query Parameters:**
- `start_date` - Cohort start date (default: 90 days ago)
- `end_date` - Cohort end date (default: now)
- `period` - Retention period (day, week, month) - default: week
- `retention_event` - Event that counts as retention (default: any event)
- `num_periods` - Number of periods to track (default: 12)

**Response:**
```json
{
  "success": true,
  "retention": {
    "cohorts": [
      {
        "cohort_name": "Week 1",
        "cohort_size": 100,
        "periods": [
          { "period": 0, "user_count": 100, "retention_rate": 100 },
          { "period": 1, "user_count": 60, "retention_rate": 60 },
          { "period": 2, "user_count": 45, "retention_rate": 45 }
        ]
      }
    ],
    "overall_retention": [100, 58, 42, 35, 30]
  },
  "parameters": {
    "start_date": "2025-08-01T00:00:00Z",
    "end_date": "2025-10-29T23:59:59Z",
    "period": "week",
    "num_periods": 12
  }
}
```

#### `GET /api/analytics/journeys`

Analyze user journey patterns.

**Query Parameters:**
- `start_date` - Start date (default: 30 days ago)
- `end_date` - End date (default: now)
- `start_event` - Journey starting event (optional)
- `end_event` - Journey ending event (optional)
- `max_steps` - Maximum steps to analyze (default: 10)
- `min_frequency` - Minimum frequency threshold (default: 5)

**Response:**
```json
{
  "success": true,
  "journeys": {
    "common_paths": [
      {
        "path": ["page_view", "button_click", "signup"],
        "frequency": 150,
        "avg_duration": 5.2,
        "conversion_rate": 30
      }
    ],
    "event_sequences": [
      {
        "sequence": ["landing", "pricing", "signup"],
        "count": 89
      }
    ],
    "drop_off_points": [
      {
        "event": "signup_page",
        "drop_off_count": 200,
        "drop_off_rate": 40
      }
    ]
  }
}
```

#### `GET /api/analytics/features/:featureId`

Analyze feature adoption and usage.

**Path Parameters:**
- `featureId` - ID of the feature

**Query Parameters:**
- `start_date` - Start date (defaults to feature launch date)
- `end_date` - End date (default: now)
- `cohort_id` - Filter by cohort

**Response:**
```json
{
  "success": true,
  "feature": {
    "id": "feature_123",
    "name": "New Dashboard",
    "description": "Redesigned analytics dashboard",
    "launch_date": "2025-10-01T00:00:00Z",
    "target_event": "dashboard_view",
    "adoption": {
      "total_users": 500,
      "adopted_users": 350,
      "adoption_rate": 70,
      "daily_active_users": 50,
      "weekly_active_users": 200,
      "monthly_active_users": 350
    },
    "adoption_over_time": [
      { "date": "2025-10-01", "adopted_users": 20, "adoption_rate": 4 },
      { "date": "2025-10-02", "adopted_users": 45, "adoption_rate": 9 }
    ]
  }
}
```

#### `GET /api/analytics/experiments/:experimentId`

Analyze A/B test experiment results.

**Path Parameters:**
- `experimentId` - ID of the experiment

**Query Parameters:**
- `start_date` - Start date (defaults to experiment start)
- `end_date` - End date (defaults to experiment end or now)
- `confidence_level` - Statistical confidence level (default: 95)

**Response:**
```json
{
  "success": true,
  "experiment": {
    "id": "exp_123",
    "name": "Signup Button Color Test",
    "description": "Testing blue vs green signup button",
    "status": "running",
    "goal_event": "signup_complete",
    "start_date": "2025-10-01T00:00:00Z",
    "end_date": null,
    "variants": [
      {
        "name": "control",
        "users": 500,
        "conversions": 150,
        "conversion_rate": 30
      },
      {
        "name": "variant_a",
        "users": 500,
        "conversions": 180,
        "conversion_rate": 36
      }
    ],
    "winner": "variant_a",
    "statistical_significance": true,
    "confidence_level": 95
  }
}
```

---

### 3. Users Routes (`users.js`)

User management and journey tracking endpoints.

#### `POST /api/users`

Create a new user or update existing user.

**Request Body:**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "properties": {
    "plan": "premium",
    "signup_source": "google"
  },
  "cohort_id": "cohort_oct_2025"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-10-29T10:30:00Z",
    "last_seen": null,
    "properties": {
      "plan": "premium",
      "signup_source": "google"
    },
    "cohort_id": "cohort_oct_2025"
  },
  "created": true
}
```

#### `GET /api/users/:id`

Get detailed user information.

**Path Parameters:**
- `id` - User ID

**Query Parameters:**
- `include_events` - Include recent events (true/false)
- `event_limit` - Number of recent events (default: 10)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-10-01T10:00:00Z",
    "last_seen": "2025-10-29T15:30:00Z",
    "properties": {
      "plan": "premium"
    },
    "cohort_id": "cohort_oct_2025",
    "stats": {
      "total_events": 250,
      "first_event": "2025-10-01T10:05:00Z",
      "last_event": "2025-10-29T15:30:00Z",
      "session_count": 45
    },
    "cohort": {
      "id": "cohort_oct_2025",
      "name": "October 2025 Cohort",
      "description": "Users who signed up in October 2025"
    },
    "recent_events": [...]
  }
}
```

#### `GET /api/users/:id/journey`

Get complete user journey timeline.

**Path Parameters:**
- `id` - User ID

**Query Parameters:**
- `start_date` - Start date
- `end_date` - End date
- `group_by_session` - Group events by session (true/false, default: true)

**Response:**
```json
{
  "success": true,
  "journey": {
    "user_id": "user123",
    "total_events": 50,
    "date_range": {
      "start": "2025-10-01T10:00:00Z",
      "end": "2025-10-29T15:30:00Z"
    },
    "sessions": [
      {
        "session_id": "session456",
        "start_time": "2025-10-01T10:00:00Z",
        "end_time": "2025-10-01T10:30:00Z",
        "duration_minutes": 30,
        "event_count": 15,
        "events": [...]
      }
    ],
    "total_sessions": 12
  }
}
```

#### `GET /api/users`

List users with filters and pagination.

**Query Parameters:**
- `cohort_id` - Filter by cohort
- `created_after` - Filter by creation date
- `created_before` - Filter by creation date
- `active_since` - Filter by last activity
- `limit` - Max results (default: 50, max: 1000)
- `offset` - Pagination offset
- `sort` - Sort field (created_at, last_seen)
- `order` - Sort order (asc, desc)
- `include_stats` - Include user statistics (true/false)

**Response:**
```json
{
  "success": true,
  "users": [...],
  "count": 50,
  "total": 500,
  "offset": 0,
  "limit": 50
}
```

#### `DELETE /api/users/:id`

Delete user and all associated data (GDPR compliance).

**Response:**
```json
{
  "success": true,
  "deleted": true,
  "user_id": "user123"
}
```

#### `PATCH /api/users/:id/properties`

Update user properties (merge with existing).

**Request Body:**
```json
{
  "properties": {
    "plan": "enterprise",
    "billing_cycle": "annual"
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "properties": {
      "plan": "enterprise",
      "billing_cycle": "annual",
      "signup_source": "google"
    }
  }
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "message": "Detailed error message (in development)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (validation error)
- `404` - Resource not found
- `500` - Internal server error

## Integration Example

```javascript
const express = require('express');
const Database = require('./database');
const { initializeRoutes } = require('./routes');

const app = express();
app.use(express.json());

// Initialize database
const db = new Database('./analytics.db');
await db.initialize();

// Initialize and mount routes
const routes = initializeRoutes(db);
app.use('/api/events', routes.events);
app.use('/api/analytics', routes.analytics);
app.use('/api/users', routes.users);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Testing

Example cURL commands for testing:

```bash
# Track an event
curl -X POST http://localhost:3000/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "page_view",
    "user_id": "user123",
    "properties": {"page": "homepage"}
  }'

# Get event summary
curl http://localhost:3000/api/events/summary?start_date=2025-10-01

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }'

# Get user journey
curl http://localhost:3000/api/users/user123/journey
```

## Dependencies

Required npm packages:
- `express` - Web framework
- `sqlite3` - Database driver
- `cors` - CORS middleware (optional)

## License

See project LICENSE file.
