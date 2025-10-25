-- Sample alumni testimonials data for testing
-- This script should be run after the migration to populate the alumni_testimonials table

-- Note: These INSERT statements assume that universities with these IDs exist
-- In a real scenario, you would query for actual university IDs first

-- Example testimonials (commented out until universities exist):
/*
INSERT INTO alumni_testimonials (
  university_id, 
  student_name, 
  graduation_year, 
  degree_obtained, 
  current_position, 
  current_company, 
  testimonial_text, 
  rating, 
  would_recommend, 
  tags, 
  status, 
  featured
) VALUES
-- Approved testimonials
(
  (SELECT id FROM universities WHERE name ILIKE '%stanford%' LIMIT 1),
  'Sarah Johnson',
  2020,
  'Master of Science in Computer Science',
  'Software Engineer',
  'Google',
  'Stanford''s CS program was incredibly challenging but rewarding. The professors were world-class and the curriculum prepared me perfectly for my career at Google. The research opportunities and industry connections were invaluable.',
  5.0,
  true,
  ARRAY['academic', 'career', 'research'],
  'approved',
  true
),

(
  (SELECT id FROM universities WHERE name ILIKE '%harvard%' LIMIT 1),
  'Michael Chen',
  2019,
  'Master of Business Administration',
  'Product Manager',
  'Microsoft',
  'Harvard Business School transformed my thinking about business and leadership. The case study method and diverse cohort provided incredible learning experiences. I''m now leading product strategy at Microsoft thanks to the skills I developed.',
  4.8,
  true,
  ARRAY['leadership', 'networking', 'career'],
  'approved',
  true
),

(
  (SELECT id FROM universities WHERE name ILIKE '%mit%' LIMIT 1),
  'Emily Rodriguez',
  2021,
  'Master of Engineering in Electrical Engineering',
  'Senior Engineer',
  'Tesla',
  'MIT''s engineering program is rigorous and innovative. The hands-on approach and cutting-edge research opportunities prepared me for the fast-paced tech industry. The collaborative environment and world-class faculty made all the difference.',
  4.9,
  true,
  ARRAY['engineering', 'innovation', 'research'],
  'approved',
  false
),

(
  (SELECT id FROM universities WHERE name ILIKE '%oxford%' LIMIT 1),
  'David Kim',
  2018,
  'Master of Philosophy in Economics',
  'Economic Analyst',
  'World Bank',
  'Oxford provided an intellectually stimulating environment with access to leading economists. The tutorial system and research opportunities were exceptional. The degree opened doors to international development work.',
  4.7,
  true,
  ARRAY['academic', 'research', 'international'],
  'approved',
  false
),

-- Pending testimonials
(
  (SELECT id FROM universities WHERE name ILIKE '%cambridge%' LIMIT 1),
  'Lisa Wang',
  2022,
  'Master of Science in Data Science',
  'Data Scientist',
  'Amazon',
  'Cambridge''s data science program was comprehensive and practical. The combination of theoretical knowledge and real-world applications prepared me well for my current role. The faculty was supportive and the research opportunities were excellent.',
  4.6,
  true,
  ARRAY['data science', 'practical', 'research'],
  'pending',
  false
),

(
  (SELECT id FROM universities WHERE name ILIKE '%berkeley%' LIMIT 1),
  'James Wilson',
  2021,
  'Master of Science in Environmental Engineering',
  'Environmental Consultant',
  'McKinsey & Company',
  'UC Berkeley''s environmental engineering program combined technical excellence with sustainability focus. The interdisciplinary approach and industry partnerships provided valuable real-world experience. The program prepared me for consulting work in sustainability.',
  4.5,
  true,
  ARRAY['sustainability', 'interdisciplinary', 'career'],
  'pending',
  false
),

(
  (SELECT id FROM universities WHERE name ILIKE '%yale%' LIMIT 1),
  'Maria Garcia',
  2020,
  'Master of Public Health',
  'Public Health Specialist',
  'World Health Organization',
  'Yale''s public health program provided excellent training in global health issues. The faculty expertise and research opportunities were outstanding. The program prepared me for international public health work.',
  4.8,
  true,
  ARRAY['public health', 'global', 'research'],
  'pending',
  false
);

-- Update the approved_at timestamp for approved testimonials
UPDATE alumni_testimonials 
SET approved_at = NOW() - INTERVAL '30 days' + (RANDOM() * INTERVAL '365 days')
WHERE status = 'approved';

-- Update the submitted_at timestamp for all testimonials
UPDATE alumni_testimonials 
SET submitted_at = NOW() - INTERVAL '60 days' + (RANDOM() * INTERVAL '730 days');
*/

-- For now, let's create some sample data that can work with any university IDs
-- This is a more generic approach that will work regardless of existing data

-- First, let's get some university IDs to work with
-- We'll create testimonials for the first few universities in the database

DO $$
DECLARE
    university_record RECORD;
    testimonial_count INTEGER := 0;
BEGIN
    -- Loop through universities and create testimonials
    FOR university_record IN 
        SELECT id, name FROM universities LIMIT 5
    LOOP
        -- Create 1-2 testimonials per university
        FOR i IN 1..2 LOOP
            INSERT INTO alumni_testimonials (
                university_id, 
                student_name, 
                graduation_year, 
                degree_obtained, 
                current_position, 
                current_company, 
                testimonial_text, 
                rating, 
                would_recommend, 
                tags, 
                status, 
                featured,
                submitted_at
            ) VALUES (
                university_record.id,
                'Student ' || (testimonial_count + 1),
                2020 + (RANDOM() * 3)::INTEGER,
                CASE (RANDOM() * 3)::INTEGER
                    WHEN 0 THEN 'Bachelor of Science'
                    WHEN 1 THEN 'Master of Science'
                    ELSE 'Master of Business Administration'
                END,
                CASE (RANDOM() * 4)::INTEGER
                    WHEN 0 THEN 'Software Engineer'
                    WHEN 1 THEN 'Product Manager'
                    WHEN 2 THEN 'Data Scientist'
                    ELSE 'Consultant'
                END,
                CASE (RANDOM() * 4)::INTEGER
                    WHEN 0 THEN 'Google'
                    WHEN 1 THEN 'Microsoft'
                    WHEN 2 THEN 'Amazon'
                    ELSE 'McKinsey & Company'
                END,
                'This university provided an excellent education that prepared me well for my career. The faculty was knowledgeable and supportive, and the curriculum was comprehensive and practical.',
                4.0 + (RANDOM() * 1.0),
                RANDOM() > 0.2, -- 80% would recommend
                ARRAY['academic', 'career', 'practical'],
                CASE 
                    WHEN testimonial_count < 3 THEN 'approved'
                    ELSE 'pending'
                END,
                testimonial_count < 2, -- First 2 are featured
                NOW() - INTERVAL '30 days' + (RANDOM() * INTERVAL '365 days')
            );
            
            testimonial_count := testimonial_count + 1;
        END LOOP;
    END LOOP;
END $$;


