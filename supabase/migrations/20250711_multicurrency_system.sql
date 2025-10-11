-- Migration: Akada Multicurrency System Implementation
-- Date: 2025-07-11
-- Purpose: Add industry-standard multicurrency support for international education programs

-- ==============================================
-- 1. CURRENCY INFRASTRUCTURE TABLES
-- ==============================================

-- Supported currencies table
CREATE TABLE IF NOT EXISTS supported_currencies (
  code CHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_places SMALLINT DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  is_major BOOLEAN DEFAULT FALSE, -- For priority in UI
  country_codes TEXT[], -- Countries that use this currency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_currencies_active (is_active, is_major)
);

-- Exchange rates table with comprehensive tracking
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency CHAR(3) NOT NULL DEFAULT 'NGN',
  target_currency CHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  inverse_rate DECIMAL(18,8) NOT NULL, -- For faster reverse calculations
  source VARCHAR(50) NOT NULL, -- 'CBN', 'ExchangeRate-API', 'Fixer', etc.
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- Store additional rate info (confidence, spread, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(base_currency, target_currency, fetched_at),
  
  -- Indexes for fast lookups
  INDEX idx_exchange_rates_active (target_currency, is_active, fetched_at DESC),
  INDEX idx_exchange_rates_lookup (base_currency, target_currency, is_active),
  INDEX idx_exchange_rates_expires (expires_at) WHERE expires_at IS NOT NULL,
  
  -- Foreign key constraints
  FOREIGN KEY (base_currency) REFERENCES supported_currencies(code),
  FOREIGN KEY (target_currency) REFERENCES supported_currencies(code)
);

-- Currency conversion cache for 3G optimization
CREATE TABLE IF NOT EXISTS currency_conversion_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency CHAR(3) NOT NULL,
  to_currency CHAR(3) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  converted_amount DECIMAL(18,2) NOT NULL,
  exchange_rate DECIMAL(18,8) NOT NULL,
  rate_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Unique constraint for cache efficiency
  UNIQUE(from_currency, to_currency, amount, rate_timestamp),
  
  -- Index for fast cache lookups
  INDEX idx_conversion_cache_lookup (from_currency, to_currency, amount, expires_at),
  INDEX idx_conversion_cache_cleanup (expires_at),
  
  -- Foreign keys
  FOREIGN KEY (from_currency) REFERENCES supported_currencies(code),
  FOREIGN KEY (to_currency) REFERENCES supported_currencies(code)
);

-- ==============================================
-- 2. UPDATE PROGRAMS TABLE FOR MULTICURRENCY
-- ==============================================

-- Add currency fields to existing programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS tuition_fee_currency CHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS tuition_fee_original DECIMAL(18,2), -- Store original amount
ADD COLUMN IF NOT EXISTS application_fee_currency CHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS application_fee_original DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS last_currency_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS currency_source VARCHAR(50) DEFAULT 'manual';

-- Create indexes for currency-based queries
CREATE INDEX IF NOT EXISTS idx_programs_currency ON programs(tuition_fee_currency, country);
CREATE INDEX IF NOT EXISTS idx_programs_tuition_currency ON programs(tuition_fee_currency, tuition_fee_original);

-- Add foreign key constraints
ALTER TABLE programs 
ADD CONSTRAINT IF NOT EXISTS fk_programs_tuition_currency 
  FOREIGN KEY (tuition_fee_currency) REFERENCES supported_currencies(code),
ADD CONSTRAINT IF NOT EXISTS fk_programs_application_currency 
  FOREIGN KEY (application_fee_currency) REFERENCES supported_currencies(code);

-- ==============================================
-- 3. UPDATE COUNTRY ESTIMATES FOR MULTICURRENCY
-- ==============================================

-- Add currency fields to country_estimates
ALTER TABLE country_estimates
ADD COLUMN IF NOT EXISTS living_cost_currency CHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS visa_fee_currency CHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS currency_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add foreign key constraints for country estimates
ALTER TABLE country_estimates
ADD CONSTRAINT IF NOT EXISTS fk_country_living_currency 
  FOREIGN KEY (living_cost_currency) REFERENCES supported_currencies(code),
ADD CONSTRAINT IF NOT EXISTS fk_country_visa_currency 
  FOREIGN KEY (visa_fee_currency) REFERENCES supported_currencies(code);

-- ==============================================
-- 4. UPDATE USER PREFERENCES FOR CURRENCY
-- ==============================================

-- Add currency preferences to user profiles
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS preferred_display_currency CHAR(3) DEFAULT 'NGN',
ADD COLUMN IF NOT EXISTS show_original_currency BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS currency_update_frequency VARCHAR(20) DEFAULT 'daily'; -- daily, hourly, real-time

