import React from 'react';

const StatisticsPanel = ({ stats }) => {
  const { activeTransports, pendingRequests, completedToday, urgentRequests } = stats;

  return (
    <div className="statistics-panel">
      <div className="panel-header">
        <h2>Summary Statistics</h2>
        <span className="refresh-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-card active">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
              <line x1="16" y1="8" x2="20" y2="8"></line>
              <line x1="16" y1="16" x2="23" y2="16"></line>
              <path d="M17 3v13"></path>
              <circle cx="8.5" cy="16" r="3"></circle>
              <circle cx="15" cy="16" r="3"></circle>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Active Transports</h3>
            <div className="stat-value">{activeTransports}</div>
            <div className="stat-description">Currently in progress</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Pending Requests</h3>
            <div className="stat-value">{pendingRequests}</div>
            <div className="stat-description">Awaiting assignment</div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Completed Today</h3>
            <div className="stat-value">{completedToday}</div>
            <div className="stat-description">Successfully finished</div>
          </div>
        </div>

        <div className="stat-card urgent">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Urgent Requests</h3>
            <div className="stat-value">{urgentRequests}</div>
            <div className="stat-description">High priority</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel; 