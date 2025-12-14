/*
  Add Missing Universities and Cities

  Based on Query 3 and Query 4 results, this script adds:
  - 22 missing universities
  - 15+ missing cities

  After running this, re-run the data sync script to match programs.
*/

-- ==========================================
-- PART 0: ADD MISSING COUNTRIES FIRST
-- ==========================================

-- Add missing countries that are referenced but not in the countries table
INSERT INTO countries (country_code, name, region, currency_code, currency_symbol, is_origin_country, is_active,
  avg_living_cost_monthly_usd, visa_fee_usd, visa_processing_days, work_permit_hours_weekly, post_study_work_duration)
SELECT * FROM (VALUES
  ('SWE', 'Sweden', 'Europe', 'SEK', 'kr', false, true, 1100, 100, 30, 20, '12 months'),
  ('CHE', 'Switzerland', 'Europe', 'CHF', 'Fr', false, true, 1800, 150, 45, 15, '6 months'),
  ('NOR', 'Norway', 'Europe', 'NOK', 'kr', false, true, 1400, 120, 30, 20, '12 months'),
  ('SGP', 'Singapore', 'Asia', 'SGD', 'S$', false, true, 1300, 90, 14, 16, '12 months'),
  ('FRA', 'France', 'Europe', 'EUR', '€', false, true, 1000, 99, 21, 20, '24 months')
) AS v(country_code, name, region, currency_code, currency_symbol, is_origin_country, is_active,
  avg_living_cost_monthly_usd, visa_fee_usd, visa_processing_days, work_permit_hours_weekly, post_study_work_duration)
WHERE NOT EXISTS (
  SELECT 1 FROM countries WHERE countries.country_code = v.country_code
);

-- ==========================================
-- PART 1: ADD MISSING UNIVERSITIES
-- ==========================================

-- Insert universities only if they don't already exist
INSERT INTO universities (name, country_code, ranking_world, type, website)
SELECT * FROM (VALUES
  ('Arizona State University', 'USA', 216, 'Public', 'https://www.asu.edu'),
  ('Carnegie Mellon University', 'USA', 52, 'Private', 'https://www.cmu.edu'),
  ('Chalmers University of Technology', 'SWE', 125, 'Public', 'https://www.chalmers.se'),
  ('Cornell University', 'USA', 12, 'Private', 'https://www.cornell.edu'),
  ('Covenant University', 'NGA', null, 'Private', 'https://covenantuniversity.edu.ng'),
  ('ETH Zurich', 'CHE', 7, 'Public', 'https://ethz.ch'),
  ('Georgia Institute of Technology', 'USA', 38, 'Public', 'https://www.gatech.edu'),
  ('Harvard Business School', 'USA', null, 'Private', 'https://www.hbs.edu'),
  ('INSEAD', 'FRA', null, 'Private', 'https://www.insead.edu'),
  ('KTH Royal Institute of Technology', 'SWE', 89, 'Public', 'https://www.kth.se'),
  ('London Business School', 'GBR', null, 'Private', 'https://www.london.edu'),
  ('National University of Singapore', 'SGP', 11, 'Public', 'https://www.nus.edu.sg'),
  ('University of Birmingham', 'GBR', 91, 'Public', 'https://www.birmingham.ac.uk'),
  ('University of California, Berkeley', 'USA', 27, 'Public', 'https://www.berkeley.edu'),
  ('University of California, San Diego', 'USA', 21, 'Public', 'https://ucsd.edu'),
  ('University of Cape Town', 'ZAF', 173, 'Public', 'https://www.uct.ac.za'),
  ('University of Lagos', 'NGA', null, 'Public', 'https://www.unilag.edu.ng'),
  ('University of Oslo', 'NOR', 117, 'Public', 'https://www.uio.no'),
  ('University of Texas at Austin', 'USA', 43, 'Public', 'https://www.utexas.edu'),
  ('University of Washington', 'USA', 6, 'Public', 'https://www.washington.edu'),
  ('Wharton School', 'USA', null, 'Private', 'https://www.wharton.upenn.edu')
) AS v(name, country_code, ranking_world, type, website)
WHERE NOT EXISTS (
  SELECT 1 FROM universities WHERE universities.name = v.name
);

-- Note: "Georgia Tech" is same as "Georgia Institute of Technology" - will be handled by fuzzy matching

-- ==========================================
-- PART 2: ADD MISSING CITIES
-- ==========================================

-- Get country codes for city insertion
-- USA: Most cities needed
-- GBR: Birmingham, Cambridge
-- SWE: Gothenburg, Stockholm
-- CHE: Zurich
-- CAN: Waterloo
-- FRA: Fontainebleau

