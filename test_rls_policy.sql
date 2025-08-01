-- Test RLS policy for shifts table
-- This will help verify that the policy is working correctly

-- Test 1: Check if we can view all shifts (should return all shifts)
SELECT 
  id,
  title,
  seller_id,
  status,
  created_at
FROM public.shifts 
ORDER BY created_at DESC 
LIMIT 5;

-- Test 2: Check if we can view specific shift by ID
-- Replace 'your-shift-id-here' with an actual shift ID from your database
SELECT 
  id,
  title,
  description,
  seller_id,
  status
FROM public.shifts 
WHERE id = 'your-shift-id-here';

-- Test 3: Check current RLS policies
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'shifts';

-- Test 4: Check if RLS is enabled on shifts table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'shifts'; 