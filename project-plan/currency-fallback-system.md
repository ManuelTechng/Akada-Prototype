# Currency Fallback System Implementation Plan
## Database-Backed Exchange Rates with Scheduled Auto-Updates

**Project:** Akada Education Platform
**Version:** 1.0
**Date:** January 14, 2025
**Status:** Planning Phase
**Owner:** Engineering Team

---

## 📋 Executive Summary

### Problem Statement
The Akada platform currently relies on:
1. **Fixer.io API** for real-time exchange rates (currently failing with CORS/404 errors)
2. **Static fallback rates** hardcoded in `errors.ts` and `config.ts` (prone to staleness)
3. **No automated rate updates** (requires manual code changes)

This creates issues:
- ❌ Programs with SGD currency showing errors
- ❌ Stale exchange rates affecting cost calculations
- ❌ Poor user experience when API is down
- ❌ No visibility into rate freshness or accuracy

### Proposed Solution
Implement a **three-tier fallback system** with database-backed rates and automated updates:

```
Tier 1: External API (Fixer.io, ExchangeRate-API)
   ↓ (on failure)
Tier 2: Supabase Database (updated every 6 hours)
   ↓ (on failure)
Tier 3: Static Emergency Fallback (hardcoded)
```

### Key Benefits
✅ **99.9% uptime** - Multiple fallback layers ensure availability
✅ **Fresh rates** - Auto-updated every 6 hours via scheduled jobs
✅ **Zero downtime** - Seamless failover between tiers
✅ **Audit trail** - Complete history of rate changes
✅ **Cost efficiency** - Free tier APIs with smart caching
✅ **Admin control** - Manual override and monitoring capabilities

### Success Metrics
- Exchange rate availability: **> 99.9%**
- Rate freshness: **< 6 hours old** (target: < 1 hour)
- API fallback frequency: **< 5%** of requests
- Page load impact: **< 50ms** additional latency
- Admin intervention: **< 1 per month**

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │         CurrencyService (Enhanced)                  │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │    │
│  │  │  API Tier    │→ │  DB Tier     │→ │ Static  │ │    │
│  │  │  (Fixer.io)  │  │  (Supabase)  │  │Fallback │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │         PostgreSQL Database                         │    │
│  │                                                     │    │
│  │  ┌─────────────────┐  ┌──────────────────────┐   │    │
│  │  │ exchange_rates  │  │ supported_currencies │   │    │
│  │  │ (historical)    │  │ (metadata)           │   │    │
│  │  └─────────────────┘  └──────────────────────┘   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Edge Functions (Deno)                       │    │
│  │                                                     │    │
│  │  update-exchange-rates: Scheduled rate fetcher     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↑
                     ┌──────┴──────┐
              ┌──────┴─────┐  ┌────┴──────┐
              │  Cron Job  │  │  GitHub   │
              │ (pg_cron)  │  │  Actions  │
              └────────────┘  └───────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React + TypeScript | Currency display & conversion |
| **Database** | Supabase (PostgreSQL) | Rate storage & retrieval |
| **API Layer** | Supabase Edge Functions (Deno) | Rate updates & processing |
| **Scheduling** | pg_cron / GitHub Actions | Automated updates |
| **Rate Sources** | Fixer.io, ExchangeRate-API, Frankfurter | External rate providers |
| **Caching** | In-memory + IndexedDB | Client-side performance |
| **Monitoring** | Supabase Logs + Custom Dashboard | Health tracking |

### Data Flow

#### 1. **Normal Operation (API Available)**
```
User Request → CurrencyService → Fixer.io API
                                      ↓
                           Store in Supabase (for future fallback)
                                      ↓
                           Return rate to user
```

#### 2. **API Failure (Fallback to Database)**
```
User Request → CurrencyService → Fixer.io API (fails)
                                      ↓
                           Query Supabase exchange_rates table
                                      ↓
                           Return cached rate (< 24hrs old)
```

#### 3. **Scheduled Update (Every 6 Hours)**
```
Cron Trigger → Edge Function → Fetch from multiple APIs
                                      ↓
                           Validate & average rates
                                      ↓
                           Insert into exchange_rates table
                                      ↓
                           Mark old rates as inactive
```

---

## 📊 Database Schema Design

### Current State (Already Exists)
From migration `20250711_multicurrency_system.sql`:

