# Product Analytics API - Quick Reference

## Files in this Directory

| File | Purpose | Size |
|------|---------|------|
| `events.js` | Event tracking endpoints | 439 lines |
| `analytics.js` | Analytics & reporting endpoints | 562 lines |
| `users.js` | User management endpoints | 621 lines |
| `index.js` | Route initialization | 31 lines |
| `README.md` | Complete API documentation | 14 KB |
| `API_TESTING.md` | Testing guide with examples | 11 KB |
| `SUMMARY.md` | Implementation overview | 9 KB |
| `example-usage.js` | Runnable code examples | 9.8 KB |

## API Endpoints at a Glance

### Events (4 endpoints)
```
POST /api/events/track        - Track single event
POST /api/events/batch        - Track multiple events
GET  /api/events              - Query events
GET  /api/events/summary      - Get statistics
```

### Analytics (5 endpoints)
```
GET /api/analytics/funnels/:id          - Funnel analysis
GET /api/analytics/retention            - Retention data
GET /api/analytics/journeys             - User journeys
GET /api/analytics/features/:id         - Feature adoption
GET /api/analytics/experiments/:id      - A/B test results
```

### Users (6 endpoints)
```
POST   /api/users                   - Create user
GET    /api/users                   - List users
GET    /api/users/:id               - Get user
GET    /api/users/:id/journey       - User timeline
PATCH  /api/users/:id/properties    - Update properties
DELETE /api/users/:id               - Delete user
```

## Quick Integration

```javascript
const { initializeRoutes } = require('./routes');

// Initialize with database
const routes = initializeRoutes(db);

// Mount routes
app.use('/api/events', routes.events);
app.use('/api/analytics', routes.analytics);
app.use('/api/users', routes.users);
```

## Quick Test Commands

```bash
# Health check
curl http://localhost:3000/health

# Track event
curl -X POST http://localhost:3000/api/events/track \
  -H "Content-Type: application/json" \
  -d '{"event_name":"test","user_id":"user1"}'

# Get summary
curl http://localhost:3000/api/events/summary

# Run examples
node routes/example-usage.js
```

## Common Use Cases

**Track a user action:**
```bash
POST /api/events/track
{"event_name": "button_click", "user_id": "user123", "properties": {"button": "signup"}}
```

**Analyze signup funnel:**
```bash
GET /api/analytics/funnels/1?start_date=2025-10-01&include_timings=true
```

**Check user activity:**
```bash
GET /api/users/user123?include_events=true
```

**Calculate retention:**
```bash
GET /api/analytics/retention?period=week&num_periods=12
```

**Get feature adoption:**
```bash
GET /api/analytics/features/new_dashboard
```

## Response Format

**Success:**
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Documentation Files

- **README.md** - Full API documentation with examples
- **API_TESTING.md** - Testing guide with cURL commands
- **SUMMARY.md** - Implementation overview and architecture
- **This file** - Quick reference for common operations

## Next Steps

1. Read README.md for complete documentation
2. Try example-usage.js for hands-on examples
3. Use API_TESTING.md for testing workflows
4. Check SUMMARY.md for architecture details

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review example-usage.js for code examples
- Consult API_TESTING.md for testing help
