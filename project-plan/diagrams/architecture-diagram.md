# System Architecture Diagram
## Currency Fallback System - Akada Platform

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                             │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Program    │  │     Cost     │  │    Admin     │                 │
│  │   Listing    │  │  Calculator  │  │  Dashboard   │                 │
│  │  Component   │  │  Component   │  │  Component   │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                  │                  │                          │
│         └──────────────────┼──────────────────┘                          │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CURRENCY SERVICE LAYER                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    CurrencyService (Enhanced)                       │ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │ │
│  │  │   Tier 1:    │  │   Tier 2:    │  │   Tier 3:    │            │ │
│  │  │  External    │→ │  Supabase    │→ │   Static     │            │ │
│  │  │     API      │  │   Database   │  │  Fallback    │            │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │ │
│  │         │                  │                  │                     │ │
│  │         ▼                  ▼                  ▼                     │ │
│  │  ┌──────────────────────────────────────────────────┐             │ │
│  │  │        In-Memory Cache (1 hour TTL)              │             │ │
│  │  └──────────────────────────────────────────────────┘             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              SupabaseRateProvider (NEW)                             │ │
│  │                                                                     │ │
│  │  • Fetch rates from database                                       │ │
│  │  • Store API rates for future fallback                             │ │
│  │  • Memory caching layer                                            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATA PERSISTENCE LAYER                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                  Supabase PostgreSQL Database                       │ │
│  │                                                                     │ │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │ │
│  │  │ exchange_rates  │  │ supported_       │  │ exchange_rate_   │ │ │
│  │  │                 │  │ currencies       │  │ update_logs      │ │ │
│  │  │ • rate          │  │ • code           │  │ • status         │ │ │
│  │  │ • inverse_rate  │  │ • symbol         │  │ • currencies_    │ │ │
│  │  │ • source        │  │ • is_active      │  │   updated        │ │ │
│  │  │ • fetched_at    │  │ • country_codes  │  │ • error_message  │ │ │
│  │  │ • expires_at    │  │                  │  │                  │ │ │
│  │  │ • is_active     │  │                  │  │                  │ │ │
│  │  └─────────────────┘  └──────────────────┘  └──────────────────┘ │ │
│  │                                                                     │ │
│  │  ┌────────────────────────────────────────────────────────────────┐│ │
│  │  │  Database Functions:                                           ││ │
│  │  │  • get_latest_exchange_rate(from, to)                         ││ │
│  │  │  • convert_currency(amount, from, to)                         ││ │
│  │  └────────────────────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATION & UPDATE LAYER                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              Supabase Edge Functions (Deno)                         │ │
│  │                                                                     │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  update-exchange-rates                                        │ │ │
│  │  │                                                               │ │ │
│  │  │  1. Fetch rates from external APIs                           │ │ │
│  │  │  2. Validate rate data                                       │ │ │
│  │  │  3. Deactivate old rates                                     │ │ │
│  │  │  4. Insert new rates                                         │ │ │
│  │  │  5. Log update status                                        │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                   Scheduling Mechanisms                             │ │
│  │                                                                     │ │
│  │  ┌──────────────┐          ┌──────────────┐                       │ │
│  │  │  pg_cron     │          │   GitHub     │                       │ │
│  │  │  (Primary)   │          │   Actions    │                       │ │
│  │  │              │          │   (Backup)   │                       │ │
│  │  │  Every 6hrs  │          │   Every 6hrs │                       │ │
│  │  └──────┬───────┘          └──────┬───────┘                       │ │
│  │         │                          │                                │ │
│  │         └────────────┬─────────────┘                                │ │
│  │                      ▼                                              │ │
│  │         ┌──────────────────────────┐                               │ │
│  │         │  Trigger Edge Function   │                               │ │
│  │         └──────────────────────────┘                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL DATA SOURCES                              │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Fixer.io    │  │ ExchangeRate │  │ Frankfurter  │                 │
│  │     API      │  │     -API     │  │     .app     │                 │
│  │              │  │              │  │              │                 │
│  │  (Legacy)    │  │  (Primary)   │  │  (Backup)    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### 1. User Requests Currency Conversion

```
User View Program
       ↓
useProgramTuition Hook
       ↓
formatProgramTuitionAsync()
       ↓
convertCurrencyWithAPI()
       ↓
CurrencyService.convertAmount()
       ↓
CurrencyService.getExchangeRate()
       ↓
[Try Tier 1: External API]
       ↓ (on failure)
[Try Tier 2: Supabase]
       ↓ (on failure)
[Use Tier 3: Static Fallback]
       ↓
Return Rate to User
```

### 2. Scheduled Rate Update Flow

```
Cron Trigger (Every 6 hours)
       ↓
pg_cron calls HTTP endpoint
       ↓
Supabase Edge Function invoked
       ↓
Fetch rates from ExchangeRate-API
       ↓ (on success)
Validate rate data
       ↓
Mark old rates as inactive
       ↓
Insert new rates into database
       ↓
Log update in update_logs table
       ↓
Return success response
```

### 3. Fallback Cascade Logic

