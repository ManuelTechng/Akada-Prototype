# Architecture Revamp - Codebase Audit Report
**Generated**: 2025-12-14
**Project**: Akada
**Scope**: Breaking changes analysis for implementation_plan.md

---

## Executive Summary

This audit identifies all components affected by the proposed architecture revamp, focusing on:
1. **Recommendation Engine Migration** (sync → async)
2. **TanStack Query v5 Compatibility**
3. **Service Worker Implementation Status**

### Critical Findings
- ✅ **2 files** directly use `calculateAdvancedMatchScore`
- ✅ **2 files** import from `recommendations.ts`
- ✅ **Service Worker exists** but is placeholder-only
- ⚠️ **React 18.2.0** is compatible with TanStack Query v5
- ⚠️ **Breaking change** will affect recommendation UX

---

## 1. Recommendation Engine Breaking Changes

### 1.1 Direct Usage of `calculateAdvancedMatchScore`

#### ❌ File: `src/lib/recommendations.ts` (Line 46)
**Current Implementation**:
```typescript
async function calculateAdvancedMatchScore(
  program: Program,
  preferences: UserPreferences,
  behavior?: UserBehavior
): Promise<ProgramMatch>
```

**Status**: Already async ✅
**Action Required**:
- Update to call Edge Function instead of local calculation
- Remove all matching logic (lines 46-246)
- Keep interface types (RecommendationCategory, UserPreferences, etc.)

**Migration Complexity**: HIGH
- Contains complex multi-factor scoring algorithm
- 10+ behavioral analysis helpers
- 200+ lines of logic to migrate

---

### 1.2 Components Using Recommendation Engine

#### 📄 File: `src/components/app/RecommendedPrograms.tsx`

**Current Usage**:
```typescript
// Lines 19-24
import {
  fetchPersonalizedRecommendations,
  refreshRecommendations,
  getUserRecommendations,
  type RecommendationCategory
} from '../../lib/recommendations'

// Lines 79-79
recommendationsPromise = getUserRecommendations(user.id)

// Lines 82
recommendationsPromise = fetchPersonalizedRecommendations({})
```

**Breaking Changes**:
1. Functions are already async ✅
2. BUT they call local `calculateAdvancedMatchScore` internally ❌
3. UI already has loading states ✅
4. 15-second timeout implemented ✅

**Migration Impact**: MEDIUM
**Action Required**:
- Update error messages to reflect API failures
- Test timeout handling with slow Edge Functions
- No component-level changes needed (already async)

---

#### 📄 File: `src/hooks/useDashboard.ts`

**Current Usage**:
```typescript
// Line 529
const { getUserRecommendations } = await import('../lib/recommendations')

// Line 532
const categories = await getUserRecommendations(user.id)
```

**Breaking Changes**: NONE ✅
**Action Required**: NONE ✅
**Reason**: Hook already handles async, dynamic import pattern is good

---

### 1.3 Files NOT Affected (False Positives)

- `src/lib/costCalculation.ts` - Different module, no relationship
- `src/components/dashboard/CostBreakdownWidget.tsx` - Uses costCalculation, not recommendations

---

## 2. TanStack Query v5 Compatibility Analysis

