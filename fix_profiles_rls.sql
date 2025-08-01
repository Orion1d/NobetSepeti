-- Fix RLS policies for profiles table
-- This allows viewing seller profiles in shift details

-- Check current RLS status for profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check existing policies for profiles
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Create a policy to allow viewing profiles (for shift details)
CREATE POLICY "Allow SELECT profiles for shift details" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Keep existing policies for INSERT, UPDATE
-- Users can still only create and update their own profiles

-- Verify the new policy was created
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
WHERE tablename = 'profiles'
ORDER BY policyname; 