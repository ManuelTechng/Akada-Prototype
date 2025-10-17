<!-- d2dfea79-c648-4089-88fa-da1d05d377dd 8d4f2db2-b151-4251-891d-48480617ca9d -->
# School Details Data System Implementation

## Database Schema Design

### New Tables to Create

#### 1. Universities Table

Centralize university information (currently duplicated across programs):

- `id` (uuid, primary key)
- `name` (text, unique)
- `country_code` (text, references countries.code)
- `city_id` (uuid, references cities.id)
- `website` (text)
- `logo_url` (text, nullable)
- `description` (text)
- `established_year` (integer, nullable)
- `type` (text: 'public', 'private', 'research', etc.)
- `ranking_world` (integer, nullable)
- `ranking_national` (integer, nullable)
- `student_population` (integer, nullable)
- `international_students_percentage` (decimal, nullable)
- `accreditations` (text[], array of accreditation bodies)
- `contact_email` (text, nullable)
- `contact_phone` (text, nullable)
- `created_at`, `updated_at` (timestamps)

#### 2. Countries Table

Expand beyond country_estimates for comprehensive country data:

- `code` (text, primary key - ISO country code)
- `name` (text)
- `continent` (text)
- `currency` (text)
- `currency_symbol` (text)
- `language_primary` (text)
- `languages_spoken` (text[])
- `avg_monthly_living_cost` (numeric)
- `living_cost_range_min` (numeric)
- `living_cost_range_max` (numeric)
- `student_visa_fee` (numeric)
- `visa_processing_time` (text, e.g., "4-6 weeks")
- `work_permit_available` (boolean)
- `work_hours_allowed` (integer, hours per week for students)
- `post_study_work_visa` (boolean)
- `post_study_work_duration` (text, e.g., "2 years")
- `healthcare_cost` (numeric)
- `safety_index` (decimal, 0-10)
- `timezone` (text)
- `climate` (text)
- `created_at`, `updated_at`

#### 3. Cities Table

City-specific information:

- `id` (uuid, primary key)
- `name` (text)
- `country_code` (text, references countries.code)
- `state_province` (text, nullable)
- `population` (integer, nullable)
- `avg_monthly_rent` (numeric, nullable)
- `transportation_cost_monthly` (numeric, nullable)
- `cost_of_living_index` (decimal, nullable - relative to national average)
- `student_friendly_rating` (decimal, 0-10, nullable)
- `public_transport_quality` (text: 'excellent', 'good', 'fair', 'poor')
- `climate` (text)
- `timezone` (text)
- `latitude`, `longitude` (decimal, nullable - for maps)
- `description` (text)
- `created_at`, `updated_at`

#### 4. Application Guides Table

Step-by-step application process per university or program:

- `id` (uuid, primary key)
- `university_id` (uuid, references universities.id)
- `program_id` (uuid, references programs.id, nullable - if guide is program-specific)
- `title` (text, e.g., "How to Apply to MIT Graduate Programs")
- `overview` (text)
- `application_steps` (jsonb - array of step objects with order, title, description, documents_needed)
- `application_portal_url` (text)
- `application_fee` (numeric)
- `application_fee_currency` (text)
- `deadline_type` (text: 'rolling', 'fixed', 'multiple rounds')
- `typical_deadlines` (jsonb - array of deadline objects)
- `required_documents` (text[] - array of document names)
- `english_proficiency_required` (boolean)
- `accepted_english_tests` (jsonb - TOEFL, IELTS requirements)
- `gre_gmat_required` (boolean)
- `min_test_scores` (jsonb)
- `interview_required` (boolean)
- `interview_format` (text, nullable)
- `processing_time` (text, e.g., "6-8 weeks")
- `acceptance_rate` (decimal, nullable)
- `tips_and_notes` (text, markdown formatted)
- `created_at`, `updated_at`

#### 5. Scholarship Opportunities Table

Detailed scholarship information:

- `id` (uuid, primary key)
- `university_id` (uuid, references universities.id, nullable)
- `program_id` (uuid, references programs.id, nullable)
- `country_code` (text, references countries.code, nullable)
- `name` (text)
- `provider` (text - university, government, private organization)
- `type` (text: 'full', 'partial', 'tuition-waiver', 'stipend')
- `amount` (numeric, nullable)
- `currency` (text)
- `coverage` (text[] - what it covers: tuition, living, travel, etc.)
- `eligibility_criteria` (text)
- `application_process` (text)
- `deadline` (date, nullable)
- `website` (text)
- `created_at`, `updated_at`