-- Add foreign key for user currency preference
ALTER TABLE user_preferences
ADD CONSTRAINT IF NOT EXISTS fk_user_display_currency 
  FOREIGN KEY (preferred_display_currency) REFERENCES supported_currencies(code);

-- ==============================================
-- 5. SEED SUPPORTED CURRENCIES DATA
-- ==============================================

-- Insert real-world currencies used by international universities
INSERT INTO supported_currencies (code, name, symbol, country_codes, is_major) VALUES
  ('USD', 'US Dollar', '$', ARRAY['US'], TRUE),
  ('CAD', 'Canadian Dollar', 'C$', ARRAY['CA'], TRUE),
  ('GBP', 'British Pound', '£', ARRAY['GB'], TRUE),
  ('EUR', 'Euro', '€', ARRAY['DE','FR','IT','ES','NL','BE','AT','IE','PT','FI','LU','MT','CY','SK','SI','EE','LV','LT'], TRUE),
  ('AUD', 'Australian Dollar', 'A$', ARRAY['AU'], TRUE),
  ('CHF', 'Swiss Franc', 'CHF', ARRAY['CH'], TRUE),
  ('SEK', 'Swedish Krona', 'kr', ARRAY['SE'], FALSE),
  ('NOK', 'Norwegian Krone', 'kr', ARRAY['NO'], FALSE),
  ('DKK', 'Danish Krone', 'kr', ARRAY['DK'], FALSE),
  ('NZD', 'New Zealand Dollar', 'NZ$', ARRAY['NZ'], FALSE),
  ('SGD', 'Singapore Dollar', 'S$', ARRAY['SG'], FALSE),
  ('HKD', 'Hong Kong Dollar', 'HK$', ARRAY['HK'], FALSE),
  ('JPY', 'Japanese Yen', '¥', ARRAY['JP'], TRUE),
  ('NGN', 'Nigerian Naira', '₦', ARRAY['NG'], TRUE)
ON CONFLICT (code) DO NOTHING;

-- ==============================================
-- 6. UPDATE EXISTING PROGRAM DATA
-- ==============================================

-- Migrate existing program data to new currency structure
-- Set original amounts and currencies based on country
UPDATE programs SET 
  tuition_fee_currency = CASE 
    WHEN country = 'United States' THEN 'USD'
    WHEN country = 'Canada' THEN 'CAD' 
    WHEN country = 'United Kingdom' THEN 'GBP'
    WHEN country IN ('Germany', 'France', 'Netherlands', 'Italy', 'Spain', 'Austria', 'Belgium') THEN 'EUR'
    WHEN country = 'Australia' THEN 'AUD'
    WHEN country = 'Switzerland' THEN 'CHF'
    WHEN country = 'Sweden' THEN 'SEK'
    WHEN country = 'Norway' THEN 'NOK'
    WHEN country = 'Denmark' THEN 'DKK'
    WHEN country = 'Japan' THEN 'JPY'
    WHEN country = 'Singapore' THEN 'SGD'
    WHEN country = 'New Zealand' THEN 'NZD'
    WHEN country = 'Hong Kong' THEN 'HKD'
    ELSE 'USD' -- Default fallback
  END,
  tuition_fee_original = tuition_fee,
  application_fee_original = application_fee,
  application_fee_currency = CASE 
    WHEN country = 'United States' THEN 'USD'
    WHEN country = 'Canada' THEN 'CAD' 
    WHEN country = 'United Kingdom' THEN 'GBP'
    WHEN country IN ('Germany', 'France', 'Netherlands', 'Italy', 'Spain', 'Austria', 'Belgium') THEN 'EUR'
    WHEN country = 'Australia' THEN 'AUD'
    WHEN country = 'Switzerland' THEN 'CHF'
    WHEN country = 'Sweden' THEN 'SEK'
    WHEN country = 'Norway' THEN 'NOK'
    WHEN country = 'Denmark' THEN 'DKK'
    WHEN country = 'Japan' THEN 'JPY'
    WHEN country = 'Singapore' THEN 'SGD'
    WHEN country = 'New Zealand' THEN 'NZD'
    WHEN country = 'Hong Kong' THEN 'HKD'
    ELSE 'USD'
  END,
  last_currency_update = NOW(),
  currency_source = 'migration';

