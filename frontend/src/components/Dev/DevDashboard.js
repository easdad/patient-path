import React, { useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { DashboardProvider, useDashboard } from '../../contexts/DashboardContext';
import DashboardHeader from './components/DashboardHeader';
import DashboardTabs from './components/DashboardTabs';
import OverviewDashboard from './components/Overview/OverviewDashboard';
import UserManagement from './components/UserManagement/UserManagement';
import RequestManagement from './components/RequestManagement/RequestManagement';
import LogViewer from './components/LogViewer/LogViewer';
import SystemMonitoring from './components/SystemMonitoring/SystemMonitoring';
import AccessTesting from './components/AccessTesting/AccessTesting';
import './DevDashboard.css';

// Dashboard content component that uses the dashboard context
const DashboardContent = () => {
  const { user } = useAuth();
  const { activeTab, isLoading, error } = useDashboard();

  // Verify developer access
  useEffect(() => {
    if (user?.app_metadata?.role !== 'developer') {
      console.error("Access denied: User does not have developer role");
      console.log("Current user role:", user?.app_metadata?.role);
    } else {
      console.log("Developer access verified successfully");
    }
  }, [user]);

  if (!user) {
    return <div className="dev-dashboard">You must be logged in to view this page.</div>;
  }

  if (user?.app_metadata?.role !== 'developer') {
    return (
      <div className="dev-dashboard">
        <div className="access-denied-container">
          <h2>Developer Access Required</h2>
          <p>Your account does not have the required permissions to access this page.</p>
          <p>Current role: {user?.app_metadata?.role || 'Unknown'}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dev-dashboard">
        <DashboardHeader />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dev-dashboard">
        <DashboardHeader />
        <div className="error-container">
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'users':
        return <UserManagement />;
      case 'requests':
        return <RequestManagement />;
      case 'logs':
        return <LogViewer />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'testing':
        return <AccessTesting />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="dev-dashboard">
      <DashboardHeader />
      <DashboardTabs />
      <div className="dev-dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

// Main dashboard component that provides the context
const DevDashboard = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default DevDashboard; 