#### `supported_currencies` Table
```sql
CREATE TABLE supported_currencies (
  code CHAR(3) PRIMARY KEY,          -- ISO 4217 code (USD, NGN, etc.)
  name VARCHAR(100) NOT NULL,         -- Full name (US Dollar)
  symbol VARCHAR(10) NOT NULL,        -- Symbol ($, ₦, etc.)
  decimal_places SMALLINT DEFAULT 2,  -- Precision (0 for JPY)
  is_active BOOLEAN DEFAULT TRUE,     -- Is currency supported?
  is_major BOOLEAN DEFAULT FALSE,     -- Priority in UI
  country_codes TEXT[],               -- Countries using this currency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `exchange_rates` Table
```sql
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency CHAR(3) NOT NULL DEFAULT 'NGN',
  target_currency CHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,              -- Exchange rate (8 decimal precision)
  inverse_rate DECIMAL(18,8) NOT NULL,      -- Reverse rate for optimization
  source VARCHAR(50) NOT NULL,               -- API source (fixer, exchangerate-api, etc.)
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,      -- When rate becomes stale
  is_active BOOLEAN DEFAULT TRUE,            -- Is this the current rate?
  metadata JSONB,                            -- Additional info (confidence, spread)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(base_currency, target_currency, fetched_at),

  FOREIGN KEY (base_currency) REFERENCES supported_currencies(code),
  FOREIGN KEY (target_currency) REFERENCES supported_currencies(code)
);

-- Indexes for performance
CREATE INDEX idx_exchange_rates_active
  ON exchange_rates(target_currency, is_active, fetched_at DESC);

CREATE INDEX idx_exchange_rates_lookup
  ON exchange_rates(base_currency, target_currency, is_active);
```

### New Additions Required

#### 1. `exchange_rate_update_logs` Table (NEW)
Track all update attempts for monitoring and debugging.

```sql
CREATE TABLE exchange_rate_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_triggered_by VARCHAR(50) NOT NULL,  -- 'cron', 'manual', 'edge_function'
  api_source VARCHAR(50) NOT NULL,            -- Which API was used
  currencies_updated INTEGER NOT NULL,        -- How many rates updated
  currencies_failed INTEGER DEFAULT 0,        -- How many failed
  status VARCHAR(20) NOT NULL,                -- 'success', 'partial', 'failed'
  error_message TEXT,                         -- Error details if failed
  execution_time_ms INTEGER,                  -- Performance metric
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB                              -- Additional context
);

CREATE INDEX idx_update_logs_status ON exchange_rate_update_logs(status, started_at DESC);
```

#### 2. Update `supported_currencies` (Add Missing Currencies)
```sql
INSERT INTO supported_currencies (code, name, symbol, decimal_places, is_major, country_codes) VALUES
  ('SGD', 'Singapore Dollar', 'S$', 2, false, ARRAY['SG']),
  ('JPY', 'Japanese Yen', '¥', 0, true, ARRAY['JP']),
  ('NZD', 'New Zealand Dollar', 'NZ$', 2, false, ARRAY['NZ']),
  ('HKD', 'Hong Kong Dollar', 'HK$', 2, false, ARRAY['HK'])
ON CONFLICT (code) DO UPDATE SET
  is_active = true,
  country_codes = EXCLUDED.country_codes;
```

#### 3. Database Functions (Already Exist, May Need Enhancement)

**`get_latest_exchange_rate(from_currency, to_currency)`**
- Returns most recent active rate
- Falls back to inverse calculation if needed
- Used by frontend CurrencyService

**`convert_currency(amount, from_currency, to_currency)`**
- Converts amount using latest rate
- Handles same-currency scenarios
- Returns NULL if rate unavailable

---

## 🔌 API Integration Strategy

### Primary Rate Sources

#### 1. **Fixer.io** (Current - With Issues)
- **Pros:** Established, comprehensive coverage
- **Cons:** Free tier has HTTPS/CORS restrictions, base currency locked to EUR
- **Usage:** Primary source when available
- **Endpoint:** `https://api.fixer.io/v1/latest?access_key={KEY}&base=EUR&symbols=USD,NGN,...`

#### 2. **ExchangeRate-API.com** (Recommended Free Alternative)
- **Pros:** 1,500 requests/month free, HTTPS enabled, no CORS issues, supports all base currencies
- **Cons:** Rate limit at 1,500/month
- **Usage:** Primary fallback when Fixer.io fails
- **Endpoint:** `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/NGN`
- **Cost:** FREE tier sufficient for our needs

