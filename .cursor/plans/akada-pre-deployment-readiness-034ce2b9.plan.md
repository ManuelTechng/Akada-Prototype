<!-- 034ce2b9-f938-4671-a768-5c00862257ff 1393b72d-0c26-4a23-9b99-c6e5ac522be7 -->
# Create Comprehensive PRD V2.0 - Separate File

## Overview

Create a new, consolidated PRD file that brings together all existing documentation and new feature specifications into one comprehensive document, without modifying existing files.

---

## New File to Create

**File**: `docs/AKADA_PRD_V2.0.md`

**Size**: ~800-1,000 lines (manageable, actionable version)

**Format**: Markdown with clear sections, tables, and code blocks

---

## File Structure

### Table of Contents

```markdown
# Akada Platform - Product Requirements Document V2.0

## Table of Contents
1. Executive Summary
2. Current Implementation (Phase 1)
3. Phase 2 Features (Post-Deployment)
4. Phase 3 Features (Advanced)
5. Database Architecture
6. Technical Specifications
7. Implementation Roadmap
8. Success Metrics & KPIs
```

---

## Content Breakdown by Section

### 1. Executive Summary (50 lines)

- **Product Vision**: AI-powered education platform for Nigerian students
- **Mission**: Democratize access to global education
- **Current Status**: 70% deployment-ready, 22 programs in database
- **Target Users**: Nigerian students aged 16-30, tech/non-tech programs
- **Business Model**: Freemium (Free tier, Standard $5/month, Premium $10/month)
- **Market Opportunity**: $5B market, 50K+ Nigerian students studying abroad annually
- **Competitive Advantage**: Nigeria-first design, 3G-optimized, NGN-native, AI-powered

### 2. Current Implementation - Phase 1 (150 lines)

**Completed Features** (from AKADA_PLATFORM_DOCUMENTATION.md):

#### Authentication & User Management

- Email/password signup with email verification
- Google OAuth integration
- Password reset flow
- User profiles with preferences
- RLS policies for data security

#### Dashboard & Analytics

- Welcome card with user info
- Quick stats (saved programs, applications, scholarships)
- Profile completion tracking
- Recent activities widget
- Application timeline widget
- Cost analysis widget
- Quick actions (search, scholarships)

#### Program Discovery & Search

- Advanced filters (country, tuition, degree type, specialization, scholarships)
- Sort options (relevance, tuition, deadline)
- Program cards with save functionality
- Search results with pagination
- City/location filtering

#### Document Management

- Upload documents to Supabase Storage
- AI-powered document review (essay, SOP feedback)
- Document library with download
- Status tracking (pending, reviewed, approved)
- Dark mode support

#### Cost Calculator (Basic)

- Tuition fee calculation
- Living expenses estimation
- Health insurance costs
- Application fees
- Total cost projection in NGN
- Multi-currency support (14 currencies)
- 3-tier fallback system (API → localStorage → static rates)

#### AI Chat Assistant

- Real-time chat with Gemini/GPT
- Context-aware responses
- Chat history persistence
- Program recommendation capability
- Visa/application guidance

#### Infrastructure

- Dark/Light theme toggle
- Multi-currency conversion system
- Responsive design (mobile-first)
- Connection health checks
- Timeout protection (10s queries)
- Error boundaries
- Environment validation

**Database Schema** (11 tables):

- user_profiles
- user_preferences  
- programs
- applications
- documents
- saved_programs
- chat_logs
- country_estimates
- reminder_system
- sessions
- auth.users

**Technology Stack**:

- Frontend: React 18, TypeScript, Tailwind CSS, Vite
- Backend: Supabase (Auth, Database, Storage)
- AI: OpenAI GPT-4, Google Gemini
- Deployment: Netlify (via GitHub)
- Currency: Fixer.io API

### 3. Phase 2 Features - Post-Deployment (250 lines)

**Timeline**: 2 weeks post-launch

**Priority**: High - Essential for production readiness

