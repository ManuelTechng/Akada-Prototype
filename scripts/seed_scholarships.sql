-- Sample scholarship data for testing
-- This script should be run after the migration to populate the program_scholarships table

-- Note: These INSERT statements assume that programs and universities exist
-- In a real scenario, you would query for actual program and university IDs first

DO $$
DECLARE
    program_record RECORD;
    university_record RECORD;
    scholarship_count INTEGER := 0;
BEGIN
    -- Create program-specific scholarships
    FOR program_record IN 
        SELECT id, name, university_id FROM programs LIMIT 3
    LOOP
        -- Create 1-2 scholarships per program
        FOR i IN 1..2 LOOP
            INSERT INTO program_scholarships (
                program_id,
                university_id,
                scholarship_name,
                type,
                amount_min_usd,
                amount_max_usd,
                coverage_details,
                eligibility_criteria,
                eligible_countries,
                min_gpa,
                application_deadline,
                application_url,
                is_active,
                renewable
            ) VALUES (
                program_record.id,
                program_record.university_id,
                CASE (RANDOM() * 4)::INTEGER
                    WHEN 0 THEN 'Merit Scholarship'
                    WHEN 1 THEN 'Excellence Award'
                    WHEN 2 THEN 'Academic Achievement Scholarship'
                    ELSE 'Program Excellence Grant'
                END,
                CASE (RANDOM() * 4)::INTEGER
                    WHEN 0 THEN 'partial'
                    WHEN 1 THEN 'tuition-waiver'
                    WHEN 2 THEN 'stipend'
                    ELSE 'full'
                END,
                CASE 
                    WHEN (RANDOM() * 4)::INTEGER = 0 THEN 5000
                    ELSE 10000 + (RANDOM() * 15000)
                END,
                CASE 
                    WHEN (RANDOM() * 4)::INTEGER = 0 THEN 10000
                    ELSE 20000 + (RANDOM() * 30000)
                END,
                CASE (RANDOM() * 3)::INTEGER
                    WHEN 0 THEN 'Covers tuition fees and living expenses'
                    WHEN 1 THEN 'Covers 50% of tuition fees'
                    ELSE 'Covers full tuition and provides monthly stipend'
                END,
                'Minimum GPA of 3.5, strong academic record, and demonstrated financial need. International students welcome.',
                ARRAY['NGA', 'GHA', 'KEN', 'ZAF', 'EGY'], -- African countries
                3.5 + (RANDOM() * 0.5),
                CURRENT_DATE + INTERVAL '30 days' + (RANDOM() * INTERVAL '120 days'),
                'https://university.edu/scholarships/apply',
                true,
                RANDOM() > 0.5
            );
            
            scholarship_count := scholarship_count + 1;
        END LOOP;
    END LOOP;

    -- Create university-wide scholarships
    FOR university_record IN 
        SELECT id, name FROM universities LIMIT 3
    LOOP
        -- Create 1-2 university-wide scholarships
        FOR i IN 1..2 LOOP
            INSERT INTO program_scholarships (
                program_id,
                university_id,
                scholarship_name,
                type,
                amount_min_usd,
                amount_max_usd,
                coverage_details,
                eligibility_criteria,
                eligible_countries,
                min_gpa,
                application_deadline,
                application_url,
                is_active,
                renewable
            ) VALUES (
                NULL, -- University-wide scholarship
                university_record.id,
                CASE (RANDOM() * 4)::INTEGER
                    WHEN 0 THEN 'International Student Scholarship'
                    WHEN 1 THEN 'Diversity Excellence Award'
                    WHEN 2 THEN 'Global Leadership Scholarship'
                    ELSE 'University Merit Scholarship'
                END,
                CASE (RANDOM() * 4)::INTEGER
                    WHEN 0 THEN 'partial'
                    WHEN 1 THEN 'tuition-waiver'
                    WHEN 2 THEN 'stipend'
                    ELSE 'full'
                END,
                CASE 
                    WHEN (RANDOM() * 4)::INTEGER = 0 THEN 8000
                    ELSE 15000 + (RANDOM() * 20000)
                END,
                CASE 
                    WHEN (RANDOM() * 4)::INTEGER = 0 THEN 15000
                    ELSE 25000 + (RANDOM() * 35000)
                END,
                CASE (RANDOM() * 3)::INTEGER
                    WHEN 0 THEN 'Covers tuition fees and accommodation'
                    WHEN 1 THEN 'Covers 75% of tuition fees'
                    ELSE 'Covers full tuition and provides living allowance'
                END,
                'Open to all international students with strong academic record. Demonstrated leadership potential preferred.',
                ARRAY['NGA', 'GHA', 'KEN', 'ZAF', 'EGY', 'UGA', 'TZA', 'RWA', 'ETH'], -- More African countries
                3.3 + (RANDOM() * 0.7),
                CURRENT_DATE + INTERVAL '45 days' + (RANDOM() * INTERVAL '150 days'),
                'https://university.edu/international-scholarships',
                true,
                RANDOM() > 0.3
            );
            
            scholarship_count := scholarship_count + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Created % scholarships', scholarship_count;
END $$;

-- Create some additional specific scholarships
INSERT INTO program_scholarships (
    program_id,
    university_id,
    scholarship_name,
    type,
    amount_min_usd,
    amount_max_usd,
    coverage_details,
    eligibility_criteria,
    eligible_countries,
    min_gpa,
    application_deadline,
    application_url,
    is_active,
    renewable
) VALUES
-- Full scholarship example
(
    NULL,
    (SELECT id FROM universities LIMIT 1),
    'Presidential Excellence Scholarship',
    'full',
    50000,
    50000,
    'Covers full tuition, accommodation, meals, and provides monthly stipend for living expenses',
    'Exceptional academic achievement (GPA 3.8+), leadership experience, and community service record required',
    ARRAY['NGA', 'GHA', 'KEN', 'ZAF'],
    3.8,
    CURRENT_DATE + INTERVAL '60 days',
    'https://university.edu/presidential-scholarship',
    true,
    true
),

-- Partial scholarship example
(
    NULL,
    (SELECT id FROM universities ORDER BY RANDOM() LIMIT 1),
    'International Student Grant',
    'partial',
    10000,
    15000,
    'Covers 50% of tuition fees for first year, renewable based on academic performance',
    'International students with GPA 3.5+, demonstrated financial need, and English proficiency',
    ARRAY['NGA', 'GHA', 'KEN', 'ZAF', 'EGY', 'UGA', 'TZA', 'RWA', 'ETH'],
    3.5,
    CURRENT_DATE + INTERVAL '90 days',
    'https://university.edu/international-grant',
    true,
    true
),

-- Tuition waiver example
(
    NULL,
    (SELECT id FROM universities ORDER BY RANDOM() LIMIT 1),
    'Academic Excellence Tuition Waiver',
    'tuition-waiver',
    0,
    0,
    'Full tuition waiver for up to 4 years, student responsible for living expenses',
    'Top 5% of applicants, minimum GPA 3.7, strong extracurricular involvement',
    ARRAY['NGA', 'GHA', 'KEN', 'ZAF'],
    3.7,
    CURRENT_DATE + INTERVAL '75 days',
    'https://university.edu/tuition-waiver',
    true,
    true
);


