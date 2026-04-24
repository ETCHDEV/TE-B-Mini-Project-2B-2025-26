-- Fix admin_get_users function type mismatch
-- The issue is that we're casting timestamps to TEXT but declaring them as TIMESTAMPTZ

DROP FUNCTION IF EXISTS admin_get_users();

CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  user_id TEXT,
  email TEXT,
  created_at TEXT,
  last_sign_in_at TEXT,
  email_confirmed_at TEXT,
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
      COALESCE(u.created_at::TEXT, '')::TEXT as created_at,
      COALESCE(u.last_sign_in_at::TEXT, '')::TEXT as last_sign_in_at,
      COALESCE(u.email_confirmed_at::TEXT, '')::TEXT as email_confirmed_at,
      COALESCE(ur.role::TEXT, 'student')::TEXT as role
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    ORDER BY u.created_at DESC;
  ELSE
    -- For non-admin users, return empty result with correct types
    RETURN QUERY
    SELECT 
      ''::TEXT as user_id,
      ''::TEXT as email,
      ''::TEXT as created_at,
      ''::TEXT as last_sign_in_at,
      ''::TEXT as email_confirmed_at,
      'student'::TEXT as role
    LIMIT 0;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_get_users() TO authenticated;
