import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../utils/AuthContext';
import LoadingState from '../../../components/common/LoadingState';
import TransportRequestForm from './TransportRequestForm';
import TransportRequestList from './TransportRequestList';
import './HospitalDashboard.css';

// Dashboard Components
import DashboardNav from './DashboardNav';

// Dashboard widget components
import StatCard from '../Widgets/StatCard';
import ActivityFeed from '../Widgets/ActivityFeed';
import NotificationList from '../Widgets/NotificationList';
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
      
      // MOCK DATA - Use this instead of trying to fetch from non-existent tables
      const mockStats = {
        total_transports: 42,
        completed_transports: 35,
        active_transports: 4,
        pending_approval: 3
      };
      
      const mockActivities = [
        {
          id: 1,
          type: 'transport_request',
          content: 'Transport request for patient #12458 was created',
          created_at: new Date(Date.now() - 35 * 60000).toISOString(),
          status: 'pending'
        },
        {
          id: 2,
          type: 'transport_assigned',
          content: 'City Ambulance Service accepted transport request #4589',
          created_at: new Date(Date.now() - 120 * 60000).toISOString(),
          status: 'active'
        },
        {
          id: 3,
          type: 'transport_completed',
          content: 'Transport #4582 was completed successfully',
          created_at: new Date(Date.now() - 240 * 60000).toISOString(),
          status: 'completed'
        }
      ];
      
      const mockNotifications = [
        {
          id: 1,
          title: 'Transport Request Update',
          message: 'Your transport request for patient Johnson has been accepted',
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
          read: false
        },
        {
          id: 2,
          title: 'System Maintenance',
          message: 'The system will be down for maintenance tonight from 2AM to 4AM',
          created_at: new Date(Date.now() - 180 * 60000).toISOString(),
          read: false
        }
      ];
      
      // Set mock data
      setStats(mockStats);
      setActivities(mockActivities);
      setNotifications(mockNotifications);
      setIsLoading(false);
      
      /* 
      // COMMENTED OUT - REAL DATA FETCHING (for future use)
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
      setIsLoading(false);
      */
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
        
        // MOCK DATA - Use this instead of trying to fetch from non-existent tables
        const mockStats = {
          total_transports: 42,
          completed_transports: 35,
          active_transports: 4,
          pending_approval: 3
        };
        
        const mockActivities = [
          {
            id: 1,
            type: 'transport_request',
            content: 'Transport request for patient #12458 was created',
            created_at: new Date(Date.now() - 35 * 60000).toISOString(),
            status: 'pending'
          },
          {
            id: 2,
            type: 'transport_assigned',
            content: 'City Ambulance Service accepted transport request #4589',
            created_at: new Date(Date.now() - 120 * 60000).toISOString(),
            status: 'active'
          },
          {
            id: 3,
            type: 'transport_completed',
            content: 'Transport #4582 was completed successfully',
            created_at: new Date(Date.now() - 240 * 60000).toISOString(),
            status: 'completed'
          }
        ];
        
        const mockNotifications = [
          {
            id: 1,
            title: 'Transport Request Update',
            message: 'Your transport request for patient Johnson has been accepted',
            created_at: new Date(Date.now() - 45 * 60000).toISOString(),
            read: false
          },
          {
            id: 2,
            title: 'System Maintenance',
            message: 'The system will be down for maintenance tonight from 2AM to 4AM',
            created_at: new Date(Date.now() - 180 * 60000).toISOString(),
            read: false
          }
        ];
        
        // Set mock data
        setStats(mockStats);
        setActivities(mockActivities);
        setNotifications(mockNotifications);
        setIsLoading(false);
        
        /* 
        // COMMENTED OUT - REAL DATA FETCHING (for future use)
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
        setIsLoading(false);
        */
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
    
    // Set up real-time listeners - commented out for now
    /*
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
    */
    
    // No real cleanup needed since we're not setting up real-time listeners
    return () => {};
  }, [user]);

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
    <div className="dashboard-container">
      {isLoading && !error ? (
        <LoadingState.Page />
      ) : error ? (
        <div className="container">
          <div className="dashboard-card mt-lg">
            <div className="message message-error">
              <h3>Error</h3>
              <p>{error}</p>
              <button className="btn btn-primary mt-md" onClick={fetchDashboardData}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="dashboard-header">
            <div className="container">
              <div className="d-flex justify-between align-center">
                <h1>Hospital Dashboard</h1>
                <div className="d-flex gap-md">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleNewRequest}
                  >
                    New Transport Request
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="container">
              <div className="view-toggle mb-lg">
                <button 
                  className={`view-toggle-button ${activeView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleViewChange('dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={`view-toggle-button ${activeView === 'transport-requests' ? 'active' : ''}`}
                  onClick={() => handleViewChange('transport-requests')}
                >
                  Transport Requests
                </button>
              </div>

              {activeView === 'dashboard' ? (
                <>
                  <div className="dashboard-section mb-lg">
                    <h2 className="mb-md">Overview</h2>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-card-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                          </svg>
                        </div>
                        <div className="stat-card-title">Pending Requests</div>
                        <div className="stat-card-value">{stats.pending_approval}</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-card-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                            <line x1="16" y1="8" x2="20" y2="8"></line>
                            <line x1="16" y1="16" x2="23" y2="16"></line>
                            <path d="M17 3v18h4"></path>
                          </svg>
                        </div>
                        <div className="stat-card-title">Active Transports</div>
                        <div className="stat-card-value">{stats.active_transports}</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-card-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div className="stat-card-title">Completed Today</div>
                        <div className="stat-card-value">{stats.completed_transports}</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-card-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div className="stat-card-title">Total Transports</div>
                        <div className="stat-card-value">{stats.total_transports}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dashboard-grid">
                    <div className="dashboard-section">
                      <div className="dashboard-card">
                        <h3 className="mb-md">Recent Activity</h3>
                        {activities.length > 0 ? (
                          <div className="activity-list">
                            {activities.map((activity, index) => (
                              <div key={activity.id || index} className="activity-item">
                                <div className="activity-icon">
                                  {activity.type === 'transport_request' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line x1="16" y1="13" x2="8" y2="13"></line>
                                      <line x1="16" y1="17" x2="8" y2="17"></line>
                                      <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                  )}
                                  {activity.type === 'transport_assigned' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                                      <line x1="16" y1="8" x2="20" y2="8"></line>
                                      <line x1="16" y1="16" x2="23" y2="16"></line>
                                      <path d="M17 3v18h4"></path>
                                    </svg>
                                  )}
                                  {activity.type === 'transport_completed' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                  )}
                                </div>
                                <div className="activity-content">
                                  <p>{activity.content}</p>
                                  <span className="activity-time">
                                    {new Date(activity.created_at).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center">No recent activity</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="dashboard-section">
                      <div className="dashboard-card">
                        <h3 className="mb-md">Notifications</h3>
                        {notifications.length > 0 ? (
                          <div className="notification-list">
                            {notifications.map((notification, index) => (
                              <div key={notification.id || index} className="notification-item">
                                <div className="notification-content">
                                  <h4>{notification.title}</h4>
                                  <p>{notification.message}</p>
                                  <span className="notification-time">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center">No new notifications</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="transport-requests-view">
                  {showTransportForm ? (
                    <div className="dashboard-card">
                      <div className="d-flex justify-between align-center mb-md">
                        <h2>New Transport Request</h2>
                        <button 
                          className="btn btn-secondary"
                          onClick={handleCloseForm}
                        >
                          Cancel
                        </button>
                      </div>
                      <TransportRequestForm 
                        onSubmit={handleCreateTransport}
                        onCancel={handleCloseForm}
                      />
                    </div>
                  ) : (
                    <div className="dashboard-card">
                      <div className="d-flex justify-between align-center mb-md">
                        <h2>Transport Requests</h2>
                        <button 
                          className="btn btn-primary"
                          onClick={handleNewRequest}
                        >
                          New Request
                        </button>
                      </div>
                      <TransportRequestList />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Dev toolbar will be rendered by App.js if user is a developer */}
    </div>
  );
};

export default HospitalDashboard; 