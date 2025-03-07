import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import './DevToolbar.css';

const DevToolbar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [systemStats, setSystemStats] = useState({
    activeUsers: 0,
    pendingRequests: 0,
    databaseSize: '0 MB',
    apiCalls: 0
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data?.user || null);
    };

    getUser();
    // Fetch system stats (mock data for now)
    fetchSystemStats();

    // Keyboard shortcut to toggle visibility (Ctrl+Shift+D)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prevVisible => !prevVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchSystemStats = async () => {
    // In a real implementation, this would fetch actual stats from the backend
    // For now, we'll use mock data
    setSystemStats({
      activeUsers: Math.floor(Math.random() * 50) + 10,
      pendingRequests: Math.floor(Math.random() * 20),
      databaseSize: `${(Math.random() * 500 + 100).toFixed(2)} MB`,
      apiCalls: Math.floor(Math.random() * 10000)
    });
  };

  const clearAllLocalStorage = () => {
    if (window.confirm('This will clear all local storage data. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const resetDatabase = async () => {
    if (window.confirm('This will reset test data in the database. Continue?')) {
      try {
        // In a real implementation, this would call a secure API endpoint
        const { error } = await supabase.functions.invoke('reset-test-data');
        if (error) throw error;
        alert('Test data has been reset successfully');
      } catch (error) {
        console.error('Error resetting test data:', error);
        alert(`Failed to reset test data: ${error.message}`);
      }
    }
  };

  const simulateError = () => {
    try {
      throw new Error('Simulated error from dev toolbar');
    } catch (error) {
      console.error('Simulated error:', error);
      alert(`Simulated error: ${error.message}`);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className={`dev-toolbar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="dev-toolbar-header" onClick={toggleExpanded}>
        <h3>
          <span role="img" aria-label="Developer">👩‍💻</span> Dev Tools
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▲</span>
        </h3>
      </div>
      
      {isExpanded && (
        <div className="dev-toolbar-content">
          <div className="dev-section">
            <h4>User Info</h4>
            <p><strong>Email:</strong> {currentUser?.email || 'Not logged in'}</p>
            <p><strong>User ID:</strong> {currentUser?.id || 'N/A'}</p>
            <p><strong>Role:</strong> Developer</p>
          </div>
          
          <div className="dev-section">
            <h4>Navigation</h4>
            <div className="button-group">
              <button onClick={() => navigateTo('/dev-dashboard')}>Dev Dashboard</button>
              <button onClick={() => navigateTo('/hospital-dashboard')}>Hospital Dashboard</button>
              <button onClick={() => navigateTo('/ambulance-dashboard')}>Ambulance Dashboard</button>
            </div>
          </div>
          
          <div className="dev-section">
            <h4>System Stats</h4>
            <p><strong>Active Users:</strong> {systemStats.activeUsers}</p>
            <p><strong>Pending Requests:</strong> {systemStats.pendingRequests}</p>
            <p><strong>DB Size:</strong> {systemStats.databaseSize}</p>
            <p><strong>API Calls:</strong> {systemStats.apiCalls}</p>
            <button onClick={fetchSystemStats}>Refresh Stats</button>
          </div>
          
          <div className="dev-section">
            <h4>Tools</h4>
            <div className="button-group">
              <button onClick={clearAllLocalStorage}>Clear LocalStorage</button>
              <button onClick={resetDatabase}>Reset Test Data</button>
              <button onClick={simulateError}>Simulate Error</button>
              <button onClick={() => setIsVisible(false)}>Hide Toolbar</button>
            </div>
          </div>
          
          <div className="dev-section">
            <h4>Authentication</h4>
            <div className="button-group">
              <button onClick={() => navigate('/register')}>Test Registration</button>
              <button onClick={() => navigate('/')}>Test Login</button>
              <button onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}>Sign Out</button>
            </div>
          </div>
          
          <div className="dev-toolbar-footer">
            <p>Press Ctrl+Shift+D to toggle toolbar visibility</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevToolbar; 