### Database Migration Updates

**Programs Table Refactoring:**

- Add `university_id` (uuid, references universities.id)
- Keep existing fields for backward compatibility during migration
- Add migration script to:

  1. Extract unique universities from existing programs
  2. Create university records
  3. Link programs to universities via university_id
  4. Deprecate old `university` text field (mark for future removal)

**Country Estimates Migration:**

- Migrate data from `country_estimates` to new `countries` table
- Expand with additional fields
- Maintain backward compatibility

## Frontend Implementation

### 1. School/University Detail Page (`/universities/:id`)

**Route:** `/universities/:universityId`

**Data Fetched:**

- University details (from universities table)
- City and country information (joined from cities, countries)
- List of programs offered (from programs table where university_id matches)
- Application guide (from application_guides where university_id matches)
- Available scholarships (from scholarship_opportunities)

**Page Sections (Tabbed Interface for Scalability):**

**Tab 1: Overview**

- University header (name, logo, location, ranking)
- Quick stats (student population, international %, established year)
- Description and highlights
- Key facts card (type, accreditations, contact info)

**Tab 2: Programs & Courses**

- Searchable/filterable list of all programs
- Group by: degree type, specialization, study level
- Each program shows:
  - Name, duration, tuition (with currency)
  - Key requirements summary
  - "View Details" → navigate to `/programs/:programId`

**Tab 3: Location & Living Costs**

- City overview (description, population, climate)
- Cost of living breakdown:
  - Average monthly expenses (from cities table)
  - Country-level costs (from countries table)
  - Comparison chart (local vs student budget)
- Transportation info
- Interactive map (using latitude/longitude)

**Tab 4: Visa & Immigration**

- Country-specific visa requirements (from countries table)
- Student visa fees and processing time
- Work permit information
- Post-study work opportunities
- Healthcare requirements

**Tab 5: How to Apply**

- Application guide overview (from application_guides)
- Step-by-step process (rendered from application_steps jsonb)
- Required documents checklist
- Test requirements (English proficiency, GRE/GMAT)
- Important deadlines
- Application portal link (CTA button)

**Tab 6: Scholarships & Aid**

- List of available scholarships (filtered by university)
- Scholarship cards showing:
  - Name, provider, type, amount
  - Eligibility summary
  - Application deadline
  - "Learn More" link to detailed page

### 2. Program/Course Detail Page (`/programs/:id`)

**Route:** `/programs/:programId`

**Data Fetched:**

- Program details (from programs table)
- University details (joined via university_id)
- City and country information
- Program-specific application guide (if exists)
- Related scholarships

**Page Layout (Single Page with Sections for Course-Specific View):**

**Header Section:**

- Program name, degree type, specialization
- University badge (clickable → university detail page)
- Duration, tuition fee (with currency conversion)
- Application deadline countdown

**Section 1: Program Overview**

- Description
- Key highlights
- Curriculum summary (if available)
- Study level and format

**Section 2: Requirements**

- Entry requirements (from entry_requirements field)
- Language requirements (from language_requirements)
- Academic prerequisites (from requirements array)
- Test scores needed

**Section 3: Tuition & Costs**

- Tuition fee (original + converted to NGN)
- Application fee
- Estimated total cost (tuition + living costs from city/country data)
- Available scholarships (from scholarship_opportunities where program_id matches)

**Section 4: Location & University Context**

- University info card (mini version of university page)
- City and country highlights
- "View Full University Profile" link

**Section 5: Application Process**

- Program-specific application guide (if exists)
- OR fallback to university-level guide
- Direct application link (program_website or university portal)
- Save/Favorite buttons

**Section 6: Similar Programs**

- Recommended programs (same specialization, similar tuition range, same country)
- Comparison feature

### 3. Component Architecture

**New Components to Create:**

**`src/components/university/UniversityDetailPage.tsx`**

- Main university detail page with tabbed interface
- Uses `@/components/ui/tabs` from shadcn

**`src/components/university/UniversityHeader.tsx`**

- University banner with logo, name, location, rankings

**`src/components/university/ProgramsList.tsx`**

- Searchable/filterable list of programs
- Table or card layout

**`src/components/university/LocationInfo.tsx`**

- City and country information display
- Cost breakdown cards
- Interactive map integration (consider Mapbox or Google Maps)

