# Getting Started - Product Analytics Platform

**Get your Mixpanel competitor running in 5 minutes!**

---

## ⚡ Quick Start

### Step 1: Install Backend Dependencies (2 minutes)

```bash
cd claude-workshop-starter/examples/product-analytics/backend
npm install
```

Expected output: `✓ 220 packages installed`

### Step 2: Generate Sample Data (1 minute)

```bash
npm run seed
```

This creates:
- 100 users across 5 cohorts
- 10,000+ realistic events
- 4 pre-configured funnels
- 3 A/B test experiments

Expected output:
```
✓ Database initialized
✓ Creating users... (100)
✓ Creating cohorts... (5)
✓ Creating experiments... (3)
✓ Generating events... (10,000+)
✓ Sample data seeded successfully!
```

### Step 3: Start Backend (30 seconds)

```bash
npm start
```

Expected output:
```
Server running on: http://localhost:3001
```

**Test it:** Open http://localhost:3001/health

Should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-29T...",
  "service": "Product Analytics API"
}
```

### Step 4: Install Frontend Dependencies (1 minute)

**Open a new terminal:**

```bash
cd claude-workshop-starter/examples/product-analytics/frontend
npm install
```

Expected output: `✓ Dependencies installed`

### Step 5: Start Frontend (30 seconds)

```bash
npm run dev
```

Expected output:
```
  VITE ready in 300 ms
  ➜  Local:   http://localhost:3000/
```

**Open:** http://localhost:3000

---

## ✅ Verification Checklist

After following the steps above, verify everything works:

### Backend (http://localhost:3001)

- [ ] Health check responds: `GET /health`
- [ ] Get users: `GET /api/users?limit=5`
- [ ] Get events: `GET /api/events/summary`

### Frontend (http://localhost:3000)

- [ ] Dashboard loads with dark theme
- [ ] Sidebar shows 9 menu items
- [ ] Overview page shows metrics (Total Users, Events, etc.)
- [ ] Funnels page loads
- [ ] Retention heatmap displays

---

## 🔧 Testing the API

### Test 1: Get Users

```bash
curl http://localhost:3001/api/users?limit=5
```

Should return 5 users with names, emails, and cohorts.

### Test 2: Analyze a Funnel

```bash
curl -X POST http://localhost:3001/api/funnels/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["signup", "email_verified", "first_project_created"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  }'
```

Should return conversion rates for each step.

### Test 3: Get Retention

```bash
curl "http://localhost:3001/api/retention?cohort_size=week&periods=8"
```

Should return retention heatmap data.

### Test 4: Export Events

```bash
curl "http://localhost:3001/api/export/events/csv?start_date=2024-10-01&end_date=2024-10-31" \
  -o events.csv
