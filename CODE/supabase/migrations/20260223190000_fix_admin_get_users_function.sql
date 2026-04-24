-- Fix admin_get_users function structure
-- The function needs to return the correct structure

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
  -- Check if current User is TPO admin
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
  ELSE
    -- For non-admin users, return empty result
    RETURN QUERY
    SELECT 
      NULL::UUID as user_id,
      ''::TEXT as email,
      NULL::TIMESTAMPTZ as created_at,
      NULL::TIMESTAMPTZ as last_sign_in_at,
      NULL::TIMESTAMPTZ as email_confirmed_at,
      'student'::TEXT as role
    LIMIT 0;
  END IF;
END;
$$;
