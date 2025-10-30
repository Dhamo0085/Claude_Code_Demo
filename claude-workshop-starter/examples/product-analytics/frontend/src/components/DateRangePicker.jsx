import React from 'react'
import '../styles/date-picker.css'

const DateRangePicker = ({ dateRange, onChange }) => {
  const presets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 }
  ]

  const handlePreset = (days) => {
    const end = new Date().toISOString().split('T')[0]
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    onChange({ start, end })
  }

  return (
    <div className="date-range-picker">
      <div className="date-inputs">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => onChange({ ...dateRange, start: e.target.value })}
          className="date-input"
        />
        <span className="date-separator">to</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => onChange({ ...dateRange, end: e.target.value })}
          className="date-input"
        />
      </div>
      <div className="date-presets">
        {presets.map(preset => (
          <button
            key={preset.days}
            onClick={() => handlePreset(preset.days)}
            className="preset-button"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DateRangePicker
