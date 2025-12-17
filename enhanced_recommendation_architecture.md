# Enhanced Recommendation Architecture (Option A)
**Date**: 2025-12-15
**Status**: Approved by User
**Approach**: pgvector + Cohere Rerank + Intent Tagging

---

## Architecture Overview

```
User Query
    ↓
Intent Tagger (Rule-based → LLM-assisted)
    ↓
Extract: budget_intent, safety_intent, migration_intent, etc.
    ↓
Vector Search (pgvector) + Keyword Boosting
    ↓
Semantic Reranking (Cohere)
    ↓
Hard Filters (budget, country, scholarships)
    ↓
Results with Intent Scores
```

---

## Phase 1: Intent Tagging System

### 1.1 Intent Taxonomy

```typescript
// src/lib/intent/types.ts

export interface Intent {
  type: IntentType
  confidence: number // 0-1
  keywords: string[]
  boost_factor: number // Multiplier for relevance score
}

export enum IntentType {
  // Financial Intents
  BUDGET_CONSCIOUS = 'budget_intent',
  SCHOLARSHIP_SEEKING = 'scholarship_intent',
  VALUE_FOR_MONEY = 'value_intent',

  // Safety & Security Intents
  SAFETY_FOCUSED = 'safety_intent',
  QUALITY_OF_LIFE = 'qol_intent',
  FAMILY_FRIENDLY = 'family_intent',

  // Migration & Career Intents
  MIGRATION_FOCUSED = 'migration_intent',
  WORK_PERMIT = 'work_permit_intent',
  POST_STUDY_WORK = 'psw_intent',
  PR_PATHWAY = 'pr_intent',

  // Academic Intents
  RESEARCH_FOCUSED = 'research_intent',
  INDUSTRY_CONNECTIONS = 'industry_intent',
  PRESTIGE_SEEKING = 'prestige_intent',

  // Lifestyle Intents
  WEATHER_PREFERENCE = 'weather_intent',
  URBAN_PREFERENCE = 'urban_intent',
  CULTURAL_FIT = 'culture_intent',

  // Practical Intents
  FAST_TRACK = 'speed_intent',
  PART_TIME_WORK = 'part_time_intent',
  ONLINE_HYBRID = 'online_intent',
}

export interface QueryAnalysis {
  raw_query: string
  intents: Intent[]
  primary_intent: IntentType | null
  extracted_entities: {
    budget_range?: [number, number]
    countries?: string[]
    degree_types?: string[]
    fields?: string[]
  }
}
```

---

### 1.2 Rule-Based Intent Detector (Phase 1)

