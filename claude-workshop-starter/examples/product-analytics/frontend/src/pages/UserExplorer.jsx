import React, { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatDateTime, formatTimeAgo } from '../utils/formatters'

const UserExplorer = ({ dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userJourney, setUserJourney] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await api.getUsers(100, 0)
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
      // Demo data
      setUsers(Array.from({ length: 20 }, (_, i) => ({
        id: `user_${1000 + i}`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        properties: { plan: i % 3 === 0 ? 'pro' : 'free', country: ['US', 'UK', 'CA'][i % 3] }
      })))
    }
    setLoading(false)
  }

  const loadUserJourney = async (userId) => {
    try {
      const response = await api.getUserJourney(userId, 50)
      setUserJourney(response.data?.events || [])
      setSelectedUser(userId)
    } catch (error) {
      console.error('Error loading user journey:', error)
      // Demo data
      const demoEvents = [
        'page_view', 'button_click', 'form_view', 'form_submit',
        'feature_used', 'settings_view', 'profile_edit', 'logout'
      ]
      setUserJourney(Array.from({ length: 15 }, (_, i) => ({
        event_name: demoEvents[i % demoEvents.length],
        timestamp: new Date(Date.now() - (15 - i) * 60 * 60 * 1000).toISOString(),
        properties: { page: '/dashboard', button_id: 'cta-1' }
      })))
      setSelectedUser(userId)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Users</h3>
            <p className="card-description">{users.length} total users</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search users by email or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginTop: '20px', marginBottom: '16px' }}
        />

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => loadUserJourney(user.id)}
              style={{
                padding: '16px',
                background: selectedUser === user.id ? 'var(--bg-elevated)' : 'transparent',
                border: `1px solid ${selectedUser === user.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '8px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px'
              }}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                    {user.name || user.email}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {user.id}
                  </div>
                </div>
                {user.properties?.plan && (
                  <span className={`badge badge-${user.properties.plan === 'pro' ? 'success' : 'info'}`}>
                    {user.properties.plan}
                  </span>
                )}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                Joined {formatTimeAgo(user.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ position: 'sticky', top: '100px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">User Journey</h3>
            <p className="card-description">
              {selectedUser ? `Events for ${selectedUser}` : 'Select a user to view journey'}
            </p>
          </div>
        </div>

        {selectedUser && userJourney.length > 0 ? (
          <div style={{ marginTop: '20px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '10px',
                bottom: '10px',
                width: '2px',
                background: 'var(--border)'
              }}></div>

              {userJourney.map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    paddingLeft: '48px',
                    paddingBottom: '24px'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '4px',
                    width: '16px',
                    height: '16px',
                    background: 'var(--accent)',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-secondary)',
                    zIndex: 1
                  }}></div>

                  <div style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div style={{
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}>
                      {event.event_name}
                    </div>
                    <div style={{
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      marginBottom: '8px'
                    }}>
                      {formatDateTime(event.timestamp)}
                    </div>
                    {event.properties && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        background: 'var(--bg-secondary)',
                        padding: '8px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '100px'
                      }}>
                        {JSON.stringify(event.properties, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3 className="empty-state-title">No User Selected</h3>
            <p className="empty-state-description">
              Click on a user from the list to view their journey
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserExplorer
