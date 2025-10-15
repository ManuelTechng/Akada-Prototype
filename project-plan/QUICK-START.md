# Quick Start Guide
## Currency Fallback System Implementation

**For:** Developers implementing the database-backed currency system
**Time to complete:** 3-5 hours for basic setup

---

## Prerequisites

- [ ] Supabase project set up and running
- [ ] Node.js 18+ installed
- [ ] Access to Supabase dashboard
- [ ] GitHub account (for Actions deployment)
- [ ] ExchangeRate-API.com account (free tier)

---

## Step-by-Step Implementation

### Phase 1: Database Setup (30 minutes)

#### 1. Run Existing Migration
Your database already has the multicurrency system from `20250711_multicurrency_system.sql`. Verify it's applied:

```bash
# Check if tables exist
npx supabase db remote commit

# If not, apply migration
npx supabase db push
```

#### 2. Add Missing Currencies

Create: `supabase/migrations/20250714_add_missing_currencies.sql`

```sql
-- Add SGD, JPY, NZD, HKD
INSERT INTO supported_currencies (code, name, symbol, decimal_places, is_major, country_codes) VALUES
('SGD', 'Singapore Dollar', 'S$', 2, FALSE, ARRAY['SG']),
('JPY', 'Japanese Yen', '¥', 0, TRUE, ARRAY['JP']),
('NZD', 'New Zealand Dollar', 'NZ$', 2, FALSE, ARRAY['NZ']),
('HKD', 'Hong Kong Dollar', 'HK$', 2, FALSE, ARRAY['HK'])
ON CONFLICT (code) DO UPDATE SET is_active = TRUE;

-- Seed initial rates
INSERT INTO exchange_rates (base_currency, target_currency, rate, inverse_rate, source, expires_at) VALUES
('SGD', 'NGN', 1119.00, 0.000894, 'fallback', NOW() + INTERVAL '7 days'),
('JPY', 'NGN', 10.03, 0.0997, 'fallback', NOW() + INTERVAL '7 days'),
('NZD', 'NGN', 893.00, 0.00112, 'fallback', NOW() + INTERVAL '7 days'),
('HKD', 'NGN', 193.00, 0.00518, 'fallback', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;
```

Apply:
```bash
npx supabase db push
```

---

### Phase 2: Frontend Integration (90 minutes)

#### 1. Create Supabase Rate Provider

Create: `src/lib/currency/SupabaseRateProvider.ts`

```typescript
import { supabase } from '../supabase';
import type { ExchangeRate } from './types';

export class SupabaseRateProvider {
  private cache = new Map<string, { rate: number; timestamp: Date }>();
  private cacheTTL = 3600000; // 1 hour

  async getRate(from: string, to: string): Promise<number | null> {
    // Check memory cache
    const cacheKey = `${from}_${to}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTTL) {
      return cached.rate;
    }

    // Query database
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
      // Try inverse
      const { data: inverseData } = await supabase
        .from('exchange_rates')
        .select('inverse_rate')
        .eq('base_currency', to)
        .eq('target_currency', from)
        .eq('is_active', true)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (!inverseData) return null;

      // Cache and return
      this.cache.set(cacheKey, { rate: inverseData.inverse_rate, timestamp: new Date() });
      return inverseData.inverse_rate;
    }

    // Cache and return
    this.cache.set(cacheKey, { rate: data.rate, timestamp: new Date(data.fetched_at) });
    return data.rate;
  }

  async storeRate(from: string, to: string, rate: number, source: string): Promise<void> {
    await supabase.from('exchange_rates').insert({
      base_currency: from,
      target_currency: to,
      rate,
      inverse_rate: 1 / rate,
      source,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 21600000).toISOString(), // 6 hours
      is_active: true
    });
  }
}

export const supabaseRateProvider = new SupabaseRateProvider();
```

#### 2. Update CurrencyService

Modify: `src/lib/currency/CurrencyService.ts`

Find the `getExchangeRate` method and update:

```typescript
import { supabaseRateProvider } from './SupabaseRateProvider';

