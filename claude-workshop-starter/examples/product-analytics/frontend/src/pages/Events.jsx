import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatNumber, formatDateTime } from '../utils/formatters'

const Events = ({ dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [eventFilter, setEventFilter] = useState('')

  useEffect(() => {
    loadEvents()
  }, [dateRange, eventFilter])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const response = await api.getEvents(dateRange.start, dateRange.end, eventFilter || null)
      setEvents(response.events || [])
    } catch (error) {
      console.error('Error loading events:', error)
      setEvents([])
    }
    setLoading(false)
  }

  const eventSummary = events.reduce((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] || 0) + 1
    return acc
  }, {})

  const chartData = {
    labels: Object.keys(eventSummary).slice(0, 10),
    datasets: [
      {
        label: 'Event Count',
        data: Object.values(eventSummary).slice(0, 10),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#141414',
        borderColor: '#262626',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { color: '#262626' }, ticks: { color: '#737373' } },
      y: { grid: { color: '#262626' }, ticks: { color: '#737373' } }
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Event Summary</h3>
            <p className="card-description">Distribution of events by type</p>
          </div>
        </div>
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Event Stream</h3>
            <p className="card-description">Real-time event tracking - {formatNumber(events.length)} events</p>
          </div>
          <input
            type="text"
            placeholder="Filter by event name..."
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            style={{ width: '250px' }}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>User ID</th>
                <th>Properties</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 100).map((event, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {event.event_name}
                  </td>
                  <td>{event.user_id}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.properties ? JSON.stringify(event.properties) : '-'}
                  </td>
                  <td>{formatDateTime(event.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">⚡</div>
            <h3 className="empty-state-title">No Events Found</h3>
            <p className="empty-state-description">
              No events were tracked during this time period. Events will appear here as they are tracked.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Events
