-- Standardize degree_type values
-- This migration fixes inconsistent degree type values

-- First, update all variations to standard values
UPDATE programs
SET degree_type = CASE
  WHEN degree_type IN ('Masters', 'Master') THEN 'Master'
  WHEN degree_type IN ('Bachelors', 'Bachelor') THEN 'Bachelor'
  WHEN degree_type = 'PhD' THEN 'Doctorate'
  ELSE degree_type
END
WHERE degree_type IS NOT NULL;

-- Add constraint to ensure only valid degree types are used
ALTER TABLE programs
DROP CONSTRAINT IF EXISTS programs_degree_type_check;

ALTER TABLE programs
ADD CONSTRAINT programs_degree_type_check
CHECK (degree_type IN (
  'Bachelor',
  'Master',
  'Doctorate',
  'Diploma',
  'Certificate'
));

-- Update any NULL degree_type values based on program name patterns
UPDATE programs
SET degree_type = CASE
  -- Bachelor's degrees
  WHEN name ILIKE 'BSc%' OR name ILIKE 'BA%' OR name ILIKE 'BEng%'
    OR name ILIKE 'Bachelor%' OR name ILIKE 'B.Sc%' OR name ILIKE 'B.A%'
    OR name ILIKE 'B.Eng%' OR name ILIKE 'LLB%' THEN 'Bachelor'

  -- Master's degrees
  WHEN name ILIKE 'MSc%' OR name ILIKE 'MA%' OR name ILIKE 'MEng%'
    OR name ILIKE 'MBA%' OR name ILIKE 'Master%' OR name ILIKE 'M.Sc%'
    OR name ILIKE 'M.A%' OR name ILIKE 'M.Eng%' OR name ILIKE 'MS %'
    OR name ILIKE 'LLM%' THEN 'Master'

  -- Doctorate degrees
  WHEN name ILIKE 'PhD%' OR name ILIKE 'Ph.D%' OR name ILIKE 'DPhil%'
    OR name ILIKE 'Doctor%' OR name ILIKE 'Doctorate%' THEN 'Doctorate'

  -- Diplomas
  WHEN name ILIKE 'Diploma%' OR name ILIKE 'Dip%' THEN 'Diploma'

  -- Certificates
  WHEN name ILIKE 'Certificate%' OR name ILIKE 'Cert%' THEN 'Certificate'

  ELSE degree_type
END
WHERE degree_type IS NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_programs_degree_type ON programs(degree_type);

-- Display summary of changes
SELECT degree_type, COUNT(*) as count
FROM programs
WHERE degree_type IS NOT NULL
GROUP BY degree_type
ORDER BY degree_type;
