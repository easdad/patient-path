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
    total_transports: 0,
    completed_transports: 0,
    active_transports: 0,
    pending_approval: 0
  });
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showTransportForm, setShowTransportForm] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (statsError && !statsError.message.includes('No rows found')) {
        console.error('Error fetching stats:', statsError);
        throw new Error('Failed to load dashboard statistics');
      }
      
      // If we don't have stats yet, create default ones
      if (!statsData) {
        const defaultStats = {
          total_transports: 0,
          completed_transports: 0,
          active_transports: 0,
          pending_approval: 0
        };
        
        setStats(defaultStats);
      } else {
        setStats(statsData);
      }
      
      // Fetch recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        // Don't throw here, just set empty activities
      }
      
      setActivities(activitiesData || []);
      
      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
        // Don't throw here, just set empty notifications
      }
      
      setNotifications(notificationsData || []);
      
      // Everything loaded successfully
      setIsLoading(false);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message || 'Failed to load dashboard data');
      setIsLoading(false);
      
      // Set default empty values on error
      setStats({
        total_transports: 0,
        completed_transports: 0,
        active_transports: 0,
        pending_approval: 0
      });
      setActivities([]);
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch dashboard stats
        const { data: statsData, error: statsError } = await supabase
          .from('dashboard_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (statsError && !statsError.message.includes('No rows found')) {
          console.error('Error fetching stats:', statsError);
          throw new Error('Failed to load dashboard statistics');
        }
        
        // If we don't have stats yet, create default ones
        if (!statsData) {
          const defaultStats = {
            total_transports: 0,
            completed_transports: 0,
            active_transports: 0,
            pending_approval: 0
          };
          
          setStats(defaultStats);
        } else {
          setStats(statsData);
        }
        
        // Fetch recent activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError);
          // Don't throw here, just set empty activities
        }
        
        setActivities(activitiesData || []);
        
        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('read', false)
          .order('created_at', { ascending: false });
        
        if (notificationsError) {
          console.error('Error fetching notifications:', notificationsError);
          // Don't throw here, just set empty notifications
        }
        
        setNotifications(notificationsData || []);
        
        // Everything loaded successfully
        setIsLoading(false);
      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error.message || 'Failed to load dashboard data');
        setIsLoading(false);
        
        // Set default empty values on error
        setStats({
          total_transports: 0,
          completed_transports: 0,
          active_transports: 0,
          pending_approval: 0
        });
        setActivities([]);
        setNotifications([]);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time listeners
    const setupSubscriptions = async () => {
      if (!user) return;
      
      try {
        // Listen for new transport requests
        const transportChannel = supabase
          .channel('transport_requests_channel')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'transport_requests',
            filter: `hospital_id=eq.${user.id}`
          }, payload => {
            console.log('Transport request changed:', payload);
            // Update data based on the change
            fetchDashboardData();
          })
          .subscribe();
          
        // Listen for new notifications
        const notificationChannel = supabase
          .channel('notifications_channel')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            console.log('New notification:', payload);
            setNotifications(current => [payload.new, ...current]);
          })
          .subscribe();
          
        // Cleanup function
        return () => {
          supabase.removeChannel(transportChannel);
          supabase.removeChannel(notificationChannel);
        };
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
      }
    };
    
    const cleanup = setupSubscriptions();
    return () => {
      if (cleanup) cleanup();
    };
  }, [user, supabase]);

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
                  value={stats.pending_approval}
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
                  value={stats.active_transports}
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
                  value={stats.completed_transports}
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