#### 3. **Frankfurter.app** (Public API)
- **Pros:** Completely free, no API key required, CORS-friendly
- **Cons:** Slower updates, EUR base only
- **Usage:** Emergency backup
- **Endpoint:** `https://api.frankfurter.app/latest?from=EUR&to=NGN,USD,CAD`

### Rate Fetching Strategy

```typescript
async function fetchExchangeRates(): Promise<ExchangeRateData> {
  const sources = [
    { name: 'exchangerate-api', fetch: fetchFromExchangeRateAPI },
    { name: 'fixer', fetch: fetchFromFixerIO },
    { name: 'frankfurter', fetch: fetchFromFrankfurter }
  ];

  for (const source of sources) {
    try {
      const rates = await source.fetch();
      if (isValidRateData(rates)) {
        return { rates, source: source.name };
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${source.name}:`, error);
      continue; // Try next source
    }
  }

  throw new Error('All rate sources unavailable');
}
```

### Rate Validation
Before storing rates in database:

```typescript
function isValidRateData(rates: any): boolean {
  // 1. Check all required currencies present
  const requiredCurrencies = ['USD', 'NGN', 'CAD', 'GBP', 'EUR', 'AUD', 'SGD'];
  for (const currency of requiredCurrencies) {
    if (!rates[currency] || rates[currency] <= 0) return false;
  }

  // 2. Sanity check: Rates shouldn't change > 10% in 6 hours
  const previousRate = await getLastRate('USD', 'NGN');
  const currentRate = rates.NGN;
  if (Math.abs(currentRate - previousRate) / previousRate > 0.1) {
    console.warn('Rate changed >10%, manual review required');
    return false;
  }

  // 3. Check timestamp is recent
  if (rates.timestamp && Date.now() - rates.timestamp > 3600000) {
    return false; // Reject rates older than 1 hour
  }

  return true;
}
```

---

## ⚙️ Implementation Phases

### **Phase 1: Database Setup & Migration** (Day 1, ~4 hours)

#### Tasks:
1. **Update Database Types** (`src/lib/database.types.ts`)
   - Add `exchange_rates` table types
   - Add `supported_currencies` table types
   - Add `exchange_rate_update_logs` table types
   - Generate types: `npx supabase gen types typescript --local > src/lib/database.types.ts`

2. **Create Migration: Add Missing Currencies**
   ```bash
   # Create migration file
   npx supabase migration new add_missing_currencies_sgd_jpy_nzd_hkd
   ```

   File: `supabase/migrations/20250714_add_missing_currencies.sql`
   - Insert SGD, JPY, NZD, HKD into `supported_currencies`
   - Seed initial fallback rates for these currencies
   - Add update log table

3. **Create Migration: Add Update Logs Table**
   - Create `exchange_rate_update_logs` table
   - Add indexes for performance
   - Add RLS policies

4. **Testing**
   - Run migrations locally: `npx supabase db reset`
   - Verify all tables created correctly
   - Test database functions work

**Deliverables:**
- ✅ Updated `database.types.ts` with new tables
- ✅ Migration file `20250714_add_missing_currencies.sql`
- ✅ Migration file `20250714_add_update_logs_table.sql`

---

### **Phase 2: Supabase Rate Provider** (Day 2, ~6 hours)

#### Tasks:
1. **Create `SupabaseRateProvider.ts`**

   File: `src/lib/currency/SupabaseRateProvider.ts`

   ```typescript
   import { supabase } from '../supabase';
   import type { ExchangeRate } from './types';

   export class SupabaseRateProvider {
     private memoryCache = new Map<string, ExchangeRate>();
     private cacheTTL = 3600000; // 1 hour in memory

     /**
      * Get exchange rate from Supabase database
      */
     async getRate(from: string, to: string): Promise<number | null> {
       const cacheKey = `${from}_${to}`;

       // Check memory cache first
       const cached = this.memoryCache.get(cacheKey);
       if (cached && this.isFresh(cached)) {
         return cached.rate;
       }

       // Query Supabase
       const { data, error } = await supabase
         .from('exchange_rates')
         .select('rate, fetched_at')
         .eq('base_currency', from)
         .eq('target_currency', to)
         .eq('is_active', true)
         .order('fetched_at', { ascending: false })
         .limit(1)
         .single();

       if (error || !data) {
         // Try inverse rate
         return this.getInverseRate(from, to);
       }

       // Cache in memory
       this.memoryCache.set(cacheKey, {
         from,
         to,
         rate: data.rate,
         timestamp: new Date(data.fetched_at),
         source: 'database'
       });

       return data.rate;
     }

     /**
      * Store rate in Supabase for future fallback
      */
     async storeRate(
       from: string,
       to: string,
       rate: number,
       source: string
     ): Promise<void> {
       const { error } = await supabase
         .from('exchange_rates')
         .insert({
           base_currency: from,
           target_currency: to,
           rate,
           inverse_rate: 1 / rate,
           source,
           fetched_at: new Date().toISOString(),
           expires_at: new Date(Date.now() + 21600000).toISOString(), // 6 hours
           is_active: true
         });

       if (error) {
         console.warn('Failed to store rate in Supabase:', error);
       }
     }

     private async getInverseRate(from: string, to: string): Promise<number | null> {
       const { data } = await supabase
         .from('exchange_rates')
         .select('inverse_rate')
         .eq('base_currency', to)
         .eq('target_currency', from)
         .eq('is_active', true)
         .order('fetched_at', { ascending: false })
         .limit(1)
         .single();

       return data?.inverse_rate || null;
     }

     private isFresh(rate: ExchangeRate): boolean {
       return Date.now() - rate.timestamp.getTime() < this.cacheTTL;
     }
   }

   export const supabaseRateProvider = new SupabaseRateProvider();
   ```

2. **Update `CurrencyService.ts`** to use Supabase fallback

   Modify the `getExchangeRate` method:

   ```typescript
   async getExchangeRate(from: string, to: string, options = {}): Promise<ExchangeRate> {
     // ... existing validation ...

     try {
       // Tier 1: Try API
       if (this.canUseAPI() && (strategy === 'realtime' || strategy === 'hybrid')) {
         try {
           const rate = await this.fetchRateFromAPI(from, to);

           // Store successful API fetch in Supabase
           await supabaseRateProvider.storeRate(from, to, rate, 'fixer_api');

           return {
             from, to, rate,
             timestamp: new Date(),
             source: 'api'
           };
         } catch (apiError) {
           console.warn('API fetch failed, trying Supabase fallback');
         }
       }

       // Tier 2: Try Supabase database
       const dbRate = await supabaseRateProvider.getRate(from, to);
       if (dbRate !== null) {
         return {
           from, to,
           rate: dbRate,
           timestamp: new Date(),
           source: 'database'
         };
       }

       // Tier 3: Static fallback
       const staticRate = FallbackRateProvider.getRate(from, to);
       if (staticRate !== null) {
         return {
           from, to,
           rate: staticRate,
           timestamp: new Date(),
           source: 'fallback'
         };
       }

       throw CurrencyErrorFactory.conversionFailed(from, to);
     } catch (error) {
       // ... error handling ...
     }
   }
   ```

3. **Add Rate Staleness Indicator**

   File: `src/lib/currency/types.ts`

   ```typescript
   export interface ExchangeRate {
     from: string;
     to: string;
     rate: number;
     timestamp: Date;
     source: 'api' | 'database' | 'fallback';
     staleness?: 'fresh' | 'recent' | 'stale'; // NEW
   }

   export function getRateStaleness(timestamp: Date): 'fresh' | 'recent' | 'stale' {
     const ageHours = (Date.now() - timestamp.getTime()) / 3600000;
     if (ageHours < 1) return 'fresh';
     if (ageHours < 24) return 'recent';
     return 'stale';
   }
   ```

**Deliverables:**
- ✅ `SupabaseRateProvider.ts` with database integration
- ✅ Updated `CurrencyService.ts` with 3-tier fallback
- ✅ Rate staleness tracking in types

**Testing:**
- Unit tests for SupabaseRateProvider
- Integration tests for fallback chain
- Manual testing with API disabled

---

### **Phase 3: Scheduled Rate Updates** (Day 3-4, ~10 hours)

#### Option A: Supabase Edge Function (Recommended)

1. **Create Edge Function**

   ```bash
   npx supabase functions new update-exchange-rates
   ```

   File: `supabase/functions/update-exchange-rates/index.ts`

   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

   interface RateSource {
     name: string;
     fetch: () => Promise<Record<string, number>>;
   }

   serve(async (req) => {
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
     );

     const startTime = Date.now();
     const logEntry = {
       update_triggered_by: 'edge_function',
       started_at: new Date().toISOString(),
       currencies_updated: 0,
       currencies_failed: 0,
       status: 'success'
     };

     try {
       // Fetch from ExchangeRate-API (primary)
       const rates = await fetchFromExchangeRateAPI();

       // Validate rates
       if (!isValidRates(rates)) {
         throw new Error('Invalid rate data received');
       }

       // Mark old rates as inactive
       await supabase
         .from('exchange_rates')
         .update({ is_active: false })
         .eq('is_active', true);

       // Insert new rates
       const baseCurrency = 'NGN';
       const targetCurrencies = Object.keys(rates);

       for (const target of targetCurrencies) {
         const { error } = await supabase
           .from('exchange_rates')
           .insert({
             base_currency: baseCurrency,
             target_currency: target,
             rate: rates[target],
             inverse_rate: 1 / rates[target],
             source: 'exchangerate-api',
             fetched_at: new Date().toISOString(),
             expires_at: new Date(Date.now() + 21600000).toISOString(),
             is_active: true
           });

         if (error) {
           console.error(`Failed to insert ${target}:`, error);
           logEntry.currencies_failed++;
         } else {
           logEntry.currencies_updated++;
         }
       }

       // Log the update
       logEntry.api_source = 'exchangerate-api';
       logEntry.execution_time_ms = Date.now() - startTime;
       logEntry.completed_at = new Date().toISOString();

       await supabase
         .from('exchange_rate_update_logs')
         .insert(logEntry);

       return new Response(
         JSON.stringify({
           success: true,
           updated: logEntry.currencies_updated,
           failed: logEntry.currencies_failed
         }),
         { headers: { 'Content-Type': 'application/json' } }
       );

     } catch (error) {
       logEntry.status = 'failed';
       logEntry.error_message = error.message;
       logEntry.execution_time_ms = Date.now() - startTime;
       logEntry.completed_at = new Date().toISOString();

       await supabase
         .from('exchange_rate_update_logs')
         .insert(logEntry);

       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500 }
       );
     }
   });

   async function fetchFromExchangeRateAPI(): Promise<Record<string, number>> {
     const API_KEY = Deno.env.get('EXCHANGERATE_API_KEY');
     const response = await fetch(
       `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/NGN`
     );

     const data = await response.json();
     return data.conversion_rates;
   }

   function isValidRates(rates: Record<string, number>): boolean {
     const required = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'SGD'];
     return required.every(curr => rates[curr] && rates[curr] > 0);
   }
   ```

