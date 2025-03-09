import { createClient } from '@supabase/supabase-js';

// Simplified Supabase client initialization
// Directly use the values from environment variables or window object
const supabaseUrl = window.__SUPABASE_CONFIG__?.URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = window.__SUPABASE_CONFIG__?.ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Add console logs to debug configuration 
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

// Create the Supabase client with minimal options
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Disable any security features that might be causing issues
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
});

// Export as both default and named export
export { supabase };
export default supabase; 