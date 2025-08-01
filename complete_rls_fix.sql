-- Complete RLS Fix for shifts table
-- This will remove all existing policies and create a clean one

-- Step 1: Disable RLS temporarily to see all data
ALTER TABLE public.shifts DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies for shifts table
DROP POLICY IF EXISTS "Anyone can view available shifts" ON public.shifts;
DROP POLICY IF EXISTS "Anyone can view all shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can create their own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can update their own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can delete their own shifts" ON public.shifts;

-- Step 3: Re-enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a comprehensive policy that allows SELECT for everyone
CREATE POLICY "Allow SELECT for all users" 
ON public.shifts 
FOR SELECT 
USING (true);

-- Step 5: Create policy for INSERT (users can only create their own shifts)
CREATE POLICY "Allow INSERT for authenticated users" 
ON public.shifts 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Step 6: Create policy for UPDATE (users can only update their own shifts)
CREATE POLICY "Allow UPDATE for shift owners" 
ON public.shifts 
FOR UPDATE 
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Step 7: Create policy for DELETE (users can only delete their own shifts)
CREATE POLICY "Allow DELETE for shift owners" 
ON public.shifts 
FOR DELETE 
USING (auth.uid() = seller_id);

-- Step 8: Verify the policies were created
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

-- Step 9: Test the policy
SELECT 
  id,
  title,
  seller_id,
  status,
  created_at
FROM public.shifts 
ORDER BY created_at DESC 
LIMIT 5; 