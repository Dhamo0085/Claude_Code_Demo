# Enterprise B2B Pilot Program Manager - Backend API

A comprehensive Node.js/Express backend with SQLite database for managing B2B pilot programs, tracking success metrics, and calculating conversion probabilities.

## Features

- RESTful API for pilot program management
- SQLite database with relational schema
- Success criteria tracking
- Stakeholder management
- Metrics collection and analysis
- Automated health score calculation
- Risk assessment algorithms
- Conversion probability forecasting

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

```bash
# Navigate to backend directory
cd examples/advanced-example-2/backend

# Install dependencies
npm install
```

## Setup & Running

### 1. Seed the Database

```bash
npm run seed
```

This creates a SQLite database with 10 realistic pilot programs across various industries.

### 2. Start the Server

```bash
npm start
```

Server will start on `http://localhost:3000`

### 3. Development Mode (with auto-reload)

```bash
npm run dev
```

## API Endpoints

### Pilots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pilots` | List all pilots with enhanced metrics |
| GET | `/api/pilots/:id` | Get single pilot with full details |
| POST | `/api/pilots` | Create new pilot |
| PUT | `/api/pilots/:id` | Update pilot information |
| DELETE | `/api/pilots/:id` | Delete pilot (cascades) |
| POST | `/api/pilots/:id/success-criteria` | Add success criteria |
| PUT | `/api/pilots/success-criteria/:id` | Update success criteria |
| POST | `/api/pilots/:id/stakeholders` | Add stakeholder |
| GET | `/api/pilots/:id/calculate` | Recalculate all metrics |

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics/:pilotId` | Get all metrics for pilot |
| GET | `/api/metrics/:pilotId/type/:type` | Get metrics by type |
| POST | `/api/metrics` | Add new metric |
| POST | `/api/metrics/batch` | Add multiple metrics |
| GET | `/api/metrics/:pilotId/calculate` | Calculate health score |
| GET | `/api/metrics/:pilotId/summary` | Get metrics summary |
| DELETE | `/api/metrics/:id` | Delete metric |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## Testing with cURL

### Get All Pilots

```bash
curl http://localhost:3000/api/pilots
```

### Get Single Pilot with Details

```bash
curl http://localhost:3000/api/pilots/1
```

### Create New Pilot

```bash
curl -X POST http://localhost:3000/api/pilots \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "industry": "SaaS",
    "start_date": "2025-11-01",
    "end_date": "2025-12-31",
    "status": "Active",
    "contract_value": 500000,
    "arr_projection": 1200000,
    "conversion_probability": 70,
    "primary_contact": "John Doe - CEO",
    "notes": "Test pilot program"
  }'
```

### Update Pilot Status

```bash
curl -X PUT http://localhost:3000/api/pilots/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Converted",
    "health_score": 95
  }'
```

### Add Success Criteria

```bash
curl -X POST http://localhost:3000/api/pilots/1/success-criteria \
  -H "Content-Type: application/json" \
  -d '{
    "criteria": "Complete integration testing",
    "target_value": "100%",
    "current_value": "75%",
    "status": "In Progress",
    "weight": 4
  }'
```

### Add Metric

```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "pilot_id": 1,
    "metric_name": "Daily Active Users",
    "metric_value": "250",
    "metric_type": "usage"
  }'
```

### Get Metrics Summary

```bash
curl http://localhost:3000/api/metrics/1/summary
```

### Recalculate Health Score

```bash
curl http://localhost:3000/api/metrics/1/calculate
```

## Database Schema

### Tables

#### pilots
Core pilot program information including status, health score, and projections.

#### success_criteria
Weighted success criteria tied to each pilot with status tracking.

#### stakeholders
Key people involved in each pilot with engagement levels.

#### metrics
Time-series metrics for tracking quantitative performance.

## Business Logic

### Health Score Calculation (0-100)

- **40%** - Success Criteria Achievement
- **30%** - Timeline Progress
- **20%** - Engagement Score
- **10%** - Status Modifier

### Risk Assessment

Factors:
- Health score
- Days remaining
- At-risk criteria count
- Stakeholder engagement
- Current status

Returns: Low, Medium, High, or Critical

### Conversion Probability

Calculated based on:
- Current health score
- Success criteria achievement
- Stakeholder engagement
- Timeline status

## File Structure

```
backend/
├── package.json          # Dependencies and scripts
├── server.js            # Express server setup
├── database.js          # SQLite database layer
├── schema.sql           # Database schema
├── seed.js              # Sample data generator
├── routes/
│   ├── pilots.js        # Pilot endpoints
│   └── metrics.js       # Metrics endpoints
└── utils/
    └── calculator.js    # Business logic functions
```

## Sample Data

The seed script creates 10 pilot programs:

1. **Acme Financial** - FinTech, $500K ARR, Active (85% health)
2. **MedTech Solutions** - HealthTech, $1.2M ARR, At Risk (42% health)
3. **Enterprise Corp** - SaaS, $2M ARR, Converted (95% health)
4. **CloudScale Technologies** - DevOps, $750K ARR, Active (78% health)
5. **DataStream Analytics** - Data, $850K ARR, Active (65% health)
6. **SecureAuth Inc** - Cybersecurity, $950K ARR, At Risk (28% health)
7. **RetailConnect** - E-commerce, $650K ARR, Active (88% health)
8. **FinanceFlow Solutions** - FinTech, $480K ARR, Active (70% health)
9. **TechCorp Industries** - IoT, $1.5M ARR, Completed (82% health)
10. **GlobalComms** - Communications, $720K ARR, Lost (15% health)

**Total ARR Projection:** $21.8M

## Error Handling

All endpoints return JSON responses with consistent structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## CORS

CORS is enabled for all origins to allow frontend integration.

## Development Tips

1. Use `GET /` to see all available endpoints
2. Use `GET /health` to verify server is running
3. Check console logs for request tracking
4. Database file is created as `pilots.db` in backend directory
5. Delete `pilots.db` and run `npm run seed` to reset data

## Next Steps

- Build frontend dashboard to visualize pilot data
- Add authentication/authorization
- Implement WebSocket for real-time updates
- Add email notifications for at-risk pilots
- Create data export functionality
- Build reporting and analytics features

---

Built with Express, SQLite3, and love for B2B success!
