# Developer Mode Setup for Patient PATH

This guide explains how to set up and use the special developer mode for the Patient PATH application.

## Developer Account

The application includes a special developer account with permissions to access all areas of the site and additional development tools.

### Account Details

```
Email: easdad.jm@gmail.com
Password: $p3@kFr!3nd
```

## Setting Up the Developer Account

1. Make sure you have the following environment variables set in your `.env` file:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run the developer account setup script:
   ```bash
   # Install dependencies if you haven't already
   npm install

   # Run the setup script
   node devSetup.js
   ```

3. After running the script, you'll need to verify the email address:
   - Check the email inbox for the verification link
   - Or verify the account manually in the Supabase dashboard

## Using Developer Mode

1. Log in with the developer account credentials:
   ```
   Email: easdad.jm@gmail.com
   Password: $p3@kFr!3nd
   ```

2. Once logged in, you'll have access to:
   - A floating developer toolbar (toggle with Ctrl+Shift+D)
   - The developer dashboard at `/dev-dashboard`
   - Access to both Hospital and Ambulance dashboards

## Developer Toolbar Features

The developer toolbar provides several useful tools:

- **User Info**: Shows your current user details
- **Navigation**: Quick links to different dashboards
- **System Stats**: View key metrics about the application
- **Tools**:
  - Clear LocalStorage
  - Reset test data
  - Simulate errors
  - Hide the toolbar
- **Authentication**: Tools for testing login/logout flows

## Developer Dashboard

The developer dashboard (`/dev-dashboard`) includes:

- **User Management**: View, modify, and delete user accounts
- **Transport Requests**: View and manage all transport requests
- **System Logs**: Monitor application logs
- **Performance Stats**: View system health metrics

## How It Works

The developer mode implementation includes:

1. **Special Authentication**: The `AuthContext` recognizes the developer email and grants special privileges
2. **Protected Routes**: The `ProtectedRoute` component allows developers to access all routes
3. **Conditional Rendering**: The dev toolbar is only shown to the developer account
4. **Admin Dashboard**: A special dashboard with administration capabilities

## Development vs. Production

The developer account and tools are designed for the development environment. For production:

1. Change the developer email and password
2. Consider disabling the developer toolbar in production builds
3. Implement proper role-based access controls for production admin users 