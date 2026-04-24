-- Extensive course population for multiple tracks
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor) VALUES
-- Programming & DSA
(gen_random_uuid(), 'Big O Notation Explained', 'YouTube', 'https://www.youtube.com/watch?v=v4cd1O4zkGw', 'Programming & DSA', 'Time Complexity', 'Beginner', 1, true, 4.9, 'Clear explanation of Big O complexity analysis', 'WilliamFiset'),
(gen_random_uuid(), 'Recursion for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=6oDQaB2one8', 'Programming & DSA', 'Recursion', 'Beginner', 2, true, 4.8, 'Learn recursion with practical examples', 'freeCodeCamp'),
(gen_random_uuid(), 'Aditya Verma Recursion Playlist', 'YouTube', 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWeT1ffjiImo0sYTJ6hKJJ31', 'Programming & DSA', 'Recursion', 'Intermediate', 10, true, 4.9, 'Legendary recursion teaching series', 'Aditya Verma'),
(gen_random_uuid(), 'Dynamic Programming - Masterclass', 'YouTube', 'https://www.youtube.com/watch?v=oBt53YbR9Kk', 'Programming & DSA', 'Dynamic Programming', 'Advanced', 5, true, 4.9, 'Master DP memoization and tabulation', 'freeCodeCamp'),
(gen_random_uuid(), 'Graph Theory Algorithms', 'YouTube', 'https://www.youtube.com/watch?v=09_LlHjoEiY', 'Programming & DSA', 'Graphs', 'Intermediate', 8, true, 4.8, 'Comprehensive graph algorithms guide', 'WilliamFiset'),
(gen_random_uuid(), 'Greedy Algorithms for Beginners', 'YouTube', 'https://www.youtube.com/watch?v=HzeK7g8cD0Y', 'Programming & DSA', 'Greedy Algorithms', 'Beginner', 2, true, 4.7, 'Introduction to greedy strategy', 'Abdul Bari'),
(gen_random_uuid(), 'Heap Data Structure Explained', 'YouTube', 'https://www.youtube.com/watch?v=t0Cq6E6LzZh8', 'Programming & DSA', 'Heaps', 'Intermediate', 3, true, 4.8, 'Deep dive into binary heaps', 'Abdul Bari'),

-- Data Science & ML
(gen_random_uuid(), 'Neural Networks Explained', '3Blue1Brown', 'https://www.youtube.com/watch?v=aircAruvnKk', 'Data Science & ML', 'Neural Networks', 'Intermediate', 3, true, 4.9, 'Best intuitive guide to Neural Networks', 'Grant Sanderson'),
(gen_random_uuid(), 'Transformers Explained', 'YouTube', 'https://www.youtube.com/watch?v=TQQlZhbC5ps', 'Data Science & ML', 'Transformers', 'Advanced', 2, true, 4.7, 'How Transformers and Attention work', 'Hugging Face'),
(gen_random_uuid(), 'Pandas Data Science Tutorial', 'YouTube', 'https://www.youtube.com/watch?v=vmEHCJofslg', 'Data Science & ML', 'Pandas', 'Beginner', 4, true, 4.8, 'Master data analysis with Pandas', 'Keith Galli'),

-- Database Management & SQL
(gen_random_uuid(), 'SQL Window Functions Guide', 'Kaggle', 'https://www.kaggle.com/code/alexisbcook/window-functions', 'Database Management & SQL', 'Window Functions', 'Intermediate', 2, true, 4.7, 'Interactive guide to SQL window functions', 'Kaggle Team'),
(gen_random_uuid(), 'SQL CTEs & Subqueries', 'SQLBolt', 'https://sqlbolt.com/', 'Database Management & SQL', 'CTE', 'Intermediate', 3, true, 4.8, 'Mastering common table expressions', 'SQLBolt'),

-- Backend / Web Dev
(gen_random_uuid(), 'JavaScript Async Tutorial', 'YouTube', 'https://www.youtube.com/watch?v=V_Kr9OSfDeU', 'Backend / Web Dev', 'Async/Await', 'Intermediate', 2, true, 4.8, 'Master asynchronous JavaScript', 'Web Dev Simplified'),
(gen_random_uuid(), 'Intro to JWT', 'YouTube', 'https://www.youtube.com/watch?v=7Q17ubqLfaM', 'Backend / Web Dev', 'JWT', 'Intermediate', 1, true, 4.7, 'Understand JSON Web Tokens', 'Fireship'),
(gen_random_uuid(), 'Redis in 100 Seconds', 'YouTube', 'https://www.youtube.com/watch?v=G1rOthPN-AY', 'Backend / Web Dev', 'Redis', 'Beginner', 1, true, 4.9, 'High level overview of Redis', 'Fireship')
ON CONFLICT (id) DO NOTHING;
