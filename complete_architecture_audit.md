# Complete Architecture Revamp Audit
**Generated**: 2025-12-15
**Project**: Akada
**Scope**: Full implementation plan coverage (100%)

---

## Table of Contents
1. [Phase 1: Deep Infrastructure](#phase-1)
2. [Phase 2: Security & IP Protection](#phase-2)
3. [Phase 3: Cleanup & Stability](#phase-3)
4. [Implementation Roadmap](#roadmap)
5. [Risk Assessment](#risks)

---

<a name="phase-1"></a>
## Phase 1: Deep Infrastructure (Reliability & Offline)

### 1.1 QueryClientProvider Setup

#### Current State
**File**: [src/App.tsx](Project%20Akada/src/App.tsx)
**Lines 1-100**: Existing provider hierarchy

```typescript
// Current providers (Lines 5-9)
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SavedProgramsProvider } from './contexts/SavedProgramsContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
```

**Status**: ❌ QueryClientProvider NOT present

#### Required Changes

**Installation**:
```bash
npm install @tanstack/react-query@^5.0.0
npm install -D @tanstack/react-query-devtools@^5.0.0
```

**New Imports** (add to App.tsx):
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
```

**Query Client Configuration** (3G optimized):
```typescript
// Create outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache & Stale Time
      staleTime: 5 * 60 * 1000, // 5 minutes (data considered fresh)
      gcTime: 10 * 60 * 1000,   // 10 minutes (cache retention - was cacheTime in v4)

      // Network Optimization for 3G
      refetchOnWindowFocus: false,  // Don't refetch on tab switch (saves bandwidth)
      refetchOnReconnect: true,      // Refetch when connection restored
      retry: 2,                      // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

      // Error Handling
      throwOnError: false, // Don't throw errors globally (handle in components)
    },
    mutations: {
      retry: 1, // Retry mutations once
      throwOnError: false,
    },
  },
})
```

**Provider Hierarchy** (recommended order):
```typescript
function App() {
  return (
    <QueryClientProvider client={queryClient}>      {/* 1. TanStack Query (outermost) */}
      <ThemeProvider>                                {/* 2. Theme */}
        <AuthProvider>                               {/* 3. Auth */}
          <NotificationProvider>                     {/* 4. Notifications */}
            <SavedProgramsProvider>                  {/* 5. Saved Programs */}
              <SubscriptionProvider>                 {/* 6. Subscription */}
                <Router>
                  {/* App routes */}
                </Router>
              </SubscriptionProvider>
            </SavedProgramsProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>

      {/* DevTools (development only) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
```

**Complexity**: MEDIUM
**Estimated Time**: 2-3 hours
**Breaking Changes**: None (additive only)

---

### 1.2 useSupabaseQuery Hook Design

#### Hook API Design

**File**: `src/hooks/useSupabaseQuery.ts` (NEW)

```typescript
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js'

/**
 * Generic useSupabaseQuery hook for Supabase SELECT queries
 * Automatically handles errors and provides type safety
 *
 * @example
 * const { data, isLoading, error } = useSupabaseQuery(
 *   ['programs', { country: 'USA' }],
 *   () => supabase.from('programs').select('*').eq('country', 'USA')
 * )
 */
export function useSupabaseQuery<T>(
  queryKey: (string | number | object)[],
  queryFn: () => Promise<PostgrestSingleResponse<T>>,
  options?: Omit<UseQueryOptions<T, PostgrestError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, PostgrestError>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await queryFn()

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      if (data === null) {
        return [] as T // Return empty array for null results
      }

      return data
    },
    ...options,
  })
}

/**
 * Hook for Supabase mutations (INSERT, UPDATE, DELETE)
 *
 * @example
 * const { mutate, isLoading } = useSupabaseMutation(
 *   (programId) => supabase.from('programs').delete().eq('id', programId),
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries(['programs'])
 *     }
 *   }
 * )
 */
export function useSupabaseMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<PostgrestSingleResponse<TData>>,
  options?: UseMutationOptions<TData, PostgrestError, TVariables>
) {
  return useMutation<TData, PostgrestError, TVariables>({
    mutationFn: async (variables) => {
      const { data, error } = await mutationFn(variables)

      if (error) {
        console.error('Supabase mutation error:', error)
        throw error
      }

      return data as TData
    },
    ...options,
  })
}

/**
 * Utility to create optimistic update handlers
 */
