-- Alternative approach: Update existing RLS policy
-- This updates the existing policy to allow viewing all shifts

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'shifts';

-- Update the existing policy to allow viewing all shifts
DROP POLICY IF EXISTS "Anyone can view available shifts" ON public.shifts;
DROP POLICY IF EXISTS "Anyone can view all shifts" ON public.shifts;

-- Create a comprehensive policy that allows viewing all shifts
CREATE POLICY "Anyone can view all shifts" 
ON public.shifts 
FOR SELECT 
USING (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'shifts'; 