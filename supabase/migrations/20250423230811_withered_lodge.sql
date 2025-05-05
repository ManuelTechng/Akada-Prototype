/*
  # Add Scholarships Flag to Programs

  1. Changes
    - Add has_scholarships column to programs table
    - Update existing programs with random scholarship status for testing
*/

-- Add has_scholarships column
ALTER TABLE programs 
ADD COLUMN has_scholarships boolean DEFAULT false;

-- Update existing programs with random scholarship status
UPDATE programs 
SET has_scholarships = (random() > 0.5);

-- Add index for scholarship filtering
CREATE INDEX idx_programs_scholarships ON programs(has_scholarships) WHERE has_scholarships = true;