import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Determine which dashboard to link to based on user type
  const getDashboardLink = () => {
    if (!user) return '/';
    const userType = user?.user_metadata?.user_type || 'hospital';
    return userType === 'hospital' ? '/hospital-dashboard' : '/ambulance-dashboard';
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-logo">
        <div className="logo-circle">+</div>
        <div className="logo-text">
          <h1>PATIENT PATH</h1>
          <p>Patient Transport Hub</p>
        </div>
      </div>
      
      <div className="navbar-links">
        <Link to="/landing" className="nav-link">Home</Link>
        
        {isAuthenticated ? (
          <>
            <Link to={getDashboardLink()} className="nav-link">Dashboard</Link>
            <Link to="/help" className="nav-link">Help</Link>
            <div className="user-menu">
              <span className="user-email">{user?.email}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link to="/" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 