```
┌─────────────────────────────────────┐
│  1. Try External API (Fixer.io)     │
│     - Timeout: 10 seconds           │
│     - Retry: 3 times with backoff   │
│     - Circuit breaker enabled       │
└──────────────┬──────────────────────┘
               │
          [Success?]
               │
        ┌──────┴──────┐
        │             │
      YES            NO
        │             │
        ▼             ▼
┌──────────────┐  ┌─────────────────────────────┐
│  Return API  │  │  2. Try Supabase Database   │
│     Rate     │  │     - Query exchange_rates  │
│              │  │     - Check memory cache    │
│  Store in DB │  │     - Try inverse rate      │
│  for future  │  └─────────┬───────────────────┘
└──────────────┘            │
                       [Success?]
                            │
                     ┌──────┴──────┐
                     │             │
                   YES            NO
                     │             │
                     ▼             ▼
             ┌──────────────┐  ┌──────────────────────┐
             │  Return DB   │  │  3. Use Static       │
             │     Rate     │  │     Fallback         │
             │              │  │     - Hardcoded      │
             │ (Mark stale  │  │     - Last resort    │
             │  if old)     │  └──────────────────────┘
             └──────────────┘            │
                     │                   │
                     └─────────┬─────────┘
                               ▼
                     ┌──────────────────┐
                     │  Return Rate     │
                     │  to User         │
                     └──────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Netlify (Frontend)                     │ │
│  │                                                         │ │
│  │  • React Application                                   │ │
│  │  • CurrencyService bundled                             │ │
│  │  • Environment variables configured                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                             │                                │
│                             ▼                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Supabase Cloud Platform                    │ │
│  │                                                         │ │
│  │  ┌──────────────────┐  ┌──────────────────┐           │ │
│  │  │   PostgreSQL     │  │  Edge Functions  │           │ │
│  │  │   Database       │  │  (Deno Runtime)  │           │ │
│  │  └──────────────────┘  └──────────────────┘           │ │
│  │                                                         │ │
│  │  ┌──────────────────┐  ┌──────────────────┐           │ │
│  │  │   pg_cron        │  │   Row Level      │           │ │
│  │  │   Extension      │  │   Security       │           │ │
│  │  └──────────────────┘  └──────────────────┘           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              GitHub Actions (CI/CD)                     │ │
│  │                                                         │ │
│  │  • Automated testing                                   │ │
│  │  • Backup rate update mechanism                        │ │
│  │  • Deployment pipeline                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Layer 1: Authentication & Authorization                │ │
│  │                                                         │ │
│  │  • Supabase Auth for user sessions                     │ │
│  │  • Row Level Security (RLS) policies                   │ │
│  │  • Service role for Edge Functions only                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Layer 2: API Key Management                           │ │
│  │                                                         │ │
│  │  • Environment variables for API keys                  │ │
│  │  • Supabase Vault for sensitive data                   │ │
│  │  • No keys in frontend code                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Layer 3: Data Access Policies                         │ │
│  │                                                         │ │
│  │  • Public read for supported_currencies                │ │
│  │  • Public read for active exchange_rates               │ │
│  │  • Service role only write to rates                    │ │
│  │  • Authenticated read for update logs                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Layer 4: Rate Limiting & DDoS Protection             │ │
│  │                                                         │ │
│  │  • Supabase built-in rate limiting                     │ │
│  │  • Client-side request throttling                      │ │
│  │  • Memory caching to reduce DB hits                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                   Monitoring Dashboard                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Admin Currency Management UI               │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │  Current     │  │   Update     │  │   Health    │ │ │
│  │  │   Rates      │  │   History    │  │   Metrics   │ │ │
│  │  │  Display     │  │     Log      │  │  Dashboard  │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                             │                                │
│                             ▼                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Data Collection                        │ │
│  │                                                         │ │
│  │  • Supabase Logs (Edge Function execution)             │ │
│  │  • exchange_rate_update_logs table                     │ │
│  │  • Client-side error tracking                          │ │
│  │  • Performance metrics (response time)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                             │                                │
│                             ▼                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Alert System                          │ │
│  │                                                         │ │
│  │  • Stale rates (> 24 hours)                            │ │
│  │  • Update failures (consecutive)                       │ │
│  │  • API quota warnings                                  │ │
│  │  • Database connection issues                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                   Caching Strategy                           │
│                                                              │
│  Level 1: In-Memory Cache (Frontend)                        │
│  ├─ TTL: 1 hour                                            │
│  ├─ Storage: JavaScript Map                                │
│  └─ Scope: Per CurrencyService instance                    │
│                                                              │
│  Level 2: Supabase Database Cache                          │
│  ├─ TTL: 6 hours (configurable via expires_at)            │
│  ├─ Storage: PostgreSQL with indexes                       │
│  └─ Scope: Global (all users)                             │
│                                                              │
│  Level 3: Static Fallback                                  │
│  ├─ TTL: Indefinite (updated via code deployment)         │
│  ├─ Storage: Hardcoded constants                           │
│  └─ Scope: Emergency use only                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Database Optimization                         │
│                                                              │
│  Indexes:                                                   │
│  • idx_exchange_rates_active (target, is_active, fetched)  │
│  • idx_exchange_rates_lookup (base, target, is_active)     │
│  • idx_update_logs_status (status, started_at DESC)        │
│                                                              │
│  Query Optimization:                                        │
│  • Use LIMIT 1 for latest rate queries                     │
│  • Filter on is_active before sorting                      │
│  • Leverage composite indexes                              │
│  • Regular VACUUM and ANALYZE                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0
**Last Updated:** January 14, 2025
**Related:** `currency-fallback-system.md`
