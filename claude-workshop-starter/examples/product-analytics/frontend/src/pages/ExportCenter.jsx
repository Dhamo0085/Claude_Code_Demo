import React, { useState } from 'react'

const ExportCenter = ({ dateRange }) => {
  const [exportType, setExportType] = useState('overview')
  const [format, setFormat] = useState('pdf')
  const [loading, setLoading] = useState(false)

  const exportOptions = [
    { id: 'overview', name: 'Executive Overview', description: 'High-level metrics and KPIs for investors' },
    { id: 'events', name: 'Event Analytics', description: 'Detailed event data and trends' },
    { id: 'funnels', name: 'Funnel Reports', description: 'Conversion funnel analysis' },
    { id: 'retention', name: 'Retention Analysis', description: 'Cohort retention data and heatmaps' },
    { id: 'users', name: 'User Analytics', description: 'User demographics and behavior' },
    { id: 'experiments', name: 'A/B Test Results', description: 'Experiment results and statistical analysis' }
  ]

  const handleExport = async () => {
    setLoading(true)

    // Simulate export
    setTimeout(() => {
      alert(`Export started for ${exportType} in ${format.toUpperCase()} format. This would normally trigger a download.`)
      setLoading(false)
    }, 2000)
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Export Reports</h3>
            <p className="card-description">Generate investor-ready reports and presentations</p>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              Select Report Type
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {exportOptions.map(option => (
                <div
                  key={option.id}
                  onClick={() => setExportType(option.id)}
                  style={{
                    padding: '20px',
                    background: exportType === option.id ? 'var(--bg-elevated)' : 'var(--bg-primary)',
                    border: `2px solid ${exportType === option.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}>
                    {option.name}
                  </div>
                  <div style={{
                    color: 'var(--text-muted)',
                    fontSize: '14px'
                  }}>
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              Export Format
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['pdf', 'csv', 'json', 'xlsx'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={format === fmt ? '' : 'button-secondary'}
                  style={{
                    textTransform: 'uppercase',
                    minWidth: '100px'
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h4 style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              Export Configuration
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date Range: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {dateRange.start} to {dateRange.end}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Report: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {exportOptions.find(o => o.id === exportType)?.name}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Format: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {format.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            style={{ width: '100%', padding: '16px', fontSize: '16px' }}
          >
            {loading ? 'Generating Export...' : 'Generate & Download Report'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Investor Deck Templates</h3>
            <p className="card-description">Pre-built presentations for fundraising</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          <div style={{
            padding: '24px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
              Growth Metrics
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              User growth, engagement, and retention metrics
            </p>
            <button className="button-secondary" style={{ width: '100%' }}>
              Generate Template
            </button>
          </div>

          <div style={{
            padding: '24px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
              Revenue Analytics
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              Conversion rates, ARR, and monetization metrics
            </p>
            <button className="button-secondary" style={{ width: '100%' }}>
              Generate Template
            </button>
          </div>

          <div style={{
            padding: '24px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
              Product-Market Fit
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              User behavior, feature adoption, and satisfaction
            </p>
            <button className="button-secondary" style={{ width: '100%' }}>
              Generate Template
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Scheduled Reports</h3>
            <p className="card-description">Automate report generation and delivery</p>
          </div>
          <button>Add Schedule</button>
        </div>

        <div className="empty-state" style={{ padding: '40px' }}>
          <div className="empty-state-icon">📅</div>
          <h3 className="empty-state-title">No Scheduled Reports</h3>
          <p className="empty-state-description">
            Set up automated reports to be delivered weekly or monthly
          </p>
        </div>
      </div>
    </div>
  )
}

export default ExportCenter
