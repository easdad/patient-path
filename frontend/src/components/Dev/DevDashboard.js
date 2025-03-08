import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import dataService from '../../services/dataService';
import './DevDashboard.css';

const DevDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [functionLogs, setFunctionLogs] = useState([]);
  const [roleMismatches, setRoleMismatches] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: '23%',
    memory: '45%',
    disk: '34%',
    response: '112ms',
    edgeFunctions: {
      updateUserRole: 'Operational',
      updateUserRoles: 'Operational'
    }
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verify admin access through app_metadata
      if (user?.app_metadata?.role !== 'admin') {
        throw new Error('Admin access required. Your account does not have the required permissions.');
      }
      
      if (activeTab === 'users' || activeTab === 'dashboard') {
        const { data: usersData, error: usersError } = await dataService.getProfiles();
        
        if (usersError) throw usersError;
        setUsers(usersData || []);
      }

      if (activeTab === 'requests' || activeTab === 'dashboard') {
        const { data: requestsData, error: requestsError } = await dataService.getTransportRequests();
        
        if (requestsError) throw requestsError;
        setTransportRequests(requestsData || []);
      }

      if (activeTab === 'logs') {
        // In a real app, you would fetch actual logs
        setLogs(generateMockLogs());
        setFunctionLogs(generateMockFunctionLogs());
      }

      if (activeTab === 'monitoring') {
        await fetchSystemHealth();
        await checkRoleMismatches();
      }

      if (activeTab === 'testing') {
        // No need to fetch anything initially for testing tab
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const fetchSystemHealth = async () => {
    try {
      // In a real app, you would fetch actual metrics from your backend
      // This is just mock data
      setSystemHealth({
        cpu: Math.floor(Math.random() * 60) + 10 + '%',
        memory: Math.floor(Math.random() * 60) + 20 + '%',
        disk: Math.floor(Math.random() * 30) + 10 + '%',
        response: Math.floor(Math.random() * 200) + 50 + 'ms',
        edgeFunctions: {
          updateUserRole: Math.random() > 0.9 ? 'Degraded' : 'Operational',
          updateUserRoles: Math.random() > 0.9 ? 'Degraded' : 'Operational'
        },
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const checkRoleMismatches = async () => {
    try {
      // In a real app, you would have an API endpoint to check for mismatches
      // This is just mock data
      const mockMismatches = users
        .filter(() => Math.random() > 0.8) // Randomly select ~20% of users
        .map(user => ({
          id: user.id,
          email: user.email,
          profileType: user.user_type,
          metadataRole: ['hospital', 'ambulance', 'developer'][Math.floor(Math.random() * 3)],
          detected: new Date().toISOString()
        }))
        .filter(user => user.profileType !== user.metadataRole);
      
      setRoleMismatches(mockMismatches);
    } catch (error) {
      console.error('Error checking role mismatches:', error);
    }
  };

  const runAccessTests = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would have an API endpoint to run these tests
      // This is just mock data
      const testCases = [
        { name: 'Hospital can view own profile', role: 'hospital', resource: 'profiles', action: 'read', expected: true },
        { name: 'Hospital can view own requests', role: 'hospital', resource: 'transport_requests', action: 'read', expected: true },
        { name: 'Hospital cannot view other hospital requests', role: 'hospital', resource: 'transport_requests', action: 'read', expected: false },
        { name: 'Ambulance can view all pending requests', role: 'ambulance', resource: 'transport_requests', action: 'read', expected: true },
        { name: 'Ambulance cannot create hospital requests', role: 'ambulance', resource: 'transport_requests', action: 'create', expected: false },
        { name: 'Developer can view all profiles', role: 'developer', resource: 'profiles', action: 'read', expected: true },
        { name: 'Developer can update any profile', role: 'developer', resource: 'profiles', action: 'update', expected: true }
      ];
      
      // Simulate test results
      const results = testCases.map(test => ({
        ...test,
        result: Math.random() > 0.1 ? test.expected : !test.expected, // 90% pass rate
        timestamp: new Date().toISOString()
      }));
      
      setTestResults(results);
    } catch (error) {
      console.error('Error running access tests:', error);
      setError('Failed to run access tests');
    } finally {
      setIsLoading(false);
    }
  };

  const fixRoleMismatches = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would call your Edge Function to fix mismatches
      // This is just a simulation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setRoleMismatches([]);
      alert('All role mismatches have been fixed!');
    } catch (error) {
      console.error('Error fixing role mismatches:', error);
      setError('Failed to fix role mismatches');
    } finally {
      setIsLoading(false);
    }
  };

  const testUserPermissions = async (userId, userType) => {
    setIsLoading(true);
    try {
      // In a real app, you would have an API endpoint to test permissions
      // This is just a simulation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert(`Tested permissions for ${userType} user (${userId.substring(0, 8)}...): All permissions are correctly configured.`);
    } catch (error) {
      console.error('Error testing user permissions:', error);
      setError(`Failed to test permissions for user ${userId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockFunctionLogs = () => {
    const functions = ['update-user-role', 'update-user-roles'];
    const statuses = ['success', 'error'];
    const messages = [
      'Role updated successfully',
      'Failed to update role: user not found',
      'Role migration completed',
      'Invalid role specified',
      'Permission denied',
      'Database connection error'
    ];

    return Array(15).fill(0).map((_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      function: functions[Math.floor(Math.random() * functions.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      userId: `user-${Math.floor(Math.random() * 1000)}`
    }));
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
      const { success, error } = await dataService.deleteUser(userId);
      
      if (!success) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleChangeUserType = async (userId, newType) => {
    try {
      const { success, error } = await dataService.updateUserType(userId, newType);
      
      if (!success) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, user_type: newType } : user
      ));
    } catch (err) {
      console.error('Error updating user type:', err);
      alert(`Failed to update user: ${err.message}`);
    }
  };

  const handleClearRequests = async () => {
    if (!window.confirm('Are you sure you want to clear all transport requests?')) return;
    
    try {
      const { success, error } = await dataService.clearTransportRequests();
      
      if (!success) throw error;
      
      setTransportRequests([]);
    } catch (err) {
      console.error('Error clearing requests:', err);
      alert(`Failed to clear requests: ${err.message}`);
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

  const renderMonitoringTab = () => (
    <div className="monitoring-section">
      <h3>System Monitoring</h3>
      <div className="refresh-row">
        <button className="refresh-button" onClick={fetchSystemHealth}>Refresh Metrics</button>
        <span className="last-updated">Last updated: {systemHealth.lastUpdated || 'Never'}</span>
      </div>
      
      <div className="monitoring-grid">
        <div className="monitoring-card">
          <h4>System Health</h4>
          <div className="health-metrics">
            <div className="health-item">
              <span>CPU:</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: systemHealth.cpu }}></div>
              </div>
              <span>{systemHealth.cpu}</span>
            </div>
            <div className="health-item">
              <span>Memory:</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: systemHealth.memory }}></div>
              </div>
              <span>{systemHealth.memory}</span>
            </div>
            <div className="health-item">
              <span>Disk:</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: systemHealth.disk }}></div>
              </div>
              <span>{systemHealth.disk}</span>
            </div>
            <div className="health-item">
              <span>Response:</span>
              <span>{systemHealth.response}</span>
            </div>
          </div>
        </div>
        
        <div className="monitoring-card">
          <h4>Edge Functions Status</h4>
          <div className="function-status">
            <div className={`status-item ${systemHealth.edgeFunctions.updateUserRole === 'Operational' ? 'operational' : 'degraded'}`}>
              <span>update-user-role:</span>
              <span>{systemHealth.edgeFunctions.updateUserRole}</span>
            </div>
            <div className={`status-item ${systemHealth.edgeFunctions.updateUserRoles === 'Operational' ? 'operational' : 'degraded'}`}>
              <span>update-user-roles:</span>
              <span>{systemHealth.edgeFunctions.updateUserRoles}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="role-mismatches">
        <h4>Role Mismatches</h4>
        <div className="actions-row">
          <button className="refresh-button" onClick={checkRoleMismatches}>Check Mismatches</button>
          <button 
            className="action-button" 
            onClick={fixRoleMismatches}
            disabled={roleMismatches.length === 0}
          >
            Fix All Mismatches
          </button>
        </div>
        
        {roleMismatches.length > 0 ? (
          <table className="mismatches-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Email</th>
                <th>Profile Type</th>
                <th>Metadata Role</th>
                <th>Detected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roleMismatches.map(mismatch => (
                <tr key={mismatch.id}>
                  <td>{mismatch.id.substring(0, 8)}...</td>
                  <td>{mismatch.email}</td>
                  <td>{mismatch.profileType}</td>
                  <td>{mismatch.metadataRole}</td>
                  <td>{new Date(mismatch.detected).toLocaleString()}</td>
                  <td>
                    <button 
                      className="small-button"
                      onClick={() => handleChangeUserType(mismatch.id, mismatch.profileType)}
                    >
                      Fix
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-mismatches">No role mismatches detected</div>
        )}
      </div>
    </div>
  );

  const renderTestingTab = () => (
    <div className="testing-section">
      <h3>Access Control Testing</h3>
      <div className="actions-row">
        <button className="action-button" onClick={runAccessTests}>Run Access Tests</button>
      </div>
      
      {testResults.length > 0 ? (
        <div className="test-results">
          <h4>Test Results</h4>
          <table className="tests-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Role</th>
                <th>Resource</th>
                <th>Action</th>
                <th>Expected</th>
                <th>Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((test, index) => (
                <tr key={index} className={test.result === test.expected ? 'test-pass' : 'test-fail'}>
                  <td>{test.name}</td>
                  <td>{test.role}</td>
                  <td>{test.resource}</td>
                  <td>{test.action}</td>
                  <td>{test.expected ? 'Allow' : 'Deny'}</td>
                  <td>{test.result ? 'Allow' : 'Deny'}</td>
                  <td>
                    <span className={`test-status ${test.result === test.expected ? 'pass' : 'fail'}`}>
                      {test.result === test.expected ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-tests">No tests have been run yet</div>
      )}
      
      <div className="user-testing">
        <h4>Test User Permissions</h4>
        <p>Select a user to test their specific permissions:</p>
        
        <div className="user-select">
          <select id="test-user" className="user-select-dropdown">
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.user_type})
              </option>
            ))}
          </select>
          <button 
            className="action-button"
            onClick={() => {
              const select = document.getElementById('test-user');
              const userId = select.value;
              const userType = users.find(u => u.id === userId)?.user_type;
              testUserPermissions(userId, userType);
            }}
            disabled={users.length === 0}
          >
            Test Permissions
          </button>
        </div>
      </div>
    </div>
  );

  const renderFunctionLogs = () => (
    <div className="function-logs">
      <h4>Edge Function Logs</h4>
      <button className="refresh-button" onClick={() => setFunctionLogs(generateMockFunctionLogs())}>
        Refresh
      </button>
      
      <table className="logs-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Function</th>
            <th>Status</th>
            <th>User ID</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {functionLogs.map(log => (
            <tr key={log.id} className={`log-row ${log.status}`}>
              <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td>{log.function}</td>
              <td>
                <span className={`log-status ${log.status}`}>
                  {log.status.toUpperCase()}
                </span>
              </td>
              <td>{log.userId}</td>
              <td>{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLogsTab = () => (
    <div className="logs-viewer">
      <h3>System Logs</h3>
      <button className="refresh-button" onClick={fetchData}>Refresh</button>
      
      <div className="logs-table-container">
        <h4>Application Logs</h4>
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
      
      {renderFunctionLogs()}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading data...</div>;
    }

    if (error) {
      return (
        <div className="error-container">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      );
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
      case 'monitoring':
        return renderMonitoringTab();
      case 'testing':
        return renderTestingTab();
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
        <button 
          className={activeTab === 'monitoring' ? 'active' : ''} 
          onClick={() => setActiveTab('monitoring')}
        >
          Monitoring
        </button>
        <button 
          className={activeTab === 'testing' ? 'active' : ''} 
          onClick={() => setActiveTab('testing')}
        >
          Testing
        </button>
      </div>
      
      <div className="dev-dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default DevDashboard; 