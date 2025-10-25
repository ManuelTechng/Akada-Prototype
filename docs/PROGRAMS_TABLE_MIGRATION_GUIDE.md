# Programs Table Migration Guide

## Overview

The `programs` table has been enhanced with Phase 2 columns, creating **duplicate/overlapping fields**. This guide helps you migrate frontend code from old columns to new columns **gradually and safely**.

---

## 🚨 Column Conflicts & Resolutions

### 1. University Reference

| Old Column | New Column | Type | Status | Action |
|-----------|-----------|------|--------|--------|
| `university` | `university_id` | TEXT → UUID FK | ⚠️ Migrate | Use `university_id` + JOIN |

**Old Code (Phase 1):**
```typescript
const program = await supabase
  .from('programs')
  .select('university, name')
  .eq('id', programId)
  .single();

console.log(program.university); // "Stanford University" (TEXT)
```

**New Code (Phase 2):**
```typescript
const program = await supabase
  .from('programs')
  .select(`
    name,
    university_id,
    universities (
      id,
      name,
      logo_url,
      ranking_world,
      acceptance_rate
    )
  `)
  .eq('id', programId)
  .single();

console.log(program.universities.name); // "Stanford University" (from universities table)
console.log(program.universities.ranking_world); // 3
```

**Migration Strategy:**
- ✅ Keep `university` (TEXT) for now (backward compatibility)
- ✅ Populate `university_id` using sync script (run `20251024_programs_data_sync.sql`)
- ✅ Update queries gradually to use `university_id` + JOIN
- ⏳ Deprecate `university` column later (after all code updated)

---

### 2. City Reference

| Old Column | New Column | Type | Status | Action |
|-----------|-----------|------|--------|--------|
| `city` | `city_id` | TEXT → UUID FK | ⚠️ Migrate | Use `city_id` + JOIN |

**Old Code:**
```typescript
const programs = await supabase
  .from('programs')
  .select('city, country')
  .eq('country', 'United States');

programs.forEach(p => console.log(p.city)); // "New York"
```

**New Code:**
```typescript
const programs = await supabase
  .from('programs')
  .select(`
    name,
    city_id,
    cities (
      id,
      name,
      accommodation_min,
      accommodation_max,
      student_friendly_rating,
      countries (
        name,
        currency_symbol
      )
    )
  `)
  .eq('cities.countries.name', 'United States');

programs.forEach(p => {
  console.log(p.cities.name); // "New York"
  console.log(p.cities.accommodation_min); // 1200
});
```

---

### 3. Application Deadlines

| Old Column(s) | New Column | Type | Status | Action |
|--------------|-----------|------|--------|--------|
| `deadline` (DATE)<br>`application_deadline` (TIMESTAMP) | `application_deadlines` | JSONB | ⚠️ Migrate | Use JSONB array |

**Old Code:**
```typescript
const program = await supabase
  .from('programs')
  .select('deadline, application_deadline')
  .eq('id', programId)
  .single();

console.log(program.deadline); // "2025-01-15"
```

**New Code (JSONB):**
```typescript
const program = await supabase
  .from('programs')
  .select('application_deadlines')
  .eq('id', programId)
  .single();

// application_deadlines structure:
// [
//   {"intake": "Fall 2025", "deadline": "2025-01-15", "type": "season"},
//   {"intake": "Spring 2026", "deadline": "2025-09-01", "type": "season"}
// ]

const deadlines = program.application_deadlines as Array<{
  intake: string;
  deadline: string;
  type: 'season' | 'month';
}>;

console.log(deadlines[0].deadline); // "2025-01-15"
console.log(deadlines[0].intake); // "Fall 2025"

// Get nearest deadline
const nearestDeadline = deadlines
  .map(d => new Date(d.deadline))
  .sort((a, b) => a.getTime() - b.getTime())[0];
```

**Helper Function for Compatibility:**
```typescript
// Use the SQL function we created
const { data } = await supabase
  .rpc('get_primary_deadline', { program_id: programId });

console.log(data); // "2025-01-15" (DATE)
```

---

### 4. Language Requirements

| Old Column | New Column | Type | Status | Action |
|-----------|-----------|------|--------|--------|
| `language_requirements_text_backup` | `language_requirements` | TEXT → JSONB | ✅ Migrated | Use JSONB |

**Old Code:**
```typescript
const program = await supabase
  .from('programs')
  .select('language_requirements_text_backup')
  .single();

console.log(program.language_requirements_text_backup); // "IELTS 6.5 or TOEFL 90"
```