```

Should download a CSV file with events.

---

## 🎨 Exploring the Dashboard

### Overview Page
- View total users, events, and active users
- See event timeline chart
- Monitor recent events stream

### Funnels
1. Click "Funnels" in sidebar
2. Add steps (e.g., `signup`, `email_verified`, `first_project_created`)
3. Click "Analyze Funnel"
4. View conversion rates and drop-offs

### Retention
1. Click "Retention" in sidebar
2. View color-coded cohort heatmap
3. Darker colors = higher retention
4. Hover to see exact percentages

### User Journeys
1. Click "User Journeys" in sidebar
2. View most common user paths
3. See drop-off points
4. Analyze session statistics

### Feature Adoption
1. Click "Feature Adoption" in sidebar
2. Select a feature (e.g., `ai_assistant_used`)
3. View adoption curve over time
4. Check DAU/MAU stickiness

### A/B Tests
1. Click "A/B Tests" in sidebar
2. View all experiments
3. Click an experiment to see results
4. Check statistical significance

### User Explorer
1. Click "User Explorer" in sidebar
2. Search for a user (or use first user from list)
3. Click to view detailed timeline
4. See all events grouped by session

### Export Center
1. Click "Export Center" in sidebar
2. Select report type (Events, Users, Analytics)
3. Choose format (CSV, JSON, HTML)
4. Select date range
5. Click "Generate Export"

---

## 📊 Sample Data Overview

The seed script creates realistic data:

**Users (100)**
- 20 Early Adopters
- 25 Power Users
- 20 Enterprise users
- 20 At Risk users
- 15 Mobile First users

**Events (10,000+)**
- Onboarding events (signup, verification, profile setup)
- Core product usage (dashboard, projects, files)
- Engagement (comments, shares, invites)
- Conversion (upgrade views, payments)
- Feature usage (AI assistant, templates, integrations)

**Cohorts (5)**
- Segmented by behavior and usage patterns

**Experiments (3)**
- Checkout button test
- Onboarding flow test
- Pricing page test

**Funnels (4)**
- Onboarding funnel
- Conversion funnel
- Feature adoption funnel
- Engagement funnel

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `Port 3001 is already in use`
- **Solution:** Kill the process using port 3001:
  ```bash
  lsof -ti:3001 | xargs kill -9
  ```

**Error:** `Cannot find module 'express'`
- **Solution:** Install dependencies:
  ```bash
  npm install
  ```

### Frontend won't start

**Error:** `Port 3000 is already in use`
- **Solution:** Kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

**Error:** `Failed to fetch` in browser console
- **Solution:** Make sure backend is running on port 3001

### No data in dashboard

**Problem:** Dashboard shows "No data available"
- **Solution:** Run the seed script:
  ```bash
  cd backend
  npm run seed
  ```

### Database locked error

**Error:** `database is locked`
- **Solution:** Close any other processes using the database, then restart:
  ```bash
  rm backend/analytics.db
  npm run seed
  npm start
  ```

---

## 🎯 What to Try Next

### 1. Track Custom Events

```bash
curl -X POST http://localhost:3001/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "feature_used",
    "user_id": "user_1",
    "properties": {
      "feature_name": "export",
      "success": true
    }
  }'
```

### 2. Create a Custom Funnel

```bash
curl -X POST http://localhost:3001/api/funnels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Funnel",
    "description": "Track my conversion flow",
    "steps": ["page_view", "button_click", "form_submit", "success"]
  }'
```

### 3. Create an A/B Test

```bash
curl -X POST http://localhost:3001/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "id": "exp_my_test",
    "name": "My A/B Test",
    "variants": ["control", "variant_a"],
    "goal_event": "purchase",
    "status": "running"
  }'
```

### 4. Export an Investor Report

```bash
curl "http://localhost:3001/api/export/investor-report?start_date=2024-10-01&end_date=2024-10-31" \
  -o investor_report.html
open investor_report.html
```

---

## 📚 Next Steps

1. **Read the main README**: `README.md` for full feature list
2. **Explore the API**: `backend/routes/README.md` for all endpoints
3. **Review the code**: Well-commented and organized
4. **Customize**: Add your own events, funnels, and features
5. **Deploy**: See deployment section in main README

---

## 🎓 Learning Resources

**Backend Code:**
- `backend/server.js` - Main server setup
- `backend/database.js` - Database layer
- `backend/analytics/` - Analytics modules
- `backend/routes/` - API endpoints

**Frontend Code:**
- `frontend/src/App.jsx` - Main app
- `frontend/src/pages/` - Dashboard pages
- `frontend/src/components/` - Reusable components
- `frontend/src/utils/api.js` - API client

**Documentation:**
- `backend/README.md` - Backend docs
- `frontend/README.md` - Frontend docs
- `backend/analytics/AB_TEST_README.md` - A/B testing guide
- `backend/utils/EXPORT_README.md` - Export utilities

---

## ⏱️ Time Breakdown

- **Install backend**: 2 minutes
- **Seed data**: 1 minute
- **Start backend**: 30 seconds
- **Install frontend**: 1 minute
- **Start frontend**: 30 seconds

**Total: 5 minutes from clone to dashboard!**

---

## ✅ Success!

If you see:
- ✅ Backend running on port 3001
- ✅ Frontend running on port 3000
- ✅ Dashboard displays with dark theme
- ✅ Metrics and charts showing data

**You're ready to track product analytics!** 🚀

---

**Questions?** Check the main README or explore the documentation files in each folder.

**Ready to demo?** Your Mixpanel competitor is production-ready!
