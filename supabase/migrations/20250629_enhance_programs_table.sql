/*
  # Enhance Programs Table for MVP Launch
  
  Adds missing fields required by PRD:
  - duration (e.g., "2 years", "18 months")
  - specialization (e.g., "Computer Science", "Data Science")
  - description (program details)
  - website (official program URL)
  - deadline (application deadline)
  - location (city/state)
  - requirements (admission requirements array)
  - has_scholarships (boolean for financial aid availability)
*/

-- Add missing columns to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS deadline date,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS requirements text[], -- Array of requirement strings
ADD COLUMN IF NOT EXISTS has_scholarships boolean DEFAULT false;

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS programs_country_idx ON programs(country);
CREATE INDEX IF NOT EXISTS programs_specialization_idx ON programs(specialization);
CREATE INDEX IF NOT EXISTS programs_tuition_idx ON programs(tuition_fee);

-- Update the search index to include new fields
DROP INDEX IF EXISTS programs_search_idx;
CREATE INDEX programs_search_idx ON programs USING gin(
  to_tsvector('english', 
    name || ' ' || 
    university || ' ' || 
    COALESCE(specialization, '') || ' ' || 
    COALESCE(description, '')
  )
);

-- Add check constraint for valid degree types
ALTER TABLE programs 
ADD CONSTRAINT IF NOT EXISTS valid_degree_type 
CHECK (degree_type IN ('Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma'));

-- Add comment for clarity
COMMENT ON TABLE programs IS 'International education programs for Nigerian students';