-- Fix TPO admin access by updating get_user_role function
-- This ensures TPO admin can always access role information

DROP FUNCTION IF EXISTS public.get_user_role(uuid);

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- First check if this is the TPO admin email
  SELECT CASE 
    WHEN _user_id IN (
      SELECT id FROM auth.users WHERE email = 'muazshaikh7861@gmail.com'
    ) THEN 'tpo'
    ELSE (
      SELECT role::text FROM public.user_roles
      WHERE user_id = _user_id
      LIMIT 1
    )
  END;
$$;