### 2.1 Current Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@supabase/supabase-js": "^2.39.8"
}
```

### 2.2 Compatibility Matrix

| Package | Current Version | TanStack Query v5 Requirement | Status |
|---------|----------------|-------------------------------|---------|
| React | 18.2.0 | ≥ 18.0.0 | ✅ Compatible |
| TypeScript | 5.2.2 | ≥ 4.7 | ✅ Compatible |
| Vite | 5.0.8 | N/A | ✅ Compatible |

### 2.3 Potential Conflicts

**NONE DETECTED** ✅

**Installation Command**:
```bash
npm install @tanstack/react-query@^5.0.0
```

**Estimated Bundle Size Impact**: +45KB (gzipped)

---

## 3. Service Worker Implementation Status

### 3.1 Existing Files

#### 📄 File: `public/service-worker.js`
**Status**: ⚠️ **PLACEHOLDER ONLY**

```javascript
// Lines 1-6
self.addEventListener('install', event => {
  // Service worker installed
});
self.addEventListener('fetch', event => {
  // Placeholder: no caching yet
});
```

**Action Required**: FULL IMPLEMENTATION NEEDED
**Complexity**: HIGH

---

#### 📄 File: `src/utils/serviceWorker.ts`
**Status**: ✅ **COMPLETE REGISTRATION UTILITY**

**Features**:
- ✅ Registration with error handling
- ✅ Network monitoring (3G optimization)
- ✅ Cache size management (50MB limit)
- ✅ Offline queue sync
- ✅ Update checking
- ✅ Localhost detection (SW disabled in dev)

**Action Required**: NONE - Utility is ready ✅

---

#### 📄 File: `public/sw.js`
**Status**: Same as `service-worker.js` (duplicate?)

**Action Required**: Consolidate with `service-worker.js`

---

### 3.2 Service Worker Implementation Gap

**Implementation Plan says**:
> Create service-worker.js with Workbox-based caching

**Reality**:
- ❌ No Workbox dependency installed
- ❌ No caching strategies implemented
- ❌ No route handlers defined
- ✅ Registration utility exists

**Missing Workbox Installation**:
```bash
npm install workbox-precaching workbox-routing workbox-strategies workbox-core
```

---

## 4. Breaking Change Impact Summary

### 4.1 Affected Components

| Component | Impact Level | Changes Required | Test Priority |
|-----------|--------------|------------------|---------------|
| `recommendations.ts` | 🔴 HIGH | Replace logic with Edge Function call | P0 |
| `RecommendedPrograms.tsx` | 🟡 MEDIUM | Update error handling | P1 |
| `useDashboard.ts` | 🟢 LOW | None (already async) | P2 |

### 4.2 User Experience Impact

**Before** (Current):
```
User clicks "Refresh" →
Local calculation (2-5s) →
Results displayed
```

**After** (Proposed):
```
User clicks "Refresh" →
API call to Edge Function (1-3s network + 0.5-2s compute) →
Results displayed
```

**Concerns**:
1. Network latency on 3G (Nigeria) could increase wait time
2. Edge Function cold starts (first request ~2-3s)
3. API failures will break recommendations completely (no fallback)

**Recommendation**: Implement fallback to cached recommendations on API failure

---

## 5. Migration Checklist

### Phase 1: Infrastructure (TanStack Query)

- [ ] Install `@tanstack/react-query` v5
- [ ] Create `QueryClientProvider` wrapper in `App.tsx`
- [ ] Create `useSupabaseQuery` hook
- [ ] Test existing Supabase queries compatibility

### Phase 2: Service Worker (Offline Support)

- [ ] Install Workbox dependencies
- [ ] Implement caching strategies in `service-worker.js`
- [ ] Add route handlers for API, static assets, images
- [ ] Test offline mode with DevTools
- [ ] Verify cache size limits on mobile

### Phase 3: Recommendation Engine Migration

- [ ] Create Supabase Edge Function `ai-recommendations`
- [ ] Implement pgvector similarity search
- [ ] Add database migration for `embedding` column
- [ ] Create `generate-embeddings` Edge Function
- [ ] Update `recommendations.ts` to call Edge Function
- [ ] Add fallback strategy for API failures
- [ ] Update error messages in `RecommendedPrograms.tsx`
- [ ] Test with slow 3G network simulation

---

## 6. Risk Assessment

### High Risk Items

1. **No Fallback Strategy** 🔴
   - If Edge Function fails, recommendations break completely
   - Mitigation: Cache last successful recommendations

2. **Cold Start Latency** 🔴
   - First request to Edge Function may take 2-3s
   - Mitigation: Warm-up function with scheduled pings

3. **OpenAI API Costs** 🟡
   - Embedding generation on every program INSERT/UPDATE
   - Mitigation: Batch processing, rate limiting

### Medium Risk Items

4. **3G Network Performance** 🟡
   - API calls over 3G may timeout (15s limit)
   - Mitigation: Optimize Edge Function response size

5. **Service Worker Complexity** 🟡
   - Workbox learning curve
   - Mitigation: Use Workbox CLI for scaffolding

### Low Risk Items

6. **TanStack Query Migration** 🟢
   - Well-documented, stable library
   - Mitigation: Follow official migration guide

---

## 7. Recommendations

### Critical Actions Before Implementation

1. **Add Fallback Strategy**
   ```typescript
   // Pseudo-code
   try {
     return await supabase.functions.invoke('ai-recommendations')
   } catch (error) {
     console.error('Edge Function failed, using cached recommendations')
     return getCachedRecommendations()
   }
   ```

2. **Implement Progressive Enhancement**
   - Keep local calculation as fallback
   - Use Edge Function when available
   - Degrade gracefully on network failures

3. **Add Edge Function Warming**
   ```sql
   -- Scheduled Supabase cron job
   SELECT cron.schedule('warm-ai-recommendations', '*/5 * * * *', $$
     SELECT net.http_get('https://your-project.supabase.co/functions/v1/ai-recommendations')
   $$);
   ```

4. **Monitor OpenAI Costs**
   - Set up billing alerts
   - Implement rate limiting (max 100 embeddings/hour)

### Nice-to-Have Enhancements

5. **Request Deduplication**
   - Cache Edge Function responses for 5 minutes
   - Reduce redundant API calls

6. **Optimistic UI Updates**
   - Show cached recommendations immediately
   - Update with fresh data in background

---

## 8. Estimated Timeline

| Phase | Estimated Time | Confidence |
|-------|----------------|------------|
| Phase 1: TanStack Query | 4-6 hours | High |
| Phase 2: Service Worker | 8-12 hours | Medium |
| Phase 3: Recommendation Migration | 12-16 hours | Medium |
| Testing & QA | 8-10 hours | Low |
| **Total** | **32-44 hours** | **Medium** |

---

## 9. Next Steps

1. ✅ Review this audit with stakeholders
2. ⏳ Decide on fallback strategy (keep local vs. cache-only)
3. ⏳ Create Archon tasks for each phase
4. ⏳ Set up staging environment for testing
5. ⏳ Implement Phase 1 (lowest risk)

---

## Appendix A: Code References

### Recommendation Engine Callers

- [recommendations.ts:46](src/lib/recommendations.ts#L46) - `calculateAdvancedMatchScore` definition
- [recommendations.ts:411](src/lib/recommendations.ts#L411) - Used in `fetchPersonalizedRecommendations`
- [RecommendedPrograms.tsx:79](src/components/app/RecommendedPrograms.tsx#L79) - `getUserRecommendations` call
- [useDashboard.ts:532](src/hooks/useDashboard.ts#L532) - Dynamic import usage

### Service Worker Files

- [public/service-worker.js](public/service-worker.js) - Placeholder implementation
- [src/utils/serviceWorker.ts](src/utils/serviceWorker.ts) - Registration utility (complete)
- [public/sw.js](public/sw.js) - Duplicate placeholder

---

**End of Audit Report**
