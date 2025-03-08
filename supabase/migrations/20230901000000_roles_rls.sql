-- This migration creates Row Level Security (RLS) policies based on roles

-- Enable RLS on tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (so we can recreate them)
DROP POLICY IF EXISTS "Developers can view any profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Developers can update any profile" ON profiles;

DROP POLICY IF EXISTS "Developers can view any transport request" ON transport_requests;
DROP POLICY IF EXISTS "Hospitals can view their own transport requests" ON transport_requests;
DROP POLICY IF EXISTS "Ambulances can view all transport requests" ON transport_requests;
DROP POLICY IF EXISTS "Hospitals can create transport requests" ON transport_requests;
DROP POLICY IF EXISTS "Hospitals can update their own transport requests" ON transport_requests;
DROP POLICY IF EXISTS "Ambulances can update transport requests" ON transport_requests;
DROP POLICY IF EXISTS "Developers can update any transport request" ON transport_requests;

-- Create new policies

-- PROFILE POLICIES

-- Allow developers to view all profiles
CREATE POLICY "Developers can view any profile"
ON profiles
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'developer'
);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (
  auth.uid() = id
);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (
  auth.uid() = id
);

-- Allow developers to update any profile
CREATE POLICY "Developers can update any profile"
ON profiles
FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'developer'
);

-- TRANSPORT REQUEST POLICIES

-- Allow developers to view all transport requests
CREATE POLICY "Developers can view any transport request"
ON transport_requests
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'developer'
);

-- Allow hospitals to view their own transport requests
CREATE POLICY "Hospitals can view their own transport requests"
ON transport_requests
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'hospital' AND hospital_id = auth.uid()
);

-- Allow ambulances to view all transport requests
CREATE POLICY "Ambulances can view all transport requests"
ON transport_requests
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'ambulance'
);

-- Allow hospitals to create transport requests
CREATE POLICY "Hospitals can create transport requests"
ON transport_requests
FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'hospital' AND hospital_id = auth.uid()
);

-- Allow hospitals to update their own transport requests
CREATE POLICY "Hospitals can update their own transport requests"
ON transport_requests
FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'hospital' AND hospital_id = auth.uid()
);

-- Allow ambulances to update transport requests (for accepting/completing requests)
CREATE POLICY "Ambulances can update transport requests"
ON transport_requests
FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'ambulance'
);

-- Allow developers to update any transport request
CREATE POLICY "Developers can update any transport request"
ON transport_requests
FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'developer'
);

-- TRIGGER FOR SYNCING user_type TO app_metadata.role

-- Create a function that syncs user_type with app_metadata.role
CREATE OR REPLACE FUNCTION sync_user_type_to_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if user_type has changed
  IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    -- Call Supabase's admin function to update the user's app_metadata
    PERFORM
      supabase_functions.http(
        'POST',
        'https://aadkpnqvfnqzxruvbqfa.supabase.co/functions/v1/update-user-role',
        '{"Authorization":"Bearer ' || current_setting('request.jwt.claim.sub', true) || '"}',
        'application/json',
        json_build_object('user_id', NEW.id, 'role', NEW.user_type)::text
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires after a profile is updated
CREATE OR REPLACE TRIGGER sync_user_type_to_role_trigger
AFTER UPDATE OF user_type ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_user_type_to_role(); 