# Troubleshooting Guide

## Quick Diagnostics

Run the test script to check all connections:
```bash
./TEST_CONNECTION.sh
```

---

## Issue: Frontend Shows Sample Data Instead of Real Data

### Symptoms
- Dashboard shows only 5 pilots (TechCorp, Global Finance, etc.)
- Console says "Using sample data (API not available)"

### Solutions

**1. Check if backend is running**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"healthy","timestamp":"..."}
```

If not running:
```bash
cd backend
npm start
```

**2. Check CORS is enabled**

In `backend/server.js`, verify this line exists:
```javascript
app.use(cors());
```

**3. Check browser console**

Open browser DevTools (F12) and look for errors like:
- `Failed to fetch` - Backend not running
- `CORS error` - CORS not configured
- `Network error` - Wrong URL

**4. Hard refresh frontend**
```bash
# Mac
Cmd + Shift + R

# Windows/Linux
Ctrl + Shift + R
```

---

## Issue: "Cannot GET /api/pilots"

### Cause
Backend routes not properly mounted

### Solution

Check `backend/server.js` has:
```javascript
app.use('/api/pilots', require('./routes/pilots')(db));
app.use('/api/metrics', require('./routes/metrics')(db));
app.use('/api/reports', require('./routes/reports')(db));
```

---

## Issue: Data Format Errors in Console

### Symptoms
- Console errors like "Cannot read property 'company_name'"
- Pilots not rendering properly

### Cause
Frontend expects camelCase, backend returns snake_case

### Solution

The frontend now has conversion functions:
- `convertPilotFromAPI()` - Converts backend → frontend
- `convertPilotToAPI()` - Converts frontend → backend

These should be automatically applied. If not working:

1. Check `dashboard.js` line ~165 has `convertPilotFromAPI()`
2. Check `dashboard.js` line ~191 has `convertPilotToAPI()`
3. Verify API calls use these converters:
   ```javascript
   const result = await response.json();
   this.pilots = result.data.map(pilot => this.convertPilotFromAPI(pilot));
   ```

---

## Issue: Port 3000 Already in Use

### Symptoms
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Solutions

**Option 1: Kill existing process**
```bash
lsof -ti:3000 | xargs kill -9
```

**Option 2: Use different port**
```bash
PORT=3001 npm start
```

Then update frontend `dashboard.js` line 8:
```javascript
this.apiUrl = 'http://localhost:3001/api';
```

---

## Issue: Database Not Found

### Symptoms
```
Error: SQLITE_CANTOPEN: unable to open database file
```

### Solution
```bash
cd backend
npm run seed
```

---

## Issue: npm install Fails

### Symptoms
- `Package not found` errors
- Dependencies won't install

### Solutions

**1. Clear npm cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**2. Check Node version**
```bash
node --version
```

Needs: Node.js 14+ (recommended: 18+)

**3. Use npm ci instead**
```bash
npm ci
```

---

## Issue: Pilots Not Updating After Edit/Create

### Cause
Response format not being parsed correctly

### Solution

Check these lines in `dashboard.js`:

**After CREATE (line ~663):**
```javascript
const result = await response.json();
const newPilot = this.convertPilotFromAPI(result.data || result);
```

**After UPDATE (line ~647):**
```javascript
const result = await response.json();
const updatedPilot = this.convertPilotFromAPI(result.data || result);
```

---

## Issue: Health Scores All Showing 0 or Wrong Values

### Cause
Backend calculator not running or criteria missing

### Solution

**1. Check success criteria exist**
```bash
curl http://localhost:3000/api/pilots/1 | jq '.data.success_criteria'
```

**2. Recalculate health score**
```bash
curl http://localhost:3000/api/pilots/1/calculate
```

**3. Check calculator.js exists**
```bash
ls backend/utils/calculator.js
```

---

## Issue: Conversion Probability Always 0%

### Cause
Predictor not loaded or missing dependencies

### Solution

**1. Check reports route is loaded**

In `server.js`:
```javascript
app.use('/api/reports', require('./routes/reports')(db));
```

**2. Test prediction endpoint**
```bash
curl http://localhost:3000/api/reports/pilot/1/prediction
```

**3. Check predictor.js exists**
```bash
ls backend/analytics/predictor.js
```

---

## Issue: "Mixed Content" Error in Browser

### Symptoms
```
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```

### Cause
Frontend loaded via HTTPS, backend on HTTP

### Solutions

**Option 1: Use file:// protocol**
```bash
open frontend/index.html
```

**Option 2: Use HTTP server**
```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## Issue: No Data Shows After Fresh Install

### Cause
Database not seeded

### Solution
```bash
cd backend
npm run seed
npm start
```

You should see:
```
✓ Created 10 pilots
✓ Added 40+ success criteria
✓ Added 30+ stakeholders
Database seeded successfully!
```

---

## Verify Everything Works

### Step-by-Step Check

1. **Backend health**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected: `{"status":"healthy"...}`

2. **Get pilots**
   ```bash
   curl http://localhost:3000/api/pilots
   ```
   Expected: `{"success":true,"count":10,"data":[...]}`

3. **Open frontend**
   ```bash
   open frontend/index.html
   ```

4. **Check browser console (F12)**
   - Should see: "Loaded pilots from API: 10"
   - Should NOT see: "Using sample data"

5. **Verify dashboard shows 10 pilots**
   - Not just 5 sample pilots

---

## Get Help

If still having issues:

1. **Check console logs**
   - Browser: F12 → Console tab
   - Backend: Terminal where `npm start` is running

2. **Enable debug mode**

   In `dashboard.js`, add at top:
   ```javascript
   const DEBUG = true;
   ```

3. **Test API directly**
   ```bash
   # Get all pilots
   curl http://localhost:3000/api/pilots | jq

   # Get single pilot
   curl http://localhost:3000/api/pilots/1 | jq

   # Get executive report
   curl http://localhost:3000/api/reports/executive | jq
   ```

4. **Check file structure**
   ```bash
   tree backend -L 2
   ```

---

## Common Gotchas

❌ **Don't** manually edit the database file
✅ **Do** use the API or re-seed

❌ **Don't** use `sudo npm install`
✅ **Do** fix permissions: `sudo chown -R $USER ~/.npm`

❌ **Don't** commit `node_modules/`
✅ **Do** use `.gitignore`

❌ **Don't** hard-code localhost in production
✅ **Do** use environment variables

---

## Still Stuck?

1. Delete everything and start fresh:
   ```bash
   cd backend
   rm -rf node_modules package-lock.json pilot-tracker.db
   npm install
   npm run seed
   npm start
   ```

2. Check the README.md for setup instructions

3. Run `./TEST_CONNECTION.sh` to verify all systems
