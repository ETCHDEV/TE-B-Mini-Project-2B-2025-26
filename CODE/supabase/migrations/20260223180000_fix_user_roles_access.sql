-- Fix user_roles table access for TPO admin
-- This allows the TPO admin to view and manage user roles

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Service role manages roles" ON user_roles;

-- Create new policies that allow TPO admin email
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );

CREATE POLICY "Service role manages roles" ON user_roles
  FOR ALL USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com'
  );

-- Also allow TPO admin to access auth.users for user management
-- This requires a function to bypass RLS for admin

CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is TPO admin
  IF auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com' THEN
    RETURN QUERY
    SELECT 
      u.id as user_id,
      u.email,
      u.created_at,
      u.last_sign_in_at,
      u.email_confirmed_at,
      COALESCE(ur.role, 'student') as role
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    ORDER BY u.created_at DESC;
  END IF;
END;
$$;