-- Update country estimates with appropriate currencies
UPDATE country_estimates SET
  living_cost_currency = CASE 
    WHEN country = 'United States' THEN 'USD'
    WHEN country = 'Canada' THEN 'CAD' 
    WHEN country = 'United Kingdom' THEN 'GBP'
    WHEN country IN ('Germany', 'France', 'Netherlands', 'Italy', 'Spain', 'Austria', 'Belgium') THEN 'EUR'
    WHEN country = 'Australia' THEN 'AUD'
    WHEN country = 'Switzerland' THEN 'CHF'
    WHEN country = 'Sweden' THEN 'SEK'
    WHEN country = 'Norway' THEN 'NOK'
    WHEN country = 'Denmark' THEN 'DKK'
    WHEN country = 'Japan' THEN 'JPY'
    WHEN country = 'Singapore' THEN 'SGD'
    WHEN country = 'New Zealand' THEN 'NZD'
    WHEN country = 'Hong Kong' THEN 'HKD'
    ELSE 'USD'
  END,
  visa_fee_currency = CASE 
    WHEN country = 'United States' THEN 'USD'
    WHEN country = 'Canada' THEN 'CAD' 
    WHEN country = 'United Kingdom' THEN 'GBP'
    WHEN country IN ('Germany', 'France', 'Netherlands', 'Italy', 'Spain', 'Austria', 'Belgium') THEN 'EUR'
    WHEN country = 'Australia' THEN 'AUD'
    WHEN country = 'Switzerland' THEN 'CHF'
    WHEN country = 'Sweden' THEN 'SEK'
    WHEN country = 'Norway' THEN 'NOK'
    WHEN country = 'Denmark' THEN 'DKK'
    WHEN country = 'Japan' THEN 'JPY'
    WHEN country = 'Singapore' THEN 'SGD'
    WHEN country = 'New Zealand' THEN 'NZD'
    WHEN country = 'Hong Kong' THEN 'HKD'
    ELSE 'USD'
  END,
  currency_last_updated = NOW();

-- ==============================================
-- 7. SEED INITIAL EXCHANGE RATES (FALLBACK)
-- ==============================================

-- Insert initial fallback exchange rates to NGN (updated weekly)
-- These serve as emergency fallbacks when APIs are unavailable
INSERT INTO exchange_rates (base_currency, target_currency, rate, inverse_rate, source, expires_at) VALUES
  ('USD', 'NGN', 1500.00, 0.00066667, 'fallback', NOW() + INTERVAL '7 days'),
  ('CAD', 'NGN', 1100.00, 0.00090909, 'fallback', NOW() + INTERVAL '7 days'),
  ('GBP', 'NGN', 1800.00, 0.00055556, 'fallback', NOW() + INTERVAL '7 days'),
  ('EUR', 'NGN', 1600.00, 0.00062500, 'fallback', NOW() + INTERVAL '7 days'),
  ('AUD', 'NGN', 1000.00, 0.00100000, 'fallback', NOW() + INTERVAL '7 days'),
  ('CHF', 'NGN', 1650.00, 0.00060606, 'fallback', NOW() + INTERVAL '7 days'),
  ('SEK', 'NGN', 145.00, 0.00689655, 'fallback', NOW() + INTERVAL '7 days'),
  ('NOK', 'NGN', 140.00, 0.00714286, 'fallback', NOW() + INTERVAL '7 days'),
  ('DKK', 'NGN', 215.00, 0.00465116, 'fallback', NOW() + INTERVAL '7 days'),
  ('JPY', 'NGN', 10.50, 0.09523810, 'fallback', NOW() + INTERVAL '7 days'),
  ('SGD', 'NGN', 1100.00, 0.00090909, 'fallback', NOW() + INTERVAL '7 days'),
  ('NZD', 'NGN', 925.00, 0.00108108, 'fallback', NOW() + INTERVAL '7 days'),
  ('HKD', 'NGN', 192.00, 0.00520833, 'fallback', NOW() + INTERVAL '7 days')
ON CONFLICT (base_currency, target_currency, fetched_at) DO NOTHING;

-- ==============================================
-- 8. CREATE UTILITY FUNCTIONS
-- ==============================================

-- Function to get latest exchange rate
CREATE OR REPLACE FUNCTION get_latest_exchange_rate(
  from_currency TEXT,
  to_currency TEXT
) RETURNS DECIMAL(18,8) AS $$
DECLARE
  latest_rate DECIMAL(18,8);
BEGIN
  -- If same currency, return 1
  IF from_currency = to_currency THEN
    RETURN 1.0;
  END IF;
  
  -- Get the latest active rate
  SELECT rate INTO latest_rate
  FROM exchange_rates
  WHERE base_currency = from_currency 
    AND target_currency = to_currency
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY fetched_at DESC
  LIMIT 1;
  
  -- If no rate found, try reverse calculation
  IF latest_rate IS NULL THEN
    SELECT (1.0 / rate) INTO latest_rate
    FROM exchange_rates
    WHERE base_currency = to_currency 
      AND target_currency = from_currency
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY fetched_at DESC
    LIMIT 1;
  END IF;
  
  -- Return rate or NULL if not found
  RETURN latest_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to convert currency amounts
