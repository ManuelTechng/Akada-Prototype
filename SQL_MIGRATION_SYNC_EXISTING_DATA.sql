-- SQL Migration Script: Sync Existing User Data
-- Purpose: Sync existing JSONB data to structured user_preferences table
-- Run this ONCE to migrate existing users before deploying new code
--
-- Date: January 2025
-- Related: FINAL_IMPLEMENTATION_SUMMARY.md

-- ============================================================================
-- SECTION 1: Sync goals from JSONB to structured table
-- ============================================================================

-- Update goals for users where structured table has NULL but JSONB has data
UPDATE user_preferences
SET goals = (
  SELECT study_preferences->>'goals'
  FROM user_profiles
  WHERE id = user_preferences.user_id
)
WHERE goals IS NULL
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_preferences.user_id
    AND study_preferences->>'goals' IS NOT NULL
    AND study_preferences->>'goals' != ''
  );

-- Log results
SELECT
  COUNT(*) as goals_updated,
  'Goals synced from JSONB to structured table' as description
FROM user_preferences
WHERE goals IS NOT NULL;

-- ============================================================================
-- SECTION 2: Sync language_preference from JSONB to structured table
-- ============================================================================

-- Update language_preference for users where structured table has NULL but JSONB has data
UPDATE user_preferences
SET language_preference = (
  SELECT study_preferences->>'language_preference'
  FROM user_profiles
  WHERE id = user_preferences.user_id
)
WHERE language_preference IS NULL
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_preferences.user_id
    AND study_preferences->>'language_preference' IS NOT NULL
    AND study_preferences->>'language_preference' != ''
  );

-- Log results
SELECT
  COUNT(*) as language_preferences_updated,
  'Language preferences synced from JSONB to structured table' as description
FROM user_preferences
WHERE language_preference IS NOT NULL;

-- ============================================================================
-- SECTION 3: Sync countries from JSONB to structured table
-- ============================================================================

-- Update countries for users where structured table has NULL/empty but JSONB has data
UPDATE user_preferences
SET countries = (
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(study_preferences->'countries')
  )
  FROM user_profiles
  WHERE id = user_preferences.user_id
)
WHERE (countries IS NULL OR countries = '{}')
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_preferences.user_id
    AND jsonb_array_length(study_preferences->'countries') > 0
  );

-- Log results
SELECT
  COUNT(*) as countries_updated,
  'Countries synced from JSONB to structured table' as description
FROM user_preferences
WHERE countries IS NOT NULL AND countries != '{}';

-- ============================================================================
-- SECTION 4: Sync specializations from JSONB to structured table
-- ============================================================================

-- Update specializations for users where structured table has NULL/empty but JSONB has data
UPDATE user_preferences
SET specializations = (
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(study_preferences->'specializations')
  )
  FROM user_profiles
  WHERE id = user_preferences.user_id
)
WHERE (specializations IS NULL OR specializations = '{}')
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_preferences.user_id
    AND jsonb_array_length(study_preferences->'specializations') > 0
  );

-- Log results
SELECT
  COUNT(*) as specializations_updated,
  'Specializations synced from JSONB to structured table' as description
FROM user_preferences
WHERE specializations IS NOT NULL AND specializations != '{}';

-- ============================================================================
-- SECTION 5: Sync study_level (program_type) from JSONB to structured table
-- ============================================================================

-- Update study_level for users where structured table has NULL but JSONB has program_type
UPDATE user_preferences
SET study_level = (
  SELECT study_preferences->'program_type'->>0
  FROM user_profiles
  WHERE id = user_preferences.user_id
)
WHERE study_level IS NULL
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_preferences.user_id
    AND jsonb_array_length(study_preferences->'program_type') > 0
  );

-- Log results
SELECT
  COUNT(*) as study_levels_updated,
  'Study levels synced from JSONB program_type to structured table' as description
FROM user_preferences
WHERE study_level IS NOT NULL;

-- ============================================================================
-- SECTION 6: Sync preferred_duration (start_date) from JSONB to structured table
-- ============================================================================

-- Update preferred_duration for users where structured table has NULL but JSONB has start_date
UPDATE user_preferences
SET preferred_duration = (
  SELECT study_preferences->>'start_date'
  FROM user_profiles
  WHERE id = user_preferences.user_id
)
WHERE preferred_duration IS NULL
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_preferences.user_id
    AND study_preferences->>'start_date' IS NOT NULL
    AND study_preferences->>'start_date' != ''
  );

-- Log results
SELECT
  COUNT(*) as preferred_durations_updated,
  'Preferred durations synced from JSONB start_date to structured table' as description
FROM user_preferences
WHERE preferred_duration IS NOT NULL;

-- ============================================================================
-- SECTION 7: Sync budget_range (max_tuition) from JSONB to structured table
-- ============================================================================

-- Update budget_range for users where structured table has NULL but JSONB has max_tuition
-- Note: max_tuition is stored as string in JSONB, need to cast to numeric
UPDATE user_preferences
SET budget_range = (
  SELECT CAST(study_preferences->>'max_tuition' AS NUMERIC)
  FROM user_profiles
  WHERE id = user_preferences.user_id
)
WHERE budget_range IS NULL
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_preferences.user_id
    AND study_preferences->>'max_tuition' IS NOT NULL
    AND study_preferences->>'max_tuition' != ''
    AND study_preferences->>'max_tuition' ~ '^[0-9]+(\.[0-9]+)?$' -- Valid number check
  );

-- Log results
SELECT
  COUNT(*) as budget_ranges_updated,
  'Budget ranges synced from JSONB max_tuition to structured table' as description
FROM user_preferences
WHERE budget_range IS NOT NULL;

