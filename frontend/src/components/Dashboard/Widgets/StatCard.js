import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'stat-card-blue',
    green: 'stat-card-green',
    purple: 'stat-card-purple',
    orange: 'stat-card-orange',
    red: 'stat-card-red'
  };

  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-card-content">
        <div className="stat-card-info">
          <h3 className="stat-title">{title}</h3>
          <p className="stat-value">{value}</p>
        </div>
        <div className="stat-icon">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard; 