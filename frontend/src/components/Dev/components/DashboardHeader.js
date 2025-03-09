import React from 'react';
import { useAuth } from '../../../utils/AuthContext';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <div className="dev-dashboard-header">
      <h1>Developer Dashboard</h1>
      <div className="dev-user-info">
        <span className="dev-email">{user?.email || 'Unknown User'}</span>
        <span className="dev-badge">Developer Access</span>
      </div>
    </div>
  );
};

export default DashboardHeader; 