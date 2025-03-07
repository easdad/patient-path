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

  const getUserTypeDisplay = () => {
    if (!user?.user_metadata?.user_type) return '';
    
    const userType = user.user_metadata.user_type;
    return userType.charAt(0).toUpperCase() + userType.slice(1);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <div className="logo-container">
            <div className="logo-circle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div className="logo-text">Patient PATH</div>
          </div>
        </Link>
      </div>
      
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to={user?.user_metadata?.user_type === 'hospital' ? '/hospital-dashboard' : '/ambulance-dashboard'}>
              Dashboard
            </Link>
            <div className="user-info">
              <span className="user-type">{getUserTypeDisplay()}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/">Login</Link>
            <Link to="/register" className="register-button">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 