```typescript
// src/lib/intent/detector.ts

const INTENT_PATTERNS: Record<IntentType, {
  keywords: string[]
  phrases: string[]
  boost_factor: number
}> = {
  [IntentType.BUDGET_CONSCIOUS]: {
    keywords: ['cheap', 'affordable', 'low cost', 'budget', 'inexpensive', 'economical'],
    phrases: ['on a budget', 'save money', 'low tuition', 'cost-effective'],
    boost_factor: 1.5
  },

  [IntentType.SAFETY_FOCUSED]: {
    keywords: ['safe', 'secure', 'safety', 'peaceful', 'low crime'],
    phrases: ['safe city', 'safe country', 'low crime rate', 'high security'],
    boost_factor: 1.3
  },

  [IntentType.MIGRATION_FOCUSED]: {
    keywords: ['PR', 'immigration', 'migrate', 'settle', 'permanent residence'],
    phrases: ['stay back', 'work permit', 'post-study work', 'path to PR', 'citizenship'],
    boost_factor: 1.4
  },

  [IntentType.SCHOLARSHIP_SEEKING]: {
    keywords: ['scholarship', 'funding', 'grant', 'financial aid', 'bursary'],
    phrases: ['full scholarship', 'partial funding', 'merit scholarship'],
    boost_factor: 1.6
  },

  [IntentType.WORK_PERMIT]: {
    keywords: ['work permit', 'OPT', 'CPT', 'PGWP', 'work visa'],
    phrases: ['work while studying', 'part-time work', 'work authorization'],
    boost_factor: 1.3
  },

  [IntentType.POST_STUDY_WORK]: {
    keywords: ['stay back', 'post-study', 'PSW', 'graduate visa'],
    phrases: ['work after graduation', 'stay and work', 'employment visa'],
    boost_factor: 1.4
  },

  [IntentType.PRESTIGE_SEEKING]: {
    keywords: ['top', 'best', 'prestigious', 'elite', 'ranked', 'ivy'],
    phrases: ['top university', 'world-class', 'highly ranked'],
    boost_factor: 1.2
  },

  [IntentType.FAST_TRACK]: {
    keywords: ['fast', 'quick', 'accelerated', 'short', 'intensive'],
    phrases: ['1 year', 'fast track', 'accelerated program', 'short duration'],
    boost_factor: 1.2
  },
}

export function detectIntents(query: string): Intent[] {
  const normalizedQuery = query.toLowerCase()
  const detectedIntents: Intent[] = []

  for (const [intentType, config] of Object.entries(INTENT_PATTERNS)) {
    let matchCount = 0
    const matchedKeywords: string[] = []

    // Check keywords
    for (const keyword of config.keywords) {
      if (normalizedQuery.includes(keyword)) {
        matchCount++
        matchedKeywords.push(keyword)
      }
    }

    // Check phrases (weighted higher)
    for (const phrase of config.phrases) {
      if (normalizedQuery.includes(phrase)) {
        matchCount += 2
        matchedKeywords.push(phrase)
      }
    }

    if (matchCount > 0) {
      const confidence = Math.min(matchCount / 3, 1) // Cap at 1.0

      detectedIntents.push({
        type: intentType as IntentType,
        confidence,
        keywords: matchedKeywords,
        boost_factor: config.boost_factor
      })
    }
  }

  // Sort by confidence
  return detectedIntents.sort((a, b) => b.confidence - a.confidence)
}

export function analyzeQuery(query: string): QueryAnalysis {
  const intents = detectIntents(query)

  return {
    raw_query: query,
    intents,
    primary_intent: intents.length > 0 ? intents[0].type : null,
    extracted_entities: extractEntities(query)
  }
}

function extractEntities(query: string): QueryAnalysis['extracted_entities'] {
  // Simple entity extraction (can be enhanced later)
  const entities: QueryAnalysis['extracted_entities'] = {}

  // Extract budget mentions
  const budgetMatch = query.match(/\$?([\d,]+)\s*(?:to|-)?\s*\$?([\d,]+)?/)
  if (budgetMatch) {
    const min = parseInt(budgetMatch[1].replace(/,/g, ''))
    const max = budgetMatch[2] ? parseInt(budgetMatch[2].replace(/,/g, '')) : min * 2
    entities.budget_range = [min, max]
  }

  // Extract countries (simple version)
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'Australia', 'Netherlands']
  const mentionedCountries = countries.filter(country =>
    query.toLowerCase().includes(country.toLowerCase())
  )
  if (mentionedCountries.length > 0) {
    entities.countries = mentionedCountries
  }

  return entities
}
```

---

### 1.3 Program Metadata Enhancement

#### Database Schema Addition

```sql
-- Add intent metadata to programs table
ALTER TABLE programs
ADD COLUMN intent_metadata JSONB DEFAULT '{}';

-- Create index for intent queries
CREATE INDEX idx_programs_intent_metadata ON programs USING GIN (intent_metadata);

-- Example intent_metadata structure:
-- {
--   "budget_friendly": true,
--   "scholarship_available": true,
--   "migration_pathway": "PR available",
--   "post_study_work": "2 years PGWP",
--   "safety_score": 8.5,
--   "cost_of_living_index": 65,
--   "crime_rate": "low",
--   "prestige_rank": 150
-- }
```

#### Metadata Population Script

