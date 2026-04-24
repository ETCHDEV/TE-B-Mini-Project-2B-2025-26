-- Seed curated SQL course videos for 10 weeks
INSERT INTO public.courses (id, title, platform, url, track, skill_covered, difficulty_level, duration_hours, is_free, rating, description, instructor, is_curated) VALUES
-- Week 1: SQL Foundations
(gen_random_uuid(), 'Database Systems Foundation', 'YouTube', 'https://www.youtube.com/watch?v=a-hFbr-4VQQ', 'Database Management & SQL', 'Database', 'Beginner', 1, true, 5.0, 'Curated learning resource for Database', 'Team Curated', true),
(gen_random_uuid(), 'Database Architecture', 'YouTube', 'https://youtu.be/HXV3zeQKqGY', 'Database Management & SQL', 'Database', 'Beginner', 1, true, 5.0, 'Curated learning resource for Database', 'Team Curated', true),
(gen_random_uuid(), 'Introduction to Database Administration', 'YouTube', 'https://youtu.be/3EJlovevfcA', 'Database Management & SQL', 'Database', 'Beginner', 1, true, 5.0, 'Curated learning resource for Database', 'Team Curated', true),
(gen_random_uuid(), 'Relational Database Management Concept', 'YouTube', 'https://youtu.be/OqjJjpjDRLc', 'Database Management & SQL', 'RDBMS', 'Beginner', 1, true, 5.0, 'Curated learning resource for RDBMS', 'Team Curated', true),
(gen_random_uuid(), 'RDBMS vs DBMS', 'YouTube', 'https://youtu.be/pFfXhCMlkdk', 'Database Management & SQL', 'RDBMS', 'Beginner', 1, true, 5.0, 'Curated learning resource for RDBMS', 'Team Curated', true),
(gen_random_uuid(), 'SQL vs NoSQL Databases', 'YouTube', 'https://youtu.be/_Ss42Vb1SU4', 'Database Management & SQL', 'SQL vs NoSQL', 'Beginner', 1, true, 5.0, 'Curated learning resource for SQL vs NoSQL', 'Team Curated', true),
(gen_random_uuid(), 'Choosing SQL or NoSQL', 'YouTube', 'https://youtu.be/mUqu5RgUYK8', 'Database Management & SQL', 'SQL vs NoSQL', 'Beginner', 1, true, 5.0, 'Curated learning resource for SQL vs NoSQL', 'Team Curated', true),

-- Week 2: SQL Basics
(gen_random_uuid(), 'Basic SQL Syntax Tutorial', 'YouTube', 'https://youtu.be/hlGoQC332VM', 'Database Management & SQL', 'Syntax', 'Beginner', 1, true, 5.0, 'Curated learning resource for Syntax', 'Team Curated', true),
(gen_random_uuid(), 'Learn SQL Syntax from Scratch', 'YouTube', 'https://youtu.be/rw62E9v9DnU', 'Database Management & SQL', 'Syntax', 'Beginner', 1, true, 5.0, 'Curated learning resource for Syntax', 'Team Curated', true),
(gen_random_uuid(), 'Understanding SQL Queries', 'YouTube', 'https://youtu.be/B1r1grQiLdk', 'Database Management & SQL', 'Syntax', 'Beginner', 1, true, 5.0, 'Curated learning resource for Syntax', 'Team Curated', true),
(gen_random_uuid(), 'Writing Complex SQL Syntax', 'YouTube', 'https://youtu.be/HmH-76_2Ak8', 'Database Management & SQL', 'Syntax', 'Beginner', 1, true, 5.0, 'Curated learning resource for Syntax', 'Team Curated', true),
(gen_random_uuid(), 'SQL Syntax Rules Overview', 'YouTube', 'https://youtu.be/CG78jU1IXjM', 'Database Management & SQL', 'Syntax', 'Beginner', 1, true, 5.0, 'Curated learning resource for Syntax', 'Team Curated', true),
(gen_random_uuid(), 'SQL Logical Operators', 'YouTube', 'https://youtu.be/Qb_7J_svPyY', 'Database Management & SQL', 'Operators', 'Beginner', 1, true, 5.0, 'Curated learning resource for Operators', 'Team Curated', true),
(gen_random_uuid(), 'SQL Comparison Operators Explained', 'YouTube', 'https://youtu.be/NJZ206_iJ0I', 'Database Management & SQL', 'Operators', 'Beginner', 1, true, 5.0, 'Curated learning resource for Operators', 'Team Curated', true),

