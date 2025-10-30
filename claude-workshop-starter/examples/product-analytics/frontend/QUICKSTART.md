# Quick Start Guide

Get the Product Analytics Dashboard running in 3 minutes.

## Prerequisites

- Node.js 16+ installed
- Backend API running on port 3001

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will open at **http://localhost:3000**

## First Steps

1. **Overview Page** - View key metrics and charts
2. **Events Dashboard** - See real-time event tracking
3. **Funnels** - Build your first conversion funnel:
   - Add steps: `page_view`, `button_click`, `purchase`
   - Click "Analyze Funnel"
4. **Date Range** - Use the picker in top-right to change time period

## Demo Mode

The dashboard includes fallback demo data, so it works even without the backend API. This is perfect for:
- Testing the UI
- Demos and presentations
- Development

## Key Features Checklist

- [ ] View overview metrics
- [ ] Track events in real-time
- [ ] Build a conversion funnel
- [ ] Check retention heatmap
- [ ] Explore user journeys
- [ ] View A/B test results
- [ ] Search individual users
- [ ] Export reports for investors

## Troubleshooting

**Port already in use?**
```bash
# Change port in vite.config.js or use:
PORT=3002 npm run dev
```

**API not connecting?**
- Check backend is running: `http://localhost:3001/health`
- Demo data will load automatically as fallback

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## What's Next?

- Customize the theme in `src/styles/global.css`
- Add new analytics pages in `src/pages/`
- Integrate with your own backend API
- Deploy to production

## Project Structure

```
frontend/
├── src/
│   ├── pages/          # 9 analytics pages
│   ├── components/     # Reusable UI components
│   ├── utils/          # API client & formatters
│   └── styles/         # CSS files
├── index.html          # Entry point
├── package.json        # Dependencies
└── README.md          # Full documentation
```

## Support

- Full docs: See `README.md`
- Backend API: See `../backend/README.md`
- Issues: Check console for errors

---

**Ready to demo!** Open http://localhost:3000 and explore the dashboard.
