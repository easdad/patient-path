import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import './DevToolbar.css';

const DevToolbar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Keyboard shortcut to toggle visibility (Alt+D)
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault(); // Prevent default behavior
        setIsVisible(prevVisible => !prevVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearAllLocalStorage = () => {
    if (window.confirm('This will clear all local storage data. Continue?')) {
      localStorage.clear();
      window.location.reload();
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
          <span role="img" aria-label="Developer">🛠️</span> Dev
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▲</span>
        </h3>
      </div>
      
      {isExpanded && (
        <div className="dev-toolbar-content">
          <div className="dev-section">
            <h4>Navigation</h4>
            <div className="button-group">
              <button onClick={() => navigateTo('/dev-dashboard')}>Dev Dashboard</button>
              <button onClick={() => navigateTo('/hospital-dashboard')}>Hospital</button>
              <button onClick={() => navigateTo('/ambulance-dashboard')}>Ambulance</button>
            </div>
          </div>
          
          <div className="dev-section">
            <h4>Tools</h4>
            <div className="button-group">
              <button onClick={clearAllLocalStorage}>Clear LocalStorage</button>
              <button onClick={() => setIsVisible(false)}>Hide Toolbar</button>
            </div>
          </div>
          
          <div className="dev-section">
            <h4>Authentication</h4>
            <div className="button-group">
              <button onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}>Sign Out</button>
            </div>
          </div>
          
          <div className="dev-toolbar-footer">
            <p>Press Alt+D to toggle toolbar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevToolbar; 