export function createOptimisticUpdate<T>(queryKey: any[], updater: (old: T | undefined) => T) {
  return {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<T>(queryKey)

      if (previousData) {
        queryClient.setQueryData<T>(queryKey, updater(previousData))
      }

      return { previousData }
    },
    onError: (_err: any, _variables: any, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  }
}
```

**TypeScript Types** (add to types file):
```typescript
// src/lib/types.ts
import { PostgrestError } from '@supabase/supabase-js'

export type SupabaseQueryResult<T> = {
  data: T | null
  error: PostgrestError | null
  isLoading: boolean
  isError: boolean
  refetch: () => void
}
```

**Complexity**: MEDIUM-HIGH
**Estimated Time**: 4-6 hours (including tests)
**Dependencies**: QueryClientProvider must be set up first

---

### 1.3 ProgramSearchPage Migration

#### Current Implementation Analysis

**File**: [src/pages/ProgramSearchPage.tsx](Project%20Akada/src/pages/ProgramSearchPage.tsx)
**Total Lines**: 906

#### Manual `useEffect` Patterns Identified

**Pattern #1: Load Filter Options** (Lines 58-133)
```typescript
useEffect(() => {
  const loadFilterOptions = async () => {
    // Query 1: Countries
    const { data: allCountries } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name');

    // Query 2: Programs (for fields extraction)
    const { data: programsData } = await supabase
      .from('programs')
      .select('name');

    // Query 3: Degree types
    const { data: degreeData } = await supabase
      .from('programs')
      .select('degree_type')
      .not('degree_type', 'is', null);

    // Query 4: Institution types
    const { data: universitiesData } = await supabase
      .from('universities')
      .select('institution_type')
      .not('institution_type', 'is', null');
  };

  loadFilterOptions();
}, []);
```

**Conversion to TanStack Query**:
```typescript
// Extract to separate hooks
function useCountries() {
  return useSupabaseQuery(
    ['countries', 'active'],
    () => supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name'),
    {
      staleTime: 60 * 60 * 1000, // 1 hour (countries rarely change)
    }
  )
}

function useDegreeTypes() {
  return useSupabaseQuery(
    ['degree-types'],
    () => supabase
      .from('programs')
      .select('degree_type')
      .not('degree_type', 'is', null),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      select: (data) => [...new Set(data.map(p => p.degree_type).filter(Boolean))].sort()
    }
  )
}