**`src/components/university/VisaInfo.tsx`**

- Visa requirements and immigration info
- Country-specific data display

**`src/components/university/ApplicationGuide.tsx`**

- Renders application steps from jsonb
- Document checklist
- Deadline information

**`src/components/program/ProgramDetailPage.tsx`**

- Main program detail page
- Section-based layout

**`src/components/program/ProgramHeader.tsx`**

- Program banner with key info
- University context badge

**`src/components/program/RequirementsSection.tsx`**

- Display entry and language requirements
- Test score requirements

**`src/components/program/CostCalculator.tsx`**

- Tuition + living costs calculator
- Currency conversion display
- Breakdown visualization

**`src/components/shared/ScholarshipCard.tsx`**

- Reusable scholarship display card

**`src/components/shared/CostBreakdown.tsx`**

- Visual cost breakdown component
- Pie/bar charts using recharts

**`src/components/shared/CountryInfoPanel.tsx`**

- Reusable country information display
- Used in both university and program pages

### 4. API/Data Hooks

**New Hooks to Create:**

**`src/hooks/useUniversity.ts`**

```typescript
// Fetch university with related data
useUniversity(universityId: string)
// Returns: university, city, country, programs, applicationGuide
```

**`src/hooks/useProgram.ts`**

```typescript
// Fetch program with related data
useProgram(programId: string)
// Returns: program, university, city, country, applicationGuide, scholarships
```

**`src/hooks/useApplicationGuide.ts`**

```typescript
// Fetch application guide
useApplicationGuide(universityId: string, programId?: string)
```

**`src/hooks/useScholarships.ts`**

```typescript
// Fetch scholarships with filters
useScholarships(filters: { universityId?, programId?, countryCode? })
```

**`src/hooks/useCityInfo.ts`**

```typescript
// Fetch city details with country context
useCityInfo(cityId: string)
```

**Supabase Queries (in `src/lib/supabase/queries/`):**

**`universities.ts`**

- `getUniversityWithDetails(id)` - joins cities, countries
- `getUniversitiesByCountry(countryCode)`
- `searchUniversities(query)`

**`programs.ts`**

- Update existing queries to join with universities table
- `getProgramWithUniversityContext(id)` - full context fetch

**`applicationGuides.ts`**

- `getApplicationGuide(universityId, programId?)`
- `createApplicationGuide(data)`
- `updateApplicationGuide(id, data)`

**`scholarships.ts`**

- `getScholarships(filters)`
- `getScholarshipById(id)`

**`locations.ts`**

- `getCountryInfo(code)`
- `getCityInfo(id)`
- `getCitiesByCountry(countryCode)`

### 5. Routing Updates

**Update `src/App.tsx` or router config:**

```typescript
// Add new routes
<Route path="/universities/:universityId" element={<UniversityDetailPage />} />
<Route path="/programs/:programId" element={<ProgramDetailPage />} />
<Route path="/scholarships" element={<ScholarshipsPage />} />
<Route path="/scholarships/:scholarshipId" element={<ScholarshipDetailPage />} />
```

**Update existing program/school selection flows:**

- When user clicks a school from search results → navigate to `/universities/:id`
- When user clicks a course/program → navigate to `/programs/:id`
- Ensure all program cards/lists link to new routes

## Data Migration Strategy

### Phase 1: Create New Tables

1. Run migration to create: universities, countries, cities, application_guides, scholarship_opportunities
2. Seed countries table with existing country_estimates data + additional fields
3. Populate cities table from existing program locations

### Phase 2: Extract Universities

1. Extract unique universities from programs table
2. Create university records with inferred data
3. Link to appropriate cities
4. Update programs table with university_id references

### Phase 3: Create Application Guides (Manual/AI-Assisted)

1. Create generic application guides for popular universities
2. Allow admin interface for adding/editing guides
3. Consider AI-assisted guide generation from university websites

### Phase 4: Scholarship Data

1. Seed with known scholarships (research required)
2. Build admin interface for ongoing updates
3. API integration with scholarship databases (future enhancement)

## Implementation Order

1. **Database Migration** (supabase/migrations/)

   - Create new table schemas
   - Migrate existing data
   - Add foreign key constraints
   - Update RLS policies

2. **API Layer** (src/lib/supabase/queries/)

   - Create query functions for new tables
   - Update existing queries to use joins

3. **Hooks** (src/hooks/)

   - Build data fetching hooks
   - Add caching with React Query