**New Code (JSONB):**
```typescript
const program = await supabase
  .from('programs')
  .select('language_requirements')
  .single();

// language_requirements structure:
// {
//   "IELTS": {"overall": 6.5, "writing": 6.0},
//   "TOEFL": {"overall": 90, "writing": 20},
//   "alternatives": ["Duolingo 110+"]
// }

const langReq = program.language_requirements as {
  IELTS?: { overall: number; writing?: number };
  TOEFL?: { overall: number; writing?: number };
  alternatives?: string[];
};

console.log(langReq.IELTS?.overall); // 6.5
console.log(langReq.TOEFL?.overall); // 90
```

---

### 5. Website URLs

| Old Columns | New Column | Status | Action |
|-----------|-----------|--------|--------|
| `website`<br>`program_website`<br>`university_website` | `program_url` | ⚠️ Consolidate | Use `program_url` |

**Migration:**
```typescript
// OLD: Multiple URL fields (confusing)
program.website
program.program_website
program.university_website

// NEW: Single source of truth
program.program_url // Official program page URL

// University website now comes from JOIN:
program.universities.website
```

---

### 6. Scholarship Flags

| Old Columns | Status | Action |
|-----------|--------|--------|
| `has_scholarships`<br>`scholarship_available` | ⚠️ Duplicate | Use either (sync script makes them identical) |

**Recommendation:**
```typescript
// Both are now synced to the same value
// Use either one (they're identical after sync script)
program.has_scholarships
program.scholarship_available

// Or check actual scholarships:
const { data: scholarships } = await supabase
  .from('program_scholarships')
  .select('*')
  .eq('program_id', programId);

const hasScholarships = scholarships.length > 0;
```

---

## 🔄 Migration Workflow

### Step 1: Run Data Sync Script ✅
```sql
-- In Supabase SQL Editor
-- Run: 20251024_programs_data_sync.sql
```

This will:
- Map `university` → `university_id`
- Map `city` → `city_id`
- Consolidate `deadline`/`application_deadline` → `application_deadlines`
- Sync scholarship flags
- Create backward-compatible view

---

### Step 2: Update TypeScript Types
```bash
supabase gen types typescript --project-id YOUR_ID > src/lib/database.types.ts
```

---

### Step 3: Create Helper Utilities

**Create `src/lib/utils/program-helpers.ts`:**
```typescript
import { Database } from '@/lib/database.types';

type Program = Database['public']['Tables']['programs']['Row'];
type University = Database['public']['Tables']['universities']['Row'];
type City = Database['public']['Tables']['cities']['Row'];

// Helper to get primary deadline from JSONB
export function getPrimaryDeadline(program: Program): Date | null {
  if (!program.application_deadlines) return null;

  const deadlines = program.application_deadlines as Array<{
    deadline: string;
    intake: string;
  }>;

  if (deadlines.length === 0) return null;

  // Sort by date and return nearest
  const sorted = deadlines
    .map(d => new Date(d.deadline))
    .sort((a, b) => a.getTime() - b.getTime());

  return sorted[0];
}

// Helper to format deadlines for display
export function formatDeadlines(program: Program): string {
  if (!program.application_deadlines) return 'Rolling admission';

  const deadlines = program.application_deadlines as Array<{
    deadline: string;
    intake: string;
  }>;

  return deadlines.map(d => `${d.intake}: ${d.deadline}`).join(', ');
}

// Helper to get language requirements summary
export function getLanguageRequirementsSummary(program: Program): string {
  if (!program.language_requirements) return 'Not specified';

  const req = program.language_requirements as {
    IELTS?: { overall: number };
    TOEFL?: { overall: number };
    alternatives?: string[];
  };

  const parts: string[] = [];
  if (req.IELTS) parts.push(`IELTS ${req.IELTS.overall}`);
  if (req.TOEFL) parts.push(`TOEFL ${req.TOEFL.overall}`);

  return parts.length > 0 ? parts.join(' or ') : 'Not specified';
}
```

---

### Step 4: Update Query Functions

**Update `src/lib/supabase/queries/programs.ts`:**

