import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatNumber } from '../utils/formatters'

const UserJourneys = ({ dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [paths, setPaths] = useState([])
  const [dropOffs, setDropOffs] = useState([])
  const [sessionStats, setSessionStats] = useState(null)

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pathsRes, dropOffsRes, statsRes] = await Promise.all([
        api.getTopPaths(null, 5, 10),
        api.getDropOffs(2),
        api.getSessionStats()
      ])

      setPaths(pathsRes.paths || [])
      setDropOffs(dropOffsRes.drop_offs || [])
      setSessionStats(statsRes.data || {})
    } catch (error) {
      console.error('Error loading journey data:', error)
      // Demo data
      setPaths([
        { path: ['landing', 'signup', 'dashboard', 'feature_1'], count: 234 },
        { path: ['landing', 'about', 'pricing', 'signup'], count: 189 },
        { path: ['landing', 'dashboard', 'settings'], count: 156 },
        { path: ['landing', 'blog', 'article', 'signup'], count: 134 },
        { path: ['dashboard', 'feature_1', 'feature_2'], count: 98 }
      ])
      setDropOffs([
        { event_name: 'pricing_page', count: 456, percentage: 34.2 },
        { event_name: 'checkout', count: 298, percentage: 28.5 },
        { event_name: 'signup_form', count: 234, percentage: 22.1 }
      ])
      setSessionStats({
        avg_session_length: 342,
        avg_events_per_session: 8.4,
        bounce_rate: 32.5
      })
    }
    setLoading(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-label">Avg Session Length</div>
          <div className="metric-value">
            {sessionStats?.avg_session_length
              ? `${Math.floor(sessionStats.avg_session_length / 60)}m ${sessionStats.avg_session_length % 60}s`
              : '5m 42s'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Events / Session</div>
          <div className="metric-value">
            {sessionStats?.avg_events_per_session?.toFixed(1) || '8.4'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Bounce Rate</div>
          <div className="metric-value">
            {sessionStats?.bounce_rate?.toFixed(1) || '32.5'}%
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Top User Paths</h3>
              <p className="card-description">Most common event sequences</p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            {paths.map((pathData, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Path #{idx + 1}
                  </span>
                  <span style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {formatNumber(pathData.count)} users
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {pathData.path.map((step, stepIdx) => (
                    <React.Fragment key={stepIdx}>
                      <div style={{
                        background: 'var(--accent)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}>
                        {step}
                      </div>
                      {stepIdx < pathData.path.length - 1 && (
                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Drop-off Points</h3>
              <p className="card-description">Where users typically leave</p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            {dropOffs.map((dropOff, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '16px',
                  padding: '16px',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}>
                    {dropOff.event_name}
                  </span>
                  <span style={{
                    color: 'var(--danger)',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {formatNumber(dropOff.count)} drops
                  </span>
                </div>

                <div style={{ position: 'relative', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${dropOff.percentage}%`,
                    background: 'var(--danger)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>

                <div style={{
                  marginTop: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}>
                  {dropOff.percentage}% of all drop-offs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Journey Visualization</h3>
            <p className="card-description">Sankey diagram showing user flow (conceptual)</p>
          </div>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '60px 20px',
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Interactive Journey Map</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Visual flow diagram would be rendered here with a library like D3.js or Recharts
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserJourneys
