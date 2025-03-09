import React, { useEffect } from 'react';
import { useDashboard } from '../../../../contexts/DashboardContext';
import { useUsers } from '../../../../hooks/useUsers';
import { useRequests } from '../../../../hooks/useRequests';
import StatCard from './StatCard';
import SystemHealthCard from './SystemHealthCard';
import QuickActions from './QuickActions';
import './OverviewDashboard.css';

const OverviewDashboard = () => {
  const { refreshTrigger, fetchSystemHealth, systemHealth } = useDashboard();
  const { users } = useUsers(refreshTrigger);
  const { requests, getRequestCounts } = useRequests(refreshTrigger);
  
  useEffect(() => {
    // Fetch system health on component mount
    fetchSystemHealth();
    
    // Set up interval to update system health
    const intervalId = setInterval(fetchSystemHealth, 30000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchSystemHealth]);
  
  const requestCounts = getRequestCounts();
  const hospitalCount = users.filter(u => u.user_type === 'hospital').length;
  const ambulanceCount = users.filter(u => u.user_type === 'ambulance').length;
  
  return (
    <div className="overview-dashboard">
      <div className="overview-header">
        <h2>System Overview</h2>
        <span className="update-time">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
      
      <div className="stats-grid">
        <StatCard
          title="Users"
          count={users.length}
          icon="👥"
          color="purple"
          breakdown={[
            { label: 'Hospital', value: hospitalCount },
            { label: 'Ambulance', value: ambulanceCount },
            { label: 'Developer', value: users.length - hospitalCount - ambulanceCount }
          ]}
        />
        
        <StatCard
          title="Transport Requests"
          count={requests.length}
          icon="🚑"
          color="blue"
          breakdown={[
            { label: 'Pending', value: requestCounts.pending },
            { label: 'In Progress', value: requestCounts.inProgress },
            { label: 'Completed', value: requestCounts.completed }
          ]}
        />
        
        <SystemHealthCard systemHealth={systemHealth} />
      </div>
      
      <QuickActions />
    </div>
  );
};

export default OverviewDashboard; 