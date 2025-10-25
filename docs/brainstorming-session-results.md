# Brainstorming Session Results

**Session Date:** 2025-10-22
**Facilitator:** Business Analyst Mary
**Participant:** User

---

## Executive Summary

**Topic:** Complete InstitutionPage.tsx with Institution Component Architecture + Compare Programs Feature

**Session Goals:**
- Full implementation of InstitutionPage with 6 dedicated components
- Enhanced ProgramDetailPage with 9 sections (up from 6)
- Compare Programs feature with database persistence
- Complete course catalog system with relational database design
- Alumni testimonial system with approval workflow
- Program-specific scholarship integration

**Techniques Used:**
1. Decomposition Technique (20 min)
2. Dependency Mapping (15 min)
3. Task Granulation (30 min)
4. Risk Identification (10 min)
5. Prioritization Matrix (15 min)

**Total Ideas Generated:** 43 granular implementation tasks

### Key Themes Identified:
- Database-first architecture with 5 new tables
- Component reusability across Institution and Program pages
- Sequential build order to manage dependencies
- 6-sprint implementation plan (~56 hours total)
- Risk mitigation through flexible JSONB schemas

---

## Technique Sessions

### 1. Decomposition Technique - 20 minutes

**Description:** Systematic breakdown of complex project into logical component categories

**Ideas Generated:**

1. **Database Schema Components**
   - Full relational course catalog (courses + program_courses tables)
   - Institution-wide alumni testimonials with approval workflow
   - Program-specific scholarships (extends existing scholarship_opportunities)
   - Program comparisons with user persistence
   - Enhanced programs table with intake periods, deadlines, requirements

2. **Component Architecture**
   - 6 Institution components (Header, Overview, Stats, Programs, Alumni, Location)
   - 4 Shared/Reusable components (CourseCard, CourseList, ScholarshipCard, TestimonialCard)
   - 2 Comparison components (Checkbox, StickyBar)

3. **Pages & Routes**
   - `/app/institutions/:id` - Full InstitutionPage
   - `/app/compare` - ProgramComparisonPage (3-program grid)
   - Enhanced ProgramDetailPage with 9 sections

4. **Feature Scope**
   - Compare Programs: Checkbox selection → Sticky bar → Full comparison page
   - Course Catalog: Relational structure with prerequisites
   - Alumni Testimonials: Public submission → Approval workflow → Display
   - Scholarships: Program-specific + University-wide

**Insights Discovered:**
- ✅ Dropped faculty data from scope to reduce complexity
- ✅ All users are authenticated, simplifying comparison persistence
- ✅ Hybrid architecture (embedded + dedicated pages) provides flexibility
- ✅ Program-first user journey aligns with existing search functionality

**Notable Connections:**
- Course catalog feeds into "Similar Programs" recommendations
- Alumni testimonials shared between InstitutionPage and ProgramDetailPage
- Scholarship data spans both program and institution contexts

---

### 2. Dependency Mapping - 15 minutes

**Description:** Identify build sequence and critical path dependencies

**Build Order (6 Layers):**

**Layer 1: Foundation (Build First)**
- Database migration (5 new tables + programs updates)
- RLS policies
- TypeScript type generation

**Layer 2: Data Layer**
- Supabase query functions for all new tables
- institutions.ts, courses.ts, testimonials.ts, scholarships.ts, comparisons.ts

**Layer 3A: Institution Components (Parallel)**
- 6 institution-specific components
- No dependencies between them

**Layer 3B: Shared Components (Parallel)**
- Course, scholarship, testimonial cards
- Comparison UI components

**Layer 4: Pages**
- InstitutionPage (composes Layer 3A components)
- Enhanced ProgramDetailPage (uses Layer 3B components)
- ProgramComparisonPage

**Layer 5: Integration**
- ProgramSearchPage updates (checkboxes, sticky bar)
- Routing and navigation updates

**Layer 6: Data Seeding & Testing**
- Minimal seed data (5-10 records per table)
- n8n scraper will handle production data

**Insights Discovered:**
- Sequential build prevents component dependency issues
- InstitutionPage must be built before ProgramDetailPage enhancements
- Comparison feature can be built independently after core components

---

### 3. Task Granulation - 30 minutes

**Description:** Convert each component into specific, implementable tasks

