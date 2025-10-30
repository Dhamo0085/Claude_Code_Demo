import React from 'react'
import { formatNumber, formatPercent } from '../utils/formatters'

const MetricCard = ({ label, value, change, changeType = 'neutral', format = 'number' }) => {
  const formatValue = (val) => {
    if (format === 'percent') return formatPercent(val)
    if (format === 'currency') return '$' + formatNumber(val)
    return formatNumber(val)
  }

  const getChangeClass = () => {
    if (changeType === 'positive' && change > 0) return 'positive'
    if (changeType === 'negative' && change < 0) return 'negative'
    if (changeType === 'positive' && change < 0) return 'negative'
    if (changeType === 'negative' && change > 0) return 'positive'
    return ''
  }

  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{formatValue(value)}</div>
      {change !== undefined && (
        <div className={`metric-change ${getChangeClass()}`}>
          <span>{change > 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}% vs last period</span>
        </div>
      )}
    </div>
  )
}

export default MetricCard
