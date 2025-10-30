import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DateRangePicker from './components/DateRangePicker'
import Overview from './pages/Overview'
import Events from './pages/Events'
import Funnels from './pages/Funnels'
import Retention from './pages/Retention'
import UserJourneys from './pages/UserJourneys'
import FeatureAdoption from './pages/FeatureAdoption'
import ABTests from './pages/ABTests'
import UserExplorer from './pages/UserExplorer'
import ExportCenter from './pages/ExportCenter'

function App() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="top-bar">
            <div className="top-bar-content">
              <h1 className="page-title">Product Analytics</h1>
              <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
            </div>
          </div>

          <div className="content-area">
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview dateRange={dateRange} />} />
              <Route path="/events" element={<Events dateRange={dateRange} />} />
              <Route path="/funnels" element={<Funnels dateRange={dateRange} />} />
              <Route path="/retention" element={<Retention dateRange={dateRange} />} />
              <Route path="/journeys" element={<UserJourneys dateRange={dateRange} />} />
              <Route path="/features" element={<FeatureAdoption dateRange={dateRange} />} />
              <Route path="/ab-tests" element={<ABTests dateRange={dateRange} />} />
              <Route path="/users" element={<UserExplorer dateRange={dateRange} />} />
              <Route path="/export" element={<ExportCenter dateRange={dateRange} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
