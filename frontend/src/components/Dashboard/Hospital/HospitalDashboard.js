import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../utils/AuthContext';
import './HospitalDashboard.css';

// Dashboard Components
import DashboardNav from './DashboardNav';
import TransportRequestForm from './TransportRequestForm';
import TransportRequestList from './TransportRequestList';

// Dashboard widget components
import StatCard from '../Widgets/StatCard';
import ActivityFeed from '../Widgets/ActivityFeed';
import NotificationList from '../Widgets/NotificationList';
import LoadingState from '../../common/LoadingState';
import ErrorBoundary from '../../common/ErrorBoundary';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeTransports: 0,
    completedToday: 0,
    averageResponseTime: 0
  });
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showTransportForm, setShowTransportForm] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const fetchDashboardData = useCallback(async () => {
    if (!user) return; // Skip if user isn't loaded yet
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch stats
      const { data: requests, error: requestsError } = await supabase
        .from('transport_requests')
        .select('*')
        .eq('hospital_id', user.id);
      
      if (requestsError) throw requestsError;
      
      // Process data for stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      const pendingRequests = requests.filter(req => req.status === 'pending').length;
      const activeTransports = requests.filter(req => 
        req.status === 'assigned' || req.status === 'in_progress'
      ).length;
      const completedToday = requests.filter(req => 
        req.status === 'completed' && new Date(req.completion_time) >= new Date(today)
      ).length;
      
      // Calculate average response time (in minutes)
      let totalResponseTime = 0;
      let completedWithResponse = 0;
      
      requests.forEach(req => {
        if (req.status === 'completed' && req.requested_at && req.completion_time) {
          const requestTime = new Date(req.requested_at);
          const completionTime = new Date(req.completion_time);
          const responseTime = (completionTime - requestTime) / (1000 * 60); // minutes
          totalResponseTime += responseTime;
          completedWithResponse++;
        }
      });
      
      const averageResponseTime = completedWithResponse > 0 
        ? Math.round(totalResponseTime / completedWithResponse) 
        : 0;
      
      setStats({
        pendingRequests,
        activeTransports,
        completedToday,
        averageResponseTime
      });
      
      // Create sample activities based on recent changes
      const recentActivities = requests
        .filter(req => new Date(req.requested_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at))
        .slice(0, 5)
        .map(req => ({
          id: `activity-${req.id}`,
          type: 'transport_created',
          content: `Transport request for ${req.patient_name} was created`,
          timestamp: req.requested_at,
          data: req
        }));
      
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
          title: 'New Provider Available',
          content: 'Rapid Response Ambulance is now available for transport in your area.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          type: 'info'
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return; // Skip if user isn't loaded
    
    fetchDashboardData();
    
    // Set up real-time listeners for updates
    const transportChannel = supabase
      .channel('transport_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transport_requests',
          filter: `hospital_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Transport change received!', payload);
          // Update dashboard data based on changes
          fetchDashboardData();
          // Add to activity feed
          if (payload.eventType === 'INSERT') {
            addActivity('transport_created', payload.new);
          } else if (payload.eventType === 'UPDATE') {
            addActivity('transport_updated', payload.new);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(transportChannel);
    };
  }, [user, fetchDashboardData]);

  const addActivity = (type, data) => {
    const activityTypes = {
      transport_created: `Transport request for ${data.patient_name} was created`,
      transport_updated: `Transport for ${data.patient_name} was updated to ${data.status}`,
      transport_assigned: `Transport for ${data.patient_name} was assigned to ${data.ambulance_id}`,
      transport_completed: `Transport for ${data.patient_name} was completed`
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

  const handleCreateTransport = (request) => {
    setShowTransportForm(false);
    addActivity('transport_created', request);
    fetchDashboardData();
  };

  const handleCloseForm = () => {
    setShowTransportForm(false);
  };

  const handleNewRequest = () => {
    setShowTransportForm(true);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
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
      <div className="hospital-dashboard">
        <DashboardNav activeView={activeView} onViewChange={handleViewChange} />
        
        <main className="dashboard-content">
          {isLoading ? (
            <LoadingState.Section text="Loading dashboard data..." />
          ) : activeView === 'dashboard' ? (
            <div className="dashboard-overview">
              <div className="dashboard-header">
                <h1>Hospital Dashboard</h1>
                <div className="dashboard-actions">
                  <button 
                    className="new-transport-button"
                    onClick={handleNewRequest}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Transport Request
                  </button>
                </div>
              </div>
              
              <div className="stats-grid">
                <StatCard
                  title="Pending Requests"
                  value={stats.pendingRequests}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  }
                  color="blue"
                />
                <StatCard
                  title="Active Transports"
                  value={stats.activeTransports}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                      <line x1="6" y1="1" x2="6" y2="4"></line>
                      <line x1="10" y1="1" x2="10" y2="4"></line>
                      <line x1="14" y1="1" x2="14" y2="4"></line>
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
          ) : activeView === 'requests' ? (
            <div className="transport-requests-view">
              {showTransportForm ? (
                <TransportRequestForm 
                  onRequestCreated={handleCreateTransport} 
                  onCancel={handleCloseForm} 
                />
              ) : (
                <TransportRequestList onNewRequest={handleNewRequest} />
              )}
            </div>
          ) : (
            <div className="placeholder-view">
              <h2>Feature Coming Soon</h2>
              <p>This feature is currently under development. Please check back later.</p>
            </div>
          )}
        </main>
        
        {/* Modals and overlays */}
        {showTransportForm && activeView === 'dashboard' && (
          <div className="modal-overlay">
            <TransportRequestForm 
              onRequestCreated={handleCreateTransport} 
              onCancel={handleCloseForm} 
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default HospitalDashboard; 