-- Week 3: DDL
(gen_random_uuid(), 'Data Definition Language Concepts', 'YouTube', 'https://youtu.be/CSX0OlOYWps', 'Database Management & SQL', 'CREATE', 'Intermediate', 1, true, 5.0, 'Curated learning resource for CREATE', 'Team Curated', true),
(gen_random_uuid(), 'SQL CREATE TABLE Statement', 'YouTube', 'https://youtu.be/Jtai4ogSsB4', 'Database Management & SQL', 'CREATE', 'Intermediate', 1, true, 5.0, 'Curated learning resource for CREATE', 'Team Curated', true),
(gen_random_uuid(), 'Creating Database Schemas', 'YouTube', 'https://youtu.be/Nsv0MX3IDJE', 'Database Management & SQL', 'CREATE', 'Intermediate', 1, true, 5.0, 'Curated learning resource for CREATE', 'Team Curated', true),
(gen_random_uuid(), 'SQL ALTER TABLE Statement', 'YouTube', 'https://youtu.be/NA3b8JRUmww', 'Database Management & SQL', 'ALTER', 'Intermediate', 1, true, 5.0, 'Curated learning resource for ALTER', 'Team Curated', true),
(gen_random_uuid(), 'Modifying Table Structure', 'YouTube', 'https://youtu.be/bp8DsBI6Oik', 'Database Management & SQL', 'ALTER', 'Intermediate', 1, true, 5.0, 'Curated learning resource for ALTER', 'Team Curated', true),
(gen_random_uuid(), 'SQL DROP Statements', 'YouTube', 'https://youtu.be/ZfDBINXhWXg', 'Database Management & SQL', 'DROP', 'Intermediate', 1, true, 5.0, 'Curated learning resource for DROP', 'Team Curated', true),
(gen_random_uuid(), 'Dropping Databases & Tables safely', 'YouTube', 'https://youtu.be/_m1aJdD-oD8', 'Database Management & SQL', 'DROP', 'Intermediate', 1, true, 5.0, 'Curated learning resource for DROP', 'Team Curated', true),

-- Week 4: DML
(gen_random_uuid(), 'Data Manipulation Language Concepts', 'YouTube', 'https://youtu.be/w27gAgDQr_w', 'Database Management & SQL', 'INSERT', 'Intermediate', 1, true, 5.0, 'Curated learning resource for INSERT', 'Team Curated', true),
(gen_random_uuid(), 'SQL INSERT INTO Usage', 'YouTube', 'https://youtu.be/R4n0W7cS0_c', 'Database Management & SQL', 'INSERT', 'Intermediate', 1, true, 5.0, 'Curated learning resource for INSERT', 'Team Curated', true),
(gen_random_uuid(), 'Inserting Multiple Rows', 'YouTube', 'https://youtu.be/4YAAgrm8_ZI', 'Database Management & SQL', 'INSERT', 'Intermediate', 1, true, 5.0, 'Curated learning resource for INSERT', 'Team Curated', true),
(gen_random_uuid(), 'SQL UPDATE Commands', 'YouTube', 'https://youtu.be/MjI-1ZT68gM', 'Database Management & SQL', 'UPDATE', 'Intermediate', 1, true, 5.0, 'Curated learning resource for UPDATE', 'Team Curated', true),
(gen_random_uuid(), 'How to UPDATE SQL Rows safely', 'YouTube', 'https://youtu.be/cd-hSl7_pGQ', 'Database Management & SQL', 'UPDATE', 'Intermediate', 1, true, 5.0, 'Curated learning resource for UPDATE', 'Team Curated', true),
(gen_random_uuid(), 'SQL DELETE Statement', 'YouTube', 'https://youtu.be/s7ehCYyEmVw', 'Database Management & SQL', 'DELETE', 'Intermediate', 1, true, 5.0, 'Curated learning resource for DELETE', 'Team Curated', true),
(gen_random_uuid(), 'DELETE vs TRUNCATE differences', 'YouTube', 'https://youtu.be/vANfY96ccOY', 'Database Management & SQL', 'DELETE', 'Intermediate', 1, true, 5.0, 'Curated learning resource for DELETE', 'Team Curated', true),
(gen_random_uuid(), 'SQL SELECT Queries Intro', 'YouTube', 'https://youtu.be/eiLqDeDp7Oc', 'Database Management & SQL', 'SELECT', 'Beginner', 1, true, 5.0, 'Curated learning resource for SELECT', 'Team Curated', true),
(gen_random_uuid(), 'Filtering with SELECT statements', 'YouTube', 'https://youtu.be/af4LckivJT8', 'Database Management & SQL', 'SELECT', 'Beginner', 1, true, 5.0, 'Curated learning resource for SELECT', 'Team Curated', true),

