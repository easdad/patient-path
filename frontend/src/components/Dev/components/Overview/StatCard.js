import React from 'react';
import './StatCard.css';

const StatCard = ({ title, count, icon, color, breakdown }) => {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-header">
        <h3>{title}</h3>
        <span className="stat-icon">{icon}</span>
      </div>
      
      <div className="stat-count">{count}</div>
      
      {breakdown && breakdown.length > 0 && (
        <div className="stat-breakdown">
          {breakdown.map((item, index) => (
            <div key={index} className="breakdown-item">
              <span className="breakdown-label">{item.label}:</span>
              <span className="breakdown-value">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard; 