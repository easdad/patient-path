import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DevNavigation.css';

const DevNavigation = () => {
  const [showNav, setShowNav] = useState(false);
  
  const toggleNav = () => setShowNav(!showNav);

  return (
    <div className="dev-nav-container">
      <button 
        className="dev-nav-toggle" 
        onClick={toggleNav}
        aria-expanded={showNav}
      >
        {showNav ? 'Hide Dev Tools' : 'Dev Tools'}
      </button>
      
      {showNav && (
        <div className="dev-navigation">
          <h3>Developer Navigation</h3>
          <ul className="dev-nav-links">
            <li>
              <Link to="/" className="dev-nav-link">
                <span className="dev-nav-icon">🚧</span>
                Construction Page
              </Link>
            </li>
            <li>
              <Link to="/landing" className="dev-nav-link">
                <span className="dev-nav-icon">🏠</span>
                Landing Page
              </Link>
            </li>
            <li>
              <Link to="/register" className="dev-nav-link">
                <span className="dev-nav-icon">✏️</span>
                Registration Page
              </Link>
            </li>
            <li>
              <Link to="/dev-hospital-dashboard" className="dev-nav-link">
                <span className="dev-nav-icon">🏥</span>
                Hospital Dashboard
              </Link>
            </li>
            <li>
              <Link to="/ambulance-dashboard" className="dev-nav-link">
                <span className="dev-nav-icon">🚑</span>
                Ambulance Dashboard
              </Link>
            </li>
            <li>
              <Link to="/test-supabase" className="dev-nav-link">
                <span className="dev-nav-icon">🧪</span>
                Supabase Test
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DevNavigation; 