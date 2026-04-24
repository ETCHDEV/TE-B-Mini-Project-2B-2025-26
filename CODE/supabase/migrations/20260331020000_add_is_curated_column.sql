-- Add is_curated column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_curated BOOLEAN DEFAULT false;

-- Update existing curated courses to set is_curated = true
UPDATE public.courses 
SET is_curated = true 
WHERE instructor = 'Team Curated' 
OR instructor = 'Aditya Verma'
OR url LIKE '%3Blue1Brown%';
