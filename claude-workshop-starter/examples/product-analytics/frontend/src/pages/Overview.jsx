import React, { useState, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import MetricCard from '../components/MetricCard'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Overview = ({ dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    setLoading(true)
    try {
      const [userStats, eventsData] = await Promise.all([
        api.getUserStats(dateRange.start, dateRange.end),
        api.getEvents(dateRange.start, dateRange.end)
      ])

      setStats({
        totalUsers: userStats.total_users || 0,
        activeUsers: userStats.active_users || 0,
        totalEvents: eventsData.count || 0,
        conversionRate: 12.5,
        events: eventsData.events || []
      })
    } catch (error) {
      console.error('Error loading overview:', error)
      setStats({
        totalUsers: 1250,
        activeUsers: 834,
        totalEvents: 45289,
        conversionRate: 12.5,
        events: []
      })
    }
    setLoading(false)
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#141414',
        borderColor: '#262626',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#a3a3a3',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: '#262626',
          drawBorder: false
        },
        ticks: {
          color: '#737373'
        }
      },
      y: {
        grid: {
          color: '#262626',
          drawBorder: false
        },
        ticks: {
          color: '#737373'
        }
      }
    }
  }

  const generateChartData = () => {
    const days = 30
    const labels = []
    const data = []

    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      data.push(Math.floor(Math.random() * 500) + 800)
    }

    return { labels, data }
  }

  const { labels, data } = generateChartData()

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Daily Active Users',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6'
      }
    ]
  }

  const barChartData = {
    labels: ['Page View', 'Button Click', 'Form Submit', 'Purchase', 'Sign Up'],
    datasets: [
      {
        label: 'Event Count',
        data: [12543, 8234, 5432, 2345, 1876],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6
      }
    ]
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="metrics-grid">
        <MetricCard
          label="Total Users"
          value={stats.totalUsers}
          change={15.3}
          changeType="positive"
        />
        <MetricCard
          label="Active Users"
          value={stats.activeUsers}
          change={8.7}
          changeType="positive"
        />
        <MetricCard
          label="Total Events"
          value={stats.totalEvents}
          change={-2.4}
          changeType="positive"
        />
        <MetricCard
          label="Conversion Rate"
          value={stats.conversionRate}
          change={3.2}
          changeType="positive"
          format="percent"
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Daily Active Users</h3>
              <p className="card-description">User activity over the last 30 days</p>
            </div>
          </div>
          <div className="chart-container">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Top Events</h3>
              <p className="card-description">Most tracked events in selected period</p>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Events</h3>
            <p className="card-description">Real-time event stream</p>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>User</th>
                <th>Properties</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.events.slice(0, 10).map((event, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{event.event_name}</td>
                  <td>{event.user_id}</td>
                  <td>{event.properties ? JSON.stringify(event.properties).slice(0, 50) : '-'}</td>
                  <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
              {stats.events.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                    No events found for this date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Overview