CREATE OR REPLACE FUNCTION convert_currency(
  amount DECIMAL(18,2),
  from_currency TEXT,
  to_currency TEXT
) RETURNS DECIMAL(18,2) AS $$
DECLARE
  exchange_rate DECIMAL(18,8);
  converted_amount DECIMAL(18,2);
BEGIN
  -- Get exchange rate
  exchange_rate := get_latest_exchange_rate(from_currency, to_currency);
  
  -- If no rate found, return NULL
  IF exchange_rate IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate converted amount
  converted_amount := amount * exchange_rate;
  
  RETURN converted_amount;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 9. CREATE ENHANCED VIEWS
-- ==============================================

-- Enhanced program view with multicurrency support
CREATE OR REPLACE VIEW program_costs_multicurrency AS
SELECT 
    p.*,
    -- Original amounts and currencies
    p.tuition_fee_original,
    p.tuition_fee_currency,
    p.application_fee_original,
    p.application_fee_currency,
    
    -- Country cost data with currencies
    ce.avg_monthly_living,
    ce.living_cost_currency,
    ce.student_visa_fee,
    ce.visa_fee_currency,
    
    -- Converted amounts to NGN (for Nigerian students)
    convert_currency(p.tuition_fee_original, p.tuition_fee_currency, 'NGN') as tuition_fee_ngn,
    convert_currency(p.application_fee_original, p.application_fee_currency, 'NGN') as application_fee_ngn,
    convert_currency(ce.avg_monthly_living, ce.living_cost_currency, 'NGN') as monthly_living_ngn,
    convert_currency(ce.student_visa_fee, ce.visa_fee_currency, 'NGN') as visa_fee_ngn,
    
    -- Total cost calculation in NGN (2-year program assumption)
    (
      COALESCE(convert_currency(p.tuition_fee_original, p.tuition_fee_currency, 'NGN'), 0) +
      COALESCE(convert_currency(ce.avg_monthly_living * 24, ce.living_cost_currency, 'NGN'), 0) +
      COALESCE(convert_currency(ce.student_visa_fee, ce.visa_fee_currency, 'NGN'), 0) +
      COALESCE(convert_currency(p.application_fee_original, p.application_fee_currency, 'NGN'), 0)
    ) as total_cost_ngn,
    
    -- Exchange rate metadata
    get_latest_exchange_rate(p.tuition_fee_currency, 'NGN') as tuition_exchange_rate,
    get_latest_exchange_rate(ce.living_cost_currency, 'NGN') as living_exchange_rate
    
FROM programs p
LEFT JOIN country_estimates ce ON p.country = ce.country
WHERE p.tuition_fee_original > 0;

-- Comment the enhanced view
COMMENT ON VIEW program_costs_multicurrency IS 'Enhanced program view with real-time multicurrency conversion for Nigerian students';

-- ==============================================
-- 10. UPDATE TABLE STATISTICS
-- ==============================================

-- Update statistics for query optimization
ANALYZE supported_currencies;
ANALYZE exchange_rates;
ANALYZE currency_conversion_cache;
ANALYZE programs;
ANALYZE country_estimates;

-- ==============================================
-- 11. CREATE CLEANUP PROCEDURES
-- ==============================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_currency_cache() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired cache entries
  DELETE FROM currency_conversion_cache 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete old exchange rates (keep last 30 days)
  DELETE FROM exchange_rates 
  WHERE fetched_at < NOW() - INTERVAL '30 days'
    AND source != 'fallback';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily (requires pg_cron extension)
-- SELECT cron.schedule('currency-cache-cleanup', '0 2 * * *', 'SELECT cleanup_currency_cache();');

-- ==============================================
-- 12. SECURITY AND PERMISSIONS
-- ==============================================

-- Ensure RLS is enabled on new tables
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_conversion_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (all users can read currency data)
CREATE POLICY "Anyone can read supported currencies" ON supported_currencies
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read exchange rates" ON exchange_rates
  FOR SELECT USING (true);

-- Restrict cache access to authenticated users only
CREATE POLICY "Authenticated users can read currency cache" ON currency_conversion_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify currency data
CREATE POLICY "Service role can modify exchange rates" ON exchange_rates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can modify currency cache" ON currency_conversion_cache
  FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- Log successful migration
INSERT INTO migration_logs (migration_name, status, completed_at) VALUES 
  ('20250711_multicurrency_system', 'completed', NOW())
ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA public IS 'Akada multicurrency system migration completed successfully - supports real-world university currencies with 3G optimization for Nigerian students';
