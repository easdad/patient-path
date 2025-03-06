import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  // While checking authentication status, show nothing or a loading indicator
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not authenticated, redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If a specific user type is required, check user metadata
  if (requiredUserType) {
    const userType = user?.user_metadata?.user_type || 'hospital';
    
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