-- Fix TPO admin access by updating RLS policies
-- This allows the TPO admin email to bypass role checks

-- Update placement_registrations RLS policies
DROP POLICY IF EXISTS "Admins can view all placement registrations" ON placement_registrations;
DROP POLICY IF EXISTS "Admins can insert placement registrations" ON placement_registrations;
DROP POLICY IF EXISTS "Admins can update placement registrations" ON placement_registrations;
DROP POLICY IF EXISTS "Admins can delete placement registrations" ON placement_registrations;

-- Create new policies that allow TPO admin email
CREATE POLICY "Admins can view all placement registrations" ON placement_registrations
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );

CREATE POLICY "Admins can insert placement registrations" ON placement_registrations
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );

CREATE POLICY "Admins can update placement registrations" ON placement_registrations
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );

CREATE POLICY "Admins can delete placement registrations" ON placement_registrations
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );

-- Update placement_upload_logs RLS policies
DROP POLICY IF EXISTS "Admins can view all upload logs" ON placement_upload_logs;
DROP POLICY IF EXISTS "Admins can insert upload logs" ON placement_upload_logs;

-- Create new policies that allow TPO admin email
CREATE POLICY "Admins can view all upload logs" ON placement_upload_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );

CREATE POLICY "Admins can insert upload logs" ON placement_upload_logs
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'ADMIN' OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );
