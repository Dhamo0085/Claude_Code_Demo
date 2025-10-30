import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatNumber, formatPercent } from '../utils/formatters'

const Funnels = ({ dateRange }) => {
  const [loading, setLoading] = useState(false)
  const [funnelData, setFunnelData] = useState(null)
  const [steps, setSteps] = useState(['page_view', 'button_click', 'form_submit', 'purchase'])
  const [newStep, setNewStep] = useState('')

  const analyzeFunnel = async () => {
    if (steps.length < 2) return

    setLoading(true)
    try {
      const response = await api.analyzeFunnel(steps, dateRange.start, dateRange.end)
      setFunnelData(response.data)
    } catch (error) {
      console.error('Error analyzing funnel:', error)
      // Demo data
      setFunnelData({
        steps: steps.map((step, idx) => ({
          step_name: step,
          user_count: Math.max(1000 - idx * 200, 100),
          conversion_rate: idx === 0 ? 100 : Math.max(100 - idx * 20, 10),
          drop_off_rate: idx === 0 ? 0 : Math.min(idx * 20, 90)
        }))
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    if (steps.length >= 2) {
      analyzeFunnel()
    }
  }, [dateRange])

  const handleAddStep = () => {
    if (newStep && !steps.includes(newStep)) {
      setSteps([...steps, newStep])
      setNewStep('')
    }
  }

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const getConversionColor = (rate) => {
    if (rate >= 70) return 'var(--success)'
    if (rate >= 40) return 'var(--warning)'
    return 'var(--danger)'
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Funnel Builder</h3>
            <p className="card-description">Create and analyze conversion funnels</p>
          </div>
          <button onClick={analyzeFunnel} disabled={loading || steps.length < 2}>
            {loading ? 'Analyzing...' : 'Analyze Funnel'}
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Step {idx + 1}:</span>
                <span style={{ color: 'var(--text-primary)' }}>{step}</span>
                <button
                  onClick={() => handleRemoveStep(idx)}
                  className="button-small button-danger"
                  style={{ padding: '4px 8px', marginLeft: '4px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter event name (e.g., page_view)"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
              style={{ flex: 1 }}
            />
            <button onClick={handleAddStep} className="button-secondary">
              Add Step
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && funnelData && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Funnel Analysis</h3>
              <p className="card-description">
                Overall conversion: {formatPercent(funnelData.steps[0]?.user_count
                  ? (funnelData.steps[funnelData.steps.length - 1]?.user_count / funnelData.steps[0]?.user_count * 100)
                  : 0)}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            {funnelData.steps.map((step, idx) => {
              const prevStep = idx > 0 ? funnelData.steps[idx - 1] : null
              const conversionFromPrev = prevStep
                ? (step.user_count / prevStep.user_count * 100)
                : 100

              return (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    marginBottom: '8px'
                  }}>
                    <div
                      style={{
                        width: `${(step.user_count / funnelData.steps[0].user_count) * 100}%`,
                        minWidth: '100px',
                        background: `linear-gradient(90deg, ${getConversionColor(conversionFromPrev)}, ${getConversionColor(conversionFromPrev)}88)`,
                        padding: '20px 24px',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>
                        Step {idx + 1}: {step.step_name}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                        {formatNumber(step.user_count)} users
                      </div>
                    </div>
                    <div style={{ minWidth: '150px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '18px' }}>
                        {formatPercent(conversionFromPrev)}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {idx === 0 ? 'Entry' : 'from previous'}
                      </div>
                    </div>
                  </div>

                  {idx < funnelData.steps.length - 1 && (
                    <div style={{
                      marginLeft: '24px',
                      padding: '12px 0',
                      borderLeft: '2px dashed var(--border)'
                    }}>
                      <div style={{
                        marginLeft: '20px',
                        color: 'var(--danger)',
                        fontSize: '13px'
                      }}>
                        ↓ {formatNumber(funnelData.steps[idx].user_count - funnelData.steps[idx + 1].user_count)} dropped off
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && !funnelData && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔽</div>
            <h3 className="empty-state-title">Build Your First Funnel</h3>
            <p className="empty-state-description">
              Add at least 2 event steps above and click "Analyze Funnel" to see conversion rates
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Funnels
