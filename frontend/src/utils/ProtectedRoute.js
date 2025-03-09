import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AUTH_CONFIG } from '../config/auth.config';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user, userType, loading, hasDevAccess } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", { 
    requiredUserType, 
    currentUserType: userType, 
    loading,
    hasUser: !!user,
    userAppMetadata: user?.app_metadata,
    isDev: hasDevAccess()
  });

  // Show loading state while authentication is being verified
  if (loading) {
    console.log("Auth is still loading...");
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Verifying authentication...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user) {
    console.log("User not authenticated, redirecting to landing page");
    // Store the current location they were trying to go to
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Check if user has developer access - developers can access all routes
  if (hasDevAccess()) {
    console.log("Developer access granted - bypassing route protection");
    return children;
  }
  
  // For routes that require a specific user type
  if (requiredUserType && userType !== requiredUserType) {
    // Get role from app_metadata (most secure) or fallback to userType
    const userRole = user.app_metadata?.role || userType;
    console.log(`Access denied: Required ${requiredUserType} but user has ${userRole}`);
    
    // Redirect to appropriate dashboard based on user role
    if (userRole === AUTH_CONFIG.USER_TYPES.HOSPITAL) {
      return <Navigate to="/hospital-dashboard" replace />;
    } else if (userRole === AUTH_CONFIG.USER_TYPES.AMBULANCE) {
      return <Navigate to="/ambulance-dashboard" replace />;
    }
    
    // If user role is not recognized, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and authorized to access this route
  return children;
};

export default ProtectedRoute; 