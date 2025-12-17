/*
  ==========================================
  PROGRAMS TABLE DATA SYNCHRONIZATION
  ==========================================

  Purpose: Sync old TEXT columns to new UUID/JSONB columns
  Addresses conflicts:
  - university (TEXT) → university_id (UUID FK)
  - city (TEXT) → city_id (UUID FK)
  - deadline/application_deadline → application_deadlines (JSONB)

  Strategy: Keep both old and new columns, sync data, add compatibility views

  Run this AFTER Phase 2A & 2B migrations are complete
  ==========================================
*/

-- ==========================================
-- PART 1: SYNC UNIVERSITY TEXT → UNIVERSITY_ID
-- ==========================================

-- Match programs to universities by fuzzy name matching
UPDATE programs p
SET university_id = u.id
FROM universities u
WHERE
  university_id IS NULL
  AND (
    -- Exact match
    LOWER(TRIM(p.university)) = LOWER(TRIM(u.name))
    OR
    -- Fuzzy match (handles "MIT" vs "Massachusetts Institute of Technology")
    LOWER(TRIM(p.university)) LIKE '%' || LOWER(TRIM(u.name)) || '%'
    OR
    LOWER(TRIM(u.name)) LIKE '%' || LOWER(TRIM(p.university)) || '%'
  );

-- Report unmatched universities
DO $$
DECLARE
  unmatched_count INTEGER;
  university_record RECORD;
BEGIN
  SELECT COUNT(*) INTO unmatched_count
  FROM programs
  WHERE university_id IS NULL;

  IF unmatched_count > 0 THEN
    RAISE NOTICE 'WARNING: % programs have no university_id match. These will need manual mapping.', unmatched_count;
    RAISE NOTICE 'Unmatched universities:';

    FOR university_record IN
      SELECT DISTINCT university
      FROM programs
      WHERE university_id IS NULL
      ORDER BY university
      LIMIT 10
    LOOP
      RAISE NOTICE '  - %', university_record.university;
    END LOOP;
  ELSE
    RAISE NOTICE 'SUCCESS: All programs matched to universities!';
  END IF;
END $$;

-- ==========================================
-- PART 2: SYNC CITY TEXT → CITY_ID
-- ==========================================

-- Match programs to cities by name AND country
UPDATE programs p
SET city_id = c.id
FROM cities c
JOIN countries co ON c.country_code = co.country_code
WHERE
  p.city_id IS NULL
  AND p.city IS NOT NULL
  AND LOWER(TRIM(p.city)) = LOWER(TRIM(c.name))
  AND LOWER(TRIM(p.country)) = LOWER(TRIM(co.name));

-- Fallback: Match by city name only (less accurate)
UPDATE programs p
SET city_id = c.id
FROM cities c
WHERE
  p.city_id IS NULL
  AND p.city IS NOT NULL
  AND LOWER(TRIM(p.city)) = LOWER(TRIM(c.name))
  AND NOT EXISTS (
    -- Only if there's a single match to avoid ambiguity
    SELECT 1 FROM cities c2
    WHERE LOWER(TRIM(c2.name)) = LOWER(TRIM(p.city))
    AND c2.id != c.id
  );

-- Report unmatched cities
DO $$
DECLARE
  unmatched_count INTEGER;
  city_record RECORD;
BEGIN
  SELECT COUNT(*) INTO unmatched_count
  FROM programs
  WHERE city IS NOT NULL AND city_id IS NULL;

  IF unmatched_count > 0 THEN
    RAISE NOTICE 'WARNING: % programs have no city_id match. These cities may need to be added.', unmatched_count;
    RAISE NOTICE 'Unmatched cities:';

    FOR city_record IN
      SELECT DISTINCT city, country
      FROM programs
      WHERE city IS NOT NULL AND city_id IS NULL
      ORDER BY country, city
      LIMIT 10
    LOOP
      RAISE NOTICE '  - % (%)', city_record.city, city_record.country;
    END LOOP;
  ELSE
    RAISE NOTICE 'SUCCESS: All programs with cities matched!';
  END IF;
END $$;

-- ==========================================
-- PART 3: CONSOLIDATE DEADLINE FIELDS → JSONB
-- ==========================================

-- Migrate deadline (DATE) to application_deadlines (JSONB)
-- Only if application_deadlines is NULL
UPDATE programs
SET application_deadlines = jsonb_build_array(
  jsonb_build_object(
    'intake', 'Fall ' || EXTRACT(YEAR FROM deadline)::TEXT,
    'deadline', deadline::TEXT,
    'type', 'season',
    'migrated_from', 'deadline_column'
  )
)
WHERE
  deadline IS NOT NULL
  AND application_deadlines IS NULL;

-- Migrate application_deadline (TIMESTAMP) to application_deadlines (JSONB)
-- Only if not already populated by previous step
UPDATE programs
SET application_deadlines = jsonb_build_array(
  jsonb_build_object(
    'intake', 'Fall ' || EXTRACT(YEAR FROM application_deadline)::TEXT,
    'deadline', application_deadline::DATE::TEXT,
    'type', 'season',
    'migrated_from', 'application_deadline_column'
  )
)
WHERE
  application_deadline IS NOT NULL
  AND application_deadlines IS NULL;

-- Report deadline migration
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM programs
  WHERE application_deadlines IS NOT NULL;

  RAISE NOTICE 'Migrated % programs to JSONB application_deadlines', migrated_count;
END $$;

