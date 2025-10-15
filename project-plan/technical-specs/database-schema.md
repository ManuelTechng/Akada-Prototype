# Database Schema Specification
## Currency Fallback System - Detailed Schema Design

**Project:** Akada Education Platform
**Version:** 1.0
**Date:** January 14, 2025

---

## Table of Contents
1. [Schema Overview](#schema-overview)
2. [Table Definitions](#table-definitions)
3. [Indexes](#indexes)
4. [Functions](#functions)
5. [Row Level Security](#row-level-security)
6. [Migration Scripts](#migration-scripts)

---

## Schema Overview

### Entity Relationship Diagram

```
┌─────────────────────────┐
│  supported_currencies   │
│─────────────────────────│
│  code (PK)              │
│  name                   │
│  symbol                 │
│  decimal_places         │
│  is_active              │
│  is_major               │
│  country_codes[]        │
│  created_at             │
└───────────┬─────────────┘
            │
            │ 1
            │
            │ *
┌───────────▼─────────────┐         ┌──────────────────────────┐
│    exchange_rates       │         │ exchange_rate_update_    │
│─────────────────────────│         │         logs             │
│  id (PK)                │         │──────────────────────────│
│  base_currency (FK) ────┼─┐       │  id (PK)                 │
│  target_currency (FK) ──┼─┘       │  update_triggered_by     │
│  rate                   │         │  api_source              │
│  inverse_rate           │         │  currencies_updated      │
│  source                 │         │  currencies_failed       │
│  fetched_at             │         │  status                  │
│  expires_at             │         │  error_message           │
│  is_active              │         │  execution_time_ms       │
│  metadata               │         │  started_at              │
│  created_at             │         │  completed_at            │
└─────────────────────────┘         │  metadata                │
                                    └──────────────────────────┘
```

---

## Table Definitions

### 1. `supported_currencies`

**Purpose:** Stores metadata for all currencies supported by the platform.

**Schema:**

```sql
CREATE TABLE supported_currencies (
  code CHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_places SMALLINT DEFAULT 2 CHECK (decimal_places >= 0 AND decimal_places <= 8),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_major BOOLEAN DEFAULT FALSE NOT NULL,
  country_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Column Details:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | CHAR(3) | PRIMARY KEY | ISO 4217 currency code (USD, NGN, etc.) |
| `name` | VARCHAR(100) | NOT NULL | Full currency name (US Dollar, Nigerian Naira) |
| `symbol` | VARCHAR(10) | NOT NULL | Currency symbol ($, ₦, €, etc.) |
| `decimal_places` | SMALLINT | DEFAULT 2, CHECK (0-8) | Number of decimal places (0 for JPY, 2 for most) |
| `is_active` | BOOLEAN | DEFAULT TRUE, NOT NULL | Whether currency is currently supported |
| `is_major` | BOOLEAN | DEFAULT FALSE, NOT NULL | Priority currency for UI display |
| `country_codes` | TEXT[] | DEFAULT '{}' | Array of ISO country codes using this currency |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW(), NOT NULL | Record creation timestamp |

**Example Data:**

```sql
INSERT INTO supported_currencies (code, name, symbol, decimal_places, is_major, country_codes) VALUES
('USD', 'US Dollar', '$', 2, TRUE, ARRAY['US']),
('NGN', 'Nigerian Naira', '₦', 2, TRUE, ARRAY['NG']),
('EUR', 'Euro', '€', 2, TRUE, ARRAY['DE','FR','IT','ES','NL','BE','AT','IE','PT','FI']),
('JPY', 'Japanese Yen', '¥', 0, TRUE, ARRAY['JP']),
('SGD', 'Singapore Dollar', 'S$', 2, FALSE, ARRAY['SG']),
('CAD', 'Canadian Dollar', 'C$', 2, TRUE, ARRAY['CA']),
('GBP', 'British Pound', '£', 2, TRUE, ARRAY['GB']),
('AUD', 'Australian Dollar', 'A$', 2, TRUE, ARRAY['AU']);
```

---

### 2. `exchange_rates`

**Purpose:** Stores historical and current exchange rates with full audit trail.

**Schema:**

```sql
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency CHAR(3) NOT NULL DEFAULT 'NGN',
  target_currency CHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL CHECK (rate > 0),
  inverse_rate DECIMAL(18,8) NOT NULL CHECK (inverse_rate > 0),
  source VARCHAR(50) NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_base_currency
    FOREIGN KEY (base_currency)
    REFERENCES supported_currencies(code)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_target_currency
    FOREIGN KEY (target_currency)
    REFERENCES supported_currencies(code)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT unique_rate_per_fetch
    UNIQUE(base_currency, target_currency, fetched_at),

  CONSTRAINT check_not_same_currency
    CHECK (base_currency != target_currency),

  CONSTRAINT check_inverse_relationship
    CHECK (ABS((rate * inverse_rate) - 1.0) < 0.0001)
);
```

**Column Details:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier for each rate record |
| `base_currency` | CHAR(3) | NOT NULL, FK, DEFAULT 'NGN' | Currency being converted FROM |
| `target_currency` | CHAR(3) | NOT NULL, FK | Currency being converted TO |
| `rate` | DECIMAL(18,8) | NOT NULL, CHECK (> 0) | Exchange rate (how much target currency for 1 base) |
| `inverse_rate` | DECIMAL(18,8) | NOT NULL, CHECK (> 0) | Reverse rate for optimization (1/rate) |
| `source` | VARCHAR(50) | NOT NULL | Source of rate (api, fallback, manual) |
| `fetched_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | When rate was fetched |
| `expires_at` | TIMESTAMP WITH TIME ZONE | NULL allowed | When rate becomes stale (NULL = never) |
| `is_active` | BOOLEAN | DEFAULT TRUE, NOT NULL | Is this the current rate for this pair? |
| `metadata` | JSONB | DEFAULT '{}' | Additional info (confidence, spread, etc.) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW(), NOT NULL | Record creation timestamp |

**Metadata JSONB Structure:**

```json
{
  "api_response_time_ms": 234,
  "confidence_score": 0.98,
  "bid_ask_spread": 0.0012,
  "volatility_24h": 0.023,
  "data_provider": "exchangerate-api",
  "notes": "Validated against 3 sources"
}
```

**Example Data:**

```sql
INSERT INTO exchange_rates (base_currency, target_currency, rate, inverse_rate, source, expires_at, metadata) VALUES
('NGN', 'USD', 0.00067, 1500.00, 'exchangerate-api',
 NOW() + INTERVAL '6 hours',
 '{"api_response_time_ms": 145, "confidence_score": 0.99}'::jsonb),

('USD', 'NGN', 1500.00, 0.00067, 'exchangerate-api',
 NOW() + INTERVAL '6 hours',
 '{"api_response_time_ms": 145, "confidence_score": 0.99}'::jsonb),

('CAD', 'NGN', 1050.00, 0.000952, 'exchangerate-api',
 NOW() + INTERVAL '6 hours',
 '{"api_response_time_ms": 145, "confidence_score": 0.99}'::jsonb);
```

---

### 3. `exchange_rate_update_logs` (NEW)

**Purpose:** Audit trail for all exchange rate update operations.

**Schema:**

```sql
CREATE TABLE exchange_rate_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_triggered_by VARCHAR(50) NOT NULL,
  api_source VARCHAR(50) NOT NULL,
  currencies_updated INTEGER NOT NULL DEFAULT 0 CHECK (currencies_updated >= 0),
  currencies_failed INTEGER NOT NULL DEFAULT 0 CHECK (currencies_failed >= 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  execution_time_ms INTEGER CHECK (execution_time_ms >= 0),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT check_completed_after_started
    CHECK (completed_at >= started_at)
);
```

**Column Details:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique log entry identifier |
| `update_triggered_by` | VARCHAR(50) | NOT NULL | Who/what triggered (cron, manual, edge_function) |
| `api_source` | VARCHAR(50) | NOT NULL | Which API was used (exchangerate-api, fixer, etc.) |
| `currencies_updated` | INTEGER | NOT NULL, DEFAULT 0, CHECK (>= 0) | Number of successful updates |
| `currencies_failed` | INTEGER | NOT NULL, DEFAULT 0, CHECK (>= 0) | Number of failed updates |
| `status` | VARCHAR(20) | NOT NULL, CHECK (success/partial/failed) | Overall update status |
| `error_message` | TEXT | NULL allowed | Error details if status = failed |
| `execution_time_ms` | INTEGER | CHECK (>= 0) | How long update took (milliseconds) |
| `started_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | When update started |
| `completed_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | When update completed |
| `metadata` | JSONB | DEFAULT '{}' | Additional context and metrics |

**Metadata JSONB Structure:**

```json
{
  "rates_fetched": {
    "USD": 1500.00,
    "CAD": 1050.00,
    "GBP": 1800.00
  },
  "validation_checks_passed": 12,
  "validation_checks_failed": 0,
  "api_quota_remaining": 1485,
  "network_latency_ms": 234
}
```

**Example Data:**

```sql
INSERT INTO exchange_rate_update_logs
(update_triggered_by, api_source, currencies_updated, currencies_failed,
 status, execution_time_ms, started_at, completed_at, metadata)
VALUES
('cron', 'exchangerate-api', 13, 0, 'success', 1250,
 NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '1.25 seconds',
 '{"api_quota_remaining": 1485, "network_latency_ms": 234}'::jsonb);
```

---

## Indexes

### Performance Optimization Indexes

```sql
-- 1. Fast lookup of latest active rate for a currency pair
CREATE INDEX idx_exchange_rates_active
  ON exchange_rates(target_currency, is_active, fetched_at DESC)
  WHERE is_active = TRUE;

-- 2. Quick lookup by base/target pair
CREATE INDEX idx_exchange_rates_lookup
  ON exchange_rates(base_currency, target_currency, is_active);

-- 3. Efficient expiration checks for cleanup
CREATE INDEX idx_exchange_rates_expires
  ON exchange_rates(expires_at)
  WHERE expires_at IS NOT NULL AND is_active = TRUE;

-- 4. Source-based filtering
CREATE INDEX idx_exchange_rates_source
  ON exchange_rates(source, fetched_at DESC);

-- 5. Time-based queries for analytics
CREATE INDEX idx_exchange_rates_created
  ON exchange_rates(created_at DESC);

-- 6. Update log status filtering
CREATE INDEX idx_update_logs_status
  ON exchange_rate_update_logs(status, started_at DESC);

-- 7. Update log time range queries
CREATE INDEX idx_update_logs_time
  ON exchange_rate_update_logs(started_at DESC, completed_at DESC);

-- 8. Currency metadata filtering
CREATE INDEX idx_currencies_active
  ON supported_currencies(is_active, is_major)
  WHERE is_active = TRUE;
```

### Index Usage Analysis

```sql
-- Query 1: Get latest USD to NGN rate
-- Uses: idx_exchange_rates_lookup
SELECT rate
FROM exchange_rates
WHERE base_currency = 'USD'
  AND target_currency = 'NGN'
  AND is_active = TRUE
ORDER BY fetched_at DESC
LIMIT 1;

-- Query 2: Find stale rates for cleanup
-- Uses: idx_exchange_rates_expires
SELECT *
FROM exchange_rates
WHERE expires_at < NOW()
  AND is_active = TRUE;

-- Query 3: Recent update history
-- Uses: idx_update_logs_status
SELECT *
FROM exchange_rate_update_logs
WHERE status = 'failed'
ORDER BY started_at DESC
LIMIT 10;
```

---

## Functions

### 1. `get_latest_exchange_rate(from_currency, to_currency)`

**Purpose:** Retrieve the most recent active exchange rate for a currency pair.

```sql
CREATE OR REPLACE FUNCTION get_latest_exchange_rate(
  from_currency TEXT,
  to_currency TEXT
) RETURNS DECIMAL(18,8) AS $$
DECLARE
  latest_rate DECIMAL(18,8);
BEGIN
  -- Same currency = rate of 1
  IF from_currency = to_currency THEN
    RETURN 1.0;
  END IF;

  -- Try direct rate
  SELECT rate INTO latest_rate
  FROM exchange_rates
  WHERE base_currency = from_currency
    AND target_currency = to_currency
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY fetched_at DESC
  LIMIT 1;

  -- If found, return it
  IF latest_rate IS NOT NULL THEN
    RETURN latest_rate;
  END IF;

  -- Try inverse rate
  SELECT inverse_rate INTO latest_rate
  FROM exchange_rates
  WHERE base_currency = to_currency
    AND target_currency = from_currency
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY fetched_at DESC
  LIMIT 1;

  -- Return rate or NULL
  RETURN latest_rate;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Usage Example:**

```sql
-- Get USD to NGN rate
SELECT get_latest_exchange_rate('USD', 'NGN');
-- Returns: 1500.00000000

-- Get NGN to USD rate (uses inverse)
SELECT get_latest_exchange_rate('NGN', 'USD');
-- Returns: 0.00066667
```

---

### 2. `convert_currency(amount, from_currency, to_currency)`

**Purpose:** Convert an amount from one currency to another.

```sql
CREATE OR REPLACE FUNCTION convert_currency(
  amount DECIMAL(18,2),
  from_currency TEXT,
  to_currency TEXT
) RETURNS DECIMAL(18,2) AS $$
DECLARE
  exchange_rate DECIMAL(18,8);
  converted_amount DECIMAL(18,2);
BEGIN
  -- Validate amount
  IF amount IS NULL OR amount < 0 THEN
    RETURN NULL;
  END IF;

  -- Get exchange rate
  exchange_rate := get_latest_exchange_rate(from_currency, to_currency);

  -- If no rate found, return NULL
  IF exchange_rate IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate converted amount
  converted_amount := ROUND(amount * exchange_rate, 2);

  RETURN converted_amount;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Usage Example:**

```sql
-- Convert $100 to NGN
SELECT convert_currency(100.00, 'USD', 'NGN');
-- Returns: 150000.00

-- Convert ₦1,500,000 to USD
SELECT convert_currency(1500000.00, 'NGN', 'USD');
-- Returns: 1000.00
```

---

### 3. `cleanup_expired_rates()`

**Purpose:** Remove or deactivate expired exchange rates.

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_rates() RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Deactivate expired rates
  UPDATE exchange_rates
  SET is_active = FALSE
  WHERE is_active = TRUE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  -- Delete very old rates (keep 90 days history)
  DELETE FROM exchange_rates
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND source != 'fallback';  -- Keep fallback rates

  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;
```

---

### 4. `check_stale_rates()`

**Purpose:** Identify and alert on stale exchange rates.

```sql
CREATE OR REPLACE FUNCTION check_stale_rates() RETURNS TABLE(
  currency_pair TEXT,
  hours_old NUMERIC,
  last_update TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    base_currency || '/' || target_currency AS currency_pair,
    ROUND(EXTRACT(EPOCH FROM (NOW() - fetched_at)) / 3600, 2) AS hours_old,
    fetched_at AS last_update
  FROM exchange_rates
  WHERE is_active = TRUE
    AND fetched_at < NOW() - INTERVAL '24 hours'
  ORDER BY fetched_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Usage:**

```sql
-- Check for stale rates
SELECT * FROM check_stale_rates();

-- Result:
-- currency_pair | hours_old | last_update
-- USD/NGN       | 36.50     | 2025-01-12 14:30:00+00
-- CAD/NGN       | 38.25     | 2025-01-12 12:45:00+00
```

---

## Row Level Security (RLS)

### Policies for `supported_currencies`

```sql
-- Enable RLS
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read currencies
CREATE POLICY "Anyone can read supported currencies"
  ON supported_currencies
  FOR SELECT
  USING (true);

-- Only service role can modify
CREATE POLICY "Service role can manage currencies"
  ON supported_currencies
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

### Policies for `exchange_rates`

```sql
-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active rates
CREATE POLICY "Anyone can read active exchange rates"
  ON exchange_rates
  FOR SELECT
  USING (is_active = TRUE);

-- Allow authenticated users to read historical rates
CREATE POLICY "Authenticated users can read historical rates"
  ON exchange_rates
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert/update rates
CREATE POLICY "Service role can manage exchange rates"
  ON exchange_rates
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

### Policies for `exchange_rate_update_logs`

```sql
-- Enable RLS
ALTER TABLE exchange_rate_update_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read logs
CREATE POLICY "Authenticated users can read update logs"
  ON exchange_rate_update_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can manage logs
CREATE POLICY "Service role can manage update logs"
  ON exchange_rate_update_logs
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Migration Scripts

### Migration 1: Add Missing Currencies

**File:** `supabase/migrations/20250714_add_missing_currencies.sql`

```sql
-- Add SGD, JPY, NZD, HKD to supported currencies
INSERT INTO supported_currencies (code, name, symbol, decimal_places, is_major, country_codes) VALUES
('SGD', 'Singapore Dollar', 'S$', 2, FALSE, ARRAY['SG']),
('JPY', 'Japanese Yen', '¥', 0, TRUE, ARRAY['JP']),
('NZD', 'New Zealand Dollar', 'NZ$', 2, FALSE, ARRAY['NZ']),
('HKD', 'Hong Kong Dollar', 'HK$', 2, FALSE, ARRAY['HK'])
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol,
  decimal_places = EXCLUDED.decimal_places,
  is_major = EXCLUDED.is_major,
  country_codes = EXCLUDED.country_codes,
  is_active = TRUE;

-- Add fallback rates for new currencies
INSERT INTO exchange_rates (base_currency, target_currency, rate, inverse_rate, source, expires_at, is_active) VALUES
('SGD', 'NGN', 1119.00, 0.000894, 'fallback', NOW() + INTERVAL '30 days', TRUE),
('JPY', 'NGN', 10.03, 0.0997, 'fallback', NOW() + INTERVAL '30 days', TRUE),
('NZD', 'NGN', 893.00, 0.00112, 'fallback', NOW() + INTERVAL '30 days', TRUE),
('HKD', 'NGN', 193.00, 0.00518, 'fallback', NOW() + INTERVAL '30 days', TRUE)
ON CONFLICT (base_currency, target_currency, fetched_at) DO NOTHING;

-- Update statistics
ANALYZE supported_currencies;
ANALYZE exchange_rates;
```

---

### Migration 2: Create Update Logs Table

**File:** `supabase/migrations/20250714_create_update_logs.sql`

```sql
-- Create update logs table
CREATE TABLE IF NOT EXISTS exchange_rate_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_triggered_by VARCHAR(50) NOT NULL,
  api_source VARCHAR(50) NOT NULL,
  currencies_updated INTEGER NOT NULL DEFAULT 0 CHECK (currencies_updated >= 0),
  currencies_failed INTEGER NOT NULL DEFAULT 0 CHECK (currencies_failed >= 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  execution_time_ms INTEGER CHECK (execution_time_ms >= 0),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT check_completed_after_started CHECK (completed_at >= started_at)
);

-- Create indexes
CREATE INDEX idx_update_logs_status
  ON exchange_rate_update_logs(status, started_at DESC);

CREATE INDEX idx_update_logs_time
  ON exchange_rate_update_logs(started_at DESC, completed_at DESC);

-- Enable RLS
ALTER TABLE exchange_rate_update_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read update logs"
  ON exchange_rate_update_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage update logs"
  ON exchange_rate_update_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE exchange_rate_update_logs IS 'Audit trail for exchange rate update operations';

-- Update statistics
ANALYZE exchange_rate_update_logs;
```

---

## Performance Tuning

### Recommended Settings

```sql
-- Vacuum strategy
ALTER TABLE exchange_rates SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- Increase statistics target for better query planning
ALTER TABLE exchange_rates ALTER COLUMN base_currency SET STATISTICS 100;
ALTER TABLE exchange_rates ALTER COLUMN target_currency SET STATISTICS 100;

-- Enable automatic index maintenance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Query Performance Monitoring

```sql
-- Find slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%exchange_rates%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

**Document Version:** 1.0
**Last Updated:** January 14, 2025
**Related:** `currency-fallback-system.md`, `architecture-diagram.md`
