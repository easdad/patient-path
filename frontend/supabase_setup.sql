-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table with organization details
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('hospital', 'ambulance')),
  organization_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Stores user profile information including organization details';

-- Create transport requests table
CREATE TABLE public.transport_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  requested_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.transport_requests IS 'Transport requests created by hospitals';

-- Create transport assignments table
CREATE TABLE public.transport_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.transport_requests(id) ON DELETE CASCADE,
  ambulance_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled')) DEFAULT 'accepted',
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.transport_assignments IS 'Transport assignments accepted by ambulance services';

-- Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Transport requests policies
CREATE POLICY "Hospitals can create transport requests"
    ON public.transport_requests
    FOR INSERT
    WITH CHECK (auth.uid() = hospital_id AND (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'hospital');

CREATE POLICY "Hospitals can view their own requests"
    ON public.transport_requests
    FOR SELECT
    USING (auth.uid() = hospital_id);

CREATE POLICY "Hospitals can update their own requests"
    ON public.transport_requests
    FOR UPDATE
    USING (auth.uid() = hospital_id);

CREATE POLICY "Ambulances can view all pending requests"
    ON public.transport_requests
    FOR SELECT
    USING ((SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'ambulance' AND status = 'pending');

CREATE POLICY "Ambulances can view assigned requests"
    ON public.transport_requests
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.transport_assignments
        WHERE request_id = public.transport_requests.id
        AND ambulance_id = auth.uid()
    ));

-- Transport assignments policies
CREATE POLICY "Ambulances can create assignments"
    ON public.transport_assignments
    FOR INSERT
    WITH CHECK (
        ambulance_id = auth.uid() AND
        (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'ambulance'
    );

CREATE POLICY "Ambulances can view their own assignments"
    ON public.transport_assignments
    FOR SELECT
    USING (ambulance_id = auth.uid());

CREATE POLICY "Hospitals can view assignments for their requests"
    ON public.transport_assignments
    FOR SELECT
    USING (
        (SELECT hospital_id FROM public.transport_requests WHERE id = request_id) = auth.uid()
    );

-- Create trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        user_type,
        organization_details
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'hospital'),
        COALESCE(NEW.raw_user_meta_data->'organization_details', '{}'::jsonb)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up the trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 