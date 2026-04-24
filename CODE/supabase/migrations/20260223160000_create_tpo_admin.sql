-- Create TPO admin user role assignment
-- This migration assumes the TPO admin user will be created through Supabase Auth
-- and then assigns the TPO role to the specific email

-- Function to assign TPO role to admin email
CREATE OR REPLACE FUNCTION assign_tpo_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for the admin email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'muazshaikh7861@gmail.com';
  
  -- Only proceed if user exists
  IF admin_user_id IS NOT NULL THEN
    -- Insert TPO role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'tpo')
    ON CONFLICT (user_id, role) DO UPDATE SET role = 'tpo';
    
    RAISE NOTICE 'TPO role assigned to admin user: %', admin_user_id;
  END IF;
END $$;

-- Execute the function
SELECT assign_tpo_role();

-- Clean up the function
DROP FUNCTION IF EXISTS assign_tpo_role();
