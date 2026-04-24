-- Drop old functions first (required to change return type)
DROP FUNCTION IF EXISTS public.get_recent_assessments(integer);
DROP FUNCTION IF EXISTS public.get_assessment_stats();

-- Recreate get_recent_assessments with correct table + gaps column
CREATE FUNCTION public.get_recent_assessments(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id              TEXT,
  user_email      TEXT,
  track           TEXT,
  correct_answers INTEGER,
  total_questions INTEGER,
  gaps            JSONB,
  level           TEXT,
  completed_at    TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com' THEN
    RETURN QUERY
    SELECT
      ar.id::TEXT                                              AS id,
      COALESCE(u.email, ar.student_username)::TEXT            AS user_email,
      ar.track::TEXT                                          AS track,
      ar.correct_answers::INTEGER                             AS correct_answers,
      ar.total_questions::INTEGER                             AS total_questions,
      COALESCE(ar.gaps, '[]'::jsonb)                         AS gaps,
      ar.level::TEXT                                          AS level,
      TO_CHAR(ar.created_at, 'YYYY-MM-DD HH24:MI:SS')::TEXT  AS completed_at
    FROM public.assessment_results ar
    LEFT JOIN auth.users u ON ar.student_id = u.id
    ORDER BY ar.created_at DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT ''::TEXT, ''::TEXT, ''::TEXT, 0::INTEGER, 0::INTEGER,
           '[]'::JSONB, ''::TEXT, ''::TEXT
    LIMIT 0;
  END IF;
END;
$fn$;

-- Create get_assessment_stats (was missing entirely)
CREATE FUNCTION public.get_assessment_stats()
RETURNS TABLE (
  track                   TEXT,
  total_students          BIGINT,
  total                   BIGINT,
  beginner_count          BIGINT,
  intermediate_count      BIGINT,
  ready_count             BIGINT,
  beginner_percentage     NUMERIC,
  intermediate_percentage NUMERIC,
  ready_percentage        NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF auth.jwt() ->> 'email' = 'muazshaikh7861@gmail.com' THEN
    RETURN QUERY
    SELECT
      ar.track::TEXT                                               AS track,
      COUNT(DISTINCT ar.student_username)::BIGINT                 AS total_students,
      COUNT(*)::BIGINT                                             AS total,
      COUNT(*) FILTER (WHERE ar.level = 'Beginner')::BIGINT      AS beginner_count,
      COUNT(*) FILTER (WHERE ar.level = 'Intermediate')::BIGINT  AS intermediate_count,
      COUNT(*) FILTER (WHERE ar.level = 'Ready')::BIGINT         AS ready_count,
      ROUND(COUNT(*) FILTER (WHERE ar.level = 'Beginner')::NUMERIC
            / NULLIF(COUNT(*), 0) * 100, 1)                      AS beginner_percentage,
      ROUND(COUNT(*) FILTER (WHERE ar.level = 'Intermediate')::NUMERIC
            / NULLIF(COUNT(*), 0) * 100, 1)                      AS intermediate_percentage,
      ROUND(COUNT(*) FILTER (WHERE ar.level = 'Ready')::NUMERIC
            / NULLIF(COUNT(*), 0) * 100, 1)                      AS ready_percentage
    FROM public.assessment_results ar
    GROUP BY ar.track;
  ELSE
    RETURN QUERY
    SELECT ''::TEXT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT,
           0::BIGINT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC
    LIMIT 0;
  END IF;
END;
$fn$;