```typescript
// scripts/populate-intent-metadata.ts

import { supabase } from '../src/lib/supabase'

const COUNTRY_METADATA = {
  'Canada': {
    migration_pathway: 'PR via Express Entry',
    post_study_work: '3 years PGWP',
    safety_score: 9.2,
    cost_of_living_index: 75,
    work_permit: 'Allowed 20hrs/week',
  },
  'Germany': {
    migration_pathway: 'Blue Card eligible',
    post_study_work: '18 months job search',
    safety_score: 8.8,
    cost_of_living_index: 65,
    work_permit: 'Allowed 120 full days',
  },
  'USA': {
    migration_pathway: 'H1B to Green Card',
    post_study_work: '12-36 months OPT',
    safety_score: 7.5,
    cost_of_living_index: 85,
    work_permit: 'CPT/OPT available',
  },
  // ... more countries
}

async function populateProgramMetadata() {
  const { data: programs } = await supabase
    .from('programs')
    .select('id, country, tuition_fee, scholarship_available, university')

  for (const program of programs) {
    const countryMeta = COUNTRY_METADATA[program.country] || {}

    const intentMetadata = {
      // Budget intent
      budget_friendly: program.tuition_fee < 20000,
      tuition_tier: program.tuition_fee < 15000 ? 'low' :
                    program.tuition_fee < 30000 ? 'medium' : 'high',

      // Scholarship intent
      scholarship_available: program.scholarship_available,

      // Migration intent
      migration_pathway: countryMeta.migration_pathway,
      post_study_work: countryMeta.post_study_work,

      // Safety intent
      safety_score: countryMeta.safety_score,
      crime_rate: countryMeta.safety_score > 8 ? 'low' :
                  countryMeta.safety_score > 6 ? 'medium' : 'high',

      // Work permit intent
      work_permit: countryMeta.work_permit,

      // Cost of living
      cost_of_living_index: countryMeta.cost_of_living_index,
    }

    await supabase
      .from('programs')
      .update({ intent_metadata: intentMetadata })
      .eq('id', program.id)
  }

  console.log(`Updated ${programs.length} programs with intent metadata`)
}
```

---

## Phase 2: Enhanced Search with Intent Boosting

### 2.1 Intent-Aware Vector Search

```typescript
// src/lib/intent/search.ts

import { supabase } from '../supabase'
import { analyzeQuery } from './detector'
import { generateEmbedding } from '../openai'

export async function intentAwareSearch(query: string, userPreferences?: any) {
  // Step 1: Analyze query for intents
  const analysis = analyzeQuery(query)

  console.log('🎯 Detected Intents:', analysis.intents.map(i => i.type))

  // Step 2: Generate embedding for vector search
  const embedding = await generateEmbedding(query)

  // Step 3: Vector search with pgvector
  const { data: vectorMatches } = await supabase.rpc('match_programs', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 100 // Get more candidates for reranking
  })

  // Step 4: Apply intent boosting
  const boostedMatches = vectorMatches.map(match => {
    let intentBoost = 1.0
    const reasons: string[] = []

    for (const intent of analysis.intents) {
      const metadata = match.intent_metadata || {}

      switch (intent.type) {
        case 'budget_intent':
          if (metadata.budget_friendly) {
            intentBoost *= intent.boost_factor
            reasons.push('Budget-friendly option')
          }
          break

        case 'safety_intent':
          if (metadata.safety_score > 8) {
            intentBoost *= intent.boost_factor
            reasons.push(`High safety score: ${metadata.safety_score}/10`)
          }
          break

        case 'migration_intent':
          if (metadata.migration_pathway) {
            intentBoost *= intent.boost_factor
            reasons.push(`Migration pathway: ${metadata.migration_pathway}`)
          }
          break

        case 'scholarship_intent':
          if (metadata.scholarship_available) {
            intentBoost *= intent.boost_factor
            reasons.push('Scholarships available')
          }
          break

        case 'work_permit_intent':
        case 'psw_intent':
          if (metadata.post_study_work) {
            intentBoost *= intent.boost_factor
            reasons.push(`Work permit: ${metadata.post_study_work}`)
          }
          break
      }
    }

    return {
      ...match,
      similarity: match.similarity * intentBoost, // Boost the vector similarity score
      intent_boost_applied: intentBoost,
      intent_match_reasons: reasons
    }
  })

  // Step 5: Re-sort by boosted similarity
  boostedMatches.sort((a, b) => b.similarity - a.similarity)

  return {
    matches: boostedMatches,
    query_analysis: analysis
  }
}
```

---

### 2.2 Cohere Reranking Integration

