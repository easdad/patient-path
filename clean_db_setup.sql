-- COMPLETE DATABASE SETUP FOR PATIENT PATH
-- This script will create the necessary tables, triggers, and RLS policies
-- This should replace any previous setup scripts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================================================================
-- SECTION 1: DROP EXISTING POLICIES AND TABLES
-- ==================================================================

-- First, drop all existing RLS policies by name to ensure a clean slate
-- Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Hospital staff can view ambulance profiles" ON public.profiles;
DROP POLICY IF EXISTS "Ambulance staff can view hospital profiles" ON public.profiles;
DROP POLICY IF EXISTS "Developers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "View profiles based on role relationships" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users full access to profiles" ON public.profiles;

-- Patients table policies
DROP POLICY IF EXISTS "Hospital staff can CRUD their own patients" ON public.patients;
DROP POLICY IF EXISTS "Ambulance staff can view assigned patients" ON public.patients;
DROP POLICY IF EXISTS "Developers can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Manage patients" ON public.patients;
DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON public.patients;

-- Transport requests table policies
DROP POLICY IF EXISTS "Hospital staff can CRUD their own transport requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Ambulance staff can view and update assigned requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Developers can view all transport requests" ON public.transport_requests;
DROP POLICY IF EXISTS "View transport requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Manage transport requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Allow authenticated users full access to transport_requests" ON public.transport_requests;

-- Transport updates table policies
DROP POLICY IF EXISTS "Users can view updates for their transports" ON public.transport_updates;
DROP POLICY IF EXISTS "Users can create updates for their transports" ON public.transport_updates;
DROP POLICY IF EXISTS "Developers can view all transport updates" ON public.transport_updates;
DROP POLICY IF EXISTS "View transport updates" ON public.transport_updates;
DROP POLICY IF EXISTS "Create transport updates" ON public.transport_updates;
DROP POLICY IF EXISTS "Allow authenticated users full access to transport_updates" ON public.transport_updates;

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "View own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Create notifications" ON public.notifications;

-- Storage policies
DROP POLICY IF EXISTS "Public profile images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "View profile images" ON storage.objects;
DROP POLICY IF EXISTS "Manage profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users full access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Developers can view all objects" ON storage.objects;

-- Drop existing triggers on auth.users to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_profile_role_updated ON public.profiles;

-- ==================================================================
-- SECTION 2: STORAGE SETUP
-- ==================================================================

-- Create storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_images', 'profile_images', true)
ON CONFLICT (id) DO NOTHING;

-- ==================================================================
-- SECTION 3: TABLE CREATION
-- ==================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL DEFAULT 'hospital',
  organization_name TEXT,
  organization_address TEXT,
  contact_number TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES public.profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  medical_record_number TEXT,
  condition TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transport_requests table
CREATE TABLE IF NOT EXISTS public.transport_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.profiles(id),
  ambulance_id UUID REFERENCES public.profiles(id),
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  requested_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'requested',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transport_updates table for real-time status updates
CREATE TABLE IF NOT EXISTS public.transport_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transport_id UUID REFERENCES public.transport_requests(id) ON DELETE CASCADE,
  update_type TEXT CHECK (update_type IN ('status_change', 'location_update', 'eta_update', 'note')),
  status TEXT,
  location TEXT,
  eta TIMESTAMP WITH TIME ZONE,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ==================================================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- ==================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==================================================================
-- SECTION 5: CREATE SIMPLE, SECURE RLS POLICIES
-- ==================================================================

-- PROFILES TABLE POLICIES -----------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can view profiles based on role relationships (fixed version)
CREATE POLICY "View profiles based on role relationships" ON public.profiles
  FOR SELECT USING (
    -- Hospital staff can see ambulance profiles
    (auth.jwt() ->> 'role' = 'hospital' AND user_type = 'ambulance')
    OR
    -- Ambulance staff can see hospital profiles
    (auth.jwt() ->> 'role' = 'ambulance' AND user_type = 'hospital')
    OR
    -- Developers can see all profiles
    (auth.jwt() ->> 'role' = 'developer')
  );

-- Fallback policy for accessing profiles during authentication
CREATE POLICY "Access own profile during authentication" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- PATIENTS TABLE POLICIES -----------------------------------------

-- Hospital staff can CRUD their own patients
CREATE POLICY "Manage patients" ON public.patients
  USING (
    (auth.uid() = hospital_id) -- Hospital staff
    OR
    (EXISTS ( -- Ambulance staff with assigned transports
      SELECT 1 FROM public.transport_requests tr
      WHERE tr.patient_id = patients.id
      AND tr.ambulance_id = auth.uid()
    ))
    OR
    (auth.jwt() ->> 'role' = 'developer') -- Developers
  )
  WITH CHECK (
    (auth.uid() = hospital_id) -- Only hospitals can create/modify
    OR
    (auth.jwt() ->> 'role' = 'developer') -- Developers
  );

-- TRANSPORT REQUESTS TABLE POLICIES ------------------------------

