-- Create prediction_logs table
CREATE TABLE IF NOT EXISTS public.prediction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    track TEXT NOT NULL,
    -- Model input features (match training feature order exactly)
    assessment_score FLOAT NOT NULL,
    mastery_ratio FLOAT NOT NULL,
    resume_score FLOAT NOT NULL,
    prev_attempts INT NOT NULL DEFAULT 0,
    avg_difficulty FLOAT NOT NULL DEFAULT 2.0,
    skill_gap_count INT NOT NULL,
    track_id INT NOT NULL DEFAULT 0,
    -- Model output (INT for retraining compatibility)
    prediction INT NOT NULL,         -- 0=Beginner, 1=Intermediate, 2=Ready
    prediction_label TEXT NOT NULL,  -- Human-readable label
    confidence FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prediction_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs
CREATE POLICY "Users can insert their own prediction logs"
ON public.prediction_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can only view their own logs (or admins can view all)
CREATE POLICY "Users can view their own prediction logs"
ON public.prediction_logs
FOR SELECT
USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'role' = 'admin'
);