#### A. PWA Implementation (Offline-First)

**Objective**: Enable offline access and installable app experience

**Service Worker Features**:

- Cache-first strategy for static assets (HTML, CSS, JS, images)
- Network-first for dynamic data (programs, user profiles)
- Background sync for offline actions
- Push notification handling (via chosen provider)
- Periodic background sync for data freshness
- Stale-while-revalidate for API responses

**IndexedDB Offline Database**:

```javascript
// Schema
{
  programs: {
    keyPath: 'id',
    indexes: ['country', 'tuition_fee', 'specialization']
  },
  saved_programs: {
    keyPath: 'id',
    indexes: ['user_id', 'created_at']
  },
  user_profile: {
    keyPath: 'user_id'
  }
}
```

**Offline Capabilities**:

- Browse 5000+ cached programs
- Search/filter programs offline
- Save programs to queue (sync when online)
- View saved programs
- Access user profile
- Offline indicator in UI

**Install Experience**:

- Smart prompt timing (2+ visits OR 5+ page views)
- Dismissal tracking (don't re-prompt immediately)
- Custom install UI for iOS
- Install analytics
- Post-install onboarding

**Performance Targets**:

- First Contentful Paint: <1.5s on 3G
- Largest Contentful Paint: <2.5s on 3G
- Time to Interactive: <3.5s on 3G
- Cache hit rate: >70%
- Offline functionality: 100% for core features

**Implementation Files**:

- `public/service-worker.js` (rewrite from placeholder)
- `public/manifest.json` (app manifest)
- `src/lib/offline-db.ts` (IndexedDB wrapper)
- `src/lib/sync-queue.ts` (offline action queue)
- `src/components/InstallPrompt.tsx` (PWA install UI)

#### B. Enhanced School Details System

**Objective**: Provide comprehensive university and program information

**New Database Tables** (5 tables):

1. **universities** (20+ fields):
```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  type TEXT, -- public, private, technical
  ranking_qs INTEGER,
  ranking_times INTEGER,
  acceptance_rate DECIMAL(5,2),
  total_students INTEGER,
  international_students INTEGER,
  student_faculty_ratio DECIMAL(5,2),
  description TEXT,
  website TEXT,
  logo_url TEXT,
  campus_size TEXT,
  founded_year INTEGER,
  accreditations TEXT[],
  notable_alumni TEXT[],
  research_output TEXT,
  industry_connections TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **countries** (25+ fields):
```sql
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT, -- North America, Europe, Asia, etc.
  currency_code VARCHAR(3),
  currency_symbol VARCHAR(5),
  visa_type TEXT, -- study permit, student visa
  visa_processing_time_days INTEGER,
  visa_fee_usd DECIMAL(10,2),
  requires_biometrics BOOLEAN,
  requires_medical_exam BOOLEAN,
  language_requirements TEXT, -- IELTS 6.5, TOEFL 90
  work_permit_hours_per_week INTEGER,
  post_study_work_permit_duration TEXT,
  healthcare_system TEXT,
  healthcare_cost_monthly_usd DECIMAL(10,2),
  climate TEXT,
  time_zone TEXT,
  popular_cities TEXT[],
  education_system_overview TEXT,
  scholarships_available BOOLEAN,
  avg_cost_of_living_monthly_usd DECIMAL(10,2),
  safety_index DECIMAL(5,2),
  quality_of_life_index DECIMAL(5,2),
  internet_speed_mbps INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. **cities** (15+ fields):
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code VARCHAR(3) REFERENCES countries(country_code),
  tier TEXT NOT NULL, -- major, mid, small
  population INTEGER,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  accommodation_min_monthly_usd DECIMAL(10,2),
  accommodation_max_monthly_usd DECIMAL(10,2),
  food_monthly_usd DECIMAL(10,2),
  transport_monthly_usd DECIMAL(10,2),
  utilities_monthly_usd DECIMAL(10,2),
  entertainment_monthly_usd DECIMAL(10,2),
  climate TEXT,
  public_transport_quality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. **application_guides** (12+ fields):
```sql
CREATE TABLE application_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES universities(id),
  country_code VARCHAR(3) REFERENCES countries(country_code),
  title TEXT NOT NULL,
  steps JSONB NOT NULL, -- [{step: 1, title: "...", description: "..."}]
  required_documents TEXT[],
  application_fee_usd DECIMAL(10,2),
  application_deadline_type TEXT, -- rolling, fixed
  typical_response_time_weeks INTEGER,
  tips TEXT[],
  common_mistakes TEXT[],
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

5. **scholarship_opportunities** (12+ fields):
```sql
CREATE TABLE scholarship_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT, -- university, government, private
  amount_min_usd DECIMAL(10,2),
  amount_max_usd DECIMAL(10,2),
  coverage_type TEXT, -- full tuition, partial, living costs
  eligible_countries TEXT[],
  eligible_programs TEXT[],
  requirements TEXT[],
  application_deadline DATE,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```


**New Pages**:

1. **University Detail Page** (`/universities/:id`):

   - Tab 1: Overview (stats, description, rankings, campus)
   - Tab 2: Programs & Courses (searchable program list)
   - Tab 3: Location & Living Costs (city info, cost breakdown)
   - Tab 4: Visa & Immigration (country requirements)
   - Tab 5: How to Apply (step-by-step guide)
   - Tab 6: Scholarships & Aid (available funding)

2. **Enhanced Program Detail Page** (`/programs/:id`):

   - Section 1: Program Overview (name, degree, duration, tuition)
   - Section 2: Requirements (entry, language, standardized tests)
   - Section 3: Tuition & Costs (with city/country context)
   - Section 4: Location & University Context (embedded university info)
   - Section 5: Application Process (timeline, documents)
   - Section 6: Similar Programs (recommendations)

**Migration Strategy**:

- Extract universities from existing programs table
- Populate countries table with visa/work permit data
- Create cities from program locations
- Manual/AI-assisted application guide creation
- Seed scholarship database

#### C. Multi-Country Cost Calculator Enhancement

**Objective**: Provide accurate cost estimates for students from 10 African countries

**From**: `cost-calculator-enhancement.plan.md` (397 lines)

**New Database Tables** (4 tables):

1. **african_countries**:
```sql
CREATE TABLE african_countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(3) NOT NULL UNIQUE, -- ISO 3166-1 alpha-3
  country_name VARCHAR(100) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  currency_symbol VARCHAR(5),
  flag_emoji VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```


**Initial Data**: Nigeria (NGN), Ghana (GHS), Kenya (KES), South Africa (ZAR), Egypt (EGP), Uganda (UGX), Tanzania (TZS), Rwanda (RWF), Ethiopia (ETB), Morocco (MAD)

2. **city_living_costs** (already designed above in cities table)

3. **flight_routes**:
```sql
CREATE TABLE flight_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_country_code VARCHAR(3) NOT NULL,
  destination_country_code VARCHAR(3) NOT NULL,
  avg_economy_cost DECIMAL(10,2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
  peak_season_multiplier DECIMAL(4,2) DEFAULT 1.3,
  budget_airline_available BOOLEAN DEFAULT false,
  typical_layovers INTEGER DEFAULT 1,
  avg_flight_duration_hours INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(origin_country_code, destination_country_code)
);
```


**Example Data**:

- NGA → USA: ~$1200-1500
- GHA → GBR: ~$800-1100  
- KEN → CAN: ~$1000-1300

4. **country_visa_requirements** (integrated into countries table above)

**Enhanced Cost Categories**:

1. **Pre-Arrival Costs** (one-time):

   - Visa application fee
   - Biometrics fee
   - Medical examinations (TB test, vaccinations)
   - Language proficiency tests (IELTS/TOEFL/PTE)
   - Document attestation/notarization
   - Background checks/police clearance
   - Initial flight ticket

2. **Initial Setup Costs** (one-time, first month):

   - Security deposit (accommodation)
   - Furniture & household items
   - Initial groceries & essentials
   - SIM card & utilities setup
   - First semester textbooks
   - Kitchen essentials
   - Bedding & linens

3. **Recurring Costs** (monthly/annual):

   - Tuition fees (annual)
   - Accommodation (monthly)
   - Food & groceries (monthly)
   - Local transport (monthly)
   - Utilities (monthly)
   - Phone & internet (monthly)
   - Health insurance (annual)
   - Entertainment (monthly)
   - Annual return flights

4. **Emergency Buffer**: 10% of total costs

**New Features**:

- Country selection: "Where are you applying from?"
- City selection: "Which city?" (filtered by tier)
- Flight cost calculator (origin → destination)
- Multi-currency display (home currency + destination currency)
- Visualizations: Pie chart, bar chart, payment timeline
- Save & compare (up to 3 programs side-by-side)
- PDF export with detailed breakdown

**TypeScript Interface**:

```typescript
interface EnhancedCostBreakdown {
  homeCountry: string // Country code
  destinationCity: string
  
  // Pre-Departure (one-time)
  visaFees: number
  medicalExams: number
  languageTests: number
  documentAttestation: number
  initialFlightTicket: number
  
  // Setup (one-time)
  securityDeposit: number
  furniture: number
  initialGroceries: number
  textbooks: number
  
  // Recurring (monthly)
  tuition: number // annual
  accommodation: number
  food: number
  transport: number
  utilities: number
  phoneInternet: number
  healthInsurance: number // annual
  
  // Annual
  annualReturnFlights: number
  
  // Buffer
  emergencyFund: number // 10%
  
  // Totals
  totalPreDeparture: number
  totalSetup: number
  totalFirstYear: number
  totalPerYear: number
}
```

### 4. Phase 3 Features - Advanced (200 lines)

**Timeline**: 4-8 weeks post-Phase 2

**Priority**: Medium - Scalability and automation

#### A. AI-Powered Auto-Scraping Agent

**Objective**: Automatically populate database when users search for schools not yet in system

**Workflow** (10 steps):

1. **User Action**: Searches "Stanford Computer Science Masters"
2. **System Detection**: Program not found in database
3. **Job Creation**: Creates scraping job (priority: high)
4. **User Notification**: "We're adding Stanford to our database! We'll notify you when it's ready."
5. **AI Agent Trigger**: Background worker picks up job
6. **Scraping Process**:

   - Visits Stanford official website
   - Extracts programs, tuition, deadlines, requirements
   - Validates data from 2+ sources (QS Rankings, official sites)
   - Structures data according to schema

7. **Quality Check**:

   - AI calculates confidence score (0-100%)
   - If >85%: Auto-approve and add to database
   - If <85%: Queue for admin review

8. **Data Added**: University + programs inserted into database
9. **Application Guide Generation**: AI creates step-by-step guide
10. **User Notification**: Push + Email + In-app "Stanford is now available! View 24 programs"

**Architecture Components**:

1. **Scraping Engine**: Playwright/Puppeteer for dynamic sites
2. **AI Extraction**: GPT-4 Vision for PDFs, images, complex layouts
3. **Data Validation**: Multi-source verification (require 2+ sources)
4. **Structured Output**: JSON schema enforcement
5. **Quality Scoring**: 0-100% confidence with detailed reasoning
6. **Job Queue**: BullMQ for distributed processing
7. **Retry Logic**: 3 attempts with exponential backoff
8. **Rate Limiting**: Respects robots.txt, max 1 req/sec per domain

**Data Sources Priority**:

1. Official university websites (highest trust)
2. Times Higher Education / QS Rankings
3. Government education portals (UCAS, Common App)
4. Trusted aggregators (Study.com, CollegeBoard)

**Ethical & Legal Compliance**:

- Respect robots.txt 100%
- User-agent: "Akada-Bot/1.0 (+https://akada.com/bot)"
- Rate limiting and politeness delays
- No personal data scraping
- Public data only
- Legal review of practices

**Admin Review Interface**:

- Dashboard for pending jobs
- Side-by-side comparison (scraped vs manual)
- Approval/rejection workflow
- Edit before approve
- Feedback to AI for learning

#### B. Self-Updating Database System

**Objective**: Automatically refresh stale data to maintain accuracy

**Update Schedules**:

| Data Type | Frequency | Method |

|-----------|-----------|--------|

| Currency rates | Every 6 hours | Fixer.io API (already implemented) |

| Program tuition | Monthly | AI agent + web scraping |

| Application deadlines | Weekly | University websites |

| Scholarship availability | Daily | Scholarship portals |

| Cost of living | Quarterly | Numbeo API |

| Visa requirements | On-demand | Government announcements |

**Update Process** (7 steps):

1. **Scheduled Trigger**: Supabase Edge Function (cron job)
2. **AI Fetch**: Agent fetches latest data for all programs
3. **Comparison**: Field-by-field diff with current database
4. **Categorization**:

   - Minor (<5% change): Auto-update
   - Moderate (5-15%): Flag for review
   - Major (>15% or structural): Require admin approval

5. **Apply Updates**: With versioning and audit trail
6. **User Notifications**:

   - "Your saved program tuition increased by 10%"
   - "Application deadline extended to March 2026"
   - "New scholarship matching your profile"

7. **Logging**: All changes in `database_update_logs` table

**Change Detection**:

- Hash-based: MD5 hash of critical fields
- Field-level: Track which specific fields changed
- Confidence scoring: AI determines if change is legitimate
- Outlier detection: Flag unusual changes (e.g., tuition doubled)
- Multi-source verification: Confirm major changes from 2+ sources

**Data Quality Monitoring**:

- Staleness tracking (how old is each field?)
- Completeness score (% of fields populated)
- Accuracy score (user feedback + verification)
- Automated alerts for data degradation

#### C. Comprehensive Notification System

**Objective**: Keep users informed via multiple channels

**Build vs Buy Decision**:

- **Phase 1**: Use OneSignal (free tier: 10K users)
- **Phase 2+**: Evaluate custom build if costs exceed $500/month
- **Enterprise**: Migrate to AWS SNS for full control

**Notification Types** (40+ across 7 categories):

1. **Onboarding & Engagement** (6 types):

   - Welcome message after signup
   - Profile completion reminders
   - Feature discovery tips
   - Abandoned profile nudge
   - App install prompt
   - First search congratulations

2. **Program Discovery** (8 types):

   - New programs matching preferences
   - Price changes on saved programs (>5%)
   - School added after search request
   - Similar program recommendations
   - Deadline approaching (saved programs)
   - Popular programs this week
   - Programs in price range
   - Late application opportunities

3. **Application Management** (10 types):

   - Deadline reminders (30, 14, 7, 3, 1 days)
   - Application status updates
   - Missing document alerts
   - Interview invitations
   - Application fee payment reminder
   - Test score submission reminder
   - Reference letter request
   - Application submitted confirmation
   - Multiple deadlines summary
   - Overdue application warning

4. **Financial Planning** (6 types):

   - Currency rate change alert (>5%)
   - Scholarship deadlines
   - New scholarship matching profile
   - Funding opportunities
   - Cost estimate update
   - Financial aid reminder

5. **Community & Support** (5 types):

   - New message from counselor
   - Discussion reply
   - Question answered
   - Peer success story
   - Study buddy request

6. **System & Account** (7 types):

   - Password reset
   - Security alert (new device)
   - Payment confirmation
   - Subscription renewal
   - Feature update
   - Maintenance notice
   - Account verification

7. **AI & Automation** (6 types):

   - Document review completed
   - Essay feedback ready
   - AI research results
   - Personalized recommendation
   - Application checklist generated
   - School data update complete

**Delivery Channels**:

- **Push**: Instant, high priority (deadline <3 days, new school added)
- **Email**: Detailed, transactional (weekly digest, document reviews)
- **In-App**: Always visible, persistent (notification center)
- **SMS**: Critical only (deadline 24h, payment failed)
- **WhatsApp** (future): Conversational, rich media

**User Preferences** (Granular Control):

- By category: On/Off per category
- By channel: On/Off per channel per category
- By timing: Quiet hours (10pm-8am in user timezone)
- Digest preference: Daily 9am / Weekly Monday 9am

**Notification Template Example**:

```json
{
  "id": "school_added",
  "channels": ["push", "email", "in-app"],
  "priority": "high",
  "push": {
    "title": "{{school_name}} is now available!",
    "body": "We've added {{program_count}} programs. View them now.",
    "action": "View Programs",
    "url": "/universities/{{university_id}}"
  },
  "email": {
    "subject": "Great news! {{school_name}} is now in our database",
    "template": "school_added_email.html",
    "cta": "Explore {{school_name}} Programs"
  }
}
```

### 5. Database Architecture (100 lines)

**Complete ERD** (Entity Relationship Diagram - text-based)

**Current Tables** (11):

- user_profiles
- user_preferences
- programs
- applications
- documents
- saved_programs
- chat_logs
- country_estimates
- reminder_system
- sessions
- auth.users

**Phase 2 Additions** (5):

- universities
- countries
- cities
- application_guides
- scholarship_opportunities

**Phase 3 Additions** (4):

- african_countries
- flight_routes
- database_update_logs
- notification_preferences

**Cost Calculator Additions** (from plan - already covered above):

- city_living_costs (integrated into cities)
- country_visa_requirements (integrated into countries)

**Total Tables**: 20+ tables

**Key Relationships**:

```
universities (1) ←→ (many) programs
countries (1) ←→ (many) cities
universities (1) ←→ (many) application_guides
countries (1) ←→ (many) application_guides
programs (1) ←→ (many) saved_programs
programs (1) ←→ (many) applications
user_profiles (1) ←→ (many) saved_programs
user_profiles (1) ←→ (many) applications
user_profiles (1) ←→ (many) documents
user_profiles (1) ←→ (1) user_preferences
```

**RLS Policies**: All tables have Row Level Security enabled

**Indexes**: Performance indexes on foreign keys, search fields

**Audit Trail**: `created_at`, `updated_at` on all tables

### 6. Technical Specifications (100 lines)

**Performance Requirements**:

- Load time: <3s on 3G, <1.5s on 4G
- API response: <200ms p95
- Database queries: <150ms p95
- Cache hit rate: >75%
- Offline functionality: 100% for core features

**Security**:

- GDPR compliant
- Data encryption (at rest, in transit)
- RLS policies on all tables
- Rate limiting (10 req/sec per user)
- Input validation
- XSS/CSRF protection
- Content Security Policy

**Accessibility**:

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- 4.5:1 color contrast
- Focus indicators

**Scalability Targets**:

- Support 100K users
- 10K programs in database
- 1M searches/month
- 99.9% uptime
- Disaster recovery (RTO: 1h, RPO: 5min)

### 7. Implementation Roadmap (50 lines)

**Phase 1: MVP Deployment** (Current - 3 days)

- Deploy to Netlify
- Populate 50+ programs
- Onboard 10-20 test users
- Collect feedback

**Phase 2: Enhanced Features** (Weeks 1-2 post-launch)

- Week 1: PWA + Database schema enhancement
- Week 2: School details pages + Multi-country cost calculator

**Phase 3: Advanced Automation** (Weeks 3-8 post-Phase 2)

- Weeks 3-4: AI auto-scraping agent
- Weeks 5-6: Self-updating database
- Weeks 7-8: Notification system

**Phase 4: Expansion** (Months 3-6)

- Multi-country expansion (10 African countries)
- Community features
- Premium tier features
- Mobile native apps (leveraging PWA)

### 8. Success Metrics & KPIs (50 lines)

**User Metrics**:

- User acquisition: 10K users in 6 months
- Activation: 70% complete profile
- Engagement: 5+ sessions/week for active users
- Retention: 60% D30 retention
- PWA install rate: 35%

**Product Metrics**:

- Program database: 10K programs in 12 months
- Search success rate: >90%
- Auto-scraping success: >85%
- Data freshness: >95% updated monthly
- Notification engagement: >30% open rate

**Business Metrics**:

- Premium conversion: 8% of active users
- Revenue per user: $5-15/month
- Customer acquisition cost: <$20
- Lifetime value: >$150
- Churn rate: <5% monthly

**Technical Metrics**:

- Page load time: <2s p95
- API response time: <150ms p95
- Uptime: >99.9%
- Error rate: <0.1%
- Cache hit rate: >75%

---

## Summary

This PRD V2.0 consolidates:

✅ **Original MVP PRD** (src/prd.txt - 129 lines)

✅ **Current Implementation** (AKADA_PLATFORM_DOCUMENTATION.md - 1,969 lines)

✅ **Cost Calculator Plan** (cost-calculator-enhancement.plan.md - 397 lines)

✅ **School Details Plan** (school-details-system.plan.md - 602 lines)

✅ **Deployment Plan** (akada-pre-deployment-readiness.plan.md - 506 lines)

🆕 **PWA Specifications**

🆕 **AI Auto-Scraping Agent**

🆕 **Self-Updating Database**

🆕 **Notification System**

**Total**: ~800-1,000 lines (manageable, actionable version)

**Next Steps**:

1. Create `docs/AKADA_PRD_V2.0.md` with all sections
2. Commit to repository
3. Use as single source of truth for Phases 2-4
4. Expand to full 5,500-line PRD V3.0 after Phase 2 with real user feedback

### To-dos

- [ ] Create netlify.toml in project root with build configuration, redirects, and security headers for GitHub-based deployment
- [ ] Populate programs table with 50+ international programs covering USA, UK, Canada, Germany, Australia with diverse tuition ranges and specializations
- [ ] Run npm run build locally and test production build with npm run preview, verify no errors and all features functional
- [ ] Connect GitHub repository to Netlify, configure build settings, and set up automatic deployments from main branch
- [ ] Configure all required environment variables in Netlify dashboard (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY)
- [ ] Push netlify.toml to GitHub main branch, trigger first Netlify deployment, monitor build logs and fix any errors
- [ ] Perform comprehensive QA testing on Netlify staging URL - test all user flows, authentication, program search, mobile responsiveness
- [ ] Address any critical bugs discovered during QA testing that block core user flows
- [ ] Deploy to production Netlify URL, verify all features working, set up custom domain if needed
- [ ] Onboard first 5-10 Nigerian student testers, provide user guide, collect initial feedback
- [ ] Design and review Phase 2 database schema for universities, countries, cities, application_guides, and scholarships tables per school-details-system plan
- [ ] Create Supabase migrations for Phase 2 enhanced database schema with proper constraints, indexes, and RLS policies
- [ ] Execute data migration scripts to extract universities from programs, migrate country_estimates to countries table
- [ ] Build Supabase query functions for universities, application guides, scholarships, and locations
- [ ] Create React hooks for Phase 2: useUniversity, useApplicationGuide, useScholarships, useCityInfo
- [ ] Build shared Phase 2 components: ScholarshipCard, CostBreakdown, CountryInfoPanel
- [ ] Implement UniversityDetailPage with tabbed interface and all related components per plan
- [ ] Implement enhanced ProgramDetailPage with section-based layout and university context
- [ ] Update routing configuration and navigation links for university and program detail pages
- [ ] Test all Phase 2 features, verify data flows, ensure currency conversions work correctly with new schema