-- Migration: Fix Database Inconsistencies for UI/UX Optimization
-- Date: 2025-07-07
-- Purpose: Standardize scholarship fields, budget storage, and add performance indexes

-- 1. Standardize scholarship fields (consolidate has_scholarships and scholarship_available)
-- Update scholarship_available based on has_scholarships where null
UPDATE programs 
SET scholarship_available = has_scholarships 
WHERE scholarship_available IS NULL OR scholarship_available = false;

-- Set default value for scholarship_available
ALTER TABLE programs 
ALTER COLUMN scholarship_available SET DEFAULT false;

-- Add comment explaining the deprecation
COMMENT ON COLUMN programs.has_scholarships IS 'DEPRECATED: Use scholarship_available instead. Kept for data migration compatibility.';

-- 2. Add performance indexes for faster program searches
-- Index for country + specialization filtering (most common search pattern)
CREATE INDEX IF NOT EXISTS idx_programs_country_specialization 
ON programs(country, specialization) 
WHERE scholarship_available = true;

-- Index for study level filtering
CREATE INDEX IF NOT EXISTS idx_programs_study_level 
ON programs(study_level) 
WHERE study_level IS NOT NULL;

-- Index for tuition fee range searches
CREATE INDEX IF NOT EXISTS idx_programs_tuition_fee 
ON programs(tuition_fee) 
WHERE tuition_fee > 0;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_programs_search_composite 
ON programs(country, study_level, scholarship_available, tuition_fee);

-- 3. Add indexes for user preference tables
-- Index for user preferences lookup
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);

-- Index for application deadline tracking
CREATE INDEX IF NOT EXISTS idx_applications_user_deadline 
ON applications(user_id, deadline) 
WHERE deadline > NOW();

-- Index for saved programs lookup
CREATE INDEX IF NOT EXISTS idx_saved_programs_user_id 
ON saved_programs(user_id);

-- Index for chat messages by user
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
ON chat_messages(user_id, created_at);

-- 4. Add constraints and validation
-- Ensure budget_range is positive in user_preferences
ALTER TABLE user_preferences 
ADD CONSTRAINT check_budget_range_positive 
CHECK (budget_range IS NULL OR budget_range > 0);

-- Ensure tuition_fee is positive in programs
ALTER TABLE programs 
ADD CONSTRAINT check_tuition_fee_positive 
CHECK (tuition_fee > 0);

-- 5. Update table statistics for query optimization
ANALYZE programs;
ANALYZE user_preferences;
ANALYZE applications;
ANALYZE saved_programs;

-- 6. Add helpful views for UI components
-- View for program recommendations with computed scores
CREATE OR REPLACE VIEW program_recommendations AS
SELECT 
    p.*,
    ce.avg_monthly_living,
    ce.student_visa_fee,
    ce.currency as country_currency,
    -- Compute total cost in NGN
    CASE 
        WHEN ce.currency = 'NGN' THEN p.tuition_fee + (ce.avg_monthly_living * 24) + ce.student_visa_fee
        ELSE (p.tuition_fee + (ce.avg_monthly_living * 24) + ce.student_visa_fee) * 1500  -- USD to NGN conversion
    END as total_cost_ngn
FROM programs p
LEFT JOIN country_estimates ce ON p.country = ce.country
WHERE p.tuition_fee > 0;

-- Comment the view
COMMENT ON VIEW program_recommendations IS 'Optimized view for UI program cards with cost calculations in NGN';

-- 7. Create function for program matching (used by unified preference service)
CREATE OR REPLACE FUNCTION calculate_program_match_score(
    program_id UUID,
    user_countries TEXT[],
    user_specializations TEXT[],
    user_budget NUMERIC,
    user_study_level TEXT,
    needs_scholarship BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
    match_score INTEGER := 0;
    program_record RECORD;
BEGIN
    -- Get program details
    SELECT * INTO program_record 
    FROM programs 
    WHERE id = program_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Country match (25 points)
    IF program_record.country = ANY(user_countries) THEN
        match_score := match_score + 25;
    END IF;
    
    -- Specialization match (30 points)
    IF program_record.specialization = ANY(user_specializations) THEN
        match_score := match_score + 30;
    END IF;
    
    -- Budget match (20 points)
    IF user_budget IS NOT NULL AND program_record.tuition_fee <= user_budget THEN
        match_score := match_score + 20;
    END IF;
    
    -- Study level match (15 points)
    IF program_record.study_level = user_study_level THEN
        match_score := match_score + 15;
    END IF;
    
    -- Scholarship match (10 points)
    IF needs_scholarship AND program_record.scholarship_available THEN
        match_score := match_score + 10;
    END IF;
    
    RETURN LEAST(match_score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Comment the function
COMMENT ON FUNCTION calculate_program_match_score IS 'Calculates match score for program recommendations in UI';
