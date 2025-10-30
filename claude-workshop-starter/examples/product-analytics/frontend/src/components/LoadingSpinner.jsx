import React from 'react'

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="loading-spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
