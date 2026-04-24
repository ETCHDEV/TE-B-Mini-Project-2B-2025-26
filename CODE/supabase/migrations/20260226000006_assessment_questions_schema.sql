-- Create assessment questions database schema
-- This will store all assessment questions by track, category, and difficulty

-- Create assessment_tracks table (domains/tracks)
CREATE TABLE IF NOT EXISTS public.assessment_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create assessment_categories table (topics within each track)
CREATE TABLE IF NOT EXISTS public.assessment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES public.assessment_tracks(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create assessment_questions table (actual questions)
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.assessment_categories(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mcq', 'coding')),
  question text NOT NULL,
  options text[], -- For MCQ options, null for coding questions
  correct_answer text NOT NULL,
  explanation text,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  points integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create assessment_user_responses table (to track user answers)
CREATE TABLE IF NOT EXISTS public.assessment_user_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  user_answer text,
  is_correct boolean,
  response_time_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessment_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_user_responses ENABLE ROW LEVEL SECURITY;

-- Policies for assessment_tracks (everyone can read)
CREATE POLICY "Anyone can read assessment tracks" ON public.assessment_tracks
  FOR SELECT USING (true);

-- Policies for assessment_categories (everyone can read)
CREATE POLICY "Anyone can read assessment categories" ON public.assessment_categories
  FOR SELECT USING (true);

-- Policies for assessment_questions (everyone can read)
CREATE POLICY "Anyone can read assessment questions" ON public.assessment_questions
  FOR SELECT USING (true);

-- Policies for assessment_user_responses (users can manage their own responses)
CREATE POLICY "Users can manage own assessment responses" ON public.assessment_user_responses
  FOR ALL USING (auth.uid() = user_id);
