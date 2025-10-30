# Product Analytics Dashboard

A comprehensive, professional React-based analytics dashboard for tracking product metrics, user behavior, and business KPIs. Built for demo and investor presentations.

## Features

### Core Analytics
- **Overview Dashboard**: High-level metrics with real-time charts
- **Event Tracking**: Real-time event stream and distribution
- **Conversion Funnels**: Visual funnel builder with drop-off analysis
- **Cohort Retention**: Interactive heatmap for retention analysis
- **User Journeys**: Path visualization and drop-off points
- **Feature Adoption**: Adoption curves and stickiness metrics (DAU/MAU)
- **A/B Testing**: Experiment results with statistical significance
- **User Explorer**: Individual user journey viewer
- **Export Center**: Generate investor-ready reports

### UI/UX Features
- Dark theme design (#0a0a0a background, professional aesthetics)
- Responsive layout with sticky sidebar navigation
- Date range picker with quick presets (7d, 30d, 90d)
- Interactive charts powered by Chart.js
- Loading states and error handling
- Empty states for better UX
- Professional metric cards with trend indicators
- Filterable tables and search functionality

## Tech Stack

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Chart.js + React-ChartJS-2** - Data visualization
- **Vite** - Build tool and dev server
- **CSS Variables** - Theming system

## Installation

### Prerequisites
- Node.js 16+ and npm
- Backend API running on http://localhost:3001

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The dashboard will be available at http://localhost:3000

3. **Build for production:**
```bash
npm run build
```

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main app component with routing
    ├── styles/
    │   ├── global.css      # Global styles and theme
    │   ├── sidebar.css     # Sidebar navigation styles
    │   └── date-picker.css # Date picker styles
    ├── components/
    │   ├── Sidebar.jsx           # Navigation sidebar
    │   ├── DateRangePicker.jsx   # Date range selector
    │   ├── LoadingSpinner.jsx    # Loading state component
    │   └── MetricCard.jsx        # Reusable metric display
    ├── pages/
    │   ├── Overview.jsx          # Main dashboard
    │   ├── Events.jsx            # Event tracking
    │   ├── Funnels.jsx           # Funnel analysis
    │   ├── Retention.jsx         # Cohort retention
    │   ├── UserJourneys.jsx      # User path analysis
    │   ├── FeatureAdoption.jsx   # Feature metrics
    │   ├── ABTests.jsx           # A/B test results
    │   ├── UserExplorer.jsx      # Individual user viewer
    │   └── ExportCenter.jsx      # Report generation
    └── utils/
        ├── api.js          # API client and endpoints
        └── formatters.js   # Number and date formatting
```

## Usage

### Viewing Analytics

1. **Overview Page**: Start here for high-level metrics
   - Total users, active users, events, conversion rate
   - Daily active users chart
   - Top events bar chart
   - Recent event stream

2. **Events Dashboard**: Track all events in real-time
   - Filter by event name
   - Event distribution chart
   - Detailed event table with properties

3. **Funnels**: Analyze conversion paths
   - Build custom funnels by adding event steps
   - Visual funnel with conversion rates
   - Drop-off analysis between steps

4. **Retention**: Understand user retention
   - Color-coded cohort heatmap
   - Toggle between daily, weekly, monthly cohorts
   - Retention percentages over time

5. **User Journeys**: See how users navigate
   - Top user paths
   - Drop-off points
   - Session statistics

6. **Feature Adoption**: Track feature usage
   - Enter feature event name
   - View adoption curve over time
   - DAU/MAU/WAU metrics
   - Stickiness ratio

7. **A/B Tests**: Analyze experiments
   - View all experiments
   - Conversion rates by variant
   - Statistical significance
   - Winner determination

8. **User Explorer**: Individual user analysis
   - Search users by email or ID
   - View complete user journey
   - Timeline visualization with events

9. **Export Center**: Generate reports
   - Choose report type
   - Select format (PDF, CSV, JSON, XLSX)
   - Investor deck templates
   - Schedule automated reports

### Date Range Selection

Use the date picker in the top-right corner:
- Manual date selection
- Quick presets: Last 7 days, Last 30 days, Last 90 days
- All analytics update based on selected range

## API Integration

The dashboard connects to the backend API at `http://localhost:3001`. All API calls are handled through the centralized `api.js` utility.

### Key API Endpoints Used

- `GET /api/users/stats` - User statistics
- `GET /api/events` - Event data
- `POST /api/funnels/analyze` - Funnel analysis
- `GET /api/retention` - Retention cohorts
- `GET /api/journeys/top-paths` - User paths
- `GET /api/features/adoption` - Feature adoption
- `GET /api/experiments` - A/B tests

## Customization

### Theme Colors

Edit `src/styles/global.css` to customize the color scheme:

```css
:root {
  --bg-primary: #0a0a0a;      /* Main background */
  --bg-secondary: #141414;    /* Cards */
  --bg-elevated: #1a1a1a;     /* Hover states */
  --border: #262626;          /* Borders */
  --accent: #3b82f6;          /* Primary blue */
  --success: #10b981;         /* Green */
  --danger: #ef4444;          /* Red */
  --warning: #f59e0b;         /* Amber */
}
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Add navigation item in `src/components/Sidebar.jsx`

## Demo Mode

The dashboard includes fallback demo data for when the API is unavailable. This allows you to:
- Demo the UI without a backend
- Test the interface during development
- Show the dashboard to stakeholders

## Performance

- **Code splitting**: Routes are lazy-loaded
- **Optimized charts**: Canvas-based Chart.js for smooth rendering
- **Responsive design**: Works on desktop, tablet, and mobile
- **Fast dev server**: Vite provides instant HMR

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### API Connection Issues

If you see "No data available":
1. Ensure backend is running on http://localhost:3001
2. Check browser console for CORS errors
3. Verify API endpoints are accessible

### Chart Not Rendering

- Check that Chart.js is properly imported
- Ensure data format matches expected structure
- Look for console errors

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Development Tips

- Use React DevTools for component debugging
- Check Network tab for API calls
- Hot reload updates instantly during development
- Use `console.log()` in API calls to debug data flow

## Production Deployment

1. Build the production bundle:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting

3. Update API base URL in `src/utils/api.js` for production

## License

This is a demo project created for the Claude Code Workshop.

## Support

For issues or questions about the dashboard, refer to the main workshop documentation or check the backend API documentation.

---

**Built with Claude Code** - A professional analytics dashboard ready for demos and investor presentations.