```typescript
// src/lib/rerank/cohere.ts

import { CohereClient } from 'cohere-ai'

const cohere = new CohereClient({
  token: import.meta.env.VITE_COHERE_API_KEY,
})

export async function rerankResults(
  query: string,
  candidates: Array<{ id: string; description: string; similarity: number }>,
  topN: number = 20
) {
  // Prepare documents for reranking
  const documents = candidates.map(c => ({
    id: c.id,
    text: c.description
  }))

  try {
    const response = await cohere.rerank({
      query,
      documents: documents.map(d => d.text),
      topN,
      model: 'rerank-english-v3.0',
      returnDocuments: false // We already have the data
    })

    // Map reranked indices back to original candidates
    const reranked = response.results.map((result, idx) => {
      const originalCandidate = candidates[result.index]
      return {
        ...originalCandidate,
        rerank_score: result.relevanceScore,
        original_rank: result.index,
        new_rank: idx
      }
    })

    return reranked
  } catch (error) {
    console.error('Cohere rerank failed, using original order:', error)
    return candidates.slice(0, topN) // Fallback to original order
  }
}
```

---

### 2.3 Complete Search Pipeline

```typescript
// src/lib/search/pipeline.ts

export async function searchPrograms(
  query: string,
  userPreferences?: UserPreferences
) {
  // Step 1: Intent-aware vector search with boosting
  const { matches: boostedMatches, query_analysis } = await intentAwareSearch(
    query,
    userPreferences
  )

  // Step 2: Semantic reranking with Cohere
  const reranked = await rerankResults(
    query,
    boostedMatches.slice(0, 50), // Rerank top 50
    20 // Return top 20 after reranking
  )

  // Step 3: Apply hard filters (budget, country, etc.)
  let filtered = reranked

  if (userPreferences?.budget_range) {
    const maxBudget = Array.isArray(userPreferences.budget_range)
      ? userPreferences.budget_range[1]
      : userPreferences.budget_range

    filtered = filtered.filter(m => m.tuition_fee <= maxBudget)
  }

  if (userPreferences?.countries && userPreferences.countries.length > 0) {
    filtered = filtered.filter(m =>
      userPreferences.countries!.includes(m.country)
    )
  }

  if (userPreferences?.scholarship_needed) {
    filtered = filtered.filter(m => m.scholarship_available)
  }

  // Step 4: Calculate final match score
  const results = filtered.map(match => ({
    ...match,
    final_score: calculateFinalScore(
      match.similarity,        // Vector similarity (boosted)
      match.rerank_score,     // Cohere rerank score
      match.intent_boost_applied // Intent boost factor
    ),
    match_breakdown: {
      vector_similarity: match.similarity,
      semantic_rerank: match.rerank_score,
      intent_boost: match.intent_boost_applied,
      reasons: match.intent_match_reasons
    }
  }))

  return {
    results,
    total_candidates: boostedMatches.length,
    after_reranking: reranked.length,
    after_filtering: results.length,
    detected_intents: query_analysis.intents
  }
}

function calculateFinalScore(
  vectorSimilarity: number,
  rerankScore: number,
  intentBoost: number
): number {
  // Weighted combination
  const weights = {
    vector: 0.3,
    rerank: 0.5,
    intent: 0.2
  }

  return (
    vectorSimilarity * weights.vector +
    rerankScore * weights.rerank +
    intentBoost * weights.intent
  )
}
```

---

## Phase 3: LLM-Assisted Intent Detection (Future Enhancement)

### 3.1 Upgrade Path to LLM Intent Extraction

```typescript
// src/lib/intent/llm-detector.ts

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})

export async function llmDetectIntents(query: string): Promise<QueryAnalysis> {
  const prompt = `
Analyze this student query and extract intents:

Query: "${query}"

Return JSON with:
{
  "intents": [
    {
      "type": "budget_intent" | "safety_intent" | "migration_intent" | ...,
      "confidence": 0.0-1.0,
      "evidence": "why this intent was detected"
    }
  ],
  "entities": {
    "budget_range": [min, max],
    "countries": ["country1", "country2"],
    "degree_types": ["type1"],
    "fields": ["field1"]
  }
}