**43 Tasks Across 6 Categories:**

#### Foundation (7 tasks, ~7 hours)
1. Create database migration file
2. Create RLS policies
3. Run migration and verify
4. Update database types
5. Seed sample courses
6. Seed sample testimonials
7. Seed sample scholarships

#### Data Layer (5 tasks, ~6 hours)
8. Create institutions query functions
9. Create courses query functions
10. Create testimonials query functions
11. Create scholarships query functions
12. Create comparisons query functions

#### Institution Components (6 tasks, ~9 hours)
13. InstitutionHeader.tsx
14. InstitutionOverview.tsx
15. InstitutionStats.tsx
16. InstitutionPrograms.tsx
17. InstitutionAlumni.tsx
18. InstitutionLocation.tsx

#### Shared Components (6 tasks, ~6.5 hours)
19. CourseCard.tsx
20. CourseList.tsx
21. ScholarshipCard.tsx
22. TestimonialCard.tsx
23. ProgramCompareCheckbox.tsx
24. ComparisonStickyBar.tsx

#### Pages (10 tasks, ~16.5 hours)
25. Create InstitutionPage.tsx
26. Add InstitutionPage routing
27. Add Curriculum section to ProgramDetailPage
28. Add Scholarships section to ProgramDetailPage
29. Add Alumni Stories section to ProgramDetailPage
30. Enhance Overview with InstitutionCard
31. Enhance Application section
32. Implement Similar Programs logic
33. Create ProgramComparisonPage.tsx
34. Add ComparisonPage routing

#### Integration & Testing (9 tasks, ~8.5 hours)
35. Add comparison checkboxes to ProgramSearchPage
36. Add ComparisonStickyBar
37. Implement comparison persistence
38. Link ProgramCards to InstitutionPage
39. Update navigation menu
40. Test InstitutionPage
41. Test ProgramDetailPage
42. Test ComparisonPage
43. End-to-end user flow testing

**Insights Discovered:**
- Average task size: 1-2 hours (ideal for tracking progress)
- Testing integrated throughout, not just at end
- Clear separation between UI and data layers

---

### 4. Risk Identification - 10 minutes

**Description:** Spot potential blockers and technical challenges

**High-Risk Areas:**

1. **Course Catalog Data Complexity**
   - Mitigation: Use placeholder data, n8n scraper handles production data

2. **Intake Periods/Deadlines JSONB Structure**
   - Mitigation: Flexible schema supports both seasons and months
   ```json
   [
     {"intake": "Fall 2025", "deadline": "2025-01-15", "type": "season"},
     {"intake": "September 2025", "deadline": "2025-06-30", "type": "month"}
   ]
   ```

3. **Course Prerequisites Chain**
   - Mitigation: Start simple (text array), add graph visualization later

**Medium-Risk Areas:**

4. **Alumni Testimonial Approval Workflow**
   - Mitigation: Simple status field (`pending` → `approved`), managed in Retool

5. **Program Comparison Performance**
   - Mitigation: Use Supabase joins, lazy load non-critical data

6. **ElasticSearch Integration Scope Creep**
   - Mitigation: Keep as separate future project, don't block current work

**Low-Risk Areas:**

7. TypeScript type regeneration
8. Mobile responsiveness (design mobile-first)
9. Seeding realistic data (include edge cases)

**Critical Dependencies:**

