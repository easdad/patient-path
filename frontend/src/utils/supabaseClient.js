import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://aadkpnqvfnqzxruvbqfa.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGtwbnF2Zm5xenhydXZicWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQwMDUsImV4cCI6MjA1NjgwMDAwNX0.GdQFXPtmijTvO2UhHsyk1V8nd-YY1bCZAtbbfzU3FRM';

// Log a warning if environment variables are not found
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or key missing from environment variables. Using fallback values.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 