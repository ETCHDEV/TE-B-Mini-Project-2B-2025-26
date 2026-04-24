-- Test the admin_get_users function structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_get_users'
ORDER BY ordinal_position;
