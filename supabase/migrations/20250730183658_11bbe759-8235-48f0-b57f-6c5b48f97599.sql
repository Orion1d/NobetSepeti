-- Add duration field to shifts table
ALTER TABLE public.shifts 
ADD COLUMN duration TEXT;

-- Add university and language fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN university TEXT,
ADD COLUMN language TEXT;