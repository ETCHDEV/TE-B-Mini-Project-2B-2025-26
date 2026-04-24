-- Final Elite version of resource_cache (Production Ready)
-- Partitioned by (topic, user_level) to ensure personalized caching

CREATE TABLE IF NOT EXISTS public.resource_cache (
    topic TEXT NOT NULL,
    user_level TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Ready'
    resources JSONB NOT NULL, -- [{title, platform, url, type, difficulty, duration, thumbnail_url, score}]
    source TEXT NOT NULL,      -- 'Curated', 'API_YouTube', 'API_Google', 'Mixed'
    content_hash TEXT,         -- hash of resources for freshness control
    algorithm_version TEXT DEFAULT 'v3',
    click_count INT DEFAULT 0,
    search_count INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (topic, user_level)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_resource_topic_level ON public.resource_cache(topic, user_level);
CREATE INDEX IF NOT EXISTS idx_resource_last_updated ON public.resource_cache(last_updated);
CREATE INDEX IF NOT EXISTS idx_resource_clicks ON public.resource_cache(click_count DESC);

-- Security: Row Level Security
ALTER TABLE public.resource_cache ENABLE ROW LEVEL SECURITY;

-- ✅ Public read access for efficiency
CREATE POLICY "Public read access for resources"
ON public.resource_cache FOR SELECT
USING (true);

-- 🔒 Only service role (backend) can modify cache
CREATE POLICY "Service role full access"
ON public.resource_cache FOR ALL
USING (auth.role() = 'service_role');

-- Helper function to increment click counts (Feedback Loop)
CREATE OR REPLACE FUNCTION public.increment_resource_click(p_topic TEXT, p_user_level TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.resource_cache
    SET click_count = click_count + 1
    WHERE topic = LOWER(TRIM(p_topic)) AND user_level = p_user_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to increment search counts (Rate Limiting/Popularity)
CREATE OR REPLACE FUNCTION public.increment_resource_search(p_topic TEXT, p_user_level TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO public.resource_cache (topic, user_level, resources, source, search_count)
    VALUES (LOWER(TRIM(p_topic)), p_user_level, '[]', 'Initial', 1)
    ON CONFLICT (topic, user_level) 
    DO UPDATE SET search_count = resource_cache.search_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;