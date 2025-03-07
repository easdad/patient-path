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
    return <div>Loading...</div>;
  }

  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Special case for developer account - can access everything
  if (isAuthenticated && user.email === DEV_EMAIL) {
    return children;
  }
  
  // If not authenticated, redirect to login page with current location
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // If user type is required and doesn't match, redirect to unauthorized
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Otherwise, render the protected component
  return children;
};

export default ProtectedRoute; 