10. n8n scraper for production data (build in parallel, don't block features)

**Insights:**
- Most risks are mitigable through good design upfront
- Flexible JSONB schemas critical for international data variance
- Performance optimization can happen after core features work

---

### 5. Prioritization Matrix - 15 minutes

**Description:** Rank tasks by impact vs. effort using 2x2 matrix

**Quick Wins (High Impact, Low Effort) - 11 tasks, ~10.5 hours:**
- Database migration (Tasks 1-4)
- Core query functions (Tasks 8, 12)
- Simple components (Tasks 14, 22, 23)
- Routing setup (Tasks 26, 34)

**Major Projects (High Impact, High Effort) - 8 tasks, ~16.5 hours:**
- InstitutionPage (Task 25)
- ProgramComparisonPage (Task 33)
- Curriculum section (Task 27)
- Similar Programs logic (Task 32)
- InstitutionPrograms component (Task 16)
- CourseList component (Task 20)
- ComparisonStickyBar (Task 24)
- Comparison persistence (Task 37)

**Fill-Ins (Low Impact, Low Effort) - 14 tasks, ~12 hours:**
- Data seeding (Tasks 5-7)
- Simple components (Tasks 18, 19, 21)
- ProgramDetailPage sections (Tasks 28-30)
- Navigation updates (Tasks 38-39)
- Testing (Tasks 40-42)

**Moderate Priority (Medium Impact/Effort) - 9 tasks, ~11 hours:**
- Query functions (Tasks 9-11)
- Institution components (Tasks 13, 15, 17)
- Application section enhancement (Task 31)
- SearchPage updates (Tasks 35-36)

**Time Sinks to Simplify:**
- Advanced prerequisite visualization (defer to Phase 2)
- Map integration (optional for MVP)

---

## Idea Categorization

### Immediate Opportunities
*Ideas ready to implement now*

1. **Database Migration with 5 New Tables**
   - Description: Create courses, program_courses, alumni_testimonials, program_scholarships, program_comparisons tables
   - Why immediate: Foundation for all features, clearly defined schema
   - Resources needed: Supabase access, 4-5 hours development time

2. **InstitutionPage Component Library**
   - Description: Build 6 reusable institution components
   - Why immediate: No external dependencies, clear requirements
   - Resources needed: React/TypeScript, existing design system

3. **Compare Programs Database Persistence**
   - Description: Full database approach (all users authenticated)
   - Why immediate: Simpler than hybrid approach, better UX
   - Resources needed: program_comparisons table, query functions

### Future Innovations
*Ideas requiring development/research*

1. **AI-Powered Search with ElasticSearch**
   - Description: Enhance program search with semantic search and AI recommendations
   - Development needed: ElasticSearch setup, AI model integration
   - Timeline estimate: Phase 3 (Q2 2026)

2. **n8n Web Scraper for Production Data**
   - Description: Automated scraping of course catalogs, testimonials from university websites
   - Development needed: n8n workflows, data normalization
   - Timeline estimate: Parallel development (Q1 2026)

3. **Alumni Testimonial Submission Form**
   - Description: Public form on landing page for alumni to submit stories
   - Development needed: Form component, approval workflow UI, Retool integration
   - Timeline estimate: Post-MVP (Feature Vault)

### Moonshots
*Ambitious, transformative concepts*

1. **Interactive Course Prerequisite Graph**
   - Description: Visual graph showing course dependencies and recommended pathways
   - Transformative potential: Helps students plan entire degree journey
   - Challenges: Complex UI, recursive queries, data accuracy

2. **Real-Time Program Comparison Analytics**
   - Description: Track which programs users compare, surface insights
   - Transformative potential: Data-driven program recommendations
   - Challenges: Privacy considerations, analytics infrastructure

### Insights & Learnings

- **Relational beats JSONB for reusable data**: Courses need their own table since they're shared across programs
- **Authentication-first simplifies architecture**: No need for hybrid localStorage/DB approaches
- **JSONB flexibility critical for international variance**: Intake periods, deadlines, requirements vary widely by region
- **Component reusability accelerates development**: InstitutionHeader used in both pages, CourseList reused across sections
- **Sequential dependencies prevent rework**: Building InstitutionPage before ProgramDetailPage enhancements avoids refactoring
- **Minimal seeding reduces initial overhead**: n8n scraper handles production data, focus on schema correctness first

---

## Action Planning

### Top 3 Priority Ideas

#### #1 Priority: Database Migration & Schema Creation

**Rationale:**
- Foundation for all features
- Blocks all component development
- High confidence in schema design after brainstorming
- Minimal risk (well-understood relational patterns)

**Next steps:**
1. Create migration file: `supabase/migrations/YYYYMMDD_institution_course_catalog_schema.sql`
2. Define all 5 new tables with constraints, indexes
3. Update programs table with new columns
4. Create RLS policies (public read, authenticated write)
5. Run migration and verify
6. Regenerate database.types.ts

**Resources needed:**
- Supabase project access
- Database migration privileges
- 4-5 hours development time

**Timeline:** Week 1, Days 1-2 (Sprint 1 start)

---

#### #2 Priority: Supabase Query Functions Library

**Rationale:**
- Enables component development
- Centralizes data fetching logic
- TypeScript type safety throughout app
- Reusable across all features

**Next steps:**
1. Create `src/lib/supabase/queries/institutions.ts`
2. Create `src/lib/supabase/queries/courses.ts`
3. Create `src/lib/supabase/queries/testimonials.ts`
4. Create `src/lib/supabase/queries/scholarships.ts`
5. Create `src/lib/supabase/queries/comparisons.ts`
6. Write unit tests for critical queries

**Resources needed:**
- Database schema (from Priority #1)
- TypeScript knowledge
- 6-7 hours development time

**Timeline:** Week 1, Days 2-3 (Sprint 1 continuation)

---

#### #3 Priority: Institution Component Library

**Rationale:**
- Core building blocks for InstitutionPage
- Can be developed in parallel (no interdependencies)
- High reusability (used in multiple contexts)
- Visual progress (stakeholder demos)

**Next steps:**
1. Create `src/components/institution/` folder
2. Build InstitutionHeader.tsx (logo, name, stats)
3. Build InstitutionOverview.tsx (about section)
4. Build InstitutionStats.tsx (rankings, demographics)
5. Build InstitutionPrograms.tsx (program list)
6. Build InstitutionAlumni.tsx (testimonials display)
7. Build InstitutionLocation.tsx (campus info)

**Resources needed:**
- Query functions (from Priority #2)
- React component library (existing)
- Design system (existing)
- 9 hours development time

**Timeline:** Week 2 (Sprint 2)

---

## Reflection & Follow-up

### What Worked Well

- **Structured decomposition** prevented scope creep and clarified exact requirements
- **Dependency mapping** created clear build sequence, avoiding rework
- **Risk identification** surfaced JSONB schema concerns early (intake periods complexity)
- **Interactive questioning** helped make critical decisions (relational vs JSONB, database vs localStorage)
- **Granular tasks** create trackable progress (43 tasks averaging 1-2 hours each)
- **Prioritization matrix** provides flexible execution based on available time

### Areas for Further Exploration

- **Alumni testimonial submission form design**: Public-facing form UX, spam prevention, photo upload handling
- **Course prerequisite visualization**: Graph libraries (React Flow, D3.js), recursive query optimization
- **Mobile comparison UI**: How to display 3-program grid on mobile effectively
- **ElasticSearch architecture**: Integration patterns, indexing strategy, cost implications
- **n8n scraper workflows**: Which universities to scrape first, data validation approach

### Recommended Follow-up Techniques

- **SWOT Analysis**: For ElasticSearch vs simple search decision when ready
- **User Journey Mapping**: For alumni testimonial submission flow design
- **Wireframing Session**: For mobile comparison UI before coding
- **Technical Spike**: For course prerequisite graph visualization libraries

### Questions That Emerged

- How do we handle programs with flexible start dates (rolling admissions)?
- Should comparison history have a retention policy (delete after 30 days)?
- Do we need versioning for course catalogs (programs change over time)?
- Should alumni testimonials link to LinkedIn profiles for verification?
- How do we handle programs taught in multiple languages?

### Next Session Planning

**Suggested topics:**
1. Alumni Testimonial Submission Form (Feature Vault item)
2. n8n Web Scraper Architecture & Data Mapping
3. ElasticSearch Integration Design
4. Mobile Responsive Comparison UI Wireframing

**Recommended timeframe:** After Sprint 3 completion (InstitutionPage live)

**Preparation needed:**
- Review Retool admin interface capabilities
- Research n8n best practices for web scraping
- Explore course catalog structures from 3-5 sample universities

---

## Implementation Roadmap

### 6-Sprint Plan (~56 hours total)

| Sprint | Focus | Duration | Key Deliverable | Tasks |
|--------|-------|----------|-----------------|-------|
| **Sprint 1** | Foundation | 13h | Database + queries operational | Tasks 1-12 |
| **Sprint 2** | Components | 13h | All components ready | Tasks 13-22 |
| **Sprint 3** | Institution | 4.75h | InstitutionPage live | Tasks 25-26, 38, 40 |
| **Sprint 4** | Program Detail | 9.5h | 9-section detail page | Tasks 27-32, 41 |
| **Sprint 5** | Comparison | 11.25h | Compare feature complete | Tasks 23-24, 33-37, 42 |
| **Sprint 6** | Polish | 4.5h | Production ready | Tasks 39, 43, bug fixes |

### Sprint 1 Details (Week 1)

**Goal:** Database and data layer fully operational

**Tasks:**
1. Create database migration file (2-3h)
2. Create RLS policies (1h)
3. Run migration and verify (30m)
4. Update database types (30m)
5. Seed sample courses (1h)
6. Seed sample testimonials (45m)
7. Seed sample scholarships (30m)
8. Create institutions query functions (1.5h)
9. Create courses query functions (1.5h)
10. Create testimonials query functions (45m)
11. Create scholarships query functions (45m)
12. Create comparisons query functions (1h)

**Success Criteria:**
- ✅ All 5 tables exist in Supabase
- ✅ RLS policies tested and working
- ✅ database.types.ts regenerated without errors
- ✅ 5-10 sample records in each table
- ✅ All query functions tested with sample data

**Blockers to Watch:**
- Supabase migration permissions
- TypeScript compilation errors after type regeneration
- RLS policy conflicts with existing auth setup

---

## Database Schema Reference

### New Tables Summary

**1. courses**
- Purpose: Course definitions (reusable across programs)
- Key fields: course_code, course_name, credits, syllabus_topics, prerequisites, assessment_breakdown
- Relationships: Many-to-many with programs via program_courses

**2. program_courses**
- Purpose: Links programs to courses with context (year, semester, required/elective)
- Key fields: program_id, course_id, year, semester, is_required, course_order
- Relationships: Joins programs and courses

**3. alumni_testimonials**
- Purpose: Institution-wide student testimonials with approval workflow
- Key fields: university_id, student_name, testimonial_text, status, rating, would_recommend, tags
- Relationships: Belongs to universities
- Special: Approval workflow (pending → approved → rejected)

**4. program_scholarships**
- Purpose: Program-specific scholarship opportunities
- Key fields: program_id, university_id, scholarship_name, type, amount_min/max_usd, eligible_countries
- Relationships: Belongs to programs and/or universities
- Note: Separate from scholarship_opportunities (some are program-specific)

**5. program_comparisons**
- Purpose: User's saved program comparisons
- Key fields: user_id, program_ids (array), comparison_name, notes, is_active
- Relationships: Belongs to users, references programs
- Max: 3 program IDs per comparison

### Programs Table Updates

**New columns:**
- `program_url` (TEXT) - Official program page link
- `application_deadlines` (JSONB) - Array of intake/deadline objects
- `intake_periods` (TEXT[]) - ["Fall", "Spring"] or ["January", "September"]
- `min_gpa` (DECIMAL) - Minimum GPA requirement
- `language_requirements` (JSONB) - {"IELTS": 6.5, "TOEFL": 90}
- `required_documents` (TEXT[]) - ["Transcripts", "SOP", "LORs"]

---

## Component Architecture Reference

### Institution Components

```
src/components/institution/
├── InstitutionHeader.tsx       → Logo, name, rankings, location
├── InstitutionOverview.tsx     → About, history, mission
├── InstitutionStats.tsx        → Rankings, demographics, acceptance
├── InstitutionPrograms.tsx     → All programs on Akada from this uni
├── InstitutionAlumni.tsx       → Approved testimonials display
└── InstitutionLocation.tsx     → Campus info, city context
```

### Shared/Reusable Components

```
src/components/
├── courses/
│   ├── CourseCard.tsx          → Individual course display
│   └── CourseList.tsx          → Grouped by year/semester
├── scholarships/
│   └── ScholarshipCard.tsx     → Scholarship info display
├── testimonials/
│   └── TestimonialCard.tsx     → Alumni story display
└── compare/
    ├── ProgramCompareCheckbox.tsx  → Checkbox for selection
    └── ComparisonStickyBar.tsx     → Bottom bar with selected programs
```

### Pages

```
src/pages/
├── InstitutionPage.tsx         → /app/institutions/:id (6 sections)
├── ProgramDetailPage.tsx       → Enhanced with 9 sections
└── ProgramComparisonPage.tsx   → /app/compare (3-program grid)
```

---

*Session facilitated using the BMAD-METHOD™ brainstorming framework*
