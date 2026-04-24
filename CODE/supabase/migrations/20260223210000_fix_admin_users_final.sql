-- Final fix for admin_get_users function
-- This completely rewrites the function to avoid type issues

DROP FUNCTION IF EXISTS admin_get_users();

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
      u.id::TEXT as user_id,
      u.email::TEXT,
      u.created_at::TEXT,
      u.last_sign_in_at::TEXT,
      u.email_confirmed_at::TEXT,
      COALESCE(ur.role::TEXT, 'student')::TEXT as role
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    ORDER BY u.created_at DESC;
  ELSE
    -- For non-admin users, return empty result with correct types
    RETURN QUERY
    SELECT 
      NULL::TEXT as user_id,
      ''::TEXT as email,
      NULL::TEXT as created_at,
      NULL::TEXT as last_sign_in_at,
      NULL::TEXT as email_confirmed_at,
      'student'::TEXT as role
    LIMIT 0;
  END IF;
END;
$$;
