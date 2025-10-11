-- =====================================================
-- Currency Standardization Migration: Phase 1 - NGN Focus
-- Date: 2025-07-12
-- Purpose: Standardize all budget/currency data to NGN with real-time conversion support
-- =====================================================

-- Migration constants
DO $$
DECLARE
    -- Exchange rates for migration (will be replaced by real-time API)
    usd_to_ngn_rate CONSTANT NUMERIC := 1500;
    eur_to_ngn_rate CONSTANT NUMERIC := 1620; -- 1 EUR = 1620 NGN
    gbp_to_ngn_rate CONSTANT NUMERIC := 1890; -- 1 GBP = 1890 NGN
    
    -- Migration tracking
    total_profiles_updated INTEGER := 0;
    total_programs_updated INTEGER := 0;
    migration_start_time TIMESTAMP := NOW();
    
BEGIN
    RAISE NOTICE '=== Starting Currency Standardization Migration ===';
    RAISE NOTICE 'Migration started at: %', migration_start_time;
    
    -- =====================================================
    -- Step 1: Backup existing data
    -- =====================================================
    
    RAISE NOTICE 'Step 1: Creating backup tables...';
    
    -- Backup user_profiles table
    DROP TABLE IF EXISTS user_profiles_currency_backup;
    CREATE TABLE user_profiles_currency_backup AS 
    SELECT * FROM user_profiles 
    WHERE study_preferences IS NOT NULL;
    
    RAISE NOTICE 'Backed up % user profiles', (SELECT COUNT(*) FROM user_profiles_currency_backup);
    
    -- Backup programs table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
        DROP TABLE IF EXISTS programs_currency_backup;
        CREATE TABLE programs_currency_backup AS 
        SELECT * FROM programs 
        WHERE tuition_fee IS NOT NULL;
        
        RAISE NOTICE 'Backed up % program records', (SELECT COUNT(*) FROM programs_currency_backup);
    END IF;

    -- =====================================================
    -- Step 2: Add currency support columns
    -- =====================================================
    
    RAISE NOTICE 'Step 2: Adding currency support columns...';
    
    -- Add currency preference columns to user_profiles
    ALTER TABLE user_profiles 
    ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'NGN',
    ADD COLUMN IF NOT EXISTS currency_preferences JSONB DEFAULT jsonb_build_object(
        'primary', 'NGN',
        'secondary', 'USD', 
        'display', jsonb_build_array('NGN', 'USD'),
        'autoDetect', true,
        'compactThreshold', 100000
    );
    
    -- Add currency fields to programs table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
        ALTER TABLE programs 
        ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'NGN',
        ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3),
        ADD COLUMN IF NOT EXISTS original_tuition_fee NUMERIC,
        ADD COLUMN IF NOT EXISTS exchange_rate_used NUMERIC,
        ADD COLUMN IF NOT EXISTS rate_updated_at TIMESTAMP DEFAULT NOW();
    END IF;

    -- =====================================================
    -- Step 3: Standardize user_profiles budget data to NGN
    -- =====================================================
    
    RAISE NOTICE 'Step 3: Converting user budget preferences to NGN...';
    
    -- Update max_tuition in study_preferences to NGN
    WITH converted_budgets AS (
        SELECT 
            id,
            study_preferences,
            CASE 
                -- Already in NGN range (>= 100,000), keep as is
                WHEN (study_preferences->>'max_tuition')::NUMERIC >= 100000 THEN 
                    (study_preferences->>'max_tuition')::NUMERIC
                    
                -- USD range (< 100,000), convert to NGN
                WHEN (study_preferences->>'max_tuition')::NUMERIC > 0 
                    AND (study_preferences->>'max_tuition')::NUMERIC < 100000 THEN 
                    (study_preferences->>'max_tuition')::NUMERIC * usd_to_ngn_rate
                    
                -- Invalid or zero values, set to reasonable NGN default
                ELSE 15000000 -- 15M NGN (~$10,000 USD)
            END AS converted_amount,
            
            -- Determine original currency
            CASE 
                WHEN (study_preferences->>'max_tuition')::NUMERIC >= 100000 THEN 'NGN'
                WHEN (study_preferences->>'max_tuition')::NUMERIC > 0 
                    AND (study_preferences->>'max_tuition')::NUMERIC < 100000 THEN 'USD'
                ELSE 'NGN'
            END AS original_currency
            
        FROM user_profiles 
        WHERE study_preferences->>'max_tuition' IS NOT NULL 
        AND study_preferences->>'max_tuition' != ''
        AND study_preferences->>'max_tuition' ~ '^[0-9]+(\.[0-9]+)?$' -- Only numeric values
    )
    UPDATE user_profiles 
    SET 
        study_preferences = jsonb_set(
            study_preferences,
            '{max_tuition}',
            to_jsonb(cb.converted_amount)
        ),
        preferred_currency = 'NGN',
        currency_preferences = jsonb_set(
            currency_preferences,
            '{originalCurrency}',
            to_jsonb(cb.original_currency)
        )
    FROM converted_budgets cb
    WHERE user_profiles.id = cb.id;
    
    -- Get count of updated profiles
    GET DIAGNOSTICS total_profiles_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % user profiles with converted budget data', total_profiles_updated;

    -- =====================================================
    -- Step 4: Standardize programs table if it exists
    -- =====================================================
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
        RAISE NOTICE 'Step 4: Converting program tuition fees to NGN...';
        
        -- Store original tuition fee and convert to NGN
        UPDATE programs 
        SET 
            original_tuition_fee = tuition_fee,
            original_currency = COALESCE(currency, 'USD'), -- Assume USD if not specified
            tuition_fee = CASE 
                -- Already in NGN range
                WHEN tuition_fee >= 100000 THEN tuition_fee
                -- USD range, convert to NGN  
                WHEN tuition_fee > 0 AND tuition_fee < 100000 THEN tuition_fee * usd_to_ngn_rate
                ELSE tuition_fee -- Keep other values as is
            END,
            currency = 'NGN',
            exchange_rate_used = CASE 
                WHEN tuition_fee < 100000 THEN usd_to_ngn_rate
                ELSE 1
            END,
            rate_updated_at = NOW()
        WHERE tuition_fee IS NOT NULL AND tuition_fee > 0;
        
        GET DIAGNOSTICS total_programs_updated = ROW_COUNT;
        RAISE NOTICE 'Updated % program records with converted tuition fees', total_programs_updated;
    END IF;

    -- =====================================================
    -- Step 5: Create indexes for performance
    -- =====================================================
    
    RAISE NOTICE 'Step 5: Creating performance indexes...';
    
    -- Index for max_tuition queries
    CREATE INDEX IF NOT EXISTS idx_user_profiles_max_tuition_ngn 
    ON user_profiles USING GIN ((study_preferences->'max_tuition'));
    
    -- Index for currency preferences
    CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_currency 
    ON user_profiles (preferred_currency);
    
    -- Index for programs currency if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
        CREATE INDEX IF NOT EXISTS idx_programs_currency 
        ON programs (currency);
        
        CREATE INDEX IF NOT EXISTS idx_programs_tuition_fee_ngn 
        ON programs (tuition_fee) WHERE currency = 'NGN';
    END IF;

    -- =====================================================
    -- Step 6: Create validation functions
    -- =====================================================
    
    RAISE NOTICE 'Step 6: Creating validation functions...';
    
    -- Function to validate NGN amounts
    CREATE OR REPLACE FUNCTION validate_ngn_amount(amount NUMERIC)
    RETURNS BOOLEAN AS $validate$
    BEGIN
        -- Valid NGN amounts should be between ₦100,000 (reasonable minimum) and ₦100,000,000 (₦100M max)
        RETURN amount >= 100000 AND amount <= 100000000;
    END;
    $validate$ LANGUAGE plpgsql IMMUTABLE;
    
    -- Function to validate currency codes
    CREATE OR REPLACE FUNCTION validate_currency_code(code TEXT)
    RETURNS BOOLEAN AS $validate_currency$
    BEGIN
        RETURN code IN ('NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR', 'EGP');
    END;
    $validate_currency$ LANGUAGE plpgsql IMMUTABLE;
    
    -- Trigger function for budget validation
    CREATE OR REPLACE FUNCTION validate_user_budget_ngn()
    RETURNS TRIGGER AS $trigger_budget$
    BEGIN
        -- Validate max_tuition if present
        IF NEW.study_preferences->>'max_tuition' IS NOT NULL THEN
            IF NOT validate_ngn_amount((NEW.study_preferences->>'max_tuition')::NUMERIC) THEN
                RAISE WARNING 'max_tuition value % is outside valid NGN range (₦100K - ₦100M)', 
                    NEW.study_preferences->>'max_tuition';
            END IF;
        END IF;
        
        -- Validate preferred currency
        IF NEW.preferred_currency IS NOT NULL THEN
            IF NOT validate_currency_code(NEW.preferred_currency) THEN
                RAISE EXCEPTION 'Invalid currency code: %', NEW.preferred_currency;
            END IF;
        END IF;
        
        RETURN NEW;
    END;
    $trigger_budget$ LANGUAGE plpgsql;
    
    -- Create trigger for user_profiles
    DROP TRIGGER IF EXISTS trigger_validate_user_budget ON user_profiles;
    CREATE TRIGGER trigger_validate_user_budget
        BEFORE INSERT OR UPDATE ON user_profiles
        FOR EACH ROW EXECUTE FUNCTION validate_user_budget_ngn();

    -- =====================================================
    -- Step 7: Create migration audit log
    -- =====================================================
    
    RAISE NOTICE 'Step 7: Creating migration audit log...';
    
    -- Create audit table if not exists
    CREATE TABLE IF NOT EXISTS currency_migration_audit (
        id SERIAL PRIMARY KEY,
        migration_date TIMESTAMP DEFAULT NOW(),
        migration_type VARCHAR(50),
        records_affected INTEGER,
        details JSONB,
        status VARCHAR(20) DEFAULT 'completed'
    );
    
    -- Log this migration
    INSERT INTO currency_migration_audit (
        migration_type, 
        records_affected, 
        details, 
        status
    ) VALUES (
        'ngn_standardization',
        total_profiles_updated + total_programs_updated,
        jsonb_build_object(
            'profiles_updated', total_profiles_updated,
            'programs_updated', total_programs_updated,
            'usd_to_ngn_rate', usd_to_ngn_rate,
            'migration_duration_minutes', 
                EXTRACT(EPOCH FROM (NOW() - migration_start_time)) / 60
        ),
        'completed'
    );

    -- =====================================================
    -- Step 8: Add helpful comments and documentation
    -- =====================================================
    
    COMMENT ON COLUMN user_profiles.preferred_currency IS 
    'User''s preferred currency for display (NGN for most African users)';
    
    COMMENT ON COLUMN user_profiles.currency_preferences IS 
    'User currency preferences in JSONB format with primary, secondary, display array, autoDetect boolean';
    
    COMMENT ON COLUMN user_profiles.study_preferences IS 
    'Study preferences in JSONB format. max_tuition field is always in NGN (Nigerian Naira)';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
        COMMENT ON COLUMN programs.currency IS 
        'Currency code for tuition_fee (standardized to NGN)';
        
        COMMENT ON COLUMN programs.original_currency IS 
        'Original currency before NGN conversion';
        
        COMMENT ON COLUMN programs.original_tuition_fee IS 
        'Original tuition fee before NGN conversion';
    END IF;

    -- =====================================================
    -- Migration Summary
    -- =====================================================
    
    RAISE NOTICE '=== Currency Standardization Migration Completed ===';
    RAISE NOTICE 'Migration duration: % minutes', 
        EXTRACT(EPOCH FROM (NOW() - migration_start_time)) / 60;
    RAISE NOTICE 'User profiles updated: %', total_profiles_updated;
    RAISE NOTICE 'Program records updated: %', total_programs_updated;
    RAISE NOTICE 'Exchange rate used (USD to NGN): %', usd_to_ngn_rate;
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update frontend ProfileSettings.tsx to use NGN budget ranges';
    RAISE NOTICE '2. Integrate real-time currency API (Fixer.io) to replace static rates';
    RAISE NOTICE '3. Test currency conversion functionality';
    RAISE NOTICE '4. Monitor for any data inconsistencies';
    RAISE NOTICE '';
    RAISE NOTICE 'Backup tables created:';
    RAISE NOTICE '- user_profiles_currency_backup (% records)', 
        (SELECT COUNT(*) FROM user_profiles_currency_backup);
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs_currency_backup') THEN
        RAISE NOTICE '- programs_currency_backup (% records)', 
            (SELECT COUNT(*) FROM programs_currency_backup);
    END IF;

END $$;