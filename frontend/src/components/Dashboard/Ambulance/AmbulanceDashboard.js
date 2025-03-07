import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../utils/AuthContext';
import DashboardNav from './DashboardNav';
import ActiveCasesList from './ActiveCasesList';
import CaseDetail from './CaseDetail';
import CommunicationPanel from './CommunicationPanel';
import './AmbulanceDashboard.css';

// Dashboard widget components
import StatCard from '../Widgets/StatCard';
import ActivityFeed from '../Widgets/ActivityFeed';
import NotificationList from '../Widgets/NotificationList';
import LoadingState from '../../common/LoadingState';
import ErrorBoundary from '../../common/ErrorBoundary';

const AmbulanceDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    availableRequests: 0,
    assignedCases: 0,
    completedToday: 0,
    averageResponseTime: 0
  });
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCommunication, setShowCommunication] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return; // Skip if user isn't loaded yet
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch available transport requests
      const { data: requests, error: requestsError } = await supabase
        .from('transport_requests')
        .select('*')
        .eq('status', 'pending');
      
      if (requestsError) throw requestsError;
      
      // Fetch assigned cases
      const { data: assignments, error: assignmentsError } = await supabase
        .from('transport_assignments')
        .select(`
          *,
          transport_request:transport_requests(*)
        `)
        .eq('ambulance_id', user.id)
        .not('status', 'eq', 'completed');
      
      if (assignmentsError) throw assignmentsError;
      
      // Fetch completed cases for today
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      const { data: completedCases, error: completedError } = await supabase
        .from('transport_assignments')
        .select('*')
        .eq('ambulance_id', user.id)
        .eq('status', 'completed')
        .gte('completion_time', today);
      
      if (completedError) throw completedError;
      
      // Calculate average response time (in minutes)
      const { data: allCompleted, error: allCompletedError } = await supabase
        .from('transport_assignments')
        .select(`
          *,
          transport_request:transport_requests(requested_at)
        `)
        .eq('ambulance_id', user.id)
        .eq('status', 'completed')
        .not('completion_time', 'is', null);
      
      if (allCompletedError) throw allCompletedError;
      
      let totalResponseTime = 0;
      let completedWithResponse = 0;
      
      allCompleted?.forEach(assignment => {
        if (assignment.completion_time && assignment.transport_request?.requested_at) {
          const requestTime = new Date(assignment.transport_request.requested_at);
          const completionTime = new Date(assignment.completion_time);
          const responseTime = (completionTime - requestTime) / (1000 * 60); // minutes
          totalResponseTime += responseTime;
          completedWithResponse++;
        }
      });
      
      const averageResponseTime = completedWithResponse > 0 
        ? Math.round(totalResponseTime / completedWithResponse) 
        : 0;
      
      setStats({
        availableRequests: requests?.length || 0,
        assignedCases: assignments?.length || 0,
        completedToday: completedCases?.length || 0,
        averageResponseTime
      });
      
      // Create sample activities based on recent assignments
      const recentActivities = assignments
        ?.sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))
        .slice(0, 5)
        .map(assignment => ({
          id: `activity-${assignment.id}`,
          type: 'assignment_created',
          content: `New transport case assigned from ${assignment.transport_request?.hospital_name || 'hospital'}`,
          timestamp: assignment.assigned_at,
          data: assignment
        })) || [];
      
      setActivities(recentActivities);
      
      // Create sample notifications
      setNotifications([
        {
          id: 'notification-1',
          title: 'System Update',
          content: 'Patient PATH will undergo maintenance tonight at 2 AM. Service will be restored by 4 AM.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          type: 'system'
        },
        {
          id: 'notification-2',
          title: 'New Assignment Policy',
          content: 'Starting next week, all ambulances must confirm pickup within 10 minutes of assignment.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          type: 'info'
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return; // Skip if user isn't loaded yet
    
    fetchDashboardData();
    
    // Set up real-time listeners for updates
    const assignmentsChannel = supabase
      .channel('assignment_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transport_assignments',
          filter: `ambulance_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Assignment change received!', payload);
          // Update dashboard data based on changes
          fetchDashboardData();
          // Add to activity feed
          if (payload.eventType === 'INSERT') {
            addActivity('assignment_created', payload.new);
          } else if (payload.eventType === 'UPDATE') {
            addActivity('assignment_updated', payload.new);
          }
        }
      )
      .subscribe();

    const requestsChannel = supabase
      .channel('requests_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transport_requests',
          filter: `status=eq.pending`
        }, 
        (payload) => {
          console.log('Request change received!', payload);
          // Update dashboard data based on changes
          fetchDashboardData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [user, fetchDashboardData]);

  const addActivity = (type, data) => {
    const activityTypes = {
      assignment_created: `New transport case assigned from ${data.transport_request?.hospital_name || 'hospital'}`,
      assignment_updated: `Transport case status updated to ${data.status}`,
      assignment_completed: `Transport case completed successfully`
    };
    
    const newActivity = {
      id: `activity-${Date.now()}`,
      type,
      content: activityTypes[type] || 'Activity recorded',
      timestamp: new Date().toISOString(),
      data
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedCase(null);
    setShowCommunication(false);
  };

  const handleCaseSelect = (caseData) => {
    setSelectedCase(caseData);
  };

  const handleCaseClosed = () => {
    setSelectedCase(null);
    fetchDashboardData();
  };

  const toggleCommunication = () => {
    setShowCommunication(prev => !prev);
  };

  // If user is not loaded yet, show a loading state
  if (!user) {
    return <LoadingState.Page text="Loading user information..." />;
  }

  // If there's an error, display it
  if (error) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="primary-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="ambulance-dashboard">
        <DashboardNav activeView={activeView} onViewChange={handleViewChange} />
        
        <main className="dashboard-content">
          {loading ? (
            <LoadingState.Section text="Loading dashboard data..." />
          ) : activeView === 'dashboard' ? (
            <div className="dashboard-overview">
              <div className="dashboard-header">
                <h1>Ambulance Dashboard</h1>
              </div>
              
              <div className="stats-grid">
                <StatCard
                  title="Available Requests"
                  value={stats.availableRequests}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  }
                  color="blue"
                />
                <StatCard
                  title="Assigned Cases"
                  value={stats.assignedCases}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      <path d="M9 14l2 2 4-4"></path>
                    </svg>
                  }
                  color="green"
                />
                <StatCard
                  title="Completed Today"
                  value={stats.completedToday}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  }
                  color="purple"
                />
                <StatCard
                  title="Avg. Response Time"
                  value={`${stats.averageResponseTime} min`}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  }
                  color="orange"
                />
              </div>
              
              <div className="dashboard-grid">
                <div className="dashboard-card activity-feed-card">
                  <h2 className="dashboard-card-title">Recent Activity</h2>
                  <ActivityFeed activities={activities} />
                </div>
                
                <div className="dashboard-card">
                  <h2 className="dashboard-card-title">Notifications</h2>
                  <NotificationList notifications={notifications} />
                </div>
              </div>
            </div>
          ) : activeView === 'cases' ? (
            <div className="cases-view">
              {selectedCase ? (
                <div className="case-detail-container">
                  <CaseDetail 
                    caseData={selectedCase} 
                    onClose={handleCaseClosed} 
                    onCommunicate={toggleCommunication}
                  />
                  {showCommunication && (
                    <CommunicationPanel 
                      caseId={selectedCase.id} 
                      onClose={toggleCommunication}
                    />
                  )}
                </div>
              ) : (
                <ActiveCasesList onCaseSelect={handleCaseSelect} />
              )}
            </div>
          ) : (
            <div className="placeholder-view">
              <h2>Feature Coming Soon</h2>
              <p>This feature is currently under development. Please check back later.</p>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default AmbulanceDashboard; 