import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey, SUPABASE_CONFIG, validateSupabaseConfig } from '../config/supabase.config';

// For debugging only
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase Configuration:');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseAnonKey);
  
  // Check URL format
  if (supabaseUrl) {
    const isValidUrl = supabaseUrl.includes('supabase.co');
    console.log('URL format valid:', isValidUrl);
    if (!isValidUrl) console.error('URL must contain supabase.co');
  }
  
  // Check Anon Key format
  if (supabaseAnonKey) {
    const isValidKey = supabaseAnonKey.startsWith('eyJ');
    console.log('Key format valid:', isValidKey);
    if (!isValidKey) console.error('Anon Key must start with "eyJ" (JWT format)');
  }
}

// Validate configuration
const { isValid, errors } = validateSupabaseConfig();
if (!isValid) {
  console.error('❌ Supabase configuration is invalid:', errors);
  alert('Application configuration error: Please contact support. Error: Invalid Supabase configuration.');
} else {
  console.log('✅ Supabase configuration format is valid');
}

// Create the Supabase client with configuration from our config file
let supabase;
try {
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    { auth: SUPABASE_CONFIG.AUTH }
  );
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ Error creating Supabase client:', error.message);
  // Create a dummy client to prevent app crashes
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' }}),
      getUser: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' }}),
      getSession: () => Promise.resolve({ error: { message: 'Supabase client initialization failed' }}),
      onAuthStateChange: () => ({ subscription: { unsubscribe: () => {} }}),
      // Add other methods as needed
    }
  };
}

// Test the connection in development mode
if (process.env.NODE_ENV === 'development') {
  // Check connection
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase connection test failed:', error.message);
        console.error('This likely means your API key is incorrect or expired');
        console.error('Please log into https://app.supabase.com and get a fresh API key');
      } else {
        console.log('✅ Supabase connection successful', data.session ? 'User is logged in' : 'No active session');
      }
    })
    .catch(error => {
      console.error('❌ Supabase connection test error:', error.message);
    });
}

// Export as both default and named export to support both import styles
export { supabase };
export default supabase; 