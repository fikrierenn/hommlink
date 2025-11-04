-- Test database connection and table structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'leads', 'status_definitions', 'lead_events', 'whatsapp_templates')
ORDER BY table_name, ordinal_position;

-- Check if status definitions exist
SELECT * FROM public.status_definitions LIMIT 5;

-- Check current user
SELECT auth.uid() as current_user_id;

-- Check if user exists in users table
SELECT * FROM public.users WHERE auth_uid = auth.uid();