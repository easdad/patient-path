import React from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';
import './DashboardTabs.css';

const DashboardTabs = () => {
  const { activeTab, setActiveTab } = useDashboard();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'requests', label: 'Requests', icon: '🚑' },
    { id: 'logs', label: 'Logs', icon: '📝' },
    { id: 'monitoring', label: 'Monitoring', icon: '📈' },
    { id: 'testing', label: 'Testing', icon: '🧪' },
  ];

  return (
    <div className="dev-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardTabs; 