-- Create placement_registrations table
CREATE TABLE IF NOT EXISTS placement_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Registered', 'Unregistered', 'Shortlisted', 'Rejected')),
  registration_email_sent BOOLEAN DEFAULT FALSE,
  shortlist_email_sent BOOLEAN DEFAULT FALSE,
  drive_id TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create placement_upload_logs table
CREATE TABLE IF NOT EXISTS placement_upload_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  total_students INTEGER NOT NULL,
  registered_count INTEGER NOT NULL DEFAULT 0,
  shortlisted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_placement_registrations_email ON placement_registrations(email);
CREATE INDEX IF NOT EXISTS idx_placement_registrations_status ON placement_registrations(status);
CREATE INDEX IF NOT EXISTS idx_placement_registrations_drive_id ON placement_registrations(drive_id);
CREATE INDEX IF NOT EXISTS idx_placement_registrations_email_sent ON placement_registrations(registration_email_sent);
CREATE INDEX IF NOT EXISTS idx_placement_registrations_shortlist_sent ON placement_registrations(shortlist_email_sent);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_placement_registrations_unique_email_drive 
ON placement_registrations(email, COALESCE(drive_id, ''));

-- Enable RLS
ALTER TABLE placement_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_upload_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for placement_registrations
CREATE POLICY "Admins can view all placement registrations" ON placement_registrations
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins can insert placement registrations" ON placement_registrations
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins can update placement registrations" ON placement_registrations
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins can delete placement registrations" ON placement_registrations
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

-- RLS policies for placement_upload_logs
CREATE POLICY "Admins can view all upload logs" ON placement_upload_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

CREATE POLICY "Admins can insert upload logs" ON placement_upload_logs
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_placement_registrations_updated_at 
  BEFORE UPDATE ON placement_registrations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
