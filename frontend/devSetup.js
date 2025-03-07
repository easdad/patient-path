/**
 * Developer Account Setup Script
 * 
 * This script creates a developer account in Supabase with admin privileges
 * Run this script once to set up the developer account
 */

// Import required dependencies
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Developer account credentials
const DEV_EMAIL = 'easdad.jm@gmail.com';
const DEV_PASSWORD = '$p3@kFr!3nd';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDevAccount() {
  try {
    console.log('🔧 Setting up developer account...');
    
    // Check if account already exists
    console.log('Checking if developer account already exists...');
    
    // First, try to sign in with the credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEV_EMAIL,
      password: DEV_PASSWORD
    });
    
    if (!signInError) {
      console.log('✅ Developer account already exists and credentials are valid.');
      
      // Update user metadata to ensure it has developer type
      const { error: updateError } = await supabase.auth.updateUser({
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
      });
      
      if (updateError) {
        console.error('Error updating user metadata:', updateError.message);
      } else {
        console.log('✅ Updated user metadata to ensure developer privileges.');
      }
      
      return signInData.user;
    }
    
    // If sign-in fails, create the account
    console.log('Creating new developer account...');
    
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
    
    if (error) {
      throw new Error(`Error creating developer account: ${error.message}`);
    }
    
    console.log('✅ Developer account created successfully!');
    console.log('User ID:', data.user.id);
    
    console.log('\n⚠️ IMPORTANT: You need to verify the email address in Supabase dashboard');
    console.log('Or click the verification link sent to', DEV_EMAIL);
    
    return data.user;
  } catch (error) {
    console.error('❌ Error in setup process:', error.message);
  }
}

// Run the setup
setupDevAccount()
  .then(() => {
    console.log('\n✨ Setup complete!');
    console.log('Dev account details:');
    console.log(`Email: ${DEV_EMAIL}`);
    console.log(`Password: ${DEV_PASSWORD}`);
    console.log('\nYou can now log in with these credentials to access the developer dashboard.');
  })
  .catch(err => {
    console.error('Fatal error:', err);
  }); 