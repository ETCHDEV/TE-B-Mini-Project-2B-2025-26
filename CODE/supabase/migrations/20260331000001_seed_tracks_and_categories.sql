-- Seed Assessment Tracks and Categories to prove DB is connected and dynamic
INSERT INTO public.assessment_tracks (name, description) VALUES
('Programming & DSA', 'Data structures, algorithms, and technical problem solving.'),
('Data Science & ML', 'Python, machine learning, statistics, and data analysis.'),
('Database Management & SQL', 'SQL querying, database design, and optimization.'),
('Backend / Web Dev', 'Server-side logic, APIs, and web architecture.')
ON CONFLICT (name) DO NOTHING;

-- Seed Categories for Programming & DSA
INSERT INTO public.assessment_categories (track_id, name, description)
SELECT id, 'Data Structures', 'Arrays, Linked Lists, Trees, and Graphs'
FROM public.assessment_tracks WHERE name = 'Programming & DSA'
ON CONFLICT DO NOTHING;

INSERT INTO public.assessment_categories (track_id, name, description)
SELECT id, 'Algorithms', 'Sorting, Searching, and Dynamic Programming'
FROM public.assessment_tracks WHERE name = 'Programming & DSA'
ON CONFLICT DO NOTHING;

-- Seed Categories for Backend
INSERT INTO public.assessment_categories (track_id, name, description)
SELECT id, 'REST APIs', 'Node.js, Express, and HTTP protocols'
FROM public.assessment_tracks WHERE name = 'Backend / Web Dev'
ON CONFLICT DO NOTHING;

INSERT INTO public.assessment_categories (track_id, name, description)
SELECT id, 'Authentication', 'JWT, OAuth, and Security practices'
FROM public.assessment_tracks WHERE name = 'Backend / Web Dev'
ON CONFLICT DO NOTHING;
