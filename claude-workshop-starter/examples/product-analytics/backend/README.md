# Product Analytics Backend

A comprehensive product analytics backend built with Node.js, Express, and SQLite. Features event tracking, funnel analysis, cohort retention, user journey mapping, feature adoption tracking, and A/B testing.

## Features

- **Event Tracking**: Track any custom event with properties, device info, and location data
- **Funnel Analysis**: Analyze conversion funnels with drop-off rates and timing analysis
- **Cohort Retention**: Track user retention by cohorts with day-N and churn metrics
- **User Journeys**: Map user paths, identify drop-off points, and analyze session behavior
- **Feature Adoption**: Track feature usage, stickiness, and time-to-adoption metrics
- **A/B Testing**: Run experiments with variant assignments and goal tracking
- **Cohort Management**: Segment users into cohorts for targeted analysis

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Seed Sample Data

Generate realistic sample data (100 users, ~10,000+ events):

```bash
npm run seed
```

This will create:
- 100 users across 5 cohorts
- 3 active A/B test experiments
- 4 pre-configured funnels
- Thousands of realistic events over 6 months
- User sessions with proper sequencing

### 3. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on **port 3001** (configurable via PORT environment variable).

## API Documentation

Once the server is running, visit:

```
http://localhost:3001/
```

This will display the complete API documentation with all available endpoints.

### Quick Health Check

```bash
curl http://localhost:3001/health
```

## Key Endpoints

### Event Tracking

```bash
# Track an event
POST /api/events/track
{
  "event_name": "button_clicked",
  "user_id": "user_123",
  "properties": { "button_id": "signup_cta" },
  "device_type": "mobile",
  "browser": "Chrome",
  "country": "United States"
}

# Query events
GET /api/events?start_date=2024-01-01&end_date=2024-12-31&event_name=signup
```

### Funnel Analysis

```bash
# Analyze a funnel
POST /api/funnels/analyze
{
  "steps": ["signup", "email_verified", "first_project_created"],
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

### Retention Analysis

```bash
# Get cohort retention
GET /api/retention?cohort_size=week&periods=12

# Get Day-N retention
GET /api/retention/day-n?days=1,7,30

# Get churn rate
GET /api/retention/churn?period=month
```

### User Journeys

```bash
# Get top user paths
GET /api/journeys/top-paths?max_steps=5&limit=10

# Get conversion paths to a goal
GET /api/journeys/conversion-paths?goal_event=subscription_purchased

# Get user's journey
GET /api/journeys/user/user_123
```

### Feature Adoption

```bash
# Track feature adoption over time
GET /api/features/adoption?event=ai_assistant_used&start_date=2024-01-01&end_date=2024-12-31

# Get feature stickiness (DAU/MAU)
GET /api/features/stickiness?event=ai_assistant_used

# Get power users
GET /api/features/power-users?event=ai_assistant_used&start_date=2024-01-01&end_date=2024-12-31
```

### A/B Testing

```bash
# List experiments
GET /api/experiments

# Get experiment results
GET /api/experiments/pricing_page_test/results

# Assign user to variant
POST /api/experiments/pricing_page_test/assign
{
  "user_id": "user_123",
  "variant": "variant_a"
}
```

## Database Schema

The backend uses SQLite with the following tables:

- **users**: User profiles and properties
- **events**: All tracked events with metadata
- **cohorts**: User segments for analysis
- **funnels**: Saved funnel definitions
- **experiments**: A/B test configurations
- **experiment_assignments**: User variant assignments
- **features**: Feature launch tracking

## Sample Data Overview

The seed script generates:

### Users (100)
- **Early Adopters** (15-20 users): Signed up in the first month
- **Power Users** (15-20 users): High engagement levels
- **Enterprise Customers** (10-15 users): On enterprise plans
- **Regular Users** (50+ users): Standard engagement
- Distributed across Free, Starter, Pro, and Enterprise plans

### Events (~10,000+)
- **Onboarding**: signup, email_verified, profile_completed, first_project_created
- **Core Usage**: dashboard_viewed, project_opened, file_uploaded, report_generated
- **Engagement**: invite_sent, comment_added, task_created
- **Conversion**: upgrade_viewed, payment_info_entered, subscription_purchased
- **Features**: ai_assistant_used, template_applied, integration_connected
- **Retention**: weekly_report_viewed, mobile_app_opened

### Experiments (3)
1. **Pricing Page Test**: Testing different layouts
2. **Onboarding Flow Test**: Simplified vs detailed flow
3. **Feature Discovery Test**: Tooltips vs videos vs hybrid

### Funnels (4)
1. **Onboarding Funnel**: Complete signup to first project
2. **Conversion Funnel**: Signup to subscription purchase
3. **Feature Adoption Funnel**: Dashboard to AI assistant usage
4. **Engagement Funnel**: Dashboard to collaboration actions

## Architecture

```
backend/
├── server.js              # Express server with all routes
├── database.js            # SQLite database wrapper
├── schema.sql            # Database schema
├── seed.js               # Sample data generator
├── package.json          # Dependencies
├── analytics/
│   ├── funnel-analyzer.js    # Funnel analysis algorithms
│   ├── cohort-retention.js   # Retention calculations
│   ├── journey-mapper.js     # User path analysis
│   └── feature-adoption.js   # Feature tracking metrics
└── README.md
```

## Development

### Running Tests

```bash
npm test
```

### Reset Database

To start fresh, simply delete the database file and re-seed:

```bash
rm analytics.db
npm run seed
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `DB_PATH`: SQLite database path (default: ./analytics.db)

## Technology Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **SQLite3**: Embedded database
- **CORS**: Cross-origin resource sharing
- **Body Parser**: Request parsing

## Notes

- The server runs on port 3001 by default to avoid conflicts with frontend dev servers
- All timestamps are stored in ISO 8601 format (UTC)
- Event properties are stored as JSON strings for flexibility
- The database is created automatically on first run
- Graceful shutdown is implemented for SIGTERM/SIGINT signals

## License

MIT
