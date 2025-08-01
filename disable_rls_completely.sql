-- Temporary solution: Disable RLS completely for shifts table
-- This will allow all users to view all shifts without any restrictions

-- Disable RLS for shifts table
ALTER TABLE public.shifts DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'shifts';

-- Test that we can view all shifts
SELECT 
  id,
  title,
  seller_id,
  status,
  created_at
FROM public.shifts 
ORDER BY created_at DESC 
LIMIT 5;

-- Note: This is a temporary solution
-- For production, you should re-enable RLS with proper policies
-- To re-enable later, use: ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY; 