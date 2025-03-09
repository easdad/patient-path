import React, { useEffect, useState } from 'react';
import { useDashboard } from '../../../../contexts/DashboardContext';
import { useUsers } from '../../../../hooks/useUsers';
import '../shared/SharedStyles.css';
import './SystemMonitoring.css'; // Keep a small custom CSS file for specific styles

const SystemMonitoring = () => {
  const { systemHealth, fetchSystemHealth } = useDashboard();
  const { users } = useUsers();
  const [roleMismatches, setRoleMismatches] = useState([]);
  
  useEffect(() => {
    // Fetch system health on component mount
    fetchSystemHealth();
    
    // Set up interval to update system health
    const intervalId = setInterval(fetchSystemHealth, 10000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchSystemHealth]);
  
  // Simulate checking for role mismatches
  const checkRoleMismatches = () => {
    // In a real app, this would be an API call
    const mockMismatches = users
      .filter(() => Math.random() > 0.8) // Randomly select ~20% of users
      .map(user => ({
        id: user.id,
        email: user.email,
        profileType: user.user_type,
        metadataRole: ['hospital', 'ambulance', 'developer'][Math.floor(Math.random() * 3)],
        detected: new Date().toISOString()
      }))
      .filter(user => user.profileType !== user.metadataRole);
    
    setRoleMismatches(mockMismatches);
  };
  
  // Simulate fixing role mismatches
  const fixRoleMismatches = async () => {
    // In a real app, this would call an API endpoint
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRoleMismatches([]);
    alert('All role mismatches have been fixed!');
  };
  
  return (
    <div className="system-monitoring">
      <div className="section-header">
        <h2>System Monitoring</h2>
        <div className="refresh-info">
          <button className="refresh-button" onClick={fetchSystemHealth}>
            Refresh Metrics
          </button>
          <span className="last-updated">
            Last updated: {systemHealth.lastUpdated || new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="monitoring-grid">
        <div className="monitoring-card">
          <h3>System Health</h3>
          <div className="health-metrics">
            <div className="health-item">
              <span className="metric-label">CPU Usage:</span>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ 
                    width: systemHealth.cpu,
                    backgroundColor: parseInt(systemHealth.cpu) > 70 ? 'var(--color-danger)' : 
                                     parseInt(systemHealth.cpu) > 50 ? 'var(--color-warning)' : 
                                     'var(--color-success)'
                  }}
                ></div>
              </div>
              <span className="metric-value">{systemHealth.cpu}</span>
            </div>
            
            <div className="health-item">
              <span className="metric-label">Memory Usage:</span>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ 
                    width: systemHealth.memory,
                    backgroundColor: parseInt(systemHealth.memory) > 70 ? 'var(--color-danger)' : 
                                     parseInt(systemHealth.memory) > 50 ? 'var(--color-warning)' : 
                                     'var(--color-success)'
                  }}
                ></div>
              </div>
              <span className="metric-value">{systemHealth.memory}</span>
            </div>
            
            <div className="health-item">
              <span className="metric-label">Disk Usage:</span>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ 
                    width: systemHealth.disk,
                    backgroundColor: parseInt(systemHealth.disk) > 70 ? 'var(--color-danger)' : 
                                     parseInt(systemHealth.disk) > 50 ? 'var(--color-warning)' : 
                                     'var(--color-success)'
                  }}
                ></div>
              </div>
              <span className="metric-value">{systemHealth.disk}</span>
            </div>
            
            <div className="health-item">
              <span className="metric-label">Response Time:</span>
              <span className="metric-value highlight">{systemHealth.response}</span>
            </div>
          </div>
        </div>
        
        <div className="monitoring-card">
          <h3>Edge Functions Status</h3>
          <div className="function-status-list">
            {Object.entries(systemHealth.edgeFunctions).map(([name, status]) => (
              <div key={name} className={`function-status-item ${status.toLowerCase()}`}>
                <span className="function-name">{name}</span>
                <span className="function-status">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="role-mismatches-section">
        <div className="section-header">
          <h3>Role Mismatches</h3>
          <div className="action-buttons">
            <button className="check-button" onClick={checkRoleMismatches}>
              Check Mismatches
            </button>
            <button 
              className="fix-button" 
              onClick={fixRoleMismatches}
              disabled={roleMismatches.length === 0}
            >
              Fix All Mismatches
            </button>
          </div>
        </div>
        
        {roleMismatches.length > 0 ? (
          <div className="table-container mismatches-table-container">
            <table className="mismatches-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Profile Type</th>
                  <th>Metadata Role</th>
                  <th>Detected</th>
                </tr>
              </thead>
              <tbody>
                {roleMismatches.map(mismatch => (
                  <tr key={mismatch.id}>
                    <td>{mismatch.id.substring(0, 8)}...</td>
                    <td>{mismatch.email}</td>
                    <td>{mismatch.profileType}</td>
                    <td>{mismatch.metadataRole}</td>
                    <td>{new Date(mismatch.detected).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No role mismatches detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitoring; 