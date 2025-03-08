// Authentication configuration
export const AUTH_CONFIG = {
  USER_TYPES: {
    HOSPITAL: 'hospital',
    AMBULANCE: 'ambulance',
    DEVELOPER: 'developer'
  }
};

// Helper to check if a user has a specific role
export const hasRole = (user, role) => {
  if (!user) return false;
  
  // Check app_metadata first (most secure)
  if (user.app_metadata?.role === role) return true;
  
  // Fallback to user_metadata or profile data
  return user.user_metadata?.user_type === role;
}; 