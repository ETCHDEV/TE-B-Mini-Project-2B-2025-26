-- Week 1: Fundamentals
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
(gen_random_uuid(), 'Time Complexity Basics', 'YouTube', 'https://youtu.be/A03oI0znAoc', 'Programming & DSA', 'Time Complexity', 'Beginner', 1, true, 4.9, 'Master time complexity and Big O notation fundamentals', 'Team Curated', true),
(gen_random_uuid(), 'Time Complexity Explained', 'YouTube', 'https://youtu.be/BgLTDT03QtU', 'Programming & DSA', 'Time Complexity', 'Beginner', 1, true, 4.9, 'Comprehensive guide to understanding time complexity', 'Team Curated', true),

(gen_random_uuid(), 'Arrays Basics', 'YouTube', 'https://youtu.be/0OK-kbu9Cwo', 'Programming & DSA', 'Arrays', 'Beginner', 1, true, 4.9, 'Introduction to arrays and array operations', 'Team Curated', true),
(gen_random_uuid(), 'Arrays Interview Problems', 'YouTube', 'https://youtu.be/Bnjbun-hiBk', 'Programming & DSA', 'Arrays', 'Intermediate', 1, true, 4.9, 'Array problems commonly asked in interviews', 'Team Curated', true),

(gen_random_uuid(), 'Strings Basics', 'YouTube', 'https://youtu.be/Tzej3YtW1BM', 'Programming & DSA', 'Strings', 'Beginner', 1, true, 4.9, 'String manipulation and string algorithms', 'Team Curated', true),
(gen_random_uuid(), 'Strings Problems', 'YouTube', 'https://youtu.be/MOSjYaVymcU', 'Programming & DSA', 'Strings', 'Intermediate', 1, true, 4.9, 'Solved string problems for interview preparation', 'Team Curated', true),

(gen_random_uuid(), 'Hashing Concepts', 'YouTube', 'https://youtu.be/xrhDF0pw7a0', 'Programming & DSA', 'Hashing', 'Beginner', 1, true, 4.9, 'Understanding hash tables and hashing', 'Team Curated', true),
(gen_random_uuid(), 'Hashing Problems', 'YouTube', 'https://youtu.be/nvzVHwrrub0', 'Programming & DSA', 'Hashing', 'Intermediate', 1, true, 4.9, 'Hashtable interview problems and solutions', 'Team Curated', true),

(gen_random_uuid(), 'Prefix Sum Techniques', 'YouTube', 'https://youtu.be/nZe7P674xZo', 'Programming & DSA', 'Prefix Sum', 'Intermediate', 1, true, 4.9, 'Prefix sum problems and optimization techniques', 'Team Curated', true),
(gen_random_uuid(), 'Two Pointers Approach', 'YouTube', 'https://youtu.be/QzZ7nmouLTI', 'Programming & DSA', 'Two Pointers', 'Beginner', 1, true, 4.9, 'Two pointer technique for array problems', 'Team Curated', true),

(gen_random_uuid(), 'Sliding Window Concept', 'YouTube', 'https://youtu.be/y2d0VHdvfdc', 'Programming & DSA', 'Sliding Window', 'Beginner', 1, true, 4.9, 'Learn the sliding window pattern', 'Team Curated', true),
(gen_random_uuid(), 'Sliding Window Problems', 'YouTube', 'https://youtu.be/EHCGAZBbB88', 'Programming & DSA', 'Sliding Window', 'Intermediate', 1, true, 4.9, 'Complex sliding window problem solutions', 'Team Curated', true);

-- Week 2: Searching & DS
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
(gen_random_uuid(), 'Binary Search Basics', 'YouTube', 'https://youtu.be/C2apEw9pgtw', 'Programming & DSA', 'Binary Search', 'Beginner', 1, true, 4.9, 'Binary search algorithm and implementation', 'Team Curated', true),
(gen_random_uuid(), 'Binary Search Problems', 'YouTube', 'https://youtu.be/81QLBCW94Oo', 'Programming & DSA', 'Binary Search', 'Intermediate', 1, true, 4.9, 'Advanced binary search problem patterns', 'Team Curated', true),

(gen_random_uuid(), 'Sorting Algorithms Overview', 'YouTube', 'https://youtu.be/mB5HXBb_HY8', 'Programming & DSA', 'Sorting Algorithms', 'Beginner', 1, true, 4.9, 'Introduction to major sorting algorithms', 'Team Curated', true),
(gen_random_uuid(), 'Sorting Deep Dive', 'YouTube', 'https://youtu.be/7h1s2SojIRw', 'Programming & DSA', 'Sorting Algorithms', 'Intermediate', 1, true, 4.9, 'Advanced sorting and custom comparators', 'Team Curated', true),

(gen_random_uuid(), 'Linked Lists Basics', 'YouTube', 'https://youtu.be/N6dOwBde7-M', 'Programming & DSA', 'Linked Lists', 'Beginner', 1, true, 4.9, 'Fundamental linked list operations', 'Team Curated', true),
(gen_random_uuid(), 'Stacks and Queues', 'YouTube', 'https://youtu.be/rHQI4mrJ3cg', 'Programming & DSA', 'Stacks', 'Beginner', 1, true, 4.9, 'Stacks, queues and deques implementation', 'Team Curated', true);

