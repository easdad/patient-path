import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../utils/AuthContext';
import LoadingState from '../../../components/common/LoadingState';
import ActiveCasesList from './ActiveCasesList';
import CaseDetail from './CaseDetail';
import CommunicationPanel from './CommunicationPanel';
import './AmbulanceDashboard.css';

// Dashboard widget components
import StatCard from '../Widgets/StatCard';
import ActivityFeed from '../Widgets/ActivityFeed';
import NotificationList from '../Widgets/NotificationList';
import ErrorBoundary from '../../common/ErrorBoundary';

const AmbulanceDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_transports: 0,
    completed_transports: 0,
    active_cases: 0,
    available_vehicles: 0
  });
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCommunication, setShowCommunication] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // MOCK DATA - Use this instead of trying to fetch from non-existent tables
      const mockStats = {
        total_transports: 24,
        completed_transports: 18,
        active_cases: 3,
        available_vehicles: 5
      };
      
      const mockActiveCases = [
        {
          id: 1,
          patient_name: "John Smith",
          status: "in_progress",
          priority: "high",
          pickup_location: "Memorial Hospital",
          destination: "County General",
          created_at: new Date().toISOString(),
          estimated_arrival: new Date(Date.now() + 25 * 60000).toISOString(),
        },
        {
          id: 2,
          patient_name: "Mary Johnson",
          status: "assigned",
          priority: "medium",
          pickup_location: "Sunset Clinic",
          destination: "Riverside Medical Center",
          created_at: new Date(Date.now() - 35 * 60000).toISOString(),
          estimated_arrival: new Date(Date.now() + 45 * 60000).toISOString(),
        },
        {
          id: 3,
          patient_name: "Robert Brown",
          status: "in_progress",
          priority: "low",
          pickup_location: "Westside Medical",
          destination: "Home Care",
          created_at: new Date(Date.now() - 120 * 60000).toISOString(),
          estimated_arrival: new Date(Date.now() + 15 * 60000).toISOString(),
        }
      ];
      
      // Set mock data
      setStats(mockStats);
      setActiveCases(mockActiveCases);
      setIsLoading(false);
      
      /* 
      // COMMENTED OUT - REAL DATA FETCHING (for future use)
      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .from('ambulance_stats')
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
          active_cases: 0,
          available_vehicles: 0
        };
        
        setStats(defaultStats);
      } else {
        setStats(statsData);
      }
      
      // Fetch active cases
      const { data: casesData, error: casesError } = await supabase
        .from('transport_requests')
        .select('*')
        .eq('ambulance_id', user.id)
        .in('status', ['assigned', 'in_progress'])
        .order('created_at', { ascending: false });
      
      if (casesError) {
        console.error('Error fetching active cases:', casesError);
        // Don't throw, just set empty cases
      }
      
      setActiveCases(casesData || []);
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
        active_cases: 0,
        available_vehicles: 0
      });
      setActiveCases([]);
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
          total_transports: 24,
          completed_transports: 18,
          active_cases: 3,
          available_vehicles: 5
        };
        
        const mockActiveCases = [
          {
            id: 1,
            patient_name: "John Smith",
            status: "in_progress",
            priority: "high",
            pickup_location: "Memorial Hospital",
            destination: "County General",
            created_at: new Date().toISOString(),
            estimated_arrival: new Date(Date.now() + 25 * 60000).toISOString(),
          },
          {
            id: 2,
            patient_name: "Mary Johnson",
            status: "assigned",
            priority: "medium",
            pickup_location: "Sunset Clinic",
            destination: "Riverside Medical Center",
            created_at: new Date(Date.now() - 35 * 60000).toISOString(),
            estimated_arrival: new Date(Date.now() + 45 * 60000).toISOString(),
          },
          {
            id: 3,
            patient_name: "Robert Brown",
            status: "in_progress",
            priority: "low",
            pickup_location: "Westside Medical",
            destination: "Home Care",
            created_at: new Date(Date.now() - 120 * 60000).toISOString(),
            estimated_arrival: new Date(Date.now() + 15 * 60000).toISOString(),
          }
        ];
        
        // Set mock data
        setStats(mockStats);
        setActiveCases(mockActiveCases);
        setIsLoading(false);
        
        /* 
        // COMMENTED OUT - REAL DATA FETCHING (for future use)
        // Fetch dashboard stats
        const { data: statsData, error: statsError } = await supabase
          .from('ambulance_stats')
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
            active_cases: 0,
            available_vehicles: 0
          };
          
          setStats(defaultStats);
        } else {
          setStats(statsData);
        }
        
        // Fetch active cases
        const { data: casesData, error: casesError } = await supabase
          .from('transport_requests')
          .select('*')
          .eq('ambulance_id', user.id)
          .in('status', ['assigned', 'in_progress'])
          .order('created_at', { ascending: false });
        
        if (casesError) {
          console.error('Error fetching active cases:', casesError);
          // Don't throw, just set empty cases
        }
        
        setActiveCases(casesData || []);
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
          active_cases: 0,
          available_vehicles: 0
        });
        setActiveCases([]);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time listeners - commented out for now
    /*
    const setupSubscriptions = async () => {
      if (!user) return;
      
      try {
        // Listen for changes to transport requests
        const transportChannel = supabase
          .channel('ambulance_transport_changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'transport_requests',
            filter: `ambulance_id=eq.${user.id}`
          }, payload => {
            console.log('Transport request changed:', payload);
            // Reload all dashboard data when a transport changes
            fetchDashboardData();
          })
          .subscribe();
        
        // Cleanup function
        return () => {
          supabase.removeChannel(transportChannel);
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

  const handleViewChange = (view) => {
    setActiveView(view);
    // Reset case selection when changing views
    if (view !== 'active-cases') {
      setSelectedCase(null);
    }
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
                <h1>Ambulance Dashboard</h1>
                <div className="d-flex gap-md">
                  <button 
                    className={`btn ${showCommunication ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={toggleCommunication}
                  >
                    {showCommunication ? 'Hide Communication' : 'Open Communication'}
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
                  className={`view-toggle-button ${activeView === 'active-cases' ? 'active' : ''}`}
                  onClick={() => handleViewChange('active-cases')}
                >
                  Active Cases
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
                        <div className="stat-card-title">Available Requests</div>
                        <div className="stat-card-value">{stats.available_vehicles}</div>
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
                        <div className="stat-card-title">Assigned Cases</div>
                        <div className="stat-card-value">{stats.active_cases}</div>
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
                                  {activity.type === 'assignment_created' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line x1="16" y1="13" x2="8" y2="13"></line>
                                      <line x1="16" y1="17" x2="8" y2="17"></line>
                                      <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                  )}
                                  {activity.type === 'assignment_updated' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                                      <line x1="16" y1="8" x2="20" y2="8"></line>
                                      <line x1="16" y1="16" x2="23" y2="16"></line>
                                      <path d="M17 3v18h4"></path>
                                    </svg>
                                  )}
                                  {activity.type === 'assignment_completed' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                  )}
                                </div>
                                <div className="activity-content">
                                  <p>{activity.content}</p>
                                  <span className="activity-time">
                                    {new Date(activity.timestamp).toLocaleString()}
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
                                  <p>{notification.message || notification.content}</p>
                                  <span className="notification-time">
                                    {new Date(notification.timestamp).toLocaleString()}
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
                <div className="active-cases-view">
                  <div className="dashboard-grid">
                    <div className="dashboard-section">
                      <div className="dashboard-card">
                        <h3 className="mb-md">Active Cases</h3>
                        {activeCases.length > 0 ? (
                          <ActiveCasesList 
                            cases={activeCases} 
                            onCaseSelect={handleCaseSelect}
                          />
                        ) : (
                          <p className="text-center">No active cases at the moment</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="dashboard-section">
                      {selectedCase ? (
                        <CaseDetail 
                          caseData={selectedCase} 
                          onCaseClosed={handleCaseClosed}
                        />
                      ) : (
                        <div className="dashboard-card">
                          <div className="text-center">
                            <h3 className="mb-md">Case Details</h3>
                            <p>Select a case to view details</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {showCommunication && (
            <CommunicationPanel onClose={toggleCommunication} />
          )}
        </>
      )}
      
      {/* Dev toolbar will be rendered by App.js if user is a developer */}
    </div>
  );
};

export default AmbulanceDashboard; 