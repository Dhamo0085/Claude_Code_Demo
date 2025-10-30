import React from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/sidebar.css'

const Sidebar = () => {
  const navItems = [
    { path: '/overview', icon: '📊', label: 'Overview' },
    { path: '/events', icon: '⚡', label: 'Events' },
    { path: '/funnels', icon: '🔽', label: 'Funnels' },
    { path: '/retention', icon: '🔄', label: 'Retention' },
    { path: '/journeys', icon: '🗺️', label: 'User Journeys' },
    { path: '/features', icon: '✨', label: 'Feature Adoption' },
    { path: '/ab-tests', icon: '🧪', label: 'A/B Tests' },
    { path: '/users', icon: '👥', label: 'User Explorer' },
    { path: '/export', icon: '📤', label: 'Export Center' }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📈</span>
          <span className="logo-text">Analytics</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-item">
          <span className="status-indicator"></span>
          <span className="status-text">All systems operational</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