-- Week 3: Trees & Recursion
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
(gen_random_uuid(), 'Recursion Basics', 'YouTube', 'https://youtu.be/IJDJ0kBx2LM', 'Programming & DSA', 'Recursion', 'Beginner', 1, true, 4.9, 'Understanding recursion and backtracking', 'Team Curated', true),
(gen_random_uuid(), 'Recursion Problems', 'YouTube', 'https://youtu.be/bJg_sv7PV-g', 'Programming & DSA', 'Recursion', 'Intermediate', 1, true, 4.9, 'Complex recursion and backtracking patterns', 'Team Curated', true),

(gen_random_uuid(), 'Binary Trees Fundamentals', 'YouTube', 'https://youtu.be/6vt3PFRC11E', 'Programming & DSA', 'Binary Trees', 'Beginner', 1, true, 4.9, 'Binary tree structure and properties', 'Team Curated', true),
(gen_random_uuid(), 'Tree Traversals Explained', 'YouTube', 'https://youtu.be/cS-198wtfj0', 'Programming & DSA', 'Tree Traversals', 'Intermediate', 1, true, 4.9, 'In-order, pre-order, post-order and level-order traversal', 'Team Curated', true),

(gen_random_uuid(), 'Heaps and Priority Queues', 'YouTube', 'https://youtu.be/rI2EBUEMfTk', 'Programming & DSA', 'Heaps', 'Intermediate', 1, true, 4.9, 'Min and max heaps, heap sort', 'Team Curated', true),
(gen_random_uuid(), 'Tries Data Structure', 'YouTube', 'https://youtu.be/oobqoCJlHA0', 'Programming & DSA', 'Tries', 'Advanced', 1, true, 4.9, 'Trie structure for prefix matching problems', 'Team Curated', true);

-- Week 4: Graphs
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
(gen_random_uuid(), 'Graph Basics and Representations', 'YouTube', 'https://youtu.be/eQA-m22wjTQ', 'Programming & DSA', 'Graphs', 'Beginner', 1, true, 4.9, 'Graph theory basics and adjacency representations', 'Team Curated', true),
(gen_random_uuid(), 'DFS and BFS Algorithms', 'YouTube', 'https://youtu.be/4jyESQDrpls', 'Programming & DSA', 'DFS', 'Intermediate', 1, true, 4.9, 'Depth-first and breadth-first search patterns', 'Team Curated', true),

(gen_random_uuid(), 'Disjoint Set Union (DSU)', 'YouTube', 'https://youtu.be/wU6udHRIkcc', 'Programming & DSA', 'Disjoint Set Union', 'Advanced', 1, true, 4.9, 'Union-find data structure and applications', 'Team Curated', true),
(gen_random_uuid(), 'Union Find Explained', 'YouTube', 'https://youtu.be/ibjEGG7ylHk', 'Programming & DSA', 'Disjoint Set Union', 'Advanced', 1, true, 4.9, 'Path compression and union by rank optimization', 'Team Curated', true);

-- Week 5: Advanced
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
(gen_random_uuid(), 'Dynamic Programming Basics', 'YouTube', 'https://youtu.be/66hDgWottdA', 'Programming & DSA', 'Dynamic Programming', 'Intermediate', 1, true, 4.9, 'Introduction to DP and memoization', 'Team Curated', true),
(gen_random_uuid(), 'Dynamic Programming Problems', 'YouTube', 'https://youtu.be/mBNrRy2_hVs', 'Programming & DSA', 'Dynamic Programming', 'Advanced', 1, true, 4.9, 'Complex DP patterns and optimizations', 'Team Curated', true),

(gen_random_uuid(), 'Greedy Algorithms', 'YouTube', 'https://youtu.be/ARvQcqJ_-NY', 'Programming & DSA', 'Greedy Algorithms', 'Intermediate', 1, true, 4.9, 'Greedy algorithm strategy and proof', 'Team Curated', true),
(gen_random_uuid(), 'Number Theory for CP', 'YouTube', 'https://youtu.be/T8PaMnb0GPo', 'Programming & DSA', 'Number Theory', 'Advanced', 1, true, 4.9, 'GCD, LCM, prime numbers and modular arithmetic', 'Team Curated', true);

-- Week 6: Interview Prep
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
(gen_random_uuid(), 'Mock Interview Practice', 'YouTube', 'https://youtu.be/rw4s4M3hFfs', 'Programming & DSA', 'Mock Interviews', 'Advanced', 1, true, 4.9, 'Timed coding interview simulations', 'Team Curated', true),
(gen_random_uuid(), 'DSA Revision Strategy', 'YouTube', 'https://youtu.be/ayZppqJAUcc', 'Programming & DSA', 'Systematic Revision', 'Intermediate', 1, true, 4.9, 'Effective revision and practice planning', 'Team Curated', true);
