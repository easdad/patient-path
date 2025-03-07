import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Developer account email for special permissions
const DEV_EMAIL = 'easdad.jm@gmail.com';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user, userType, loading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being determined
  if (loading) {
    return <div className="loading-container">Loading authentication...</div>;
  }

  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Special case for developer account - can access everything
  if (isAuthenticated && 
      (user.email === DEV_EMAIL || 
       user.user_metadata?.user_type === 'developer' || 
       userType === 'developer')) {
    return children;
  }
  
  // If user type is required and doesn't match, redirect to unauthorized or the appropriate dashboard
  if (requiredUserType && userType !== requiredUserType) {
    // If user has a valid type but tries to access another dashboard type, redirect to their dashboard
    if (userType === 'hospital') {
      return <Navigate to="/hospital-dashboard" replace />;
    } else if (userType === 'ambulance') {
      return <Navigate to="/ambulance-dashboard" replace />;
    }
    
    // Otherwise, unauthorized
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Otherwise, render the protected component
  return children;
};

export default ProtectedRoute; 