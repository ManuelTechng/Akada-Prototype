/*
  Add institution_type column to universities table

  Distinguishes between:
  - University (research-focused, comprehensive programs)
  - College (teaching-focused, undergraduate emphasis)
  - Technical Institute / Polytechnic (vocational, hands-on)
  - Business School (specialized in business/management)
  - Community College (2-year programs, affordable)
  - Institute of Technology (engineering/tech focused)
  - Other (specialized institutions)

  Note: The existing 'type' column (Public/Private) represents ownership,
  while this new 'institution_type' represents the academic category.
*/

-- Add institution_type column
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS institution_type TEXT
CHECK (institution_type IN (
  'University',
  'College',
  'Technical Institute',
  'Polytechnic',
  'Business School',
  'Community College',
  'Institute of Technology',
  'Art School',
  'Music School',
  'Medical School',
  'Law School',
  'Other'
));

-- Set default value for existing records (based on name patterns)
UPDATE universities
SET institution_type = CASE
  -- Business Schools
  WHEN name ILIKE '%business school%' THEN 'Business School'
  WHEN name ILIKE '%school of business%' THEN 'Business School'

  -- Institutes of Technology
  WHEN name ILIKE '%institute of technology%' THEN 'Institute of Technology'
  WHEN name ILIKE '%polytechnic%' THEN 'Polytechnic'
  WHEN name ILIKE '%technical%' THEN 'Technical Institute'

  -- Colleges
  WHEN name ILIKE '%college%' THEN 'College'
  WHEN name ILIKE 'Imperial College%' THEN 'University' -- Exception: Imperial is a university

  -- Default to University for all others
  ELSE 'University'
END
WHERE institution_type IS NULL;

-- Add comment to column for documentation
COMMENT ON COLUMN universities.institution_type IS 'Academic category of the institution (University, College, Technical Institute, etc.). Distinct from type column which indicates ownership (Public/Private).';

-- Verification query
DO $$
DECLARE
  type_record RECORD;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INSTITUTION TYPE DISTRIBUTION';
  RAISE NOTICE '========================================';

  FOR type_record IN (
    SELECT institution_type, COUNT(*) as count
    FROM universities
    GROUP BY institution_type
    ORDER BY count DESC
  ) LOOP
    RAISE NOTICE '  % : % institutions', type_record.institution_type, type_record.count;
  END LOOP;

  RAISE NOTICE '========================================';
END $$;
