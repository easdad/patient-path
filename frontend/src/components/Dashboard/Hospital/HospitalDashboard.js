import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../../../utils/supabaseClient';
import './HospitalDashboard.css';

// Dashboard Components
import StatisticsPanel from './StatisticsPanel';
import ActivityFeed from './ActivityFeed';
import NotificationsPanel from './NotificationsPanel';
import DashboardNav from './DashboardNav';

const HospitalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeTransports: 0,
    pendingRequests: 0,
    completedToday: 0,
    urgentRequests: 0
  });
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch statistics
        const statsResponse = await fetchStatistics();
        setStats(statsResponse);

        // Fetch recent activities
        const activitiesResponse = await fetchActivities();
        setActivities(activitiesResponse);

        // Fetch notifications
        const notificationsResponse = await fetchNotifications();
        setNotifications(notificationsResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time listeners for updates
    const transportSubscription = supabase
      .channel('transport-requests')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transport_requests' 
      }, handleTransportUpdate)
      .subscribe();

    const notificationSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, handleNotificationUpdate)
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(transportSubscription);
      supabase.removeChannel(notificationSubscription);
    };
  }, []);

  // Mock data fetching functions (to be replaced with actual API calls)
  const fetchStatistics = async () => {
    // In real implementation, this would be a Supabase query
    return {
      activeTransports: 5,
      pendingRequests: 3,
      completedToday: 8,
      urgentRequests: 2
    };
  };

  const fetchActivities = async () => {
    // In real implementation, this would be a Supabase query
    return [
      {
        id: 1,
        type: 'transport_created',
        message: 'New transport request #T-1234 created',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'pending'
      },
      {
        id: 2,
        type: 'transport_assigned',
        message: 'Transport #T-1230 assigned to Memorial Ambulance',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'active'
      },
      {
        id: 3,
        type: 'transport_completed',
        message: 'Transport #T-1228 completed successfully',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        status: 'completed'
      },
      {
        id: 4,
        type: 'message_received',
        message: 'New message from Memorial Ambulance regarding transport #T-1230',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        status: 'unread'
      }
    ];
  };

  const fetchNotifications = async () => {
    // In real implementation, this would be a Supabase query
    return [
      {
        id: 1,
        title: 'Transport Accepted',
        message: 'Memorial Ambulance has accepted transport request #T-1234',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        read: false
      },
      {
        id: 2,
        title: 'Patient Ready Update',
        message: 'Please confirm patient John Doe is ready for pickup (Transport #T-1230)',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        read: false
      },
      {
        id: 3,
        title: 'Schedule Change',
        message: 'Transport #T-1235 has been rescheduled to 3:45 PM',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        read: true
      }
    ];
  };

  // Real-time update handlers
  const handleTransportUpdate = (payload) => {
    console.log('Transport update received:', payload);
    // Update stats and activities based on the payload
    // In a real implementation, you'd use the payload data to update the UI
    fetchStatistics().then(setStats);
    fetchActivities().then(setActivities);
  };

  const handleNotificationUpdate = (payload) => {
    console.log('Notification update received:', payload);
    // Update notifications based on the payload
    fetchNotifications().then(setNotifications);
  };

  // Create new transport request
  const handleCreateTransport = () => {
    // In a real implementation, navigate to the transport creation form
    console.log('Create transport clicked');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="hospital-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Hospital Dashboard</h1>
          <div className="header-actions">
            <button className="primary-button" onClick={handleCreateTransport}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Transport Request
            </button>
            <button className="secondary-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              View Schedule
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <DashboardNav />
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-grid">
            <section className="dashboard-statistics">
              <StatisticsPanel stats={stats} />
            </section>

            <section className="dashboard-activity">
              <ActivityFeed activities={activities} />
            </section>
          </div>
        </main>

        <aside className="dashboard-notifications">
          <NotificationsPanel notifications={notifications} />
        </aside>
      </div>
    </div>
  );
};

export default HospitalDashboard; 