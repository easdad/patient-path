import React from 'react';
import { useDashboard } from '../../../../contexts/DashboardContext';
import './QuickActions.css';

const QuickActions = () => {
  const { setActiveTab, refreshData } = useDashboard();
  
  const actions = [
    { 
      id: 'refresh',
      label: 'Refresh Data',
      icon: '🔄',
      action: () => refreshData(),
      color: 'blue'
    },
    { 
      id: 'users',
      label: 'Manage Users',
      icon: '👥',
      action: () => setActiveTab('users'),
      color: 'purple'
    },
    { 
      id: 'requests',
      label: 'View Requests',
      icon: '🚑',
      action: () => setActiveTab('requests'),
      color: 'green'
    },
    { 
      id: 'logs',
      label: 'View Logs',
      icon: '📝',
      action: () => setActiveTab('logs'),
      color: 'orange'
    },
    { 
      id: 'health',
      label: 'System Health',
      icon: '📈',
      action: () => setActiveTab('monitoring'),
      color: 'red'
    },
    { 
      id: 'tests',
      label: 'Run Tests',
      icon: '🧪',
      action: () => setActiveTab('testing'),
      color: 'teal'
    }
  ];

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map(action => (
          <button 
            key={action.id}
            className={`action-button ${action.color}`}
            onClick={action.action}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions; 