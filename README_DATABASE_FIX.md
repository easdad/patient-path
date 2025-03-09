# Patient Path Database Fix Guide

This guide provides instructions for fixing the database issues in the Patient Path application.

## Overview of the Fix

The database fix addresses the following issues:

1. Inconsistent environment variables
2. Overly permissive Row Level Security (RLS) policies
3. User role synchronization problems
4. Trigger conflicts
5. Unclear data access patterns

## Implementation Steps

### 1. Environment Configuration

We've consolidated all environment settings into a single `.env` file in the `frontend` directory:

```
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://mtrmxzywxfklltwuxtgb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cm14enl3eGZrbGx0d3V4dGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzEwMzksImV4cCI6MjA1NzA0NzAzOX0.WO9gM5kfhIvLiS7PNbbAmayYKfpPiCocahyXAUtTcdY

# Application Configuration
REACT_APP_NAME=Patient PATH
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_REAL_TIME=true
```

### 2. Database Schema and RLS Policies

We've created a clean, comprehensive database setup script in `clean_db_setup.sql`. This script:

1. Drops all existing conflicting policies
2. Creates the necessary tables with proper relationships
3. Implements secure but functional RLS policies
4. Sets up triggers for user creation and updates
5. Adds performance-optimizing indexes
6. Configures realtime functionality

**To apply these changes:**

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `clean_db_setup.sql`
4. Run the script

### 3. Role Synchronization

We've implemented a simple but effective role synchronization solution:

1. A new Edge Function `sync-user-role` updates auth.users metadata when profile user_type changes
2. A database trigger `trigger_sync_user_role` calls this function automatically 

**To deploy the Edge Function:**

1. In the Supabase dashboard, go to Edge Functions
2. Create a new function called `sync-user-role`
3. Copy the contents of `supabase/functions/sync-user-role/index.ts`
4. Deploy the function

**To set up the trigger:**

1. Go to the SQL Editor
2. Copy the contents of `trigger_sync_role.sql`
3. Run the script

### 4. Clean Up Conflicting Files

To prevent confusion, we've removed:

- `simplified_rls_policy.sql` - Replaced with our secure policy
- Multiple environment files - Consolidated into a single `.env`

### 5. Authentication Context

The existing authentication context in `frontend/src/utils/AuthContext.js` already has the correct logic for handling user roles, checking both:

1. `app_metadata.role` (primary source)
2. `profiles.user_type` (fallback)

No changes are needed in the authentication code once our database fixes are applied.

## Testing the Fix

After implementing these changes, you should:

1. Register a new user
2. Verify the user appears in auth.users
3. Confirm a corresponding profile record is created
4. Try changing the user_type in the profile
5. Verify the app_metadata.role is updated to match
6. Test data access with different user types

## Conclusion

These changes establish a solid foundation for the Patient Path application with:

- Properly secured data
- Efficient role management
- Clear data access patterns
- Simplified but effective security model

The fixes address the immediate issues while maintaining the core functionality of the application. 