# Implementation Plan - Architecture Revamp (UPDATED)
**Last Updated**: 2025-12-15
**Status**: Enhanced with Intent Tagging & Semantic Reranking

This plan addresses critical architectural risks identified in the review: lack of offline support, client-side IP exposure, and technical debt.

## User Review Required

> [!IMPORTANT]
> **Dependencies:** This plan requires installing:
> - `@tanstack/react-query` v5
> - `cohere-ai` (for semantic reranking)
>
> **Breaking Change:** The recommendation engine API on the frontend will change from synchronous local calculation to asynchronous backend calls.
>
> **New Feature:** Intent-aware search with semantic understanding (e.g., "cheap schools in safe cities with PR options")

---

## Proposed Changes

### Phase 1: Deep Infrastructure (Reliability & Offline)

#### [NEW] [QueryClientProvider](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/src/App.tsx)
- Wrap the entire application in `QueryClientProvider`
- Configure default options optimized for 3G networks:
  - `staleTime: 5 minutes` (data freshness)
  - `gcTime: 10 minutes` (cache retention)
  - `refetchOnWindowFocus: false` (bandwidth saving)
  - `retry: 2` with exponential backoff
- Add React Query DevTools (development only)

**Reference**: [complete_architecture_audit.md Section 1.1](complete_architecture_audit.md#11-queryclientprovider-setup)

---

#### [NEW] [useSupabaseQuery](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/src/hooks/useSupabaseQuery.ts)
- Create a generic hook wrapper for Supabase queries
- Integrate with TanStack Query for automatic caching and revalidation
- Add `useSupabaseMutation` for INSERT/UPDATE/DELETE operations
- Include `createOptimisticUpdate` utility for instant UI updates
- Type-safe with TypeScript generics

**Reference**: [complete_architecture_audit.md Section 1.2](complete_architecture_audit.md#12-usesupabasequery-hook-design)

---

#### [MODIFY] [ProgramSearchPage](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/src/pages/ProgramSearchPage.tsx)
- Replace manual `useEffect` fetching with `useSupabaseQuery` hooks
- Extract separate hooks: `useCountries()`, `useDegreeTypes()`, `useInstitutionTypes()`, `useProgramSearch()`
- Implement proper loading and error states using Query data
- Enable `keepPreviousData` for smooth filter transitions
- **Estimated reduction**: 50 lines of code (10% smaller)

**Reference**: [complete_architecture_audit.md Section 1.3](complete_architecture_audit.md#13-programsearchpage-migration)

---

#### [NEW] [service-worker.js](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/public/service-worker.js)
- Implement Workbox-based service worker for static asset caching
- Add caching strategies:
  - Static assets: Cache-first
  - API responses: Network-first with cache fallback
  - Images: Cache-first with 50MB limit
- Register SW in `main.tsx` (already exists, needs implementation)

**Installation**:
```bash
npm install workbox-precaching workbox-routing workbox-strategies workbox-core
```

**Reference**: [architecture_revamp_audit.md Section 3](architecture_revamp_audit.md#3-service-worker-implementation-status)

---

### Phase 2: Security & IP Protection (AI + Vector Search + Intent Understanding)

#### [NEW] [Database Migration] (Supabase)

**Core Vector Search**:
- Enable `vector` extension
- Add `embedding` column (vector(1536)) to `programs` table
- Add metadata columns: `embedding_generated_at`, `embedding_model`
- Create HNSW index for fast similarity search (m=16, ef_construction=64)
- Create `match_programs()` RPC function for vector queries

**Intent Metadata** 🆕:
- Add `intent_metadata` column (JSONB) to `programs` table
- Create GIN index for fast intent queries
- Populate with:
  - Financial metadata: `budget_friendly`, `tuition_tier`
  - Safety metadata: `safety_score`, `crime_rate`
  - Migration metadata: `migration_pathway`, `post_study_work`
  - Work permit metadata: `work_permit`
  - Cost of living: `cost_of_living_index`

**Example metadata**:
```json
{
  "budget_friendly": true,
  "tuition_tier": "low",
  "scholarship_available": true,
  "safety_score": 9.2,
  "crime_rate": "low",
  "migration_pathway": "PR via Express Entry",
  "post_study_work": "3 years PGWP",
  "work_permit": "Allowed 20hrs/week",
  "cost_of_living_index": 75
}
```

**SQL Scripts**:
- Migration script with HNSW index
- Backfill strategy (batch processing)
- Rollback script for safety

**Reference**: [complete_architecture_audit.md Section 2.1](complete_architecture_audit.md#21-database-migration)

---

#### [NEW] [Intent Detection System] 🆕

**File**: `src/lib/intent/detector.ts`

Lightweight intent understanding WITHOUT Azure AI Search:

**14 Intent Types**:
- **Financial**: `budget_intent`, `scholarship_intent`, `value_intent`
- **Safety**: `safety_intent`, `qol_intent`, `family_intent`
- **Migration**: `migration_intent`, `work_permit_intent`, `psw_intent`, `pr_intent`
- **Academic**: `research_intent`, `industry_intent`, `prestige_intent`
- **Lifestyle**: `weather_intent`, `urban_intent`, `culture_intent`
- **Practical**: `speed_intent`, `part_time_intent`, `online_intent`

**Implementation Phases**:
1. **Phase 1**: Rule-based keyword/phrase matching
   - Fast, no API calls
   - Pattern matching with confidence scoring
   - Boost factors (1.2x - 1.6x)

2. **Phase 2** (Future): LLM-assisted detection
   - GPT-4o-mini for complex queries
   - Hybrid approach (rules for simple, LLM for complex)
   - ~$1.50/month additional cost

**Example**:
```typescript
// Query: "cheap schools in safe cities with PR options"
const analysis = analyzeQuery(query)
// Returns:
{
  intents: [
    { type: "budget_intent", confidence: 0.9, boost: 1.5 },
    { type: "safety_intent", confidence: 0.85, boost: 1.3 },
    { type: "pr_intent", confidence: 0.8, boost: 1.4 }
  ],
  primary_intent: "budget_intent",
  extracted_entities: {
    budget_range: [0, 20000],
    countries: ["Canada"]
  }
}
```

**Reference**: [enhanced_recommendation_architecture.md Section 1](enhanced_recommendation_architecture.md#phase-1-intent-tagging-system)

---

#### [NEW] [Intent Metadata Population Script] 🆕

**File**: `scripts/populate-intent-metadata.ts`

One-time script to populate program metadata:
- Country-level data (migration rules, safety scores, work permits)
- Program-level data (tuition tiers, scholarship flags)
- Automated metadata generation based on existing data

**Run after database migration**:
```bash
npx ts-node scripts/populate-intent-metadata.ts
```

**Reference**: [enhanced_recommendation_architecture.md Section 1.3](enhanced_recommendation_architecture.md#metadata-population-script)

---

#### [NEW] [generate-embeddings](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/supabase/functions/generate-embeddings/index.ts)

**Triggers**: Database webhook on Program INSERT/UPDATE

**Functionality**:
- Generates OpenAI embedding (text-embedding-3-small) for program description + metadata
- Saves back to `embedding` column
- Rate limiting: 100 requests/hour per program
- Duplicate detection (skip if embedding exists)
- Error handling with detailed logging

**Environment Variables**:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Reference**: [complete_architecture_audit.md Section 2.2](complete_architecture_audit.md#22-edge-function-generate-embeddings)

---

#### [NEW] [ai-recommendations](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/supabase/functions/ai-recommendations/index.ts)

**ENHANCED Pipeline** 🆕:

**Step 1: Intent Detection**
- Analyze user query for intents
- Extract entities (budget, countries, fields)

**Step 2: Vector Search**
- Generate query embedding via OpenAI
- Use `pgvector` similarity search (`1 - (embedding <=> query_embedding)`)
- Get top 100 candidates

**Step 3: Intent Boosting** 🆕
- Apply boost factors based on metadata matches
- Example: Program with all 3 intents gets 1.5 × 1.3 × 1.4 = 2.73x boost

**Step 4: Semantic Reranking** 🆕
- Call Cohere Rerank API
- Reorder top 50 boosted results
- Get top 20 with semantic relevance scores

**Step 5: Hard Filters**
- Apply budget, country, scholarship filters
- Calculate final score (weighted combination)

**Step 6: Return Results with Explanations**
- Include match breakdown
- Provide "Why this match?" reasons

**Security**:
- JWT validation with Supabase Auth
- Rate limiting
- Error handling

**Reference**:
- [complete_architecture_audit.md Section 2.3](complete_architecture_audit.md#23-edge-function-ai-recommendations)
- [enhanced_recommendation_architecture.md Section 2](enhanced_recommendation_architecture.md#phase-2-enhanced-search-with-intent-boosting)

---

#### [NEW] [Cohere Reranking Integration] 🆕

**File**: `src/lib/rerank/cohere.ts`

**Installation**:
```bash
npm install cohere-ai
```

**Configuration**:
- Model: `rerank-english-v3.0`
- Default top_n: 20
- Fallback to original order on failure

**Cost**: ~$60/month (1,000 searches/day × $0.002 per search)

**Example**:
```typescript
const reranked = await rerankResults(
  "cheap schools in safe cities",
  candidates,
  20
)
// Returns top 20 with semantic relevance scores
```

**Reference**: [enhanced_recommendation_architecture.md Section 2.2](enhanced_recommendation_architecture.md#22-cohere-reranking-integration)

---

#### [MODIFY] [recommendations.ts](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/src/lib/recommendations.ts)

**Changes**:
1. Remove local calculation logic (~200 lines)
2. Update `calculateAdvancedMatchScore` to call Edge Function
3. Add fallback strategy for Edge Function failures:
   - Try localStorage cache first
   - Fall back to basic local matching if cache miss
4. Ensure type safety is maintained
5. Add match explanation parsing

**New Return Format**:
```typescript
{
  program: Program,
  matchScore: 92,
  reasons: [
    "Budget-friendly option",
    "High safety score: 9.2/10",
    "Migration pathway: PR via Express Entry"
  ],
  confidence: 'high',
  category: 'perfect-match',
  match_breakdown: {
    vector_similarity: 0.85,
    semantic_rerank: 0.94,
    intent_boost: 2.73
  }
}
```

**Reference**: [complete_architecture_audit.md Section 2.4](complete_architecture_audit.md#24-update-recommendationsts)

---

### Phase 3: Cleanup & Stability

#### [MODIFY] [LandingPage.tsx](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/src/pages/LandingPage.tsx)
- Consolidate 27 variant files into one configurable component
- Implement feature flag system via `config/features.ts`
- Use environment variable: `VITE_LANDING_VARIANT`
- Variants: `default`, `minimalist`, `enhanced`, `redesigned`
- Dynamic component loading based on variant

**Strategy**:
1. Create feature flag config
2. Update main LandingPage.tsx with dynamic imports
3. Move unused variants to `/deprecated` folder
4. Monitor for 1 sprint
5. Delete deprecated files after confirmation

**Reference**: [complete_architecture_audit.md Section 3.1](complete_architecture_audit.md#31-landing-page-consolidation)

---

#### [DELETE] [Redundant Landing Pages](file:///c:/Users/oyiny/OneDrive/2025/manueltech/Projects/Akada-Prototype/Project Akada/src/pages/)

**Files to Consolidate** (27 total):
- Hero variants: Default, Enhanced, Redesigned, Minimalist
- Features variants: Default, Enhanced, Redesigned, Minimalist
- ProblemSolution variants: Default, Minimalist
- HowItWorks variants: Default, Minimalist
- SuccessStories variants: Default, Minimalist
- Pricing variants: Default, Minimalist
- FAQ variants: Default, Minimalist
- About variants: Default, Minimalist
- Signup variants: Default, Minimalist
- Footer variants: Default, Minimalist
- Navbar variants: Default, Minimalist

**Gradual Deprecation**:
- Week 1: Move to `/deprecated` folder
- Week 2-3: Monitor for usage
- Week 4: Delete if no usage detected

---

## Cost Analysis

### Monthly Operational Costs

| Component | Usage | Cost/Month |
|-----------|-------|------------|
| **OpenAI Embeddings** | 1,000 searches/day | $3 |
| **Cohere Reranking** 🆕 | 1,000 searches/day | $60 |
| **LLM Intent Detection** (optional) | 500 complex queries/day | $1.50 |
| **pgvector** | Included in Supabase | $0 |
| **Workbox/SW** | Client-side | $0 |
| **TanStack Query** | Client-side | $0 |
| **Total** | | **~$64.50/month** |

### vs Azure AI Search Alternative

| Tier | Monthly Cost | Our Savings |
|------|-------------|-------------|
| Azure Basic | $250/month | **$185/month (74%)** |
| Azure Standard S1 | $500/month | **$435/month (87%)** |

**Why not Azure**: We achieve the same capabilities (vector search, semantic reranking, intent understanding) at 74% lower cost with no vendor lock-in.

---

## Verification Plan

### Automated Tests

1. **Unit Tests**:
   - `useSupabaseQuery` hook
   - Intent detection accuracy
   - Boost factor calculations

2. **Integration Tests**:
   - Complete search pipeline (intent → vector → rerank → filter)
   - Edge Function responses
   - Fallback strategies

3. **Performance Tests**:
   - Search latency benchmarks
   - Cache hit rate monitoring
   - 3G network simulation

---

### Manual Verification

#### 1. **Offline Mode**:
   - Open Developer Tools → Application → Service Workers
   - Check "Offline" box
   - Reload page and verify assets load from cache
   - Verify Program Search still shows cached results

#### 2. **Security**:
   - Inspect Network tab when viewing programs
   - Verify request goes to `functions/v1/ai-recommendations`
   - Confirm logic is not visible in `main.js` bundle
   - Check JWT token in request headers

#### 3. **Functionality**:
   - Verify Program Search filtering still works correctly with new Query hooks
   - Verify Landing Page renders correctly with feature flags
   - Test intent detection with sample queries:
     - "cheap schools in safe cities with PR"
     - "fast track programs with scholarships"
     - "top universities for research in AI"

#### 4. **Intent Understanding** 🆕:
   - Query: "cheap schools in safe cities with PR options"
   - Expected intents: `budget_intent`, `safety_intent`, `pr_intent`
   - Verify results include:
     - Programs with `budget_friendly: true`
     - Programs with `safety_score > 8`
     - Programs with `migration_pathway` metadata
   - Check "Why this match?" explanations in UI

#### 5. **Semantic Reranking** 🆕:
   - Compare results before/after Cohere reranking
   - Verify top results are semantically relevant
   - Test with synonym queries:
     - "affordable" vs "cheap"
     - "safe" vs "secure"
     - "immigration" vs "PR"

---

## Implementation Timeline

### Week 1: Phase 1 Foundation
- **Day 1-2**: QueryClientProvider setup + tests
- **Day 3-4**: useSupabaseQuery hook + tests
- **Day 5**: ProgramSearchPage migration (start)

### Week 2: Phase 1 Completion + Phase 2 Start
- **Day 1-2**: ProgramSearchPage migration (complete)
- **Day 3**: Service Worker Workbox implementation
- **Day 4-5**: Database migration (dev/staging)

### Week 3: Phase 2 - Intent System 🆕
- **Day 1**: Intent detector + metadata schema
- **Day 2**: Populate intent metadata script
- **Day 3**: generate-embeddings Edge Function
- **Day 4**: Intent boosting integration
- **Day 5**: Cohere reranking integration

### Week 4: Phase 2 - AI Recommendations
- **Day 1-2**: ai-recommendations Edge Function (complete pipeline)
- **Day 3**: recommendations.ts update with fallback
- **Day 4**: Frontend integration + "Why this match?" UI
- **Day 5**: Testing + bug fixes

### Week 5: Phase 3 + Production
- **Day 1-2**: Landing page consolidation
- **Day 3**: E2E testing
- **Day 4**: Performance tuning (boost factors)
- **Day 5**: Production deployment

**Total Timeline**: 5 weeks (1 week added for intent system)

---

## Success Metrics

### Before (Current System)
- ❌ No intent understanding
- ❌ No semantic reranking
- ❌ Simple keyword or basic vector search
- ❌ No match explanations

### After (Enhanced System)
- ✅ Detects 14+ intent types
- ✅ Semantic reranking with Cohere
- ✅ Intent-boosted relevance scores
- ✅ Explainable results ("Why this match?")
- ✅ 74% cheaper than Azure AI Search
- ✅ No vendor lock-in (open source stack)
- ✅ Offline support with service worker
- ✅ Optimized for 3G networks

---

## Risk Mitigation

### Critical Risks

#### 1. Edge Function Failures
**Mitigation**:
- localStorage caching of last successful recommendations
- Fallback to basic local matching
- Circuit breaker pattern
- Comprehensive error handling

#### 2. OpenAI Cost Overruns
**Mitigation**:
- Rate limiting (100 embeddings/hour)
- Batch processing for backfill
- Billing alerts at $50/$100
- Embedding deduplication

#### 3. Cohere API Failures 🆕
**Mitigation**:
- Graceful degradation (skip reranking, use boosted order)
- Response timeout (5 seconds)
- Fallback to vector similarity only

#### 4. Database Migration Downtime
**Mitigation**:
- `ADD COLUMN IF NOT EXISTS` (non-blocking)
- Low-traffic window deployment
- Staging environment testing
- Rollback script ready

#### 5. Landing Page Variants
**Mitigation**:
- Feature flag system
- Gradual deprecation (1 sprint buffer)
- Backup files for 1 sprint

---

## Dependencies

### NPM Packages
```bash
# Phase 1
npm install @tanstack/react-query@^5.0.0
npm install -D @tanstack/react-query-devtools@^5.0.0
npm install workbox-precaching workbox-routing workbox-strategies workbox-core

# Phase 2
npm install cohere-ai
npm install openai

# Already Installed
# - @supabase/supabase-js (existing)
# - react, react-dom (existing)
```

### Environment Variables
```env
# OpenAI
VITE_OPENAI_API_KEY=sk-...

# Cohere (NEW)
VITE_COHERE_API_KEY=...

# Supabase (existing)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # For Edge Functions

# Feature Flags (NEW)
VITE_LANDING_VARIANT=default # or minimalist, enhanced, redesigned
```

---

## References

### Audit Documents
- [complete_architecture_audit.md](complete_architecture_audit.md) - Full implementation details (100% coverage)
- [architecture_revamp_audit.md](architecture_revamp_audit.md) - Original partial audit (35% coverage)
- [audit_gap_analysis.md](audit_gap_analysis.md) - Gap analysis between plan and audit
- [enhanced_recommendation_architecture.md](enhanced_recommendation_architecture.md) - Intent tagging & reranking architecture 🆕

### Code Examples
All Edge Function code, SQL migrations, and TypeScript implementations are provided in the audit documents above.

---

**End of Implementation Plan**
