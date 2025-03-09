import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { SUPABASE_CONFIG } from '../config/supabase.config';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user, userType, loading } = useAuth();
  const location = useLocation();

  // Show simplified loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '10px' }}>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user) {
    console.log("User not authenticated, redirecting to landing page");
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Simple role check - if you're a developer, you can access everything
  const isDeveloper = userType === SUPABASE_CONFIG.USER_TYPES.DEVELOPER;
  if (isDeveloper) {
    return children;
  }
  
  // For routes that require a specific user type
  if (requiredUserType && userType !== requiredUserType) {
    console.log(`Access denied: Required ${requiredUserType} but user has ${userType}`);
    
    // Simplified redirect logic based on user type
    if (userType === SUPABASE_CONFIG.USER_TYPES.HOSPITAL) {
      return <Navigate to="/hospital-dashboard" replace />;
    } else if (userType === SUPABASE_CONFIG.USER_TYPES.AMBULANCE) {
      return <Navigate to="/ambulance-dashboard" replace />;
    }
    
    // Default redirect
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute; 