-- Week 5: Aggregation
(gen_random_uuid(), 'Data Aggregation functions in SQL', 'YouTube', 'https://youtu.be/Yr4pHPZCshA', 'Database Management & SQL', 'COUNT', 'Beginner', 1, true, 5.0, 'Curated learning resource for COUNT', 'Team Curated', true),
(gen_random_uuid(), 'COUNT Function Applications', 'YouTube', 'https://youtu.be/XxwZB6mdgLU', 'Database Management & SQL', 'COUNT', 'Beginner', 1, true, 5.0, 'Curated learning resource for COUNT', 'Team Curated', true),
(gen_random_uuid(), 'Advanced COUNT Scenarios', 'YouTube', 'https://youtu.be/FhuWjr2dQd8', 'Database Management & SQL', 'COUNT', 'Intermediate', 1, true, 5.0, 'Curated learning resource for COUNT', 'Team Curated', true),
(gen_random_uuid(), 'SUM Function Guide', 'YouTube', 'https://youtu.be/bxDCnGJwZbg', 'Database Management & SQL', 'SUM', 'Intermediate', 1, true, 5.0, 'Curated learning resource for SUM', 'Team Curated', true),
(gen_random_uuid(), 'Using SUM in Financial Queries', 'YouTube', 'https://youtu.be/DwK2qKxwYoo', 'Database Management & SQL', 'SUM', 'Intermediate', 1, true, 5.0, 'Curated learning resource for SUM', 'Team Curated', true),
(gen_random_uuid(), 'AVG Function & Averages', 'YouTube', 'https://youtu.be/XxwZB6mdgLU', 'Database Management & SQL', 'AVG', 'Intermediate', 1, true, 5.0, 'Curated learning resource for AVG', 'Team Curated', true),
(gen_random_uuid(), 'Applying AVG correctly', 'YouTube', 'https://youtu.be/tYnr-YwDp1M', 'Database Management & SQL', 'AVG', 'Intermediate', 1, true, 5.0, 'Curated learning resource for AVG', 'Team Curated', true),
(gen_random_uuid(), 'SQL Constraints overview', 'YouTube', 'https://youtu.be/-8bYtApJNos', 'Database Management & SQL', 'Constraints', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Constraints', 'Team Curated', true),
(gen_random_uuid(), 'Primary Keys Foreign Keys Unique constraints', 'YouTube', 'https://youtu.be/PcMr6xoundk', 'Database Management & SQL', 'Constraints', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Constraints', 'Team Curated', true),

-- Week 6: Joins & Subqueries
(gen_random_uuid(), 'SQL Joins subqueries deep dive', 'YouTube', 'https://youtu.be/Pjk4zoJf2B0', 'Database Management & SQL', 'Joins', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Joins', 'Team Curated', true),
(gen_random_uuid(), 'Practical SQL Joins Tutorial', 'YouTube', 'https://youtu.be/N1gJMfVk1N8', 'Database Management & SQL', 'Joins', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Joins', 'Team Curated', true),
(gen_random_uuid(), 'SQL Basics & Joins Masterclass', 'YouTube', 'http://www.youtube.com/watch?v=O10Du9zWZxY', 'Database Management & SQL', 'Joins', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Joins', 'Team Curated', true),
(gen_random_uuid(), 'Complex SQL Joins breakdown', 'YouTube', 'http://www.youtube.com/watch?v=gwp3dJUsy5g', 'Database Management & SQL', 'Joins', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Joins', 'Team Curated', true),
(gen_random_uuid(), 'SQL Subqueries Tutorial', 'YouTube', 'https://youtu.be/GpC0XyiJPEo', 'Database Management & SQL', 'Subqueries', 'Advanced', 1, true, 5.0, 'Curated learning resource for Subqueries', 'Team Curated', true),
(gen_random_uuid(), 'Writing Subqueries Like a Pro', 'YouTube', 'https://youtu.be/i5acg3Hvu6g', 'Database Management & SQL', 'Subqueries', 'Advanced', 1, true, 5.0, 'Curated learning resource for Subqueries', 'Team Curated', true),
(gen_random_uuid(), 'Nested Queries explained', 'YouTube', 'https://youtu.be/LWPD4L7_8ro', 'Database Management & SQL', 'Nested Queries', 'Advanced', 1, true, 5.0, 'Curated learning resource for Nested Queries', 'Team Curated', true),
(gen_random_uuid(), 'Complex Nested SQL Queries', 'YouTube', 'https://youtu.be/bonJEipf3VU', 'Database Management & SQL', 'Nested Queries', 'Advanced', 1, true, 5.0, 'Curated learning resource for Nested Queries', 'Team Curated', true),

-- Week 7: Functions & Optimization
(gen_random_uuid(), 'Database Functions Optimization Intro', 'YouTube', 'https://youtu.be/TyHUU05XKMY', 'Database Management & SQL', 'Indexes', 'Advanced', 1, true, 5.0, 'Curated learning resource for Indexes', 'Team Curated', true),
(gen_random_uuid(), 'How Indexes Work realistically', 'YouTube', 'https://youtu.be/BxAj3bl00-o', 'Database Management & SQL', 'Indexes', 'Advanced', 1, true, 5.0, 'Curated learning resource for Indexes', 'Team Curated', true),
(gen_random_uuid(), 'Database Indexation Best Practices', 'YouTube', 'https://youtu.be/YuRO9-rOgv4', 'Database Management & SQL', 'Indexes', 'Advanced', 1, true, 5.0, 'Curated learning resource for Indexes', 'Team Curated', true),
(gen_random_uuid(), 'SQL Views Tutorial', 'YouTube', 'https://youtu.be/QngqhdLd1SE', 'Database Management & SQL', 'Views', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Views', 'Team Curated', true),
(gen_random_uuid(), 'When to Use Views efficiently', 'YouTube', 'https://youtu.be/vLLkNI-vkV8', 'Database Management & SQL', 'Views', 'Intermediate', 1, true, 5.0, 'Curated learning resource for Views', 'Team Curated', true),
(gen_random_uuid(), 'Built In Functions in SQL', 'YouTube', 'https://youtu.be/ulby6deC8UM', 'Database Management & SQL', 'Functions', 'Advanced', 1, true, 5.0, 'Curated learning resource for Functions', 'Team Curated', true),
(gen_random_uuid(), 'Writing Custom Database Functions', 'YouTube', 'https://youtu.be/le9EsUaiFpQ', 'Database Management & SQL', 'Functions', 'Advanced', 1, true, 5.0, 'Curated learning resource for Functions', 'Team Curated', true),

-- Week 8: Transactions
(gen_random_uuid(), 'Database Transactions Concept', 'YouTube', 'https://youtu.be/20SXjcg6EIw', 'Database Management & SQL', 'ACID', 'Advanced', 1, true, 5.0, 'Curated learning resource for ACID', 'Team Curated', true),
(gen_random_uuid(), 'ACID Properties Tutorial', 'YouTube', 'https://youtu.be/GAe5oB742dw', 'Database Management & SQL', 'ACID', 'Advanced', 1, true, 5.0, 'Curated learning resource for ACID', 'Team Curated', true),
(gen_random_uuid(), 'Why ACID is Important', 'YouTube', 'https://youtu.be/-GS0OxFJsYQ', 'Database Management & SQL', 'ACID', 'Advanced', 1, true, 5.0, 'Curated learning resource for ACID', 'Team Curated', true),
(gen_random_uuid(), 'Stored Procedures Introduction', 'YouTube', 'https://youtu.be/oagHZwY9JJY', 'Database Management & SQL', 'Stored Procedures', 'Advanced', 1, true, 5.0, 'Curated learning resource for Stored Procedures', 'Team Curated', true),
(gen_random_uuid(), 'Advanced Stored Procedures Applications', 'YouTube', 'https://youtu.be/7vnxpcqmqNQ', 'Database Management & SQL', 'Stored Procedures', 'Advanced', 1, true, 5.0, 'Curated learning resource for Stored Procedures', 'Team Curated', true),

-- Week 9: Advanced SQL
(gen_random_uuid(), 'Mastering Advanced SQL operations', 'YouTube', 'https://youtu.be/-u-kCJmJHCk', 'Database Management & SQL', 'Window Functions', 'Advanced', 1, true, 5.0, 'Curated learning resource for Window Functions', 'Team Curated', true),
(gen_random_uuid(), 'Window Functions Crash Course', 'YouTube', 'https://youtu.be/S1do1EeA7ng', 'Database Management & SQL', 'Window Functions', 'Advanced', 1, true, 5.0, 'Curated learning resource for Window Functions', 'Team Curated', true),
(gen_random_uuid(), 'Common Table Expressions Deep Dive', 'YouTube', 'https://youtu.be/OqhfXIK1NhY', 'Database Management & SQL', 'Window Functions', 'Advanced', 1, true, 5.0, 'Curated learning resource for Window Functions', 'Team Curated', true),
(gen_random_uuid(), 'CTE Examples in SQL', 'YouTube', 'https://youtu.be/WHBH0yz35_8', 'Database Management & SQL', 'CTE', 'Advanced', 1, true, 5.0, 'Curated learning resource for CTE', 'Team Curated', true),
(gen_random_uuid(), 'Practical CTE Queries Breakdown', 'YouTube', 'https://youtu.be/LJC8277LONg', 'Database Management & SQL', 'CTE', 'Advanced', 1, true, 5.0, 'Curated learning resource for CTE', 'Team Curated', true),
(gen_random_uuid(), 'SQL Database Triggers Guide', 'YouTube', 'https://youtu.be/f6VWSlnHGCE', 'Database Management & SQL', 'Triggers', 'Advanced', 1, true, 5.0, 'Curated learning resource for Triggers', 'Team Curated', true),
(gen_random_uuid(), 'How to use Triggers effectivly', 'YouTube', 'https://youtu.be/3up4yHqOy68', 'Database Management & SQL', 'Triggers', 'Advanced', 1, true, 5.0, 'Curated learning resource for Triggers', 'Team Curated', true),

-- Week 10: Final Assessment
(gen_random_uuid(), 'Final Exam Details & Review', 'Scribd', 'https://www.scribd.com/document/579214218/Database-Programming-With-SQL-Final-Exam', 'Database Management & SQL', 'Mock Queries', 'Advanced', 1, true, 5.0, 'Curated practice resource for Mock Queries', 'Team Curated', true),
(gen_random_uuid(), 'SQL Query Problems Compilation', 'CodeChef', 'https://www.codechef.com/practice/sql-case-studies-topic-wise', 'Database Management & SQL', 'Mock Queries', 'Advanced', 1, true, 5.0, 'Curated practice resource for Mock Queries', 'Team Curated', true),
(gen_random_uuid(), 'Code Interview Practice Tests', 'CodingShuttle', 'https://www.codingshuttle.com/mock-tests/sql-for-interviews', 'Database Management & SQL', 'Mock Queries', 'Advanced', 1, true, 5.0, 'Curated practice resource for Mock Queries', 'Team Curated', true),
(gen_random_uuid(), 'Optimization Exercises Practice', 'GeeksForGeeks', 'https://www.geeksforgeeks.org/sql/best-practices-for-sql-query-optimizations/', 'Database Management & SQL', 'Optimization Problems', 'Advanced', 1, true, 5.0, 'Curated practice resource for Optimization Problems', 'Team Curated', true),
(gen_random_uuid(), 'Performance SQL Tips Checking', 'Explo', 'https://www.explo.co/encyclopedia/sql-optimization-checklist', 'Database Management & SQL', 'Optimization Problems', 'Advanced', 1, true, 5.0, 'Curated practice resource for Optimization Problems', 'Team Curated', true)
ON CONFLICT (id) DO NOTHING;

