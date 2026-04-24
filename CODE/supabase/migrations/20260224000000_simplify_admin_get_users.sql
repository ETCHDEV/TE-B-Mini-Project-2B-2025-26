-- Simplified admin_get_users function to avoid all type issues
-- This version returns simple text types that match the interface exactly

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
      u.email,
      u.created_at::TEXT,
      u.last_sign_in_at::TEXT,
      u.email_confirmed_at::TEXT,
      COALESCE(ur.role, 'student') as role
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    ORDER BY u.created_at DESC;
  ELSE
    -- For non-admin users, return empty result
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