-- Insert cities only if they don't already exist
INSERT INTO cities (name, country_code, currency_code, tier)
SELECT * FROM (VALUES
  -- United States cities
  ('Atlanta', 'USA', 'USD', 'major'),
  ('Austin', 'USA', 'USD', 'major'),
  ('Berkeley', 'USA', 'USD', 'major'),
  ('Cambridge', 'USA', 'USD', 'major'),  -- Cambridge, MA (MIT, Harvard)
  ('Ithaca', 'USA', 'USD', 'small'),     -- Cornell
  ('La Jolla', 'USA', 'USD', 'mid'),     -- UCSD
  ('Philadelphia', 'USA', 'USD', 'major'),
  ('Pittsburgh', 'USA', 'USD', 'major'),  -- Carnegie Mellon
  ('Seattle', 'USA', 'USD', 'major'),     -- U of Washington
  ('Stanford', 'USA', 'USD', 'mid'),      -- Stanford University area
  ('Tempe', 'USA', 'USD', 'major'),       -- Arizona State

  -- United Kingdom cities
  ('Birmingham', 'GBR', 'GBP', 'major'),
  ('Cambridge', 'GBR', 'GBP', 'major'),   -- Cambridge, UK

  -- Sweden cities
  ('Gothenburg', 'SWE', 'SEK', 'major'),
  ('Stockholm', 'SWE', 'SEK', 'major'),

  -- Switzerland cities
  ('Zurich', 'CHE', 'CHF', 'major'),

  -- Canada cities
  ('Waterloo', 'CAN', 'CAD', 'mid'),

  -- France cities
  ('Fontainebleau', 'FRA', 'EUR', 'small')  -- INSEAD
) AS v(name, country_code, currency_code, tier)
WHERE NOT EXISTS (
  SELECT 1 FROM cities WHERE cities.name = v.name AND cities.country_code = v.country_code
);

-- ==========================================
-- PART 3: UPDATE PROGRAMS WITH FUZZY MATCHING
-- ==========================================

-- Update university_id for programs with exact or fuzzy matches
UPDATE programs p
SET university_id = u.id
FROM universities u
WHERE
  p.university_id IS NULL
  AND (
    -- Exact match
    LOWER(TRIM(p.university)) = LOWER(TRIM(u.name))
    OR
    -- Fuzzy match: program contains university name
    LOWER(TRIM(p.university)) LIKE '%' || LOWER(TRIM(u.name)) || '%'
    OR
    -- Fuzzy match: university name contains program text
    LOWER(TRIM(u.name)) LIKE '%' || LOWER(TRIM(p.university)) || '%'
  );

-- Special case: "Georgia Tech" -> "Georgia Institute of Technology"
UPDATE programs p
SET university_id = u.id
FROM universities u
WHERE
  p.university_id IS NULL
  AND LOWER(TRIM(p.university)) = 'georgia tech'
  AND LOWER(TRIM(u.name)) = 'georgia institute of technology';

-- Update city_id for programs with exact matches
UPDATE programs p
SET city_id = c.id
FROM cities c
WHERE
  p.city_id IS NULL
  AND p.city IS NOT NULL
  AND LOWER(TRIM(p.city)) = LOWER(TRIM(c.name))
  AND p.country = (SELECT name FROM countries WHERE country_code = c.country_code);

-- ==========================================
-- PART 4: VERIFICATION REPORT
-- ==========================================

DO $$
DECLARE
  total_programs INTEGER;
  matched_unis INTEGER;
  matched_cities INTEGER;
  remaining_unis INTEGER;
  remaining_cities INTEGER;
  uni_record RECORD;
  city_record RECORD;
BEGIN
  SELECT COUNT(*) INTO total_programs FROM programs;
  SELECT COUNT(*) INTO matched_unis FROM programs WHERE university_id IS NOT NULL;
  SELECT COUNT(*) INTO matched_cities FROM programs WHERE city_id IS NOT NULL;

  remaining_unis := total_programs - matched_unis;
  remaining_cities := total_programs - matched_cities;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION VERIFICATION REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Programs: %', total_programs;
  RAISE NOTICE '';
  RAISE NOTICE 'Universities:';
  RAISE NOTICE '  - Matched: % (%.1f%%)', matched_unis, (matched_unis::DECIMAL / total_programs * 100);
  RAISE NOTICE '  - Unmatched: % (%.1f%%)', remaining_unis, (remaining_unis::DECIMAL / total_programs * 100);
  RAISE NOTICE '';
  RAISE NOTICE 'Cities:';
  RAISE NOTICE '  - Matched: % (%.1f%%)', matched_cities, (matched_cities::DECIMAL / total_programs * 100);
  RAISE NOTICE '  - Unmatched: % (%.1f%%)', remaining_cities, (remaining_cities::DECIMAL / total_programs * 100);
  RAISE NOTICE '========================================';

  IF remaining_unis > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'REMAINING UNMATCHED UNIVERSITIES:';
    FOR uni_record IN (
      SELECT DISTINCT university, COUNT(*) as cnt
      FROM programs
      WHERE university_id IS NULL
      GROUP BY university
      ORDER BY cnt DESC
      LIMIT 10
    ) LOOP
      RAISE NOTICE '  - % (% programs)', uni_record.university, uni_record.cnt;
    END LOOP;
  END IF;

  IF remaining_cities > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'REMAINING UNMATCHED CITIES:';
    FOR city_record IN (
      SELECT DISTINCT city, country, COUNT(*) as cnt
      FROM programs
      WHERE city_id IS NULL AND city IS NOT NULL
      GROUP BY city, country
      ORDER BY cnt DESC
      LIMIT 10
    ) LOOP
      RAISE NOTICE '  - %, % (% programs)', city_record.city, city_record.country, city_record.cnt;
    END LOOP;
  END IF;
END $$;
