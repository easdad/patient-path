import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Fallback values - for development only, should be removed in production
const fallbackUrl = 'https://aadkpnqvfnqzxruvbqfa.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGtwbnF2Zm5xenhydXZicWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQwMDUsImV4cCI6MjA1NjgwMDAwNX0.GdQFXPtmijTvO2UhHsyk1V8nd-YY1bCZAtbbfzU3FRM';

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  // In development, use fallback values
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Supabase URL or key missing from environment variables. Using fallback values.\n' +
      'This is OK for development, but ensure you set proper environment variables for production.'
    );
  } else {
    // In production, log a more serious error
    console.error(
      'Supabase configuration is missing! The application may not function correctly.\n' +
      'Please make sure that environment variables are properly set.'
    );
  }
}

// Create the Supabase client
const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Export as both default and named export to support both import styles
export { supabase };
export default supabase; 