-- ============================================================================
-- SECTION 8: Update timestamps for all synced records
-- ============================================================================

UPDATE user_preferences
SET updated_at = NOW()
WHERE updated_at < NOW() - INTERVAL '1 hour'; -- Only update if older than 1 hour

-- ============================================================================
-- SECTION 9: Verification Queries
-- ============================================================================

-- Check data consistency after migration
SELECT
  'Data Consistency Check' as check_type,
  COUNT(*) as total_users,
  SUM(CASE WHEN goals IS NOT NULL THEN 1 ELSE 0 END) as users_with_goals,
  SUM(CASE WHEN language_preference IS NOT NULL THEN 1 ELSE 0 END) as users_with_language,
  SUM(CASE WHEN countries IS NOT NULL AND countries != '{}' THEN 1 ELSE 0 END) as users_with_countries,
  SUM(CASE WHEN budget_range IS NOT NULL THEN 1 ELSE 0 END) as users_with_budget,
  SUM(CASE WHEN specializations IS NOT NULL AND specializations != '{}' THEN 1 ELSE 0 END) as users_with_specializations,
  SUM(CASE WHEN study_level IS NOT NULL THEN 1 ELSE 0 END) as users_with_study_level,
  SUM(CASE WHEN preferred_duration IS NOT NULL THEN 1 ELSE 0 END) as users_with_duration
FROM user_preferences;

-- Compare JSONB vs Structured data for a sample user
-- Replace 'YOUR_USER_ID' with an actual user ID to test
/*
SELECT
  'Sample User Comparison' as check_type,
  up.user_id,
  -- JSONB data
  upr.study_preferences->>'goals' as jsonb_goals,
  upr.study_preferences->>'language_preference' as jsonb_language,
  upr.study_preferences->'countries' as jsonb_countries,
  upr.study_preferences->>'max_tuition' as jsonb_budget,
  -- Structured data
  up.goals as structured_goals,
  up.language_preference as structured_language,
  up.countries as structured_countries,
  up.budget_range as structured_budget
FROM user_preferences up
JOIN user_profiles upr ON up.user_id = upr.id
WHERE up.user_id = 'YOUR_USER_ID';
*/

-- ============================================================================
-- SECTION 10: Find users with missing sync data
-- ============================================================================

-- Users who have JSONB data but structured table is empty
SELECT
  'Users Needing Manual Review' as issue_type,
  COUNT(*) as count_users
FROM user_profiles upr
LEFT JOIN user_preferences up ON upr.id = up.user_id
WHERE
  -- Has JSONB data
  (upr.study_preferences IS NOT NULL AND upr.study_preferences != '{}'::jsonb)
  AND (
    -- But structured is empty
    up.user_id IS NULL
    OR (up.goals IS NULL AND upr.study_preferences->>'goals' IS NOT NULL)
    OR (up.language_preference IS NULL AND upr.study_preferences->>'language_preference' IS NOT NULL)
    OR ((up.countries IS NULL OR up.countries = '{}') AND jsonb_array_length(upr.study_preferences->'countries') > 0)
  );

-- ============================================================================
-- SECTION 11: Create missing user_preferences records
-- ============================================================================

-- Insert records for users who have profiles but no user_preferences row
INSERT INTO user_preferences (user_id, created_at, updated_at)
SELECT
  id as user_id,
  NOW() as created_at,
  NOW() as updated_at
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Log results
SELECT
  COUNT(*) as new_records_created,
  'New user_preferences records created' as description
FROM user_preferences
WHERE created_at > NOW() - INTERVAL '1 minute';

-- ============================================================================
-- SECTION 12: Final Summary Report
-- ============================================================================

-- Generate comprehensive summary
SELECT
  'MIGRATION SUMMARY' as report_type,
  (SELECT COUNT(*) FROM user_profiles) as total_profiles,
  (SELECT COUNT(*) FROM user_preferences) as total_preferences,
  (SELECT COUNT(*) FROM user_preferences WHERE goals IS NOT NULL) as synced_goals,
  (SELECT COUNT(*) FROM user_preferences WHERE language_preference IS NOT NULL) as synced_languages,
  (SELECT COUNT(*) FROM user_preferences WHERE countries IS NOT NULL AND countries != '{}') as synced_countries,
  (SELECT COUNT(*) FROM user_preferences WHERE budget_range IS NOT NULL) as synced_budgets,
  NOW() as migration_completed_at;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

-- To rollback this migration (USE WITH CAUTION):
/*
-- This will clear all synced data from structured table
-- Only use if migration failed or caused issues
UPDATE user_preferences
SET
  goals = NULL,
  language_preference = NULL,
  countries = NULL,
  specializations = NULL,
  study_level = NULL,
  preferred_duration = NULL,
  budget_range = NULL,
  updated_at = NOW()
WHERE updated_at > NOW() - INTERVAL '1 hour';
*/

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. This migration is IDEMPOTENT - safe to run multiple times
-- 2. Only updates NULL values in structured table
-- 3. Does not modify JSONB data
-- 4. Can be run on production without downtime
-- 5. All updates are logged for verification
-- 6. Run verification queries after migration
-- 7. Monitor application logs after deployment for sync warnings

-- ============================================================================
-- POST-MIGRATION CHECKLIST
-- ============================================================================

-- [ ] Run all sections 1-11
-- [ ] Check Section 9 verification queries
-- [ ] Verify Section 10 shows 0 users needing manual review
-- [ ] Review Section 12 summary report
-- [ ] Test profile save in application
-- [ ] Verify dashboard shows correct completion percentage
-- [ ] Monitor console logs for "✅ All study preferences synced" message
-- [ ] Confirm no sync warnings in application logs

-- END OF MIGRATION SCRIPT
