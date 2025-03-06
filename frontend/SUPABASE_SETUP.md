# Supabase Setup for Patient PATH

This document outlines the steps needed to configure Supabase for the Patient PATH application.

## Credentials

Your Supabase project is already configured with the following credentials:

- **URL**: https://aadkpnqvfnqzxruvbqfa.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGtwbnF2Zm5xenhydXZicWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjQwMDUsImV4cCI6MjA1NjgwMDAwNX0.GdQFXPtmijTvO2UhHsyk1V8nd-YY1bCZAtbbfzU3FRM

These credentials have been added directly to the `supabaseClient.js` file.

## Database Setup

To set up the required database schema:

1. Login to your Supabase dashboard at [https://app.supabase.com](https://app.supabase.com)
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `supabase_setup.sql` file
5. Run the SQL script

This will create:
- A profiles table for user information
- A transport_requests table for hospital transport requests
- A transport_assignments table for ambulance service assignments
- Row Level Security policies to protect the data
- A trigger to automatically create profiles for new users

## Authentication Setup

To configure authentication:

1. Go to Authentication → Settings in your Supabase dashboard
2. Ensure Email Auth is enabled
3. Configure your Site URL (should match your application's URL)
4. For local development, add `http://localhost:3000` to the Additional Redirect URLs

### Social Authentication Setup (Optional)

For Google authentication:
1. Go to Authentication → Providers → Google
2. Enable Google authentication
3. Create OAuth credentials in Google Cloud Console
4. Add your Google Client ID and Secret
5. Add your application's redirect URL to Google's allowed redirect URLs

For Apple authentication:
1. Go to Authentication → Providers → Apple
2. Enable Apple authentication
3. Set up Sign in with Apple in your Apple Developer account
4. Add your Apple Service ID, Team ID, Key ID, and Private Key
5. Add your application's redirect URL to Apple's allowed redirect URLs

## Testing the Setup

After completing these steps:

1. Start your development server
2. Try registering a new user
3. Confirm the user appears in the Supabase Authentication dashboard
4. Verify that a corresponding profile was created in the profiles table
5. Test login functionality
6. Test protected routes and dashboard access based on user type

## Troubleshooting

If you encounter authentication issues:
- Check that your Supabase URL and Anon Key are correct
- Ensure the redirects are properly configured in Authentication Settings
- Check browser console for any errors
- Verify RLS policies are correctly set up if database access is failing

For database issues:
- Check that the tables were created successfully
- Ensure the RLS policies are allowing the correct access
- Test queries directly in the SQL Editor to isolate issues 