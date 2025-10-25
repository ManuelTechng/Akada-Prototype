-- Sample course data for testing
-- This script should be run after the migration to populate the courses table

-- Computer Science Courses
INSERT INTO courses (course_code, course_name, credits, course_description, syllabus_topics, prerequisites, assessment_breakdown, course_level) VALUES
('CS101', 'Introduction to Computer Science', 3.0, 'Fundamental concepts of computer science including algorithms, data structures, and programming.', 
 ARRAY['Programming basics', 'Algorithm design', 'Data structures', 'Problem solving'], 
 ARRAY[]::TEXT[], 
 '{"assignments": 40, "midterm": 25, "final": 35}'::JSONB, 
 'undergraduate'),

('CS201', 'Data Structures and Algorithms', 4.0, 'Advanced study of data structures and algorithm design and analysis.', 
 ARRAY['Arrays and linked lists', 'Trees and graphs', 'Sorting algorithms', 'Search algorithms', 'Complexity analysis'], 
 ARRAY['CS101'], 
 '{"assignments": 35, "midterm": 30, "final": 35}'::JSONB, 
 'undergraduate'),

('CS301', 'Database Systems', 3.0, 'Introduction to database design, implementation, and management.', 
 ARRAY['Relational model', 'SQL programming', 'Database design', 'Normalization', 'Transaction processing'], 
 ARRAY['CS201'], 
 '{"assignments": 30, "project": 30, "midterm": 20, "final": 20}'::JSONB, 
 'undergraduate'),

('CS401', 'Software Engineering', 3.0, 'Principles and practices of software development lifecycle.', 
 ARRAY['Requirements analysis', 'System design', 'Testing strategies', 'Project management', 'Version control'], 
 ARRAY['CS201', 'CS301'], 
 '{"assignments": 25, "project": 40, "midterm": 20, "final": 15}'::JSONB, 
 'undergraduate'),

('CS501', 'Machine Learning', 3.0, 'Introduction to machine learning algorithms and applications.',
 ARRAY['Supervised learning', 'Unsupervised learning', 'Neural networks', 'Deep learning', 'Model evaluation'],
 ARRAY['CS201'],
 '{"assignments": 30, "project": 35, "midterm": 20, "final": 15}'::JSONB,
 'graduate');

-- Business Courses
INSERT INTO courses (course_code, course_name, credits, course_description, syllabus_topics, prerequisites, assessment_breakdown, course_level) VALUES
('BUS101', 'Introduction to Business', 3.0, 'Overview of business concepts, functions, and organizational structures.', 
 ARRAY['Business environment', 'Management principles', 'Marketing basics', 'Finance fundamentals'], 
 ARRAY[]::TEXT[], 
 '{"assignments": 30, "midterm": 30, "final": 40}'::JSONB, 
 'undergraduate'),

('BUS201', 'Financial Accounting', 3.0, 'Principles and practices of financial accounting and reporting.', 
 ARRAY['Accounting principles', 'Financial statements', 'Assets and liabilities', 'Revenue recognition'], 
 ARRAY['BUS101'], 
 '{"assignments": 25, "midterm": 35, "final": 40}'::JSONB, 
 'undergraduate'),

('BUS301', 'Marketing Management', 3.0, 'Strategic marketing planning and implementation.', 
 ARRAY['Market research', 'Consumer behavior', 'Product development', 'Pricing strategies', 'Promotion mix'], 
 ARRAY['BUS101'], 
 '{"assignments": 30, "project": 30, "midterm": 20, "final": 20}'::JSONB, 
 'undergraduate'),

('BUS401', 'Strategic Management', 3.0, 'Corporate strategy formulation and implementation.',
 ARRAY['Strategic analysis', 'Competitive advantage', 'Corporate governance', 'International strategy'],
 ARRAY['BUS201', 'BUS301'],
 '{"assignments": 25, "case_studies": 35, "midterm": 20, "final": 20}'::JSONB,
 'undergraduate');

-- Engineering Courses
INSERT INTO courses (course_code, course_name, credits, course_description, syllabus_topics, prerequisites, assessment_breakdown, course_level) VALUES
('ENG101', 'Engineering Mathematics', 4.0, 'Mathematical foundations for engineering applications.', 
 ARRAY['Calculus', 'Linear algebra', 'Differential equations', 'Statistics'], 
 ARRAY[]::TEXT[], 
 '{"assignments": 30, "midterm": 30, "final": 40}'::JSONB, 
 'undergraduate'),

('ENG201', 'Engineering Mechanics', 3.0, 'Statics and dynamics principles in engineering.', 
 ARRAY['Force systems', 'Equilibrium', 'Kinematics', 'Kinetics'], 
 ARRAY['ENG101'], 
 '{"assignments": 35, "midterm": 30, "final": 35}'::JSONB, 
 'undergraduate'),

('ENG301', 'Thermodynamics', 3.0, 'Principles of energy and heat transfer in engineering systems.', 
 ARRAY['First law of thermodynamics', 'Second law', 'Heat engines', 'Refrigeration cycles'], 
 ARRAY['ENG201'], 
 '{"assignments": 30, "midterm": 35, "final": 35}'::JSONB, 
 'undergraduate'),

('ENG401', 'Engineering Design', 4.0, 'Capstone engineering design project.', 
 ARRAY['Design process', 'Project management', 'Prototyping', 'Testing and validation'], 
 ARRAY['ENG201', 'ENG301'], 
 '{"project": 60, "presentations": 20, "reports": 20}'::JSONB, 
 'undergraduate');

-- Link courses to programs (assuming we have some programs in the database)
-- This would typically be done after programs are seeded
-- For now, we'll create placeholder program-course relationships

-- Note: These INSERT statements assume that programs with these IDs exist
-- In a real scenario, you would query for actual program IDs first

-- Example program-course relationships (commented out until programs exist):
/*
INSERT INTO program_courses (program_id, course_id, year, semester, is_required, course_order) 
SELECT 
  p.id as program_id,
  c.id as course_id,
  CASE 
    WHEN c.course_code IN ('CS101', 'BUS101', 'ENG101') THEN 1
    WHEN c.course_code IN ('CS201', 'BUS201', 'ENG201') THEN 2
    WHEN c.course_code IN ('CS301', 'BUS301', 'ENG301') THEN 3
    WHEN c.course_code IN ('CS401', 'BUS401', 'ENG401') THEN 4
    ELSE 1
  END as year,
  CASE 
    WHEN c.course_code IN ('CS101', 'BUS101', 'ENG101') THEN 1
    WHEN c.course_code IN ('CS201', 'BUS201', 'ENG201') THEN 1
    WHEN c.course_code IN ('CS301', 'BUS301', 'ENG301') THEN 1
    WHEN c.course_code IN ('CS401', 'BUS401', 'ENG401') THEN 1
    ELSE 1
  END as semester,
  true as is_required,
  ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY c.course_code) as course_order
FROM programs p
CROSS JOIN courses c
WHERE (p.name ILIKE '%computer%' OR p.name ILIKE '%cs%') AND c.course_code LIKE 'CS%'
   OR (p.name ILIKE '%business%' OR p.name ILIKE '%mba%') AND c.course_code LIKE 'BUS%'
   OR (p.name ILIKE '%engineering%' OR p.name ILIKE '%eng%') AND c.course_code LIKE 'ENG%';
*/