-- Policy for viewing transport requests
CREATE POLICY "View transport requests" ON public.transport_requests
  FOR SELECT USING (
    auth.uid() = hospital_id -- Hospital that created the request
    OR
    auth.uid() = ambulance_id -- Assigned ambulance
    OR
    (status = 'requested' AND auth.jwt() ->> 'role' = 'ambulance') -- Open requests visible to all ambulances
    OR
    auth.jwt() ->> 'role' = 'developer' -- Developers see all
  );

-- Policy for creating/updating transport requests
CREATE POLICY "Manage transport requests" ON public.transport_requests
  USING (
    (auth.uid() = hospital_id) -- Hospital
    OR
    (auth.uid() = ambulance_id) -- Assigned ambulance
    OR
    (status = 'requested' AND ambulance_id IS NULL AND auth.jwt() ->> 'role' = 'ambulance') -- Available for claim
    OR
    (auth.jwt() ->> 'role' = 'developer') -- Developers
  )
  WITH CHECK (
    (auth.uid() = hospital_id) -- Hospital creating/updating own request
    OR
    (auth.uid() = ambulance_id) -- Assigned ambulance updating
    OR
    (status = 'requested' AND auth.jwt() ->> 'role' = 'ambulance') -- Ambulance claiming
    OR
    (auth.jwt() ->> 'role' = 'developer') -- Developers
  );

-- TRANSPORT UPDATES TABLE POLICIES -------------------------------

-- Policy for viewing transport updates
CREATE POLICY "View transport updates" ON public.transport_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transport_requests tr
      WHERE tr.id = transport_updates.transport_id
      AND (tr.hospital_id = auth.uid() OR tr.ambulance_id = auth.uid())
    )
    OR
    auth.jwt() ->> 'role' = 'developer'
  );

-- Policy for creating transport updates
CREATE POLICY "Create transport updates" ON public.transport_updates
  FOR INSERT WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM public.transport_requests tr
        WHERE tr.id = transport_updates.transport_id
        AND (tr.hospital_id = auth.uid() OR tr.ambulance_id = auth.uid())
      )
      AND
      created_by = auth.uid()
    )
    OR
    auth.jwt() ->> 'role' = 'developer'
  );

-- NOTIFICATIONS TABLE POLICIES ---------------------------------

-- Users can view their own notifications
CREATE POLICY "View own notifications" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    auth.jwt() ->> 'role' = 'developer'
  );

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users with appropriate roles can create notifications for others
CREATE POLICY "Create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    user_id = auth.uid() -- Self notifications always allowed
    OR
    (
      -- Hospital staff can notify assigned ambulance
      auth.jwt() ->> 'role' = 'hospital'
      AND
      user_id IN (
        SELECT ambulance_id FROM public.transport_requests 
        WHERE hospital_id = auth.uid()
      )
    )
    OR
    (
      -- Ambulance staff can notify requesting hospital
      auth.jwt() ->> 'role' = 'ambulance'
      AND
      user_id IN (
        SELECT hospital_id FROM public.transport_requests 
        WHERE ambulance_id = auth.uid()
      )
    )
    OR
    auth.jwt() ->> 'role' = 'developer'
  );

-- STORAGE POLICIES ---------------------------------------------

-- Users can view their own profile images
CREATE POLICY "View profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile_images'
    AND (
      -- Own images
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Or authenticated users can view profile images
      auth.role() = 'authenticated'
    )
  );

-- Users can upload/update their own profile images
CREATE POLICY "Manage profile images" ON storage.objects
  USING (
    bucket_id = 'profile_images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile_images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==================================================================
-- SECTION 6: USER MANAGEMENT AND TRIGGERS
-- ==================================================================

-- Function to handle new user creation and auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    user_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'hospital')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile when user is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Function to sync user_type to role in app_metadata when profile is updated
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Only perform the update if user_type has changed
  IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    -- Note: This requires a separate serverless function with admin privileges
    -- The actual update would be handled there
    -- Here we're just noting that a change occurred
    INSERT INTO public.notifications (
      user_id,
      title,
      message
    ) VALUES (
      NEW.id,
      'Role Updated',
      'Your user role has been updated to ' || NEW.user_type || '.'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user role updates
CREATE TRIGGER on_profile_role_updated
  AFTER UPDATE OF user_type ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_to_metadata();

-- ==================================================================
-- SECTION 7: INDEXES FOR BETTER PERFORMANCE
-- ==================================================================

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON public.patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_hospital_id ON public.transport_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_ambulance_id ON public.transport_requests(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_status ON public.transport_requests(status);
CREATE INDEX IF NOT EXISTS idx_transport_updates_transport_id ON public.transport_updates(transport_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ==================================================================
-- SECTION 8: REALTIME SETUP
-- ==================================================================

-- Enable realtime for key tables
ALTER TABLE public.transport_requests REPLICA IDENTITY FULL;
ALTER TABLE public.transport_updates REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Set up publication for realtime updates
DROP PUBLICATION IF EXISTS patient_path_realtime;
CREATE PUBLICATION patient_path_realtime FOR TABLE
  public.transport_requests,
  public.transport_updates,
  public.notifications; 