-- ==========================================
-- PART 4: CONSOLIDATE SCHOLARSHIP BOOLEAN FLAGS
-- ==========================================

-- Sync has_scholarships and scholarship_available
-- Set both to true if either is true (they should be the same)
UPDATE programs
SET
  has_scholarships = COALESCE(has_scholarships, scholarship_available, false),
  scholarship_available = COALESCE(scholarship_available, has_scholarships, false)
WHERE has_scholarships != scholarship_available OR has_scholarships IS NULL OR scholarship_available IS NULL;

-- ==========================================
-- PART 5: SYNC WEBSITE FIELDS
-- ==========================================

-- Prioritize program_website, fallback to website, then university_website
UPDATE programs
SET program_url = COALESCE(program_website, website, university_website)
WHERE program_url IS NULL;

-- ==========================================
-- PART 6: CREATE BACKWARD-COMPATIBLE VIEWS
-- ==========================================

-- View that maintains old column names for backward compatibility
CREATE OR REPLACE VIEW programs_legacy_compat AS
SELECT
  p.*,
  -- Add computed columns for backward compatibility
  u.name AS university_name_resolved,
  c.name AS city_name_resolved,

  -- Extract first deadline from JSONB for old code
  (application_deadlines->0->>'deadline')::DATE AS primary_deadline,

  -- Scholarship flag (unified)
  COALESCE(p.has_scholarships, p.scholarship_available, false) AS has_any_scholarships

FROM programs p
LEFT JOIN universities u ON p.university_id = u.id
LEFT JOIN cities c ON p.city_id = c.id;

COMMENT ON VIEW programs_legacy_compat IS 'Backward-compatible view for existing code using old column names';

-- ==========================================
-- PART 7: ADD HELPER FUNCTIONS
-- ==========================================

-- Function to get primary application deadline from JSONB
CREATE OR REPLACE FUNCTION get_primary_deadline(program_id UUID)
RETURNS DATE AS $$
  SELECT (application_deadlines->0->>'deadline')::DATE
  FROM programs
  WHERE id = program_id;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_primary_deadline IS 'Extract primary deadline from JSONB application_deadlines array';

-- ==========================================
-- PART 8: DATA QUALITY REPORT
-- ==========================================

-- Generate comprehensive data quality report
DO $$
DECLARE
  total_programs INTEGER;
  programs_with_uni_id INTEGER;
  programs_with_city_id INTEGER;
  programs_with_deadlines INTEGER;
  programs_with_lang_req INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_programs FROM programs;
  SELECT COUNT(*) INTO programs_with_uni_id FROM programs WHERE university_id IS NOT NULL;
  SELECT COUNT(*) INTO programs_with_city_id FROM programs WHERE city_id IS NOT NULL;
  SELECT COUNT(*) INTO programs_with_deadlines FROM programs WHERE application_deadlines IS NOT NULL;
  SELECT COUNT(*) INTO programs_with_lang_req FROM programs WHERE language_requirements IS NOT NULL;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'PROGRAMS TABLE DATA QUALITY REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Programs: %', total_programs;
  RAISE NOTICE '';
  RAISE NOTICE 'University Mapping:';
  RAISE NOTICE '  - With university_id: % (% %%)', programs_with_uni_id, ROUND(programs_with_uni_id::NUMERIC / total_programs * 100, 1);
  RAISE NOTICE '  - Missing university_id: %', (total_programs - programs_with_uni_id);
  RAISE NOTICE '';
  RAISE NOTICE 'City Mapping:';
  RAISE NOTICE '  - With city_id: % (% %%)', programs_with_city_id, ROUND(programs_with_city_id::NUMERIC / total_programs * 100, 1);
  RAISE NOTICE '  - Missing city_id: %', (total_programs - programs_with_city_id);
  RAISE NOTICE '';
  RAISE NOTICE 'Deadlines (JSONB):';
  RAISE NOTICE '  - With application_deadlines: % (% %%)', programs_with_deadlines, ROUND(programs_with_deadlines::NUMERIC / total_programs * 100, 1);
  RAISE NOTICE '';
  RAISE NOTICE 'Language Requirements (JSONB):';
  RAISE NOTICE '  - With language_requirements: % (% %%)', programs_with_lang_req, ROUND(programs_with_lang_req::NUMERIC / total_programs * 100, 1);
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Review unmatched universities and cities above';
  RAISE NOTICE '2. Manually map missing university_id/city_id if needed';
  RAISE NOTICE '3. Update frontend code to use new columns gradually';
  RAISE NOTICE '4. Test programs_legacy_compat view for backward compatibility';
  RAISE NOTICE '========================================';
END $$;

-- ==========================================
-- PART 9: CREATE MANUAL MAPPING TABLE
-- ==========================================

-- Table to track manual university mappings
CREATE TABLE IF NOT EXISTS program_university_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id),
  old_university_text TEXT NOT NULL,
  new_university_id UUID NOT NULL REFERENCES universities(id),
  mapped_by TEXT,
  mapped_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(program_id)
);

COMMENT ON TABLE program_university_mappings IS 'Manual mappings for programs that could not be auto-matched to universities';

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ DATA SYNCHRONIZATION COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - programs_legacy_compat view (backward compatibility)';
  RAISE NOTICE '  - get_primary_deadline() function';
  RAISE NOTICE '  - program_university_mappings table (manual mapping tracker)';
  RAISE NOTICE '';
  RAISE NOTICE 'Review the data quality report above for next steps.';
END $$;