4. **Shared Components** (src/components/shared/)

   - Cost breakdown
   - Country info panel
   - Scholarship cards

5. **University Feature** (src/components/university/)

   - University detail page
   - All university-specific components

6. **Program Feature** (src/components/program/)

   - Program detail page
   - All program-specific components

7. **Routing & Navigation**

   - Update routes
   - Update existing links to point to new pages

8. **Testing & Refinement**

   - Test data flows
   - Ensure currency conversions work
   - Verify all joins and relationships

## Technical Considerations

**Performance:**

- Use database indexes on foreign keys (university_id, city_id, country_code)
- Implement pagination for program lists (>50 programs per university)
- Use React Query for caching and stale-while-revalidate pattern
- Lazy load tabs on university detail page

**Data Consistency:**

- Ensure currency values are always stored with currency codes
- Use CHECK constraints for enum-like fields (deadline_type, scholarship type, etc.)
- Add database triggers for updated_at timestamps

**Scalability:**

- jsonb fields for flexible data (application_steps, test requirements)
- Support for multiple languages (add i18n later)
- Extensible schema (easy to add new fields without breaking changes)

**UX:**

- Loading skeletons for all data-heavy sections
- Error boundaries for failed data fetches
- Fallback content when data is missing (e.g., no application guide available)
- Mobile-responsive tabbed interface (accordion on mobile)

## Files to Create/Modify

### Migrations (create new):

- `supabase/migrations/YYYYMMDD_create_universities_table.sql`
- `supabase/migrations/YYYYMMDD_create_countries_table.sql`
- `supabase/migrations/YYYYMMDD_create_cities_table.sql`
- `supabase/migrations/YYYYMMDD_create_application_guides_table.sql`
- `supabase/migrations/YYYYMMDD_create_scholarships_table.sql`
- `supabase/migrations/YYYYMMDD_migrate_programs_to_universities.sql`

### Queries (create new):

- `src/lib/supabase/queries/universities.ts`
- `src/lib/supabase/queries/applicationGuides.ts`
- `src/lib/supabase/queries/scholarships.ts`
- `src/lib/supabase/queries/locations.ts`

### Queries (modify):

- `src/lib/supabase/queries/programs.ts` - add university joins

### Hooks (create new):

- `src/hooks/useUniversity.ts`
- `src/hooks/useApplicationGuide.ts`
- `src/hooks/useScholarships.ts`
- `src/hooks/useCityInfo.ts`

### Hooks (modify):

- `src/hooks/useProgram.ts` - update to include university context

### Components (create new):

- `src/components/university/UniversityDetailPage.tsx`
- `src/components/university/UniversityHeader.tsx`
- `src/components/university/ProgramsList.tsx`
- `src/components/university/LocationInfo.tsx`
- `src/components/university/VisaInfo.tsx`
- `src/components/university/ApplicationGuide.tsx`
- `src/components/program/ProgramDetailPage.tsx`
- `src/components/program/ProgramHeader.tsx`
- `src/components/program/RequirementsSection.tsx`
- `src/components/program/CostCalculator.tsx`
- `src/components/shared/ScholarshipCard.tsx`
- `src/components/shared/CostBreakdown.tsx`
- `src/components/shared/CountryInfoPanel.tsx`

### Routes (modify):

- `src/App.tsx` - add new routes

### Types (create/modify):

- `src/lib/types/university.ts` - new types
- `src/lib/types/applicationGuide.ts` - new types
- `src/lib/types/scholarship.ts` - new types
- `src/lib/types/location.ts` - new types
- `src/lib/types/program.ts` - update to include university reference

### To-dos

- [ ] Design and review database schema for universities, countries, cities, application_guides, and scholarships tables
- [ ] Create Supabase migrations for all new tables with proper constraints, indexes, and RLS policies
- [ ] Write and execute data migration scripts to extract universities from programs and migrate country_estimates to countries table
- [ ] Build Supabase query functions for universities, application guides, scholarships, and locations
- [ ] Create React hooks for data fetching: useUniversity, useApplicationGuide, useScholarships, useCityInfo
- [ ] Build shared components: ScholarshipCard, CostBreakdown, CountryInfoPanel
- [ ] Implement UniversityDetailPage with tabbed interface and all related components
- [ ] Implement ProgramDetailPage with section-based layout and university context
- [ ] Update routing configuration and navigation links throughout the app
- [ ] Test all data flows, verify joins, ensure currency conversions work correctly