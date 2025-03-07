import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../utils/AuthContext';
import './DevDashboard.css';

const DevDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [logs, setLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: '23%',
    memory: '45%',
    disk: '34%',
    response: '112ms'
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'users' || activeTab === 'dashboard') {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*');
        
        if (usersError) throw usersError;
        setUsers(usersData || []);
      }

      if (activeTab === 'requests' || activeTab === 'dashboard') {
        const { data: requestsData, error: requestsError } = await supabase
          .from('transport_requests')
          .select('*');
        
        if (requestsError) throw requestsError;
        setTransportRequests(requestsData || []);
      }

      if (activeTab === 'logs') {
        // In a real app, you would fetch actual logs
        // This is just mock data
        setLogs(generateMockLogs());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockLogs = () => {
    const logTypes = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
    const components = ['Auth', 'Database', 'API', 'Frontend', 'Backend'];
    const messages = [
      'User logged in successfully',
      'Failed to connect to database',
      'API rate limit exceeded',
      'Rendering error in component',
      'Request timeout',
      'Session expired',
      'Invalid authentication token',
      'Data fetch completed'
    ];

    return Array(20).fill(0).map((_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      component: components[Math.floor(Math.random() * components.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    }));
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  const handleChangeUserType = async (userId, newType) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, user_type: newType } : user
      ));
    } catch (error) {
      console.error('Error updating user type:', error);
      alert(`Failed to update user: ${error.message}`);
    }
  };

  const handleClearRequests = async () => {
    if (!window.confirm('Are you sure you want to clear all transport requests?')) return;
    
    try {
      const { error } = await supabase
        .from('transport_requests')
        .delete()
        .gte('id', 0);
      
      if (error) throw error;
      
      setTransportRequests([]);
    } catch (error) {
      console.error('Error clearing requests:', error);
      alert(`Failed to clear requests: ${error.message}`);
    }
  };

  const renderDashboard = () => (
    <div className="dev-dashboard-overview">
      <div className="dev-stats-grid">
        <div className="dev-stat-card">
          <h3>Users</h3>
          <div className="stat-number">{users.length}</div>
          <div className="stat-breakdown">
            <div>{users.filter(u => u.user_type === 'hospital').length} Hospitals</div>
            <div>{users.filter(u => u.user_type === 'ambulance').length} Ambulances</div>
          </div>
        </div>
        
        <div className="dev-stat-card">
          <h3>Requests</h3>
          <div className="stat-number">{transportRequests.length}</div>
          <div className="stat-breakdown">
            <div>{transportRequests.filter(r => r.status === 'pending').length} Pending</div>
            <div>{transportRequests.filter(r => r.status === 'completed').length} Completed</div>
          </div>
        </div>
        
        <div className="dev-stat-card">
          <h3>System Health</h3>
          <div className="system-health">
            <div className="health-item">
              <span>CPU:</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: systemHealth.cpu }}></div>
              </div>
              <span>{systemHealth.cpu}</span>
            </div>
            <div className="health-item">
              <span>MEM:</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: systemHealth.memory }}></div>
              </div>
              <span>{systemHealth.memory}</span>
            </div>
            <div className="health-item">
              <span>DISK:</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: systemHealth.disk }}></div>
              </div>
              <span>{systemHealth.disk}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="button-group">
          <button onClick={fetchData}>Refresh Data</button>
          <button onClick={() => setActiveTab('users')}>Manage Users</button>
          <button onClick={() => setActiveTab('requests')}>View Requests</button>
          <button onClick={() => setActiveTab('logs')}>View Logs</button>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="users-management">
      <h3>User Management</h3>
      <button className="refresh-button" onClick={fetchData}>Refresh</button>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Type</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="user-id">{user.id.substring(0, 8)}...</td>
                <td>{user.email}</td>
                <td>{user.full_name || '—'}</td>
                <td>
                  <select 
                    value={user.user_type} 
                    onChange={(e) => handleChangeUserType(user.id, e.target.value)}
                  >
                    <option value="hospital">Hospital</option>
                    <option value="ambulance">Ambulance</option>
                    <option value="developer">Developer</option>
                  </select>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="requests-management">
      <h3>Transport Requests</h3>
      <div className="actions-row">
        <button className="refresh-button" onClick={fetchData}>Refresh</button>
        <button className="delete-button" onClick={handleClearRequests}>Clear All</button>
      </div>
      
      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hospital</th>
              <th>Patient</th>
              <th>Status</th>
              <th>Created</th>
              <th>Pickup</th>
              <th>Destination</th>
            </tr>
          </thead>
          <tbody>
            {transportRequests.map(request => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.hospital_id}</td>
                <td>{request.patient_name}</td>
                <td>
                  <span className={`status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td>{request.pickup_location}</td>
                <td>{request.destination}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="logs-viewer">
      <h3>System Logs</h3>
      <button className="refresh-button" onClick={fetchData}>Refresh</button>
      
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Component</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className={`log-row ${log.type.toLowerCase()}`}>
                <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>
                  <span className={`log-type ${log.type.toLowerCase()}`}>
                    {log.type}
                  </span>
                </td>
                <td>{log.component}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading data...</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsersTab();
      case 'requests':
        return renderRequestsTab();
      case 'logs':
        return renderLogsTab();
      default:
        return renderDashboard();
    }
  };

  if (!user) {
    return <div className="dev-dashboard">You must be logged in to view this page.</div>;
  }

  return (
    <div className="dev-dashboard">
      <div className="dev-dashboard-header">
        <h1>Developer Dashboard</h1>
        <div className="dev-user-info">
          <span className="dev-email">{user.email}</span>
          <span className="dev-badge">Developer Access</span>
        </div>
      </div>
      
      <div className="dev-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'requests' ? 'active' : ''} 
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
        <button 
          className={activeTab === 'logs' ? 'active' : ''} 
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </button>
      </div>
      
      <div className="dev-dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default DevDashboard; 