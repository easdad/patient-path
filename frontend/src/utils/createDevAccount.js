/**
 * This script creates a developer account with admin privileges in Supabase
 * Run this script once to set up the developer account
 */

import { supabase } from './supabaseClient';

const DEV_EMAIL = 'easdad.jm@gmail.com';
const DEV_PASSWORD = '$p3@kFr!3nd';

const createDevAccount = async () => {
  try {
    console.log('Creating developer account...');
    
    // Check if account already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', DEV_EMAIL);
    
    if (checkError) throw checkError;
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('Developer account already exists');
      return;
    }
    
    // Create new user account
    const { data, error } = await supabase.auth.signUp({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      options: {
        data: {
          user_type: 'developer',
          full_name: 'Developer Account',
          organization_details: {
            name: 'Admin Organization',
            address: '123 Dev Street',
            contact_number: '555-DEV-MODE',
            admin_privileges: true
          }
        }
      }
    });
    
    if (error) throw error;
    
    console.log('Developer account created successfully:', data.user.id);
    
    // Force confirm the email (this would typically be done by an admin in Supabase dashboard)
    // Note: This part won't work with this client-side script.
    // You'll need to verify the email address through the Supabase dashboard or API.
    
    console.log('Please verify the email address in the Supabase dashboard');
    console.log('Then you can log in with:');
    console.log(`Email: ${DEV_EMAIL}`);
    console.log(`Password: ${DEV_PASSWORD}`);
    
    return data;
  } catch (error) {
    console.error('Error creating developer account:', error);
    throw error;
  }
};

// Call the function
createDevAccount();

export default createDevAccount; 