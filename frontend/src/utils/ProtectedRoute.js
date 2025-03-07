import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user, loading, error, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // While checking authentication status, show loading indicator
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="verification-progress">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If there's an auth error, show it
  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-error">
            <h2>Authentication Error</h2>
            <p>{error}</p>
            <button 
              className="primary-button"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If a specific user type is required, check user metadata
  if (requiredUserType) {
    const userType = user?.user_metadata?.user_type;
    
    if (!userType) {
      return (
        <div className="auth-container">
          <div className="auth-form-container">
            <div className="auth-error">
              <h2>Access Denied</h2>
              <p>Your account type could not be determined.</p>
              <button 
                className="primary-button"
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (userType !== requiredUserType) {
      // Redirect to the appropriate dashboard based on user type
      const redirectPath = userType === 'hospital' ? '/hospital-dashboard' : '/ambulance-dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  // If authenticated and has the correct role (if specified), render the children
  return children;
};

export default ProtectedRoute; 