2. **Configure Edge Function**

   File: `supabase/functions/update-exchange-rates/deno.json`

   ```json
   {
     "imports": {
       "supabase": "https://esm.sh/@supabase/supabase-js@2"
     }
   }
   ```

3. **Setup Cron Schedule**

   Using Supabase pg_cron extension:

   ```sql
   -- Run every 6 hours
   SELECT cron.schedule(
     'update-exchange-rates',
     '0 */6 * * *',  -- Every 6 hours at :00 minutes
     $$
     SELECT
       net.http_post(
         url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/update-exchange-rates',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
       ) as request_id;
     $$
   );
   ```

#### Option B: GitHub Actions (Alternative/Backup)

File: `.github/workflows/update-exchange-rates.yml`

```yaml
name: Update Exchange Rates

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-rates:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install @supabase/supabase-js node-fetch

      - name: Update exchange rates
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          EXCHANGERATE_API_KEY: ${{ secrets.EXCHANGERATE_API_KEY }}
        run: node scripts/update-exchange-rates.js

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Exchange rate update failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Deliverables:**
- ✅ Edge Function `update-exchange-rates`
- ✅ Cron schedule configured
- ✅ GitHub Actions workflow (backup)
- ✅ Update logging system

---

### **Phase 4: Admin Dashboard** (Day 5, ~6 hours)

Create admin interface for monitoring and manual updates.

File: `src/components/admin/CurrencyManagement.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ExchangeRateLog {
  id: string;
  api_source: string;
  currencies_updated: number;
  currencies_failed: number;
  status: string;
  started_at: string;
  execution_time_ms: number;
}