// In getExchangeRate method, after API failure:
try {
  // Tier 1: API (existing code)
  const rate = await this.fetchRateFromAPI(from, to);

  // NEW: Store in Supabase for future fallback
  await supabaseRateProvider.storeRate(from, to, rate, 'fixer_api');

  return { from, to, rate, timestamp: new Date(), source: 'api' };
} catch (apiError) {
  console.warn('API failed, trying Supabase fallback');

  // NEW: Tier 2: Supabase Database
  const dbRate = await supabaseRateProvider.getRate(from, to);
  if (dbRate !== null) {
    return {
      from, to,
      rate: dbRate,
      timestamp: new Date(),
      source: 'database'
    };
  }

  // Existing: Tier 3: Static fallback
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
}
```

#### 3. Update Database Types

```bash
# Generate types from Supabase
npx supabase gen types typescript --local > src/lib/database.types.ts
```

---

### Phase 3: Scheduled Updates (2 hours)

#### Option A: Supabase Edge Function (Recommended)

**Step 1:** Create Edge Function

```bash
npx supabase functions new update-exchange-rates
```

**Step 2:** Implement Function

File: `supabase/functions/update-exchange-rates/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Fetch from ExchangeRate-API
    const API_KEY = Deno.env.get('EXCHANGERATE_API_KEY');
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/NGN`
    );
    const data = await response.json();
    const rates = data.conversion_rates;

    // Mark old rates inactive
    await supabase
      .from('exchange_rates')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new rates
    const currenciesToUpdate = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'SGD', 'JPY', 'NZD', 'HKD'];
    let updated = 0;

    for (const currency of currenciesToUpdate) {
      if (rates[currency]) {
        await supabase.from('exchange_rates').insert({
          base_currency: 'NGN',
          target_currency: currency,
          rate: rates[currency],
          inverse_rate: 1 / rates[currency],
          source: 'exchangerate-api',
          fetched_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 21600000).toISOString(),
          is_active: true
        });
        updated++;
      }
    }

    return new Response(JSON.stringify({ success: true, updated }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
});
```

**Step 3:** Deploy

```bash
# Set secrets
npx supabase secrets set EXCHANGERATE_API_KEY=your_key_here

# Deploy function
npx supabase functions deploy update-exchange-rates
```

**Step 4:** Schedule with pg_cron

In Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'update-exchange-rates',
  '0 */6 * * *',  -- Every 6 hours
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/update-exchange-rates',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
    );
  $$
);
```

---

### Phase 4: Testing (30 minutes)

#### Manual Tests

```bash
# 1. Test database queries
# In Supabase SQL Editor:
SELECT * FROM supported_currencies WHERE code IN ('SGD', 'JPY', 'NZD', 'HKD');
SELECT * FROM exchange_rates WHERE target_currency = 'SGD';

# 2. Test Edge Function
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/update-exchange-rates \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# 3. Test frontend
npm run dev
# Navigate to a program with SGD currency
# Verify it displays without errors
```

#### Unit Tests

Create: `src/lib/currency/__tests__/SupabaseRateProvider.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { supabaseRateProvider } from '../SupabaseRateProvider';

describe('SupabaseRateProvider', () => {
  it('should fetch rate from database', async () => {
    const rate = await supabaseRateProvider.getRate('USD', 'NGN');
    expect(rate).toBeGreaterThan(0);
  });

  it('should use memory cache', async () => {
    const rate1 = await supabaseRateProvider.getRate('USD', 'NGN');
    const rate2 = await supabaseRateProvider.getRate('USD', 'NGN');
    expect(rate1).toBe(rate2);
  });
});
```

Run tests:
```bash
npm test
```

---

## Verification Checklist

- [ ] All 4 new currencies (SGD, JPY, NZD, HKD) appear in `supported_currencies` table
- [ ] Exchange rates exist for all new currencies in `exchange_rates` table
- [ ] Frontend displays programs with SGD currency without errors
- [ ] Edge Function executes successfully (check Supabase logs)
- [ ] Cron job is scheduled (check `SELECT * FROM cron.job;`)
- [ ] No TypeScript errors when building (`npm run build`)
- [ ] Unit tests pass (`npm test`)

---

## Troubleshooting

### Problem: "SGD not found" error persists

**Solution:**
```sql
-- Verify currency exists
SELECT * FROM supported_currencies WHERE code = 'SGD';

-- If missing, insert manually
INSERT INTO supported_currencies (code, name, symbol, is_active)
VALUES ('SGD', 'Singapore Dollar', 'S$', TRUE);
```

### Problem: Edge Function fails with "API key invalid"

**Solution:**
```bash
# Check secret is set
npx supabase secrets list

# Set if missing
npx supabase secrets set EXCHANGERATE_API_KEY=your_key
```

### Problem: Rates not updating

**Solution:**
```sql
-- Check cron jobs
SELECT * FROM cron.job;

-- Check Edge Function logs in Supabase Dashboard
-- Trigger manual update
SELECT net.http_post(
  url:='https://YOUR_PROJECT.supabase.co/functions/v1/update-exchange-rates',
  headers:='{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
);
```

---

## Next Steps

After basic setup is working:

1. **Add Admin Dashboard** - See `currency-fallback-system.md` Phase 4
2. **Setup Monitoring** - Add alerts for stale rates
3. **Optimize Caching** - Tune cache TTL based on usage patterns
4. **Add More Currencies** - Expand to support additional currencies as needed

---

## Resources

- **Full Plan:** [currency-fallback-system.md](./currency-fallback-system.md)
- **Architecture:** [diagrams/architecture-diagram.md](./diagrams/architecture-diagram.md)
- **Database Schema:** [technical-specs/database-schema.md](./technical-specs/database-schema.md)
- **ExchangeRate-API Docs:** https://www.exchangerate-api.com/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **pg_cron Extension:** https://supabase.com/docs/guides/database/extensions/pgcron

---

**Estimated Time:** 3-5 hours
**Difficulty:** Intermediate
**Last Updated:** January 14, 2025
