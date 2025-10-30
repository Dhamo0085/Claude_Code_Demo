import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatPercent } from '../utils/formatters'

const Retention = ({ dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [retentionData, setRetentionData] = useState(null)
  const [cohortSize, setCohortSize] = useState('week')

  useEffect(() => {
    loadRetention()
  }, [cohortSize, dateRange])

  const loadRetention = async () => {
    setLoading(true)
    try {
      const response = await api.getRetention(cohortSize, 12)
      setRetentionData(response.data)
    } catch (error) {
      console.error('Error loading retention:', error)
      // Demo data
      setRetentionData({
        cohorts: Array.from({ length: 8 }, (_, i) => ({
          cohort_date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          cohort_size: 100 - i * 5,
          retention: Array.from({ length: 12 }, (_, j) => Math.max(100 - j * 8 - i * 2, 10))
        }))
      })
    }
    setLoading(false)
  }

  const getRetentionColor = (rate) => {
    if (rate >= 70) return '#10b981'
    if (rate >= 50) return '#3b82f6'
    if (rate >= 30) return '#f59e0b'
    if (rate >= 10) return '#ef4444'
    return '#7f1d1d'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Cohort Retention Analysis</h3>
            <p className="card-description">User retention over time by cohort</p>
          </div>
          <select value={cohortSize} onChange={(e) => setCohortSize(e.target.value)}>
            <option value="day">Daily Cohorts</option>
            <option value="week">Weekly Cohorts</option>
            <option value="month">Monthly Cohorts</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '900px', borderCollapse: 'separate', borderSpacing: '4px' }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 2 }}>
                  Cohort
                </th>
                <th style={{ textAlign: 'center' }}>Size</th>
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i} style={{ textAlign: 'center' }}>
                    {cohortSize === 'day' ? `D${i}` : cohortSize === 'week' ? `W${i}` : `M${i}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retentionData?.cohorts.map((cohort, cohortIdx) => (
                <tr key={cohortIdx}>
                  <td style={{
                    position: 'sticky',
                    left: 0,
                    background: 'var(--bg-secondary)',
                    zIndex: 1,
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    {new Date(cohort.cohort_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {cohort.cohort_size}
                  </td>
                  {cohort.retention.map((rate, periodIdx) => (
                    <td
                      key={periodIdx}
                      style={{
                        textAlign: 'center',
                        background: getRetentionColor(rate),
                        color: 'white',
                        fontWeight: 600,
                        padding: '12px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title={`${rate}% retained`}
                    >
                      {rate}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'var(--bg-primary)',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
            Legend
          </h4>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#10b981',
                borderRadius: '4px'
              }}></div>
              <span style={{ fontSize: '13px' }}>70%+ Excellent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#3b82f6',
                borderRadius: '4px'
              }}></div>
              <span style={{ fontSize: '13px' }}>50-70% Good</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#f59e0b',
                borderRadius: '4px'
              }}></div>
              <span style={{ fontSize: '13px' }}>30-50% Average</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#ef4444',
                borderRadius: '4px'
              }}></div>
              <span style={{ fontSize: '13px' }}>10-30% Poor</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#7f1d1d',
                borderRadius: '4px'
              }}></div>
              <span style={{ fontSize: '13px' }}>&lt;10% Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Retention
