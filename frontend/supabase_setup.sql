-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table with organization details
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('hospital', 'ambulance')),
  organization_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transport requests table
CREATE TABLE IF NOT EXISTS transport_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hospital_id UUID REFERENCES profiles(id),
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  requested_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transport assignments table
CREATE TABLE IF NOT EXISTS transport_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES transport_requests(id) ON DELETE CASCADE,
  ambulance_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled')) DEFAULT 'accepted',
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Transport requests policies
CREATE POLICY "Hospitals can view own requests" 
  ON transport_requests FOR SELECT 
  USING (auth.uid() = hospital_id);

CREATE POLICY "Ambulance services can view all requests" 
  ON transport_requests FOR SELECT 
  USING ((SELECT user_type FROM profiles WHERE id = auth.uid()) = 'ambulance');

CREATE POLICY "Hospitals can create requests" 
  ON transport_requests FOR INSERT 
  WITH CHECK (
    auth.uid() = hospital_id AND 
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'hospital'
  );

CREATE POLICY "Hospitals can update own requests" 
  ON transport_requests FOR UPDATE 
  USING (
    auth.uid() = hospital_id AND 
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'hospital'
  );

-- Transport assignments policies
CREATE POLICY "Hospitals can view assignments for their requests" 
  ON transport_assignments FOR SELECT 
  USING (
    auth.uid() = (
      SELECT hospital_id FROM transport_requests 
      WHERE id = transport_assignments.request_id
    )
  );

CREATE POLICY "Ambulance services can view their assignments" 
  ON transport_assignments FOR SELECT 
  USING (
    auth.uid() = ambulance_id OR
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'ambulance'
  );

CREATE POLICY "Ambulance services can create assignments" 
  ON transport_assignments FOR INSERT 
  WITH CHECK (
    auth.uid() = ambulance_id AND
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'ambulance'
  );

CREATE POLICY "Ambulance services can update their assignments" 
  ON transport_assignments FOR UPDATE 
  USING (
    auth.uid() = ambulance_id AND
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'ambulance'
  );

-- Create trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, organization_details)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'user_type',
    jsonb_build_object(
      'name', new.raw_user_meta_data->>'organization_name',
      'address', new.raw_user_meta_data->>'organization_address',
      'city', new.raw_user_meta_data->>'organization_city',
      'state', new.raw_user_meta_data->>'organization_state',
      'zip', new.raw_user_meta_data->>'organization_zip',
      'phone', new.raw_user_meta_data->>'organization_phone',
      'hospital_type', new.raw_user_meta_data->>'hospital_type',
      'number_of_beds', new.raw_user_meta_data->>'number_of_beds',
      'fleet_size', new.raw_user_meta_data->>'fleet_size',
      'service_area', new.raw_user_meta_data->>'service_area'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 