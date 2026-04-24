CREATE OR REPLACE FUNCTION get_recent_assessments(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id TEXT,
  user_email TEXT,
  track TEXT,
  correct_answers INTEGER,
  total_questions INTEGER,
  level TEXT,
  completed_at TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com' THEN

    RETURN QUERY
    SELECT 
      aa.id::TEXT AS id,
      u.email::TEXT AS user_email,
      aa.track::TEXT AS track,
      aa.correct_answers::INTEGER AS correct_answers,
      aa.total_questions::INTEGER AS total_questions,
      aa.level::TEXT AS level,
      TO_CHAR(aa.completed_at, 'YYYY-MM-DD HH24:MI:SS')::TEXT AS completed_at
    FROM public.assessment_attempts aa
    INNER JOIN auth.users u 
      ON aa.user_id = u.id
    ORDER BY aa.completed_at DESC
    LIMIT limit_count;

  ELSE
    RETURN QUERY
    SELECT 
      ''::TEXT,
      ''::TEXT,
      ''::TEXT,
      0::INTEGER,
      0::INTEGER,
      ''::TEXT,
      ''::TEXT
    LIMIT 0;
  END IF;
END;
$$;