```typescript
// OLD WAY (Phase 1)
export async function getProgram(programId: string) {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single();

  return { data, error };
}

// NEW WAY (Phase 2) - Include relationships
export async function getProgramWithDetails(programId: string) {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      universities (
        id,
        name,
        logo_url,
        ranking_world,
        acceptance_rate,
        description,
        website
      ),
      cities (
        id,
        name,
        accommodation_min,
        accommodation_max,
        student_friendly_rating,
        countries (
          name,
          currency_symbol
        )
      )
    `)
    .eq('id', programId)
    .single();

  return { data, error };
}
```

---

### Step 5: Update Components Gradually

**Example: ProgramCard.tsx**

```typescript
// BEFORE (using old columns)
interface ProgramCardProps {
  program: {
    id: string;
    name: string;
    university: string; // TEXT
    city: string; // TEXT
    deadline: string; // DATE
  };
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div>
      <h3>{program.name}</h3>
      <p>{program.university}</p>
      <p>{program.city}</p>
      <p>Deadline: {program.deadline}</p>
    </div>
  );
}

// AFTER (using new columns with relationships)
interface ProgramCardProps {
  program: {
    id: string;
    name: string;
    universities: {
      name: string;
      logo_url: string;
      ranking_world: number;
    };
    cities: {
      name: string;
      student_friendly_rating: number;
    };
    application_deadlines: Array<{
      intake: string;
      deadline: string;
    }>;
  };
}

export function ProgramCard({ program }: ProgramCardProps) {
  const primaryDeadline = program.application_deadlines?.[0];

  return (
    <div>
      <h3>{program.name}</h3>
      <div className="flex items-center gap-2">
        <img src={program.universities.logo_url} alt="" className="w-8 h-8" />
        <p>{program.universities.name}</p>
        <span>#{program.universities.ranking_world}</span>
      </div>
      <p>{program.cities.name} (Rating: {program.cities.student_friendly_rating}/10)</p>
      {primaryDeadline && (
        <p>Next Deadline: {primaryDeadline.intake} - {primaryDeadline.deadline}</p>
      )}
    </div>
  );
}
```

---

## 📋 Migration Checklist

### Phase 1: Data Preparation ✅
- [x] Run Phase 2A migration (countries, cities, universities)
- [x] Run Phase 2B migration (courses, testimonials, scholarships)
- [ ] **Run data sync script** (`20251024_programs_data_sync.sql`)
- [ ] Review data quality report
- [ ] Manually map any unmatched universities/cities

### Phase 2: Type Updates
- [ ] Regenerate TypeScript types
- [ ] Create helper utilities (`program-helpers.ts`)
- [ ] Update query function types

### Phase 3: Code Migration (Gradual)
- [ ] Update program detail page queries
- [ ] Update program search queries
- [ ] Update program card component
- [ ] Update cost calculator integration
- [ ] Update dashboard recommendations

### Phase 4: Testing
- [ ] Test program search with new columns
- [ ] Test program details page
- [ ] Test backward compatibility view
- [ ] Test deadline display logic
- [ ] Test language requirements display

### Phase 5: Cleanup (Future)
- [ ] Mark old columns as deprecated in comments
- [ ] Add database constraints to prefer new columns
- [ ] Remove old columns (after 100% migration verified)

---

## 🛡️ Backward Compatibility

**Use the `programs_legacy_compat` view for existing code:**

```typescript
// Temporarily query the compatibility view instead of programs table
const { data } = await supabase
  .from('programs_legacy_compat')
  .select('*');

// This view includes:
// - university_name_resolved (from JOIN)
// - city_name_resolved (from JOIN)
// - primary_deadline (extracted from JSONB)
// - All original columns
```

This gives you time to migrate without breaking existing code!

---

## 🚀 Next Steps

1. **Run the data sync script** → `20251024_programs_data_sync.sql`
2. **Review the output** → Check data quality report
3. **Update one component** → Start with ProgramCard or ProgramDetail
4. **Test thoroughly** → Verify old and new approaches work
5. **Migrate gradually** → Update remaining components over sprints

---

## ❓ FAQ

**Q: Can I use both old and new columns at the same time?**
A: Yes! The sync script ensures both are populated. Migrate gradually.

**Q: What if a program doesn't match any university?**
A: The sync script reports unmatched programs. Add missing universities or use `program_university_mappings` table for manual mapping.

**Q: Do I need to update all code at once?**
A: No! Use `programs_legacy_compat` view for backward compatibility during migration.

**Q: When can I drop the old columns?**
A: Only after **all** frontend code is updated and tested. Plan for Sprint 3 or later.

---

**Author:** Database Migration Team
**Last Updated:** 2025-10-24
**Status:** Active Migration
