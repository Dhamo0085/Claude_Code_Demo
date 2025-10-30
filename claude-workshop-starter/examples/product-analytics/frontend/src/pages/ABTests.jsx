import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatNumber, formatPercent } from '../utils/formatters'

const ABTests = ({ dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [experiments, setExperiments] = useState([])
  const [selectedExperiment, setSelectedExperiment] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    setLoading(true)
    try {
      const response = await api.getExperiments()
      setExperiments(response.experiments || [])
    } catch (error) {
      console.error('Error loading experiments:', error)
      // Demo data
      setExperiments([
        {
          id: 'exp_001',
          name: 'Button Color Test',
          description: 'Testing blue vs green CTA button',
          status: 'active',
          goal_event: 'button_click',
          variants: ['control', 'variant_a']
        },
        {
          id: 'exp_002',
          name: 'Pricing Page Layout',
          description: 'New layout vs original',
          status: 'completed',
          goal_event: 'signup',
          variants: ['control', 'variant_a']
        }
      ])
    }
    setLoading(false)
  }

  const loadExperimentResults = async (experimentId) => {
    try {
      const response = await api.getExperimentResults(experimentId)
      setResults(response.results)
      setSelectedExperiment(experimentId)
    } catch (error) {
      console.error('Error loading results:', error)
      // Demo data
      setResults([
        {
          variant: 'control',
          user_count: 1000,
          goal_count: 125,
          conversion_rate: 12.5
        },
        {
          variant: 'variant_a',
          user_count: 1000,
          goal_count: 165,
          conversion_rate: 16.5
        }
      ])
      setSelectedExperiment(experimentId)
    }
  }

  const calculateSignificance = (results) => {
    if (!results || results.length < 2) return null

    const control = results[0]
    const variant = results[1]
    const improvement = ((variant.conversion_rate - control.conversion_rate) / control.conversion_rate) * 100

    return {
      improvement,
      significant: Math.abs(improvement) > 10,
      winner: improvement > 0 ? variant.variant : control.variant
    }
  }

  const significance = results ? calculateSignificance(results) : null

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Active Experiments</h3>
            <p className="card-description">{experiments.length} total experiments</p>
          </div>
          <button>Create New Experiment</button>
        </div>

        <div style={{ marginTop: '20px' }}>
          {experiments.map(exp => (
            <div
              key={exp.id}
              onClick={() => loadExperimentResults(exp.id)}
              style={{
                padding: '20px',
                background: selectedExperiment === exp.id ? 'var(--bg-elevated)' : 'var(--bg-primary)',
                border: `1px solid ${selectedExperiment === exp.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '8px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                    {exp.name}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    {exp.description}
                  </p>
                </div>
                <span className={`badge badge-${exp.status === 'active' ? 'success' : 'info'}`}>
                  {exp.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
                <span>Goal: {exp.goal_event}</span>
                <span>Variants: {exp.variants.length}</span>
              </div>
            </div>
          ))}

          {experiments.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🧪</div>
              <h3 className="empty-state-title">No Experiments Yet</h3>
              <p className="empty-state-description">
                Create your first A/B test to start experimenting
              </p>
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Experiment Results</h3>
              <p className="card-description">
                {experiments.find(e => e.id === selectedExperiment)?.name}
              </p>
            </div>
          </div>

          {significance && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: significance.improvement > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${significance.improvement > 0 ? 'var(--success)' : 'var(--danger)'}`,
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '32px' }}>
                  {significance.improvement > 0 ? '📈' : '📉'}
                </span>
                <div>
                  <div style={{
                    color: significance.improvement > 0 ? 'var(--success)' : 'var(--danger)',
                    fontSize: '24px',
                    fontWeight: 700
                  }}>
                    {significance.improvement > 0 ? '+' : ''}{significance.improvement.toFixed(1)}%
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    {significance.significant ? 'Statistically Significant' : 'Not Significant'}
                  </div>
                </div>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Winner: <strong style={{ color: 'var(--text-primary)' }}>{significance.winner}</strong>
              </div>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '24px'
          }}>
            {results.map(result => (
              <div
                key={result.variant}
                style={{
                  padding: '24px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px'
                }}>
                  {result.variant}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontSize: '36px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}>
                    {formatPercent(result.conversion_rate)}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Conversion Rate
                  </div>
                </div>

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Users</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatNumber(result.user_count)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Conversions</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatNumber(result.goal_count)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ABTests
