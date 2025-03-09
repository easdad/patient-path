import React from 'react';
import './SystemHealthCard.css';

const SystemHealthCard = ({ systemHealth }) => {
  return (
    <div className="system-health-card">
      <div className="stat-header">
        <h3>System Health</h3>
        <span className="stat-icon">🔄</span>
      </div>
      
      <div className="health-metrics">
        <div className="health-item">
          <span className="health-label">CPU:</span>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ 
                width: systemHealth.cpu,
                backgroundColor: getColorForPercentage(parseInt(systemHealth.cpu))
              }}
            ></div>
          </div>
          <span className="health-value">{systemHealth.cpu}</span>
        </div>
        
        <div className="health-item">
          <span className="health-label">Memory:</span>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ 
                width: systemHealth.memory,
                backgroundColor: getColorForPercentage(parseInt(systemHealth.memory))
              }}
            ></div>
          </div>
          <span className="health-value">{systemHealth.memory}</span>
        </div>
        
        <div className="health-item">
          <span className="health-label">Disk:</span>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ 
                width: systemHealth.disk,
                backgroundColor: getColorForPercentage(parseInt(systemHealth.disk))
              }}
            ></div>
          </div>
          <span className="health-value">{systemHealth.disk}</span>
        </div>
        
        <div className="health-item">
          <span className="health-label">Response Time:</span>
          <span className="health-value highlight">{systemHealth.response}</span>
        </div>
      </div>
      
      <div className="edge-functions">
        <h4>Edge Functions</h4>
        <div className="functions-status">
          {Object.entries(systemHealth.edgeFunctions).map(([name, status]) => (
            <div key={name} className="function-item">
              <span className="function-name">{name}:</span>
              <span className={`function-status ${status.toLowerCase()}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="health-last-updated">
        Last checked: {systemHealth.lastUpdated || new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

// Helper function to generate color based on percentage
const getColorForPercentage = (percentage) => {
  if (percentage < 50) return 'var(--color-success)';
  if (percentage < 80) return 'var(--color-warning)';
  return 'var(--color-danger)';
};

export default SystemHealthCard; 