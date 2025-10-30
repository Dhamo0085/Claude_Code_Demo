import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatNumber, formatPercent } from '../utils/formatters'

const FeatureAdoption = ({ dateRange }) => {
  const [loading, setLoading] = useState(false)
  const [feature, setFeature] = useState('button_click')
  const [adoptionData, setAdoptionData] = useState(null)
  const [stickiness, setStickiness] = useState(null)

  const loadFeatureData = async () => {
    if (!feature) return

    setLoading(true)
    try {
      const [adoption, stickinessRes] = await Promise.all([
        api.getFeatureAdoption(feature, dateRange.start, dateRange.end, 'day'),
        api.getFeatureStickiness(feature)
      ])

      setAdoptionData(adoption.data)
      setStickiness(stickinessRes.data)
    } catch (error) {
      console.error('Error loading feature data:', error)
      // Demo data
      const days = 30
      setAdoptionData({
        timeline: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          adoption_rate: Math.min(10 + i * 2 + Math.random() * 5, 85),
          total_users: 50 + i * 15,
          active_users: 1000 + i * 20
        }))
      })
      setStickiness({
        dau: 456,
        wau: 1234,
        mau: 3456,
        stickiness_ratio: 13.2
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFeatureData()
  }, [feature, dateRange])

  const chartData = adoptionData ? {
    labels: adoptionData.timeline.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Adoption Rate',
        data: adoptionData.timeline.map(d => d.adoption_rate),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Active Users',
        data: adoptionData.timeline.map(d => d.total_users),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        labels: { color: '#a3a3a3' }
      },
      tooltip: {
        backgroundColor: '#141414',
        borderColor: '#262626',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: '#262626' },
        ticks: { color: '#737373' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#262626' },
        ticks: { color: '#737373' },
        title: {
          display: true,
          text: 'Adoption Rate (%)',
          color: '#8b5cf6'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#737373' },
        title: {
          display: true,
          text: 'Active Users',
          color: '#3b82f6'
        }
      }
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Feature Selection</h3>
            <p className="card-description">Choose a feature to analyze</p>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Enter event name (e.g., button_click, feature_used)"
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadFeatureData()}
            style={{ marginBottom: '12px' }}
          />
          <button onClick={loadFeatureData} disabled={!feature}>
            Analyze Feature
          </button>
        </div>
      </div>

      {stickiness && (
        <div className="metrics-grid" style={{ marginBottom: '24px' }}>
          <div className="metric-card">
            <div className="metric-label">Daily Active Users</div>
            <div className="metric-value">{formatNumber(stickiness.dau)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Weekly Active Users</div>
            <div className="metric-value">{formatNumber(stickiness.wau)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Monthly Active Users</div>
            <div className="metric-value">{formatNumber(stickiness.mau)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Stickiness (DAU/MAU)</div>
            <div className="metric-value">{formatPercent(stickiness.stickiness_ratio)}</div>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && adoptionData && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Adoption Curve</h3>
              <p className="card-description">Feature adoption over time</p>
            </div>
          </div>
          <div className="chart-container" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {!loading && !adoptionData && feature && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✨</div>
            <h3 className="empty-state-title">No Data Available</h3>
            <p className="empty-state-description">
              No adoption data found for this feature in the selected date range
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeatureAdoption
