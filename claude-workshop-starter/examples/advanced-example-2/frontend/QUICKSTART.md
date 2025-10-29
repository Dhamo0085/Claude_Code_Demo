# Quick Start Guide - Pilot Program Dashboard

## Instant Demo (No Setup Required)

### Option 1: Direct File Open
```bash
# From the frontend directory
open index.html
```
The dashboard will load with 5 sample pilot programs immediately!

### Option 2: With Python (Recommended)
```bash
# Start a simple web server
python3 -m http.server 8080

# Then open in browser
http://localhost:8080
```

### Option 3: With Node.js
```bash
# Install a simple server
npm install -g http-server

# Run it
http-server -p 8080

# Open http://localhost:8080
```

## What You'll See

### Top Metrics Bar
- **4 Active Pilots** in the sample data
- **Average Health Score** of 78
- **$795,000** total pipeline value
- **40% conversion rate**

### Pilot Cards
You'll see 5 enterprise pilot programs:

1. **TechCorp Industries**
   - Status: On Track (green)
   - Health: 85 (excellent)
   - Value: $150K
   - 75% conversion probability

2. **Global Finance Solutions**
   - Status: At Risk (red)
   - Health: 45 (poor)
   - Value: $250K
   - 35% conversion probability
   - **Appears in risk alerts!**

3. **CloudScale Dynamics**
   - Status: Active (blue)
   - Health: 92 (excellent)
   - Value: $180K
   - 90% conversion probability

4. **DataStream Analytics**
   - Status: Completed (gray)
   - Health: 88 (excellent)
   - Value: $120K
   - 95% conversion probability

5. **InnovateLabs**
   - Status: Active (blue)
   - Health: 72 (good)
   - Value: $95K
   - 60% conversion probability

## Try These Features

### 1. View Details
- Click on any pilot card
- See expanded information
- Review success criteria
- Check contract calculations

### 2. Create New Pilot
- Click "New Pilot" button (top right)
- Fill in company details
- Add success criteria (one per line)
- Save and see it appear immediately

### 3. Edit Existing
- Click the pencil icon on any card
- Modify details
- Save changes

### 4. Filter & Sort
**Sidebar Filters:**
- Try "At Risk" status filter
- Sort by "Health Score" (highest first)
- Sort by "Contract Value" (highest first)

**Search:**
- Type "Tech" to find TechCorp
- Type "Sarah" to find her pilot

### 5. Export Report
- Click "Export Report" in sidebar
- Downloads JSON with all data
- Includes summary metrics

## Interactive Elements

### Status Badges
Watch them change color based on status:
- Blue = Active
- Green = On Track
- Red = At Risk
- Gray = Completed
- Purple = Converted

### Health Scores
Color-coded for quick scanning:
- Green (80+) = Excellent
- Blue (60-79) = Good
- Yellow (40-59) = Warning
- Red (0-39) = Poor

### Progress Bars
- Shows timeline progress
- Days elapsed vs total days
- Color changes near deadline

### Success Criteria
- Checkboxes show completion
- Shows X/Y completed
- Click card to see all criteria

## API Integration

### Without Backend (Current)
- Uses sample data automatically
- All features work client-side
- Perfect for demos and testing

### With Backend (Future)
To connect to real API:

1. Backend should run on `http://localhost:3000`
2. Implement these endpoints:
   - `GET /api/pilots` - List all
   - `POST /api/pilots` - Create new
   - `PUT /api/pilots/:id` - Update
   - `DELETE /api/pilots/:id` - Delete

3. Dashboard will auto-detect and use API
4. Sample data is replaced with real data

## Customization

### Change Colors
Edit `styles.css` CSS variables:
```css
:root {
    --primary-blue: #2563eb;  /* Change main color */
    --success-green: #10b981; /* Change success color */
    /* ... etc */
}
```

### Modify Sample Data
Edit `dashboard.js` around line 15:
```javascript
this.samplePilots = [
    // Add or modify pilots here
];
```

### Change API URL
Edit `dashboard.js` line 3:
```javascript
this.apiUrl = 'http://your-api-url.com/api';
```

## Keyboard Shortcuts

- **ESC** - Close any open modal
- Click outside modal - Close modal
- Enter in search - Auto-filters

## Mobile View

Try resizing your browser window:
- Desktop: 2-column with sidebar
- Tablet: Single column, sidebar below
- Mobile: Optimized spacing

Or test on your phone's browser!

## Troubleshooting

### Dashboard is blank
- Check browser console (F12)
- Verify all 3 files are in same folder
- Try different browser

### API not connecting
- Normal! Dashboard uses sample data
- Check console for "Using sample data" message
- All features still work

### Styles look wrong
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Verify styles.css is loading
- Check for CSS errors in console

## File Structure
```
frontend/
├── index.html      (329 lines) - Main structure
├── styles.css      (1,123 lines) - All styling
├── dashboard.js    (780 lines) - Application logic
├── README.md       - Full documentation
└── QUICKSTART.md   - This file
```

## Next Steps

1. **Try all features** - Create, edit, filter, sort
2. **Open developer tools** - See console logs
3. **Customize sample data** - Add your own pilots
4. **Build the backend** - Connect to real API
5. **Deploy** - Host on Netlify/Vercel

## Demo Script

Want to show this to someone? Here's a 2-minute demo:

1. **Overview** (15s)
   - "This is an enterprise pilot program manager"
   - Point to metrics at top
   - "We're tracking $795K in pipeline"

2. **Pilot Cards** (30s)
   - "Each card shows a pilot program"
   - Point to health scores and status
   - "This one is at risk - see the red badge?"
   - Click to show detail view

3. **Create New** (45s)
   - Click "New Pilot"
   - Fill in form quickly
   - "I can track success criteria"
   - Save and show it appears

4. **Filtering** (20s)
   - Use status filter
   - Try search
   - "Easy to find specific pilots"

5. **Risk Management** (10s)
   - Point to sidebar alerts
   - "Automatic risk detection"
   - "Health scores below 60 alert me"

**Total: 2 minutes, impressive demo!**

## Questions?

Everything works out of the box. Just open `index.html` and start exploring!

Built to ship - enjoy! 🚀
