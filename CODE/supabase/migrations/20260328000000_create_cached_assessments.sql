-- Create cached_assessments table for session performance
CREATE TABLE IF NOT EXISTS public.cached_assessments (
  track text PRIMARY KEY,
  questions jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cached_assessments ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read cached assessments" 
  ON public.cached_assessments FOR SELECT USING (true);

-- Service role can do everything (needed for the backend server)
CREATE POLICY "Service role can manage cached assessments"
  ON public.cached_assessments FOR ALL 
  USING (true)
  WITH CHECK (true);
