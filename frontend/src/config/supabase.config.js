/**
 * Supabase Configuration
 * This file centralizes all Supabase-related configuration
 */

// IMPORTANT: If you're experiencing "Invalid API key" errors, you need to:
// 1. Log in to your Supabase dashboard (https://app.supabase.com)
// 2. Get the correct URL and anon key from your project settings
// 3. Update the .env file accordingly with:
//    REACT_APP_SUPABASE_URL=your-url
//    REACT_APP_SUPABASE_ANON_KEY=your-key

// Project URL (required) - MUST end with .supabase.co
export const PROJECT_URL = process.env.REACT_APP_SUPABASE_URL;

// Project Anon Key (required) - MUST be a valid JWT token
export const PROJECT_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Export the SUPABASE_CONFIG object for use in the app
export const SUPABASE_CONFIG = {
  // Supabase URL (required)
  URL: PROJECT_URL,
  
  // Supabase Anon Key (required)
  ANON_KEY: PROJECT_ANON_KEY,
  
  // Auth configuration
  AUTH: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
  
  // User Types
  USER_TYPES: {
    HOSPITAL: 'hospital',
    AMBULANCE: 'ambulance',
    DEVELOPER: 'developer'
  },
  
  // Test users for development
  DEV_TEST_USERS: {
    HOSPITAL: {
      email: 'hospital@test.com',
      password: 'password123'
    },
    AMBULANCE: {
      email: 'ambulance@test.com',
      password: 'password123'
    }
  }
};

// Validate Supabase configuration
export const validateSupabaseConfig = () => {
  const errors = [];
  
  if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.URL.includes('supabase.co')) {
    errors.push('Invalid Supabase URL: Must be a valid Supabase URL ending with supabase.co');
  }
  
  if (!SUPABASE_CONFIG.ANON_KEY || !SUPABASE_CONFIG.ANON_KEY.startsWith('eyJ')) {
    errors.push('Invalid Supabase Anon Key: Must be a valid JWT token starting with "eyJ"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export specific properties for convenience
export const supabaseUrl = SUPABASE_CONFIG.URL;
export const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY;

// Check configuration validity
const { isValid, errors } = validateSupabaseConfig();
if (!isValid) {
  console.error('CRITICAL: Invalid Supabase configuration:', errors);
}

// Export default config
export default SUPABASE_CONFIG; 