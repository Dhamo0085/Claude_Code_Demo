# Quick Start Guide

Get your Product Analytics backend running in 3 simple steps!

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Express (web framework)
- SQLite3 (database)
- CORS (API access)
- Body-parser (request handling)

## Step 2: Generate Sample Data

```bash
npm run seed
```

This creates:
- 100 realistic users
- 5 cohorts (Early Adopters, Power Users, etc.)
- 3 A/B test experiments
- 4 pre-configured funnels
- 10,000+ events over 6 months

Takes about 1-2 minutes to complete.

## Step 3: Start the Server

```bash
npm start
```

Server starts on: **http://localhost:3001**

## Verify It's Working

Open your browser and visit:

```
http://localhost:3001/
```

You should see the API documentation with all available endpoints.

### Test the Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-29T...",
  "uptime": 1.234,
  "database": "connected"
}
```

### Try a Sample Query

Get all users:
```bash
curl http://localhost:3001/api/users?limit=5
```

Analyze a funnel:
```bash
curl -X POST http://localhost:3001/api/funnels/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["signup", "email_verified", "first_project_created"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

Get retention data:
```bash
curl http://localhost:3001/api/retention?cohort_size=week&periods=8
```

## What's Next?

1. Explore the full API documentation at `http://localhost:3001/`
2. Read `README.md` for detailed endpoint documentation
3. Check out the analytics modules in the `/analytics` folder
4. Build your frontend to visualize the data!

## Troubleshooting

### Port 3001 already in use?

Change the port:
```bash
PORT=3002 npm start
```

### Want to reset the database?

```bash
rm analytics.db
npm run seed
npm start
```

### Need development mode with auto-reload?

```bash
npm run dev
```

(Requires installing nodemon: `npm install -g nodemon`)

## Project Structure

```
backend/
├── server.js           ← Main server with all routes
├── database.js         ← Database operations
├── seed.js            ← Sample data generator
├── package.json       ← Dependencies
├── analytics/         ← Analysis algorithms
│   ├── funnel-analyzer.js
│   ├── cohort-retention.js
│   ├── journey-mapper.js
│   └── feature-adoption.js
└── README.md          ← Full documentation
```

## Key Features

- **Event Tracking**: Track any user action
- **Funnel Analysis**: Conversion rates and drop-offs
- **Retention**: Cohort analysis and churn metrics
- **User Journeys**: Path analysis and session stats
- **Feature Adoption**: Usage metrics and stickiness
- **A/B Testing**: Experiment management and results

## Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Review the code comments in `server.js`
3. Examine the analytics modules for algorithm details

Happy analyzing! 🚀