export const CurrencyManagement: React.FC = () => {
  const [logs, setLogs] = useState<ExchangeRateLog[]>([]);
  const [currentRates, setCurrentRates] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUpdateLogs();
    loadCurrentRates();
  }, []);

  const loadUpdateLogs = async () => {
    const { data } = await supabase
      .from('exchange_rate_update_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    setLogs(data || []);
  };

  const loadCurrentRates = async () => {
    const { data } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('fetched_at', { ascending: false });

    setCurrentRates(data || []);
  };

  const triggerManualUpdate = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-exchange-rates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`Updated ${result.updated} rates successfully!`);
        loadUpdateLogs();
        loadCurrentRates();
      } else {
        alert('Update failed: ' + result.error);
      }
    } catch (error) {
      alert('Failed to trigger update: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Currency Management</h1>

      {/* Manual Update Button */}
      <div className="mb-8">
        <button
          onClick={triggerManualUpdate}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isUpdating ? 'Updating...' : 'Manual Update Now'}
        </button>
      </div>

      {/* Current Rates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Exchange Rates</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">From</th>
              <th className="p-2">To</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Source</th>
              <th className="p-2">Last Updated</th>
              <th className="p-2">Age</th>
            </tr>
          </thead>
          <tbody>
            {currentRates.map((rate) => {
              const ageHours = Math.round(
                (Date.now() - new Date(rate.fetched_at).getTime()) / 3600000
              );
              const isStale = ageHours > 24;

              return (
                <tr key={rate.id} className={isStale ? 'bg-red-50' : ''}>
                  <td className="p-2">{rate.base_currency}</td>
                  <td className="p-2">{rate.target_currency}</td>
                  <td className="p-2">{rate.rate.toFixed(4)}</td>
                  <td className="p-2">{rate.source}</td>
                  <td className="p-2">
                    {new Date(rate.fetched_at).toLocaleString()}
                  </td>
                  <td className="p-2">
                    {ageHours}h
                    {isStale && <span className="text-red-600 ml-2">⚠️ STALE</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Update Logs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Update History</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Time</th>
              <th className="p-2">Source</th>
              <th className="p-2">Updated</th>
              <th className="p-2">Failed</th>
              <th className="p-2">Status</th>
              <th className="p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="p-2">
                  {new Date(log.started_at).toLocaleString()}
                </td>
                <td className="p-2">{log.api_source}</td>
                <td className="p-2">{log.currencies_updated}</td>
                <td className="p-2">{log.currencies_failed}</td>
                <td className="p-2">
                  <span className={log.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {log.status}
                  </span>
                </td>
                <td className="p-2">{log.execution_time_ms}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

**Deliverables:**
- ✅ Admin dashboard component
- ✅ Manual update trigger
- ✅ Rate health monitoring
- ✅ Update history viewer

---

### **Phase 5: Testing & Deployment** (Day 6, ~6 hours)

#### Unit Tests

File: `src/lib/currency/__tests__/SupabaseRateProvider.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabaseRateProvider } from '../SupabaseRateProvider';

describe('SupabaseRateProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch rate from Supabase', async () => {
    const rate = await supabaseRateProvider.getRate('USD', 'NGN');
    expect(rate).toBeGreaterThan(0);
  });

  it('should use memory cache', async () => {
    // First call - database
    const rate1 = await supabaseRateProvider.getRate('USD', 'NGN');

    // Second call - should use cache
    const rate2 = await supabaseRateProvider.getRate('USD', 'NGN');

    expect(rate1).toBe(rate2);
  });

  it('should handle inverse rates', async () => {
    const directRate = await supabaseRateProvider.getRate('USD', 'NGN');
    const inverseRate = await supabaseRateProvider.getRate('NGN', 'USD');

    expect(directRate * inverseRate).toBeCloseTo(1, 2);
  });
});
```

#### Integration Tests

```typescript
describe('Currency Service Integration', () => {
  it('should fallback from API to Supabase', async () => {
    // Mock API failure
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API down'));

    const rate = await currencyService.getExchangeRate('USD', 'NGN');

    expect(rate.source).toBe('database');
    expect(rate.rate).toBeGreaterThan(0);
  });

  it('should fallback from Supabase to static', async () => {
    // Mock both API and DB failure
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API down'));
    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({ error: new Error('DB down') })
    });

    const rate = await currencyService.getExchangeRate('USD', 'NGN');

    expect(rate.source).toBe('fallback');
    expect(rate.rate).toBe(1500); // Static fallback
  });
});
```

#### Manual Testing Checklist

- [ ] API available → rates fetched from API
- [ ] API down → rates fetched from Supabase
- [ ] Supabase down → rates fetched from static fallback
- [ ] Edge Function executes successfully
- [ ] Cron job triggers on schedule
- [ ] Admin dashboard displays correct data
- [ ] Manual update button works
- [ ] Stale rates highlighted correctly

#### Deployment Steps

1. **Deploy Database Migrations**
   ```bash
   npx supabase db push
   ```

2. **Deploy Edge Function**
   ```bash
   npx supabase functions deploy update-exchange-rates
   ```

3. **Configure Environment Variables**
   - Add `EXCHANGERATE_API_KEY` to Supabase secrets
   - Update `.env` with new variables

4. **Enable Cron Schedule**
   ```sql
   SELECT cron.schedule(...);
   ```

5. **Deploy Frontend**
   ```bash
   npm run build
   netlify deploy --prod
   ```

---

## 📈 Monitoring & Maintenance

### Health Metrics to Track

1. **Rate Freshness**
   - Alert if any active rate > 24 hours old
   - Dashboard showing age of each currency pair

2. **Update Success Rate**
   - Track percentage of successful updates
   - Alert if < 90% success rate

3. **API Fallback Frequency**
   - Monitor how often we fall back to Supabase
   - Alert if > 5% of requests use database fallback

4. **Response Time**
   - Track p95 latency for currency conversions
   - Alert if > 200ms

### Monitoring Dashboard Query

```sql
-- Health check query
SELECT
  target_currency,
  MAX(fetched_at) as last_update,
  EXTRACT(EPOCH FROM (NOW() - MAX(fetched_at))) / 3600 as hours_old,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  MAX(source) as latest_source
FROM exchange_rates
WHERE base_currency = 'NGN'
GROUP BY target_currency
HAVING EXTRACT(EPOCH FROM (NOW() - MAX(fetched_at))) / 3600 > 24
ORDER BY hours_old DESC;
```

### Automated Alerts

```sql
-- Create alert function
CREATE OR REPLACE FUNCTION check_stale_rates() RETURNS void AS $$
DECLARE
  stale_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO stale_count
  FROM exchange_rates
  WHERE is_active = true
    AND fetched_at < NOW() - INTERVAL '24 hours';

  IF stale_count > 0 THEN
    -- Send notification (integrate with your notification system)
    RAISE WARNING 'Found % stale exchange rates', stale_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily check
SELECT cron.schedule(
  'check-stale-rates',
  '0 9 * * *',  -- 9 AM daily
  'SELECT check_stale_rates();'
);
```

### Maintenance Tasks

**Weekly:**
- Review update logs for failures
- Check rate accuracy against external sources
- Review API usage and quotas

**Monthly:**
- Update static fallback rates if needed
- Review and optimize caching strategy
- Analyze performance metrics

**Quarterly:**
- Evaluate new rate sources
- Review and update supported currencies
- Performance audit and optimization

---

## ⚠️ Risk Assessment & Mitigation

### Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **All APIs fail simultaneously** | High | Low | 3-tier fallback + static rates |
| **Database becomes unavailable** | Medium | Low | In-memory cache + static fallback |
| **Rate data is inaccurate** | High | Low | Multi-source validation + sanity checks |
| **Scheduled job fails silently** | Medium | Medium | Monitoring + alerts + manual trigger |
| **Rate changes > 10% unexpectedly** | Medium | Low | Validation rejects + manual review |
| **API quota exceeded** | Low | Medium | Free tier APIs + multiple sources |
| **Edge Function times out** | Low | Low | 30s timeout + retry logic |
| **Migration breaks existing data** | High | Low | Thorough testing + rollback plan |

### Rollback Plan

If issues occur after deployment:

1. **Immediate:** Disable Edge Function cron
2. **Short-term:** Revert to static fallback rates
3. **Investigation:** Review logs and identify root cause
4. **Fix:** Apply hotfix or revert migration
5. **Re-deploy:** Test thoroughly before re-enabling

### Data Backup Strategy

- Supabase automatic backups (daily)
- Export exchange rates before major updates
- Keep historical rates for 90 days
- Archive update logs monthly

---

## 📅 Timeline & Milestones

### Week 1: Foundation
- **Day 1-2:** Database setup and migrations
- **Day 3-4:** Supabase rate provider implementation
- **Day 5:** Testing and bug fixes

### Week 2: Automation
- **Day 1-2:** Edge Function development
- **Day 3:** Cron scheduling and GitHub Actions
- **Day 4-5:** Admin dashboard and monitoring

### Week 3: Testing & Launch
- **Day 1-2:** Comprehensive testing
- **Day 3:** Staging deployment and validation
- **Day 4:** Production deployment
- **Day 5:** Monitoring and adjustments

### Milestones
- ✅ **M1:** Database schema complete (Day 2)
- ✅ **M2:** Fallback system working (Day 5)
- ✅ **M3:** Auto-updates functional (Day 9)
- ✅ **M4:** Admin dashboard live (Day 12)
- ✅ **M5:** Production deployment (Day 18)

---

## 💰 Cost Analysis

### Current Costs
- Fixer.io API: **$0** (free tier, currently failing)
- Static fallback: **$0** (hardcoded)
- **Total:** $0/month

### Proposed Solution Costs
- ExchangeRate-API.com: **$0** (1,500 req/month free, only used for updates)
- Frankfurter.app: **$0** (completely free)
- Supabase storage: **~$0.01/month** (minimal data)
- Supabase Edge Functions: **$0** (within free tier: 500K req/month)
- GitHub Actions: **$0** (within free tier)
- **Total:** **~$0-1/month**

### Cost Savings
- Avoided paid API subscriptions
- Reduced support tickets from currency errors
- Improved user experience (priceless!)

---

## 🎯 Success Criteria

### Technical Metrics
- [ ] 99.9% currency conversion availability
- [ ] < 6 hour average rate staleness
- [ ] < 100ms p95 conversion latency
- [ ] Zero user-facing errors from missing currencies

### Business Metrics
- [ ] Zero support tickets about "SGD not supported"
- [ ] Accurate tuition conversions for all programs
- [ ] Admin can monitor rates without developer intervention
- [ ] System self-heals without manual intervention

### User Experience
- [ ] Users always see a conversion (even if fallback)
- [ ] Rate source and freshness visible when needed
- [ ] No breaking changes to existing functionality
- [ ] Improved trust in cost calculations

---

## 📚 Appendices

### A. API Documentation

**ExchangeRate-API.com**
- Endpoint: `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{BASE}`
- Rate limit: 1,500/month
- Response format:
  ```json
  {
    "result": "success",
    "base_code": "NGN",
    "conversion_rates": {
      "USD": 0.00067,
      "CAD": 0.00095,
      ...
    }
  }
  ```

**Frankfurter.app**
- Endpoint: `https://api.frankfurter.app/latest?from={BASE}&to={TARGETS}`
- Rate limit: None (public service)
- Response format:
  ```json
  {
    "amount": 1.0,
    "base": "EUR",
    "date": "2025-01-14",
    "rates": {
      "USD": 1.0912,
      "NGN": 1620.5
    }
  }
  ```

### B. Database Queries Reference

**Get latest rate:**
```sql
SELECT rate
FROM exchange_rates
WHERE base_currency = 'USD'
  AND target_currency = 'NGN'
  AND is_active = true
ORDER BY fetched_at DESC
LIMIT 1;
```

**Get all current rates:**
```sql
SELECT *
FROM exchange_rates
WHERE is_active = true
  AND expires_at > NOW()
ORDER BY target_currency;
```

**Update history:**
```sql
SELECT *
FROM exchange_rate_update_logs
ORDER BY started_at DESC
LIMIT 20;
```

### C. Environment Variables

```bash
# .env file
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_FIXER_API_KEY=xxx  # Optional, for Fixer.io
EXCHANGERATE_API_KEY=xxx  # For scheduled updates
VITE_CURRENCY_UPDATE_INTERVAL=21600000  # 6 hours in ms
```

### D. Troubleshooting Guide

**Problem:** Edge Function not executing
- Check Supabase logs: `npx supabase functions logs update-exchange-rates`
- Verify cron schedule: `SELECT * FROM cron.job;`
- Check environment variables are set

**Problem:** Rates not updating
- Check update logs: `SELECT * FROM exchange_rate_update_logs ORDER BY started_at DESC LIMIT 5;`
- Manually trigger update via admin dashboard
- Check API keys are valid

**Problem:** Frontend shows stale rates
- Clear browser cache
- Check Supabase connection
- Verify RLS policies allow reads

---

## 📝 Conclusion

This implementation plan provides a robust, scalable, and cost-effective solution for currency exchange rate management in the Akada platform. The three-tier fallback system ensures high availability while the automated updates keep rates fresh without manual intervention.

**Key Takeaways:**
- ✅ Zero-cost solution using free-tier services
- ✅ 99.9% uptime through multiple fallback layers
- ✅ Automated updates every 6 hours
- ✅ Full audit trail and monitoring
- ✅ Admin control without requiring developer intervention

**Next Steps:**
1. Review and approve this plan
2. Set up ExchangeRate-API.com account (free)
3. Begin Phase 1: Database migrations
4. Schedule weekly check-ins during implementation

---

**Document Version:** 1.0
**Last Updated:** January 14, 2025
**Approved By:** _Pending Review_
**Implementation Start Date:** _TBD_
**Target Completion:** _TBD (3 weeks from start)_
