-- Create clean RLS policy for shifts table
-- This assumes RLS is currently disabled

-- Step 1: Re-enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view available shifts" ON public.shifts;
DROP POLICY IF EXISTS "Anyone can view all shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can create their own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can update their own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can delete their own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Allow SELECT for all users" ON public.shifts;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.shifts;
DROP POLICY IF EXISTS "Allow UPDATE for shift owners" ON public.shifts;
DROP POLICY IF EXISTS "Allow DELETE for shift owners" ON public.shifts;

-- Step 3: Create a simple SELECT policy that allows everyone to view all shifts
CREATE POLICY "Allow SELECT for everyone" 
ON public.shifts 
FOR SELECT 
USING (true);

-- Step 4: Create INSERT policy (users can only create their own shifts)
CREATE POLICY "Allow INSERT for authenticated users" 
ON public.shifts 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Step 5: Create UPDATE policy (users can only update their own shifts)
CREATE POLICY "Allow UPDATE for shift owners" 
ON public.shifts 
FOR UPDATE 
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Step 6: Create DELETE policy (users can only delete their own shifts)
CREATE POLICY "Allow DELETE for shift owners" 
ON public.shifts 
FOR DELETE 
USING (auth.uid() = seller_id);

-- Step 7: Verify the policies were created
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

-- Step 8: Test the policy
SELECT 
  id,
  title,
  seller_id,
  status,
  created_at
FROM public.shifts 
ORDER BY created_at DESC 
LIMIT 5; 