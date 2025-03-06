import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with direct values
// In production, these should come from environment variables
const supabaseUrl = 'https://aadkpnqvfnqzxruvbqfa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGtwbnF2Zm5xenhydXZicWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQwMDUsImV4cCI6MjA1NjgwMDAwNX0.GdQFXPtmijTvO2UhHsyk1V8nd-YY1bCZAtbbfzU3FRM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 