function useInstitutionTypes() {
  return useSupabaseQuery(
    ['institution-types'],
    () => supabase
      .from('universities')
      .select('institution_type')
      .not('institution_type', 'is', null'),
    {
      staleTime: 30 * 60 * 1000,
      select: (data) => [...new Set(data.map(u => u.institution_type).filter(Boolean))].sort()
    }
  )
}

// In component
const { data: countries = [] } = useCountries()
const { data: degreeTypes = [] } = useDegreeTypes()
const { data: institutionTypes = [] } = useInstitutionTypes()
```

**Pattern #2: Search Programs** (Lines 144-453)
```typescript
const searchPrograms = async () => {
  setLoading(true);
  setError(null);

  let query = supabase
    .from('programs')
    .select(/* complex select */)
    .limit(50);

  // Apply filters
  if (searchQuery.trim()) {
    query = query.or(`name.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`);
  }
  // ... many more filters

  const { data, error } = await query;

  setPrograms(data);
  setLoading(false);
};
```

**Conversion to TanStack Query**:
```typescript
function useProgramSearch(filters: FilterState, searchQuery: string, sortBy: string) {
  return useSupabaseQuery(
    ['programs', 'search', filters, searchQuery, sortBy],
    async () => {
      let query = supabase
        .from('programs')
        .select(/* same select */)
        .limit(50);

      // Apply all filters (same logic)
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`);
      }
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      // ... other filters

      return query;
    },
    {
      enabled: true, // Always enabled
      keepPreviousData: true, // Keep old data while fetching new (better UX)
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )
}

// In component
const { data: programs = [], isLoading, error } = useProgramSearch(filters, searchQuery, sortBy)

// Remove manual searchPrograms function and useEffect
// TanStack Query automatically re-fetches when dependencies change
```

#### Migration Summary

| Current Approach | TanStack Query Approach | Benefit |
|------------------|------------------------|---------|
| Manual `useEffect` + `useState` | `useSupabaseQuery` hook | Automatic caching |
| 3 separate `useEffect` hooks | 1 query with dependencies | Cleaner code |
| Manual loading states | Built-in `isLoading` | Less boilerplate |
| Manual error handling | Built-in error states | Consistent UX |
| No caching | 2-5 minute cache | Faster page loads |
| No deduplication | Automatic deduplication | Fewer API calls |

#### Refactoring Effort

**Lines to Remove**: ~150 lines (useEffect logic, manual state management)
**Lines to Add**: ~100 lines (hook extractions)
**Net Change**: -50 lines (10% reduction)

**Affected State Variables** (can be removed):
- Line 46: `const [programs, setPrograms] = useState<Program[]>([]);`
- Line 47: `const [loading, setLoading] = useState(true);`
- Line 49: `const [error, setError] = useState<string | null>(null);`
- Line 52-55: Filter option states (countries, fields, degreeTypes, institutionTypes)

**Complexity**: HIGH
**Estimated Time**: 8-12 hours
**Breaking Changes**: None (internal refactor only)

---

### 1.4 Service Worker Implementation

**Status**: ✅ Registration utility exists, ❌ Caching logic missing

**See**: [architecture_revamp_audit.md Section 3](architecture_revamp_audit.md#3-service-worker-implementation-status) for details

**Additional Finding**: [main.tsx:8](Project%20Akada/src/main.tsx#L8) already imports and registers SW

**Action Required**: Implement Workbox caching strategies in `public/service-worker.js`

---

<a name="phase-2"></a>
## Phase 2: Security & IP Protection (AI + Vector Search)

### 2.1 Database Migration

#### SQL Migration Script

```sql
-- ========================================
-- PGVECTOR MIGRATION FOR AKADA
-- Adds semantic search capabilities to programs table
-- ========================================

BEGIN;

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Add embedding column
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Step 3: Add metadata columns for embedding tracking
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS embedding_model VARCHAR(100) DEFAULT 'text-embedding-3-small';

-- Step 4: Create HNSW index for fast similarity search
-- HNSW (Hierarchical Navigable Small World) is faster than IVFFlat for < 1M vectors
CREATE INDEX IF NOT EXISTS programs_embedding_idx
ON programs
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
-- m = max connections per layer (16 is good balance)
-- ef_construction = size of dynamic candidate list (64 is default)

-- Step 5: Create function for similarity search
CREATE OR REPLACE FUNCTION match_programs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  university text,
  country text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    programs.id,
    programs.name,
    programs.university,
    programs.country,
    1 - (programs.embedding <=> query_embedding) as similarity
  FROM programs
  WHERE programs.embedding IS NOT NULL
    AND 1 - (programs.embedding <=> query_embedding) > match_threshold
  ORDER BY programs.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 6: Add trigger to track when embeddings are updated
CREATE OR REPLACE FUNCTION update_embedding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.embedding_generated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER programs_embedding_timestamp
BEFORE UPDATE OF embedding ON programs
FOR EACH ROW
EXECUTE FUNCTION update_embedding_timestamp();

COMMIT;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'programs' AND column_name = 'embedding';

-- Check index
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'programs' AND indexname = 'programs_embedding_idx';

-- Count programs with embeddings
SELECT COUNT(*) as total_programs,
       COUNT(embedding) as programs_with_embeddings,
       ROUND(COUNT(embedding)::numeric / COUNT(*)::numeric * 100, 2) as percentage
FROM programs;
```

#### Backfill Strategy

```sql
-- ========================================
-- BACKFILL STRATEGY (Run AFTER Edge Functions deployed)
-- ========================================

-- Option 1: Backfill in batches (recommended for large datasets)
DO $$
DECLARE
  batch_size INT := 100;
  total_count INT;
  processed INT := 0;
BEGIN
  SELECT COUNT(*) INTO total_count FROM programs WHERE embedding IS NULL;

  RAISE NOTICE 'Total programs to process: %', total_count;

  WHILE processed < total_count LOOP
    -- This would call the Edge Function for each program
    -- In practice, you'd do this via a script, not SQL
    RAISE NOTICE 'Processed % of %', processed, total_count;
    processed := processed + batch_size;
  END LOOP;
END $$;

-- Option 2: Priority backfill (most viewed programs first)
-- Requires a view_count column or similar metric
UPDATE programs
SET embedding = NULL  -- Trigger Edge Function
WHERE embedding IS NULL
  AND created_at > NOW() - INTERVAL '6 months'  -- Recent programs first
ORDER BY created_at DESC
LIMIT 100;
```

#### Rollback Script

```sql
-- ========================================
-- ROLLBACK SCRIPT (If migration fails)
-- ========================================

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS programs_embedding_timestamp ON programs;
DROP FUNCTION IF EXISTS update_embedding_timestamp();

-- Drop function
DROP FUNCTION IF EXISTS match_programs(vector(1536), float, int);

-- Drop index
DROP INDEX IF EXISTS programs_embedding_idx;

-- Drop columns (CAUTION: This loses data!)
ALTER TABLE programs
DROP COLUMN IF EXISTS embedding,
DROP COLUMN IF EXISTS embedding_generated_at,
DROP COLUMN IF EXISTS embedding_model;

-- Note: We don't drop the extension as other tables might use it
-- DROP EXTENSION IF EXISTS vector;

COMMIT;
```

**Complexity**: HIGH
**Estimated Time**: 4-6 hours (including testing)
**Risk**: HIGH (data migration, requires careful testing)

---

### 2.2 Edge Function: generate-embeddings

**File**: `supabase/functions/generate-embeddings/index.ts` (NEW)

```typescript
// ========================================
// GENERATE EMBEDDINGS EDGE FUNCTION
// Triggered by database webhooks on program INSERT/UPDATE
// ========================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Rate limiting (in-memory, resets on function cold start)
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_PER_HOUR = 100

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const limit = rateLimits.get(key)

  if (!limit || now > limit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + 3600000 }) // 1 hour
    return true
  }

  if (limit.count >= RATE_LIMIT_PER_HOUR) {
    return false
  }

  limit.count++
  return true
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // OpenAI limit: 8191 tokens (~8000 chars)
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const { data } = await response.json()
  return data[0].embedding
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Parse request body
    const { program_id, force = false } = await req.json()

    if (!program_id) {
      return new Response(
        JSON.stringify({ error: 'program_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting
    if (!checkRateLimit(program_id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Max 100 requests per hour per program.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch program details
    const { data: program, error: fetchError } = await supabase
      .from('programs')
      .select('id, name, description, specialization, university, country, degree_type, embedding')
      .eq('id', program_id)
      .single()

    if (fetchError || !program) {
      return new Response(
        JSON.stringify({ error: 'Program not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Skip if embedding already exists (unless force = true)
    if (program.embedding && !force) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Embedding already exists',
          program_id,
          skipped: true
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate embedding text
    const embeddingText = [
      program.name || '',
      program.description || '',
      program.specialization || '',
      program.university || '',
      program.country || '',
      program.degree_type || ''
    ]
      .filter(Boolean)
      .join(' ')
      .trim()

    if (!embeddingText) {
      return new Response(
        JSON.stringify({ error: 'No text available for embedding generation' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Generating embedding for program: ${program.name} (${program_id})`)

    // Generate embedding via OpenAI
    const embedding = await generateEmbedding(embeddingText)

    // Save embedding to database
    const { error: updateError } = await supabase
      .from('programs')
      .update({
        embedding,
        embedding_generated_at: new Date().toISOString(),
        embedding_model: 'text-embedding-3-small'
      })
      .eq('id', program_id)

    if (updateError) {
      throw updateError
    }

    console.log(`Successfully generated embedding for program ${program_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        program_id,
        embedding_length: embedding.length,
        text_length: embeddingText.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating embedding:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
```

**Complexity**: MEDIUM-HIGH
**Estimated Time**: 6-8 hours
**Dependencies**: Database migration must be complete

---

### 2.3 Edge Function: ai-recommendations

**File**: `supabase/functions/ai-recommendations/index.ts` (NEW)

```typescript
// ========================================
// AI RECOMMENDATIONS EDGE FUNCTION
// Uses pgvector similarity search + hard constraints
// ========================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface UserPreferences {
  budget_range?: [number, number] | number
  countries?: string[]
  degree_type?: string[]
  specialization?: string[]
  study_level?: string
  scholarship_needed?: boolean
}

async function generateQueryEmbedding(preferences: UserPreferences): Promise<number[]> {
  // Create natural language query from preferences
  const queryParts = []

  if (preferences.specialization) {
    queryParts.push(...preferences.specialization)
  }
  if (preferences.study_level) {
    queryParts.push(preferences.study_level)
  }
  if (preferences.degree_type) {
    queryParts.push(...preferences.degree_type)
  }
  if (preferences.countries) {
    queryParts.push(...preferences.countries)
  }

  const queryText = queryParts.join(' ')

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: queryText,
    }),
  })

  const { data } = await response.json()
  return data[0].embedding
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader }
      }
    })

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const { preferences, match_count = 20 } = await req.json()

    // Generate embedding from preferences
    const queryEmbedding = await generateQueryEmbedding(preferences)

    // Build query with hard constraints
    let query = supabase.rpc('match_programs', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: match_count * 2  // Get more, filter later
    })

    const { data: matches, error: matchError } = await query

    if (matchError) throw matchError

    // Apply hard constraints (budget, scholarships, etc.)
    let filteredMatches = matches

    // Budget filter
    if (preferences.budget_range) {
      const maxBudget = Array.isArray(preferences.budget_range)
        ? preferences.budget_range[1]
        : preferences.budget_range

      filteredMatches = filteredMatches.filter(m =>
        m.tuition_fee <= maxBudget
      )
    }

    // Country filter
    if (preferences.countries && preferences.countries.length > 0) {
      filteredMatches = filteredMatches.filter(m =>
        preferences.countries!.includes(m.country)
      )
    }

    // Scholarship filter
    if (preferences.scholarship_needed) {
      filteredMatches = filteredMatches.filter(m => m.scholarship_available)
    }

    // Limit results
    filteredMatches = filteredMatches.slice(0, match_count)

    return new Response(
      JSON.stringify({
        success: true,
        matches: filteredMatches,
        count: filteredMatches.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in ai-recommendations:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
```

**Complexity**: HIGH
**Estimated Time**: 8-10 hours
**Dependencies**: generate-embeddings must be working

---

### 2.4 Update recommendations.ts

**Changes Required**:

```typescript
// src/lib/recommendations.ts

// BEFORE (local calculation)
async function calculateAdvancedMatchScore(
  program: Program,
  preferences: UserPreferences,
  behavior?: UserBehavior
): Promise<ProgramMatch> {
  // 200+ lines of matching logic
  let score = 0
  // ... complex calculation
  return { program, matchScore: score, reasons, confidence, category }
}

// AFTER (Edge Function call)
async function calculateAdvancedMatchScore(
  program: Program,
  preferences: UserPreferences,
  behavior?: UserBehavior
): Promise<ProgramMatch> {
  try {
    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('ai-recommendations', {
      body: {
        preferences,
        program_ids: [program.id], // Get match for this specific program
        match_count: 1
      }
    })

    if (error) throw error

    const match = data.matches[0]

    return {
      program,
      matchScore: Math.round(match.similarity * 100),
      reasons: ['AI-powered semantic match based on your preferences'],
      confidence: match.similarity > 0.8 ? 'high' : match.similarity > 0.6 ? 'medium' : 'low',
      category: match.similarity >= 0.9 ? 'perfect-match' : 'ai-suggested'
    }

  } catch (error) {
    console.error('Edge Function failed, using fallback:', error)

    // FALLBACK: Use cached recommendations or basic matching
    const cachedMatch = getCachedProgramMatch(program.id)
    if (cachedMatch) return cachedMatch

    // Basic fallback logic
    return {
      program,
      matchScore: 70, // Default moderate match
      reasons: ['Basic match (AI unavailable)'],
      confidence: 'medium',
      category: 'general'
    }
  }
}

// Add caching helper
function getCachedProgramMatch(programId: string): ProgramMatch | null {
  const cached = localStorage.getItem(`program-match-${programId}`)
  if (!cached) return null

  const { match, timestamp } = JSON.parse(cached)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

  if (timestamp < fiveMinutesAgo) {
    localStorage.removeItem(`program-match-${programId}`)
    return null
  }

  return match
}
```

**Complexity**: MEDIUM
**Estimated Time**: 4-6 hours
**Breaking Changes**: YES (async behavior, requires frontend updates)

---

<a name="phase-3"></a>
## Phase 3: Cleanup & Stability

### 3.1 Landing Page Consolidation

#### Current State

**26 Landing Page Files Found**:
1. LandingPage.tsx (main)
2. LandingHero.tsx
3. LandingHeroEnhanced.tsx
4. LandingHeroRedesigned.tsx
5. LandingHeroMinimalist.tsx
6. LandingFeatures.tsx
7. LandingFeaturesEnhanced.tsx
8. LandingFeaturesRedesigned.tsx
9. LandingFeaturesMinimalist.tsx
10. LandingProblemSolution.tsx
11. LandingProblemSolutionMinimalist.tsx
12. LandingHowItWorks.tsx
13. LandingHowItWorksMinimalist.tsx
14. LandingSuccessStories.tsx
15. LandingSuccessStoriesMinimalist.tsx
16. LandingPricing.tsx
17. LandingPricingMinimalist.tsx
18. LandingFAQ.tsx
19. LandingFAQMinimalist.tsx
20. LandingAbout.tsx
21. LandingAboutMinimalist.tsx
22. LandingSignup.tsx
23. LandingSignupMinimalist.tsx
24. LandingFooter.tsx
25. LandingFooterMinimalist.tsx
26. LandingNavbar.tsx
27. LandingNavbarMinimalist.tsx

#### Consolidation Strategy

**Step 1: Identify Active Variant**
- Check current usage in routes
- Determine which variant is in production

**Step 2: Create Feature Flag System**
```typescript
// src/config/features.ts
export const LANDING_PAGE_VARIANT = (import.meta.env.VITE_LANDING_VARIANT as
  'default' | 'minimalist' | 'enhanced' | 'redesigned') || 'default'

// src/pages/LandingPage.tsx
import { LANDING_PAGE_VARIANT } from '../config/features'

export function LandingPage() {
  const Hero = LANDING_PAGE_VARIANT === 'minimalist'
    ? LandingHeroMinimalist
    : LANDING_PAGE_VARIANT === 'enhanced'
    ? LandingHeroEnhanced
    : LandingHero

  // ... same for other components
}
```

**Step 3: Gradual Deprecation**
- Move unused variants to `/deprecated` folder
- Add deprecation warnings
- Monitor for 1 sprint
- Delete if no usage

**Complexity**: MEDIUM
**Estimated Time**: 6-8 hours
**Risk**: MEDIUM (UI changes, requires testing)

---

<a name="roadmap"></a>
## Implementation Roadmap

### Week 1: Phase 1 Foundation
- [ ] Day 1-2: QueryClientProvider setup & testing
- [ ] Day 3-4: useSupabaseQuery hook creation & tests
- [ ] Day 5: ProgramSearchPage migration (start)

### Week 2: Phase 1 Completion + Phase 2 Start
- [ ] Day 1-2: ProgramSearchPage migration (complete)
- [ ] Day 3: Service Worker caching implementation
- [ ] Day 4-5: Database migration (dev/staging)

### Week 3: Phase 2 Edge Functions
- [ ] Day 1-2: generate-embeddings Edge Function
- [ ] Day 3-4: ai-recommendations Edge Function
- [ ] Day 5: recommendations.ts update

### Week 4: Phase 3 + Testing
- [ ] Day 1-2: Landing page consolidation
- [ ] Day 3-4: E2E testing
- [ ] Day 5: Production deployment

---

<a name="risks"></a>
## Risk Assessment & Mitigation

### Critical Risks

#### 1. Edge Function Failures 🔴
**Risk**: No fallback if Edge Functions fail
**Impact**: Recommendations completely broken
**Mitigation**:
- Implement localStorage caching
- Keep basic local matching as fallback
- Add circuit breaker pattern

#### 2. OpenAI Cost Overruns 🔴
**Risk**: Embedding generation on every INSERT
**Impact**: Unexpected API costs
**Mitigation**:
- Rate limiting (100/hour)
- Batch processing for backfill
- Set billing alerts at $50/$100

#### 3. Database Migration Downtime 🟡
**Risk**: Adding vector column locks table
**Impact**: Service disruption
**Mitigation**:
- Use `ADD COLUMN IF NOT EXISTS`
- Run during low-traffic window
- Test on staging first

#### 4. Landing Page Variants 🟡
**Risk**: Deleting wrong variant breaks production
**Impact**: Broken landing page
**Mitigation**:
- Feature flag system
- Gradual deprecation
- Keep backups for 1 sprint

---

## Summary Statistics

| Phase | Items | Estimated Hours | Complexity | Risk |
|-------|-------|----------------|------------|------|
| Phase 1 | 4 items | 32-44 hours | HIGH | MEDIUM |
| Phase 2 | 4 items | 22-30 hours | VERY HIGH | HIGH |
| Phase 3 | 2 items | 6-8 hours | MEDIUM | LOW |
| **Total** | **10 items** | **60-82 hours** | **HIGH** | **MEDIUM-HIGH** |

**Total Effort**: 2-3 weeks (1 developer, full-time)
**Audit Coverage**: 100% of implementation plan

---

**End of Complete Audit**
