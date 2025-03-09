-- Patient PATH Supabase Setup
-- This file contains all the SQL needed to set up the Supabase database for Patient PATH

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_images', 'profile_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create secure policies for storage
CREATE POLICY "Public profile images are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile_images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

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

-- Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Fixed policies to avoid recursion
CREATE POLICY "Hospital staff can view ambulance profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT id FROM public.profiles WHERE user_type = 'hospital'
      )
    )
    AND user_type = 'ambulance'
  );

CREATE POLICY "Ambulance staff can view hospital profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT id FROM public.profiles WHERE user_type = 'ambulance'
      )
    )
    AND user_type = 'hospital'
  );

CREATE POLICY "Developers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND auth.users.raw_app_meta_data->>'role' = 'developer'
    )
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

-- Create RLS policies for patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospital staff can CRUD their own patients" ON public.patients
  USING (hospital_id = auth.uid())
  WITH CHECK (hospital_id = auth.uid());

CREATE POLICY "Ambulance staff can view assigned patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transport_requests tr
      WHERE tr.patient_id = patients.id
      AND tr.ambulance_id = auth.uid()
    )
  );

CREATE POLICY "Developers can view all patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND auth.users.raw_app_meta_data->>'role' = 'developer'
    )
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

-- Create RLS policies for transport_requests
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospital staff can CRUD their own transport requests" ON public.transport_requests
  USING (hospital_id = auth.uid())
  WITH CHECK (hospital_id = auth.uid());

CREATE POLICY "Ambulance staff can view and update assigned requests" ON public.transport_requests
  USING (ambulance_id = auth.uid() OR status = 'requested')
  WITH CHECK (ambulance_id = auth.uid());

CREATE POLICY "Developers can view all transport requests" ON public.transport_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND auth.users.raw_app_meta_data->>'role' = 'developer'
    )
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

-- Create RLS policies for transport_updates
ALTER TABLE public.transport_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view updates for their transports" ON public.transport_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transport_requests tr
      WHERE tr.id = transport_updates.transport_id
      AND (tr.hospital_id = auth.uid() OR tr.ambulance_id = auth.uid())
    )
  );

CREATE POLICY "Users can create updates for their transports" ON public.transport_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transport_requests tr
      WHERE tr.id = transport_updates.transport_id
      AND (tr.hospital_id = auth.uid() OR tr.ambulance_id = auth.uid())
    )
  );

CREATE POLICY "Developers can view all transport updates" ON public.transport_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND auth.users.raw_app_meta_data->>'role' = 'developer'
    )
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

-- Create RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
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

-- Create function to update profiles when users are updated
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

-- Create function to set developer role
CREATE OR REPLACE FUNCTION public.set_developer_role(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
  v_allowed BOOLEAN := FALSE;
BEGIN
  -- Get the user's email
  SELECT email INTO v_email FROM auth.users WHERE id = user_id;
  
  -- Check if the email is in the allowed list (this would be configured in your app)
  -- For security, this is just a placeholder. In production, you'd check against a secure list
  -- or use the Supabase Edge Function approach
  IF v_email IN ('developer@example.com', 'admin@patientpath.org') THEN
    v_allowed := TRUE;
  END IF;
  
  -- Only proceed if allowed
  IF v_allowed THEN
    -- Update the user's app_metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      CASE 
        WHEN raw_app_meta_data IS NULL THEN jsonb_build_object('role', 'developer')
        ELSE jsonb_set(raw_app_meta_data, '{role}', '"developer"')
      END
    WHERE id = user_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update transport request status
CREATE OR REPLACE FUNCTION public.update_transport_status(transport_id UUID, new_status TEXT, update_note TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_transport public.transport_requests;
BEGIN
  -- Get the transport request
  SELECT * INTO v_transport FROM public.transport_requests WHERE id = transport_id;
  
  -- Check if the transport exists
  IF v_transport IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user is authorized to update this transport
  IF auth.uid() != v_transport.hospital_id AND auth.uid() != v_transport.ambulance_id THEN
    -- Check if user is a developer
    IF NOT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND auth.users.raw_app_meta_data->>'role' = 'developer'
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Update the transport status
  UPDATE public.transport_requests
  SET 
    status = new_status,
    updated_at = now()
  WHERE id = transport_id;
  
  -- Create a status update record
  INSERT INTO public.transport_updates (
    transport_id,
    update_type,
    status,
    note,
    created_by
  ) VALUES (
    transport_id,
    'status_change',
    new_status,
    update_note,
    auth.uid()
  );
  
  -- Create notifications for relevant parties
  IF v_transport.hospital_id IS NOT NULL AND v_transport.hospital_id != auth.uid() THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      related_entity_type,
      related_entity_id
    ) VALUES (
      v_transport.hospital_id,
      'Transport Status Updated',
      'Transport request status changed to ' || new_status,
      'transport_request',
      transport_id
    );
  END IF;
  
  IF v_transport.ambulance_id IS NOT NULL AND v_transport.ambulance_id != auth.uid() THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      related_entity_type,
      related_entity_id
    ) VALUES (
      v_transport.ambulance_id,
      'Transport Status Updated',
      'Transport request status changed to ' || new_status,
      'transport_request',
      transport_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create realtime publication for transport updates
DROP PUBLICATION IF EXISTS transport_updates_pub;
CREATE PUBLICATION transport_updates_pub FOR TABLE
  public.transport_requests,
  public.transport_updates,
  public.notifications;

-- Enable realtime for these tables
ALTER TABLE public.transport_requests REPLICA IDENTITY FULL;
ALTER TABLE public.transport_updates REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON public.patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_hospital_id ON public.transport_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_ambulance_id ON public.transport_requests(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_status ON public.transport_requests(status);
CREATE INDEX IF NOT EXISTS idx_transport_updates_transport_id ON public.transport_updates(transport_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Add comment to explain the setup
COMMENT ON DATABASE postgres IS 'Patient PATH application database setup'; 