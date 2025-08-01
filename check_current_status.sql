-- Check current RLS status and policies
-- Run this to see what's currently configured

-- 1. Check if RLS is enabled/disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'shifts';

-- 2. Check existing policies
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'shifts'
ORDER BY policyname;

-- 3. Test if we can view shifts
SELECT 
  id,
  title,
  seller_id,
  status,
  created_at
FROM public.shifts 
ORDER BY created_at DESC 
LIMIT 5; 