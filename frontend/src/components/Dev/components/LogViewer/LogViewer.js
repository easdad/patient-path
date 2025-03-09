import React, { useState } from 'react';
import { useLogs } from '../../../../hooks/useLogs';
import { useDashboard } from '../../../../contexts/DashboardContext';
import '../shared/SharedStyles.css';

const LogViewer = () => {
  const { refreshTrigger } = useDashboard();
  const { logs, functionLogs, isLoading, error, filterLogsByType, filterFunctionLogsByStatus } = useLogs(refreshTrigger);
  const [logTypeFilter, setLogTypeFilter] = useState('');
  const [functionStatusFilter, setFunctionStatusFilter] = useState('');
  
  const filteredLogs = filterLogsByType(logTypeFilter);
  const filteredFunctionLogs = filterFunctionLogsByStatus(functionStatusFilter);
  
  if (isLoading) {
    return <div className="loading-indicator">Loading logs...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="log-viewer">
      <div className="section-header">
        <h2>System Logs</h2>
      </div>
      
      <div className="log-sections">
        <div className="app-logs-section">
          <div className="section-header">
            <h3>Application Logs</h3>
            <div className="log-filters">
              <select 
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="info">INFO</option>
                <option value="warning">WARNING</option>
                <option value="error">ERROR</option>
                <option value="debug">DEBUG</option>
              </select>
            </div>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <p>No logs found</p>
            </div>
          ) : (
            <div className="table-container logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Component</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id} className={`log-row ${log.type.toLowerCase()}`}>
                      <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td>
                        <span className={`status-badge ${log.type.toLowerCase()}`}>
                          {log.type}
                        </span>
                      </td>
                      <td>{log.component}</td>
                      <td>{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="function-logs-section">
          <div className="section-header">
            <h3>Edge Function Logs</h3>
            <div className="log-filters">
              <select 
                value={functionStatusFilter}
                onChange={(e) => setFunctionStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          
          {filteredFunctionLogs.length === 0 ? (
            <div className="empty-state">
              <p>No function logs found</p>
            </div>
          ) : (
            <div className="table-container logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Function</th>
                    <th>Status</th>
                    <th>User ID</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFunctionLogs.map(log => (
                    <tr key={log.id} className={`log-row ${log.status}`}>
                      <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td>{log.function}</td>
                      <td>
                        <span className={`status-badge ${log.status}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{log.userId}</td>
                      <td>{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogViewer; 