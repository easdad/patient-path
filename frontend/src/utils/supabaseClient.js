import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verify environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL ERROR: Missing Supabase environment variables. The application will not function correctly.\n' +
    'Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are properly set in your .env file.'
  );
}

// Create the Supabase client
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
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