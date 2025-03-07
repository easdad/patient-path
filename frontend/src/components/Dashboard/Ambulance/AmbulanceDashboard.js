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
    total_transports: 0,
    completed_transports: 0,
    active_cases: 0,
    available_vehicles: 0
  });
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCommunication, setShowCommunication] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCases, setActiveCases] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
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
          active_cases: 0,
          available_vehicles: 0
        });
        setActiveCases([]);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time listeners
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
  }, [user, supabase]);

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
                  value={stats.available_vehicles}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  }
                  color="blue"
                />
                <StatCard
                  title="Assigned Cases"
                  value={stats.active_cases}
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