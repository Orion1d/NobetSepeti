-- Fix RLS policy to allow viewing all shifts for detail pages
-- This policy allows anyone to view all shifts, not just available ones

-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Anyone can view available shifts" ON public.shifts;

-- Create a new policy that allows viewing all shifts
CREATE POLICY "Anyone can view all shifts" 
ON public.shifts 
FOR SELECT 
USING (true);

-- Keep the existing policies for INSERT and UPDATE
-- Users can still only create and update their own shifts 