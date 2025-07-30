-- Add duration field to shifts table
ALTER TABLE public.shifts 
ADD COLUMN duration TEXT;

-- Add language field to profiles table (university already exists)
ALTER TABLE public.profiles 
ADD COLUMN language TEXT;