Available intent types:
- budget_intent, scholarship_intent, value_intent
- safety_intent, qol_intent, family_intent
- migration_intent, work_permit_intent, psw_intent, pr_intent
- research_intent, industry_intent, prestige_intent
- weather_intent, urban_intent, culture_intent
- speed_intent, part_time_intent, online_intent
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cheaper model for intent extraction
    messages: [
      { role: 'system', content: 'You are an expert at understanding student study abroad intents.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  })

  const parsed = JSON.parse(response.choices[0].message.content!)

  return {
    raw_query: query,
    intents: parsed.intents.map((i: any) => ({
      type: i.type,
      confidence: i.confidence,
      keywords: [i.evidence],
      boost_factor: INTENT_PATTERNS[i.type]?.boost_factor || 1.0
    })),
    primary_intent: parsed.intents[0]?.type || null,
    extracted_entities: parsed.entities
  }
}

// Hybrid approach: Use LLM for complex queries, rules for simple ones
export async function hybridDetectIntents(query: string): Promise<QueryAnalysis> {
  const wordCount = query.split(' ').length

  if (wordCount <= 5) {
    // Simple query, use rule-based
    return analyzeQuery(query)
  } else {
    // Complex query, use LLM
    return llmDetectIntents(query)
  }
}
```

---

## Cost Breakdown

### Monthly Costs (Estimated)

| Component | Usage | Cost/Month |
|-----------|-------|------------|
| **OpenAI Embeddings** | 1,000 searches/day | ~$3 |
| **Cohere Reranking** | 1,000 searches/day × $0.002 | ~$60 |
| **LLM Intent Detection** (optional) | 500 complex queries/day × $0.0001 | ~$1.50 |
| **pgvector** (Supabase) | Included in plan | $0 |
| **Total** | | **~$64.50/month** |

**vs Azure AI Search**: $250/month minimum

**Savings**: **~$185/month** (74% cheaper)

---

## Implementation Timeline

### Week 1: Intent Tagging Foundation
- [ ] Day 1: Create intent types & rule-based detector
- [ ] Day 2: Populate program metadata with intent tags
- [ ] Day 3: Test intent detection with sample queries

### Week 2: Search Pipeline Integration
- [ ] Day 1: Integrate intent boosting into vector search
- [ ] Day 2: Add Cohere reranking
- [ ] Day 3: Implement complete search pipeline

### Week 3: Frontend Integration
- [ ] Day 1: Update recommendation engine to use new pipeline
- [ ] Day 2: Display intent match reasons in UI
- [ ] Day 3: Add "Why this match?" explanations

### Week 4: Testing & Optimization
- [ ] Day 1-2: A/B testing vs old system
- [ ] Day 3: Tune boost factors based on results
- [ ] Day 4: Production deployment

---

## Success Metrics

### Before (Current System)
- ❌ No intent understanding
- ❌ No semantic reranking
- ❌ Simple keyword or vector-only search

### After (Enhanced System)
- ✅ Detects 14+ intent types
- ✅ Semantic reranking with Cohere
- ✅ Intent-boosted relevance scores
- ✅ Explainable match reasons ("Why this match?")
- ✅ $185/month cheaper than Azure
- ✅ Path to LLM-assisted intent detection

---

## Example Query Flow

**Query**: *"cheap schools in safe cities with PR options"*

### Step 1: Intent Detection
```json
{
  "intents": [
    { "type": "budget_intent", "confidence": 0.9, "boost": 1.5 },
    { "type": "safety_intent", "confidence": 0.85, "boost": 1.3 },
    { "type": "pr_intent", "confidence": 0.8, "boost": 1.4 }
  ]
}
```

### Step 2: Vector Search (pgvector)
- Finds 100 semantically similar programs

### Step 3: Intent Boosting
- Programs with `budget_friendly: true` → ×1.5 boost
- Programs with `safety_score > 8` → ×1.3 boost
- Programs with `migration_pathway: PR` → ×1.4 boost

### Step 4: Semantic Reranking (Cohere)
- Top 50 boosted results → Cohere API
- Returns top 20 with relevance scores

### Step 5: Results
```json
{
  "results": [
    {
      "name": "Computer Science - Memorial University",
      "country": "Canada",
      "final_score": 0.92,
      "match_breakdown": {
        "vector_similarity": 0.85,
        "semantic_rerank": 0.94,
        "intent_boost": 2.73, // 1.5 × 1.3 × 1.4
        "reasons": [
          "Budget-friendly option",
          "High safety score: 9.2/10",
          "Migration pathway: PR via Express Entry"
        ]
      }
    }
  ]
}
```

---

**End of Enhanced Architecture**
