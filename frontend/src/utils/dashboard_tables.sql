-- This file contains SQL commands to set up the required tables for the dashboard
-- To use this, go to the SQL Editor in your Supabase dashboard and run these commands

-- Dashboard stats for hospitals
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  total_transports INTEGER DEFAULT 0,
  completed_transports INTEGER DEFAULT 0,
  active_transports INTEGER DEFAULT 0,
  pending_approval INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard stats for ambulance services
CREATE TABLE IF NOT EXISTS ambulance_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  total_transports INTEGER DEFAULT 0,
  completed_transports INTEGER DEFAULT 0,
  active_cases INTEGER DEFAULT 0,
  available_vehicles INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities for hospital dashboard
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  data JSONB DEFAULT NULL
);

-- Notifications for dashboard
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type VARCHAR(50) DEFAULT 'info'
);

-- Transport requests
CREATE TABLE IF NOT EXISTS transport_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES auth.users NOT NULL,
  ambulance_id UUID REFERENCES auth.users,
  patient_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  patient_details JSONB DEFAULT NULL
);

-- Set up RLS policies for these tables
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own stats
CREATE POLICY dashboard_stats_policy ON dashboard_stats
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY ambulance_stats_policy ON ambulance_stats
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to see their own activities
CREATE POLICY activities_policy ON activities
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to see their own notifications
CREATE POLICY notifications_policy ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Transport requests policies - more complex for different user types
-- Hospitals can see their own requests
CREATE POLICY hospital_transport_policy ON transport_requests
  FOR ALL
  TO authenticated
  USING (hospital_id = auth.uid());

-- Ambulances can see requests assigned to them
CREATE POLICY ambulance_transport_policy ON transport_requests
  FOR SELECT
  TO authenticated
  USING (ambulance_id = auth.uid());

-- Sample data insertion function - uncomment and modify as needed
/*
-- Insert sample data for testing
INSERT INTO dashboard_stats (user_id, total_transports, completed_transports, active_transports, pending_approval)
VALUES 
  ('your-hospital-user-id', 42, 35, 4, 3);

INSERT INTO ambulance_stats (user_id, total_transports, completed_transports, active_cases, available_vehicles)
VALUES 
  ('your-ambulance-user-id', 24, 18, 3, 5);

INSERT INTO activities (user_id, type, content, status)
VALUES 
  ('your-hospital-user-id', 'transport_request', 'Transport request for patient #12458 was created', 'pending'),
  ('your-hospital-user-id', 'transport_assigned', 'City Ambulance Service accepted transport request #4589', 'active'),
  ('your-hospital-user-id', 'transport_completed', 'Transport #4582 was completed successfully', 'completed');

INSERT INTO notifications (user_id, title, message)
VALUES 
  ('your-hospital-user-id', 'Transport Request Update', 'Your transport request for patient Johnson has been accepted'),
  ('your-hospital-user-id', 'System Maintenance', 'The system will be down for maintenance tonight from 2AM to 4AM');

INSERT INTO transport_requests (hospital_id, ambulance_id, patient_name, status, priority, pickup_location, destination)
VALUES 
  ('your-hospital-user-id', 'your-ambulance-user-id', 'John Smith', 'in_progress', 'high', 'Memorial Hospital', 'County General'),
  ('your-hospital-user-id', 'your-ambulance-user-id', 'Mary Johnson', 'assigned', 'medium', 'Sunset Clinic', 'Riverside Medical Center');
*/ 