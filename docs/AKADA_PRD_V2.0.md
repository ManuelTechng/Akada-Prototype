# Akada Platform - Product Requirements Document V2.0

**Version**: 2.1
**Last Updated**: October 22, 2025
**Status**: Updated with Institution & Course Catalog features
**Document Owner**: Akada Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Implementation - Phase 1](#2-current-implementation---phase-1)
3. [Phase 2 Features - Post-Deployment](#3-phase-2-features---post-deployment)
4. [Phase 3 Features - Advanced](#4-phase-3-features---advanced)
5. [Database Architecture](#5-database-architecture)
6. [Technical Specifications](#6-technical-specifications)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Success Metrics & KPIs](#8-success-metrics--kpis)

---

## 1. Executive Summary

### Product Vision
Akada is an AI-powered education platform that empowers African students (primarily Nigerian students aged 16-30) to explore, plan, and apply to international education programs, democratizing access to global education opportunities.

### Mission
To become the go-to platform for African students seeking affordable and accessible international education, with a focus on Nigeria-first usability, real-time data, and AI-powered guidance.

### Current Status
- **Deployment Readiness**: 70% ready for internal testing
- **Programs Database**: 22 programs (target: 50+ for launch)
- **Core Features**: Authentication, Dashboard, Program Search, Document Management, Cost Calculator, AI Chat
- **Infrastructure**: Supabase backend, React frontend, Netlify deployment target

### Target Users
- **Primary**: Nigerian students aged 16-30 seeking tech/non-tech international programs
- **Secondary**: Education counselors in Nigeria assisting multiple students
- **Edge Case**: Students with intermittent 3G internet connections

### Business Model
- **Free Tier**: Basic features (authentication, program search, timeline builder)
- **Standard Tier**: $5/month - AI chat assistance, document review (5 uploads/month)
- **Premium Tier**: $10/month - Unlimited document reviews, application tracking, email reminders

### Market Opportunity
- **Market Size**: $5 billion+ education services market
- **Target Audience**: 50,000+ Nigerian students studying abroad annually
- **Growth Rate**: 15% year-over-year increase in international education

### Competitive Advantage
1. **Nigeria-First Design**: Optimized for 3G networks, NGN-native pricing
2. **AI-Powered**: Automated program recommendations, document review, search assistance
3. **Comprehensive Data**: Multi-country support, city-specific costs, visa requirements
4. **Offline Capability**: PWA with offline program browsing and sync
5. **Real-Time Updates**: Self-updating database with currency conversion and price alerts

---

## 2. Current Implementation - Phase 1

### 2.1 Completed Features

#### A. Authentication & User Management

**Features**:
- Email/password signup with email verification
- Google OAuth integration (SSO)
- Password reset flow with secure token
- User profiles with preferences storage
- Session management with auto-refresh
- Row Level Security (RLS) policies

**Technical Implementation**:
- **Service**: Supabase Auth
- **Tables**: `auth.users`, `user_profiles`, `user_preferences`
- **Security**: RLS enabled, email verification required
- **Session Storage**: localStorage with in-memory fallback

**User Profile Fields**:
```typescript
interface UserProfile {
  user_id: string
  email: string
  full_name: string
  phone_number?: string
  date_of_birth?: string
  country: string
  city?: string
  preferred_countries?: string[]
  preferred_specializations?: string[]
  budget_min?: number
  budget_max?: number
  target_start_date?: string
  education_level: string
  profile_complete: boolean
  created_at: string
  updated_at: string
}
```

#### B. Dashboard & Analytics

**Widgets**:
1. **Welcome Card**: Personalized greeting with user name and quick stats
2. **Stats Grid**: Saved programs count, active applications, scholarships found
3. **Profile Completion**: Progress bar with missing fields highlighted
4. **Notifications**: Recent system notifications and alerts
5. **Recent Activities**: Last 5 user actions (searches, saves, applications)
6. **Application Timeline**: Visual timeline for tracked applications
7. **Cost Analysis**: Budget utilization and cost breakdown
8. **Quick Actions**: Fast navigation to search, scholarships, chat

**Dark Mode Support**: Full theme system with `ThemeContext` and localStorage persistence

**Responsive Design**: Mobile-first (375px), tablet (768px), desktop (1024px+)

#### C. Program Discovery & Search

**Search Features**:
- **Text Search**: Name, university, country, specialization
- **Filters**:
  - Country (multi-select)
  - Tuition range (slider with NGN display)
  - Degree type (Bachelor's, Master's, PhD, Diploma)
  - Specialization (20+ options)
  - Scholarships available (toggle)
  - Application deadline (date range)
- **Sort Options**: Relevance, tuition (low/high), deadline (nearest), name (A-Z)
- **Pagination**: 50 results per page with load more

**Program Card Display**:
- University name and logo
- Program name and degree type
- Location (city, country) with flag emoji
- Tuition fee in NGN (converted from USD)
- Scholarship badge if available
- Application deadline with countdown
- Save/unsave button
- Quick view modal

**Technical Implementation**:
- **Data Source**: Supabase `programs` table
- **Performance**: Connection health checks, retry with backoff, 10s timeout
- **Caching**: No client-side caching yet (planned for PWA)
- **Error Handling**: User-friendly messages, connection health diagnostics

#### D. Document Management

**Features**:
- Upload documents to Supabase Storage
- AI-powered document review (essays, statements of purpose)
- Document library with download capability
- Status tracking (pending, reviewed, approved, rejected)
- Feedback display with suggestions
- Dark mode support

**Supported Document Types**:
- Essays (college application essays)
- Statements of Purpose (SOP)
- Personal Statements
- Transcripts
- Letters of Recommendation (for review only)
- Other application documents

**AI Review Integration**:
- **Providers**: OpenAI GPT-4, Google Gemini
- **Feedback Categories**: Grammar, structure, clarity, relevance, tone
- **Response Time**: 5-15 seconds average
- **Fallback**: Static message if AI unavailable

**Storage**:
- **Service**: Supabase Storage
- **Bucket**: `documents` (private)
- **Max File Size**: 10 MB
- **RLS**: User can only access their own documents

#### E. Cost Calculator (Basic)

**Current Features**:
- Tuition fee input/selection
- Living expenses estimation (country-level)
- Health insurance costs
- Application fees
- Total cost projection in NGN
- Multi-currency support (14 currencies)
- 3-tier fallback system (API → localStorage → static rates)

**Currency Support**:
- Primary: NGN (Nigerian Naira)
- Supported: USD, EUR, GBP, CAD, AUD, NZD, JPY, CNY, INR, ZAR, KES, GHS, EGP

**Conversion System**:
- **Primary Source**: Fixer.io API (updates every 6 hours)
- **Fallback 1**: localStorage cached rates (valid 24 hours)
- **Fallback 2**: Static rates embedded in code
- **Display**: Always shows both NGN and original currency

**Limitations** (to be addressed in Phase 2):
- Country-level costs only (not city-specific)
- No flight costs
- No pre-arrival costs (visa, medical exams)
- No initial setup costs
- No comparison functionality

#### F. AI Chat Assistant

**Features**:
- Real-time chat with AI (Gemini/GPT-4)
- Context-aware responses
- Chat history persistence in Supabase
- Program recommendation capability
- Visa/application guidance
- Essay writing tips

**AI Providers**:
- **Primary**: Google Gemini 1.5 Pro
- **Fallback**: OpenAI GPT-4
- **Context Window**: 8K tokens
- **Response Time**: 2-5 seconds average

**Use Cases**:
1. "How do I write a strong statement of purpose?"
2. "What are the visa requirements for studying in Canada?"
3. "Recommend affordable CS Master's programs in Europe"
4. "When should I start my application for Fall 2026?"
5. "What documents do I need for US student visa?"

**Limitations**:
- No voice input (text only)
- No file attachments in chat
- No multi-turn conversation memory (each query is independent)

#### G. Saved Programs

**Features**:
- Save/unsave programs from search results
- Dedicated saved programs page
- Filters and sorting on saved programs
- Bulk actions (remove multiple)
- Export saved programs list
- Integration with application tracker

**Data Storage**:
- **Table**: `saved_programs`
- **Fields**: `user_id`, `program_id`, `notes`, `created_at`
- **RLS**: User can only access their own saved programs

#### H. Infrastructure & Performance

**Frontend**:
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **Icons**: Lucide React
- **Build Tool**: Vite (ES2020 target)
- **Bundle Size**: ~350 KB gzipped (main bundle)

**Backend**:
- **Service**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with RLS
- **Storage**: Supabase Storage (documents)
- **Functions**: Supabase Edge Functions (future)

**Performance**:
- **Load Time**: ~2.5s on 3G (target: <3s)
- **API Response**: ~200ms p95
- **Bundle Splitting**: Vendor chunks for React, Router, UI libraries
- **Lazy Loading**: Most routes lazy-loaded

**Error Handling**:
- Connection health checks before queries
- Timeout protection (10s for all queries)
- Retry with exponential backoff (3 attempts)
- User-friendly error messages
- Error boundaries at route level

**Dark Mode**:
- **Implementation**: CSS custom properties + Tailwind dark: classes
- **Storage**: localStorage with system preference detection
- **Components**: All components support dark mode

### 2.2 Database Schema (Phase 1)

**Current Tables** (11 tables):

1. **auth.users** (Supabase managed)
   - id, email, encrypted_password, email_confirmed_at, created_at

2. **user_profiles**
   - user_id (FK), email, full_name, phone_number, date_of_birth, country, city
   - preferred_countries, preferred_specializations, budget_min, budget_max
   - target_start_date, education_level, profile_complete, created_at, updated_at

3. **user_preferences**
   - user_id (FK), theme (light/dark), language, currency, notification_preferences
   - created_at, updated_at

4. **programs**
   - id, name, university, country, city, location, tuition_fee, tuition_fee_currency
   - tuition_fee_original, degree_type, specialization, duration, description
   - application_deadline, deadline, website, university_website, program_website
   - entry_requirements, language_requirements, study_level, application_fee
   - application_fee_currency, requirements, scholarship_available, has_scholarships
   - created_at, updated_at

5. **applications**
   - id, user_id (FK), program_id (FK), status, deadline, notes
   - documents_submitted, created_at, updated_at

6. **documents**
   - id, user_id (FK), application_id (FK), filename, file_url, file_size
   - file_type, document_type, status, ai_feedback, uploaded_at

7. **saved_programs**
   - id, user_id (FK), program_id (FK), notes, created_at

8. **chat_logs**
   - id, user_id (FK), message, response, model_used, tokens_used
   - created_at

9. **country_estimates**
   - id, country_name, living_cost_monthly, avg_tuition_annually
   - currency_code, created_at, updated_at

10. **reminder_system**
    - id, user_id (FK), application_id (FK), reminder_date, reminder_type
    - message, sent, created_at

11. **sessions** (Supabase managed)
    - id, user_id, created_at, updated_at

**Total Records**:
- programs: 22 (target: 50+ for launch, 10K+ for Phase 3)
- user_profiles: Test users only
- Other tables: Minimal test data

---

## 3. Phase 2 Features - Post-Deployment

**Timeline**: 2 weeks post-launch  
**Priority**: High - Essential for production readiness  
**Goal**: Transform MVP into production-grade platform with offline support and comprehensive data

### 3.1 PWA Implementation (Offline-First)

**Objective**: Enable offline access, installable app experience, and improved performance

#### A. Service Worker Features

**Cache Strategies**:

1. **Cache-First** (Static Assets):
   - HTML, CSS, JavaScript files
   - Images, icons, fonts
   - Logo and branding assets
   - Max age: 7 days, revalidate in background

2. **Network-First** (Dynamic Data):
   - Programs list from Supabase
   - User profile data
   - Saved programs
   - Fallback to cache if offline (stale-while-revalidate)

3. **Network-Only** (Real-Time):
   - Authentication requests
   - Document uploads
   - AI chat requests
   - Currency conversion API

4. **Stale-While-Revalidate** (Balanced):
   - Program details
   - University information
   - Country/city data
   - Show cached, fetch update in background

**Additional Features**:
- Background sync for offline actions (save programs, create applications)
- Push notification handling (via OneSignal or similar)
- Periodic background sync (refresh program data every 24 hours if installed)
- Offline indicator in UI (banner when connection lost)

**Implementation Files**:
```
public/
├── service-worker.js (complete rewrite from placeholder)
├── manifest.json (app manifest for install)
└── offline.html (offline fallback page)

src/
├── lib/
│   ├── offline-db.ts (IndexedDB wrapper with Dexie.js)
│   ├── sync-queue.ts (offline action queue management)
│   └── sw-registration.ts (service worker registration logic)
└── components/
    ├── InstallPrompt.tsx (custom PWA install UI)
    └── OfflineIndicator.tsx (connection status banner)
```

#### B. IndexedDB Offline Database

**Schema** (using Dexie.js):
```typescript
const db = new Dexie('AkadaOfflineDB')

db.version(1).stores({
  programs: 'id, country, tuition_fee, specialization, deadline',
  saved_programs: 'id, user_id, program_id, created_at',
  user_profile: 'user_id',
  search_cache: 'query_hash, timestamp',
  sync_queue: '++id, action, timestamp, synced'
})
```

**Data to Cache**:
1. **Programs** (5,000+ programs):
   - All programs for browsing offline
   - Indexed by country, specialization, tuition range
   - Auto-sync every 24 hours when online

2. **Saved Programs**:
   - User's saved programs list
   - Sync immediately when online

3. **User Profile**:
   - Current user's profile data
   - Preferences and settings
   - Sync on every change when online

4. **Search Cache**:
   - Recently searched queries and results
   - Expire after 7 days
   - Max 100 cached searches per user

5. **Sync Queue**:
   - Actions performed offline (save program, create application)
   - Auto-sync when connection restored
   - Show sync status in UI

**Offline Capabilities**:
✅ Browse full program database (5,000+ programs)  
✅ Search and filter programs (client-side with Fuse.js)  
✅ View program details  
✅ Save programs to queue (sync when online)  
✅ View saved programs  
✅ Access user profile and settings  
❌ Cannot upload documents offline  
❌ Cannot use AI chat offline  
❌ Cannot see real-time price updates offline  

**Sync Logic**:
```typescript
// On connection restored
async function syncOfflineActions() {
  const queue = await db.sync_queue.where('synced').equals(false).toArray()
  
  for (const action of queue) {
    try {
      if (action.action === 'save_program') {
        await supabase.from('saved_programs').insert(action.data)
      } else if (action.action === 'create_application') {
        await supabase.from('applications').insert(action.data)
      }
      await db.sync_queue.update(action.id, { synced: true })
    } catch (error) {
      console.error('Sync failed:', action, error)
      // Retry later
    }
  }
}
```

#### C. Install Experience

**Smart Install Prompt**:
- Show after 2+ visits OR 5+ page views OR after saving 3+ programs
- Dismissal tracking (don't re-prompt for 7 days)
- Custom UI for iOS (Add to Home Screen guide)
- Install analytics (conversions, dismissals)

**Post-Install Onboarding**:
- Welcome screen: "You can now use Akada offline!"
- Feature tour: Offline browsing, background sync
- First-time offline mode prompt
- PWA badge in profile settings

**App Manifest** (`public/manifest.json`):
```json
{
  "name": "Akada - Study Abroad Platform",
  "short_name": "Akada",
  "description": "AI-powered platform for Nigerian students to explore international education",
  "start_url": "/app",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### D. Performance Targets

| Metric | 3G Target | 4G Target | Current |
|--------|-----------|-----------|---------|
| First Contentful Paint (FCP) | <1.5s | <0.8s | ~2.0s |
| Largest Contentful Paint (LCP) | <2.5s | <1.2s | ~2.5s |
| Time to Interactive (TTI) | <3.5s | <1.8s | ~3.0s |
| Total Blocking Time (TBT) | <300ms | <150ms | ~250ms |
| Cumulative Layout Shift (CLS) | <0.1 | <0.05 | ~0.05 |
| Cache Hit Rate | >70% | >80% | 0% |
| Offline Functionality | 100% core | 100% core | 0% |

**Optimization Strategies**:
- Lazy load all routes
- Code splitting by page
- Image optimization (WebP, lazy loading)
- Font preloading (Open Sans, Inter)
- CSS minification and purging
- JavaScript tree shaking
- Service worker precaching for critical assets

### 3.2 Enhanced School Details System

**Objective**: Provide comprehensive university and program information with rich context

#### A. New Database Tables (5 tables)

**1. universities** (20+ fields):
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

**2. countries** (25+ fields):
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

**3. cities** (15+ fields):
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

**4. application_guides** (12+ fields):
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

**5. scholarship_opportunities** (12+ fields):
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

#### B. New Pages & Features

**University Detail Page** (`/universities/:id`):
- **Tab 1: Overview**: University stats, description, rankings, campus info
- **Tab 2: Programs & Courses**: Searchable list of all programs offered
- **Tab 3: Location & Living Costs**: City information and cost breakdown
- **Tab 4: Visa & Immigration**: Country-specific requirements and timeline
- **Tab 5: How to Apply**: Step-by-step application process guide
- **Tab 6: Scholarships & Aid**: Available funding opportunities

**Enhanced Program Detail Page** (`/programs/:id`):
- **Section 1: Program Overview**: Name, degree type, duration, tuition details
- **Section 2: Requirements**: Entry requirements, language tests, standardized tests
- **Section 3: Tuition & Costs**: Detailed cost breakdown with city context
- **Section 4: Location & University**: Embedded university information and location
- **Section 5: Application Process**: Timeline, required documents, process steps
- **Section 6: Similar Programs**: AI-recommended alternatives

#### C. Migration Strategy

**Data Migration Steps**:
1. Extract universities from existing `programs` table
2. Populate `countries` table with visa/work permit data from official sources
3. Create cities from program locations and populate with cost data
4. Generate application guides (manual + AI-assisted content creation)
5. Seed scholarship database from university websites and government sources

### 3.3 Institution Pages & Course Catalog System

**Objective**: Provide comprehensive university information with detailed course catalogs and program comparison features

**Timeline**: 6 sprints (~56 hours total)
**Priority**: High - Core feature for program discovery
**Goal**: Full institution exploration with course-level details and comparison capabilities

#### A. New Database Tables (5 tables)

**1. courses** (Course definitions, reusable across programs):
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code VARCHAR(20) NOT NULL,        -- "CS601"
  course_name TEXT NOT NULL,               -- "Advanced Algorithms"
  description TEXT,                        -- Course overview
  credits INTEGER NOT NULL,                -- 15
  syllabus_topics TEXT[],                  -- ["Complexity", "Graph Algorithms"]
  assessment_breakdown JSONB,              -- {"exam": 60, "coursework": 40}
  prerequisites TEXT[],                    -- ["Linear Algebra", "CS101"]
  learning_outcomes TEXT[],                -- What students will learn
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. program_courses** (Links programs to courses with context):
```sql
CREATE TABLE program_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,                   -- 1, 2 (for 2-year programs)
  semester INTEGER NOT NULL,               -- 1, 2, 3
  is_required BOOLEAN DEFAULT true,        -- Required vs elective
  course_order INTEGER,                    -- Display order
  UNIQUE(program_id, course_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. alumni_testimonials** (Institution-wide testimonials with approval workflow):
```sql
CREATE TABLE alumni_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES universities(id),

  -- Testimonial content
  student_name TEXT NOT NULL,
  graduation_year INTEGER,
  degree_program TEXT,
  testimonial_text TEXT NOT NULL,

  -- Optional metadata
  student_photo_url TEXT,
  current_position TEXT,
  student_country_origin VARCHAR(3),

  -- Rating & recommendation
  rating DECIMAL(2,1),                     -- 1-5 stars
  would_recommend BOOLEAN,
  tags TEXT[],                             -- ["academics", "campus-life", "career"]

  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,

  -- Display settings
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**4. program_scholarships** (Program-specific scholarship opportunities):
```sql
CREATE TABLE program_scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id),
  university_id UUID REFERENCES universities(id),

  scholarship_name TEXT NOT NULL,
  provider TEXT,
  type TEXT CHECK (type IN ('full', 'partial', 'tuition-waiver', 'stipend')),

  amount_min_usd DECIMAL(10,2),
  amount_max_usd DECIMAL(10,2),
  coverage TEXT[],                         -- ["Tuition", "Living costs", "Travel"]

  -- Eligibility
  eligible_countries TEXT[],
  min_gpa DECIMAL(3,2),
  requirements TEXT[],

  application_deadline DATE,
  application_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**5. program_comparisons** (User's saved program comparisons):
```sql
CREATE TABLE program_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  program_ids UUID[] NOT NULL,             -- Array of max 3 program IDs
  comparison_name TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### B. Enhanced Programs Table

**New columns added to existing `programs` table**:
```sql
ALTER TABLE programs ADD COLUMN
  university_id UUID REFERENCES universities(id),
  city_id UUID REFERENCES cities(id),
  program_url TEXT,                        -- Official program page
  application_deadlines JSONB,             -- [{"intake": "Fall 2025", "deadline": "2025-01-15"}]
  intake_periods TEXT[],                   -- ["Fall", "Spring"] or ["January", "September"]
  min_gpa DECIMAL(3,2),
  language_requirements JSONB,             -- {"IELTS": 6.5, "TOEFL": 90}
  required_documents TEXT[];               -- ["Transcripts", "SOP", "LORs"]
```

**JSONB Structure for Application Deadlines**:
```json
[
  {
    "intake": "Fall 2025",
    "deadline": "2025-01-15",
    "type": "season"
  },
  {
    "intake": "September 2025",
    "deadline": "2025-06-30",
    "type": "month"
  }
]
```
*Note: Supports both seasonal (Fall/Spring/Summer) and month-based intake systems to handle international variance*

#### C. New Pages & Components

**InstitutionPage** (`/app/institutions/:id`):

**6 Section Tabs**:
1. **Overview**: About, history, mission, description
2. **Statistics**: Rankings (world, national), demographics (total students, international students), acceptance rates
3. **Programs**: All programs offered on Akada (filterable by degree type, field)
4. **Location & Campus**: City information, campus details, student life
5. **Alumni Testimonials**: Approved testimonials with ratings, tags, recommendations
6. **Admissions & Scholarships**: General admissions info, university-wide scholarships

**6 Reusable Institution Components**:
- `InstitutionHeader.tsx` - Logo, name, rankings, basic stats
- `InstitutionOverview.tsx` - About section, description, accreditations
- `InstitutionStats.tsx` - Rankings, demographics, acceptance rate visualization
- `InstitutionPrograms.tsx` - Searchable program list from this institution
- `InstitutionAlumni.tsx` - Testimonial display with filtering by tags
- `InstitutionLocation.tsx` - Campus info, city context

**Enhanced ProgramDetailPage** (expanded from 6 to 9 sections):

**9 Section Tabs**:
1. **Overview**: Program basics + embedded InstitutionCard component
2. **Requirements**: Entry requirements + course prerequisites from catalog
3. **Curriculum** *(NEW)*: Full course catalog display grouped by year/semester
4. **Scholarships** *(NEW)*: Program-specific scholarship opportunities
5. **Costs**: Cost calculator (existing, already comprehensive)
6. **Location**: University location and city details (existing)
7. **Application**: Enhanced with intake periods, deadlines (JSONB), required documents, program URL
8. **Alumni Stories** *(NEW)*: Filtered testimonials from this institution
9. **Similar Programs**: Query logic based on degree_type, country, tuition range

**Shared Components** (reusable across pages):
- `CourseCard.tsx` - Individual course display with code, credits, topics
- `CourseList.tsx` - Grouped by year/semester, required vs elective badges
- `ScholarshipCard.tsx` - Scholarship info with eligibility, deadlines
- `TestimonialCard.tsx` - Alumni story with photo, rating, position

**Compare Programs Feature**:

**ProgramComparisonPage** (`/app/compare`):
- **Selection Method**: Checkbox on each ProgramCard in search results
- **UI Component**: Sticky bottom bar showing selected programs (max 3)
- **Comparison View**: Grid layout for side-by-side comparison
- **Compare Attributes**: Tuition, location, requirements, curriculum, scholarships, deadlines
- **Persistence**: Saved to `program_comparisons` table (all users authenticated)
- **Sharing**: Generate shareable URL with program IDs

**ProgramSearchPage Updates**:
- Add `ProgramCompareCheckbox.tsx` to each card
- Add `ComparisonStickyBar.tsx` when 2+ programs selected
- "Compare Now" button navigates to `/app/compare`

#### D. Implementation Roadmap (6 Sprints)

**Sprint 1: Foundation** (~13 hours)
- Create database migration with 5 new tables
- Add RLS policies
- Update TypeScript types
- Seed minimal sample data (courses, testimonials, scholarships)
- Create all Supabase query functions

**Sprint 2: Components** (~13 hours)
- Build 6 Institution components
- Build 4 shared components (Course, Scholarship, Testimonial cards)
- Build 2 comparison components (Checkbox, StickyBar)

**Sprint 3: InstitutionPage** (~4.75 hours)
- Create InstitutionPage with 6 sections
- Add routing `/app/institutions/:id`
- Link from ProgramCards to InstitutionPage
- Test institution page functionality

**Sprint 4: Enhanced ProgramDetailPage** (~9.5 hours)
- Add Curriculum section (course catalog display)
- Add Scholarships section (program-specific)
- Add Alumni Stories section (filtered testimonials)
- Enhance Overview with InstitutionCard embed
- Enhance Application section (deadlines JSONB, intake periods, program URL)
- Implement Similar Programs query logic

**Sprint 5: Comparison Feature** (~11.25 hours)
- Build ProgramComparisonPage with grid layout
- Add comparison checkboxes to ProgramSearchPage
- Add ComparisonStickyBar
- Implement comparison persistence
- Add routing `/app/compare`

**Sprint 6: Polish & Testing** (~4.5 hours)
- Update navigation menu
- End-to-end user flow testing
- Bug fixes and polish
- Production deployment

**Total Estimated Time**: ~56 hours across 6 sprints

#### E. Alumni Testimonial Submission Form (Feature Vault)

**Scope**: Post-MVP feature
**Location**: Public landing page (unauthenticated access)
**Workflow**:
1. Alumni submits testimonial via public form
2. Testimonial saved with `status='pending'`
3. Admin reviews in Retool interface
4. Admin changes status to `approved` or `rejected`
5. Approved testimonials display on InstitutionPage and ProgramDetailPage

**Form Fields**:
- University selection
- Student name, graduation year, degree program
- Testimonial text (max 500 words)
- Optional: Photo upload, current position, rating, would_recommend
- Tags selection (academics, campus-life, career, facilities, etc.)

#### F. Data Architecture Decisions

**Why Relational Course Catalog (vs JSONB)**:
- ✅ Courses reusable across multiple programs
- ✅ Searchable and filterable by course attributes
- ✅ Can track prerequisites and course relationships
- ✅ Enables "similar programs" based on shared courses
- ✅ Better data integrity and validation

**Why Institution-Wide Testimonials (vs Program-Specific)**:
- ✅ Alumni experience spans entire institution
- ✅ Reduces duplicate data (same testimonial for multiple programs)
- ✅ Easier to filter and display across different contexts
- ✅ Simpler approval workflow

**Why Both Program & University Scholarships**:
- ✅ Some scholarships are university-wide (any program)
- ✅ Some scholarships are program-specific (e.g., "CS Master's Excellence Award")
- ✅ Flexible schema supports both via optional foreign keys

**Why Database Persistence for Comparisons**:
- ✅ All users authenticated (no need for localStorage hybrid)
- ✅ Cross-device access to saved comparisons
- ✅ Shareable comparison URLs
- ✅ Analytics on popular comparisons
- ✅ User can save multiple comparison sets

#### G. Key User Journeys

**Journey 1: Program-First Discovery (Primary)**
1. User searches programs → Finds "MSc Computer Science"
2. Clicks program → ProgramDetailPage (9 sections)
3. Views Curriculum section → Sees full course catalog
4. Views embedded InstitutionCard in Overview
5. Clicks "View University Details" → InstitutionPage
6. Explores other programs from same university

**Journey 2: Institution-First Discovery (Secondary)**
1. User clicks university name in ProgramCard
2. Lands on InstitutionPage
3. Explores 6 sections (Overview, Stats, Programs, Location, Alumni, Admissions)
4. Clicks specific program → ProgramDetailPage

**Journey 3: Program Comparison**
1. User searches programs on ProgramSearchPage
2. Clicks checkbox on 3 programs of interest
3. Sticky bar appears at bottom showing selections
4. Clicks "Compare Now" → `/app/compare`
5. Views side-by-side grid comparison
6. Saves comparison for later (database persistence)

#### H. Risk Mitigation Strategies

**Risk 1: Course Catalog Data Complexity**
- Mitigation: Use placeholder courses for testing, n8n scraper for production data

**Risk 2: Intake Periods JSONB Variance**
- Mitigation: Flexible JSONB schema supports both seasons and months

**Risk 3: Course Prerequisites Display**
- Mitigation: Start simple (text array), add graph visualization in Phase 3

**Risk 4: Comparison Page Performance**
- Mitigation: Use Supabase joins for single query, lazy load non-critical data

**Risk 5: Mobile Responsive Comparison Grid**
- Mitigation: Vertical stack on mobile, grid on desktop (mobile-first design)

### 3.4 Multi-Country Cost Calculator Enhancement

**Objective**: Provide accurate cost estimates for students from 10 African countries

**From**: `cost-calculator-enhancement.plan.md` (397 lines)

#### A. New Database Tables (4 tables)

**1. african_countries**:
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

**2. flight_routes**:
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

#### B. Enhanced Cost Categories

**1. Pre-Arrival Costs** (one-time):
- Visa application fee
- Biometrics fee
- Medical examinations (TB test, vaccinations)
- Language proficiency tests (IELTS/TOEFL/PTE)
- Document attestation/notarization
- Background checks/police clearance
- Initial flight ticket

**2. Initial Setup Costs** (one-time, first month):
- Security deposit (accommodation)
- Furniture & household items
- Initial groceries & essentials
- SIM card & utilities setup
- First semester textbooks
- Kitchen essentials
- Bedding & linens

**3. Recurring Costs** (monthly/annual):
- Tuition fees (annual)
- Accommodation (monthly)
- Food & groceries (monthly)
- Local transport (monthly)
- Utilities (monthly)
- Phone & internet (monthly)
- Health insurance (annual)
- Entertainment (monthly)
- Annual return flights

**4. Emergency Buffer**: 10% of total costs

#### C. New Features

**Enhanced User Experience**:
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

---

## 4. Phase 3 Features - Advanced

**Timeline**: 4-8 weeks post-Phase 2  
**Priority**: Medium - Scalability and automation  
**Goal**: Automated data management and comprehensive user engagement

### 4.1 AI-Powered Auto-Scraping Agent

**Objective**: Automatically populate database when users search for schools not yet in system

#### A. Workflow (10 steps)

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

#### B. Architecture Components

**1. Scraping Engine**: Playwright/Puppeteer for dynamic sites
**2. AI Extraction**: GPT-4 Vision for PDFs, images, complex layouts
**3. Data Validation**: Multi-source verification (require 2+ sources)
**4. Structured Output**: JSON schema enforcement
**5. Quality Scoring**: 0-100% confidence with detailed reasoning
**6. Job Queue**: BullMQ for distributed processing
**7. Retry Logic**: 3 attempts with exponential backoff
**8. Rate Limiting**: Respects robots.txt, max 1 req/sec per domain

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

### 4.2 Self-Updating Database System

**Objective**: Automatically refresh stale data to maintain accuracy

#### A. Update Schedules

| Data Type | Frequency | Method |
|-----------|-----------|--------|
| Currency rates | Every 6 hours | Fixer.io API (already implemented) |
| Program tuition | Monthly | AI agent + web scraping |
| Application deadlines | Weekly | University websites |
| Scholarship availability | Daily | Scholarship portals |
| Cost of living | Quarterly | Numbeo API |
| Visa requirements | On-demand | Government announcements |

#### B. Update Process (7 steps)

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

### 4.3 Comprehensive Notification System

**Objective**: Keep users informed via multiple channels

#### A. Build vs Buy Decision

- **Phase 1**: Use OneSignal (free tier: 10K users)
- **Phase 2+**: Evaluate custom build if costs exceed $500/month
- **Enterprise**: Migrate to AWS SNS for full control

#### B. Notification Types (40+ across 7 categories)

**1. Onboarding & Engagement** (6 types):
- Welcome message after signup
- Profile completion reminders
- Feature discovery tips
- Abandoned profile nudge
- App install prompt
- First search congratulations

**2. Program Discovery** (8 types):
- New programs matching preferences
- Price changes on saved programs (>5%)
- School added after search request
- Similar program recommendations
- Deadline approaching (saved programs)
- Popular programs this week
- Programs in price range
- Late application opportunities

**3. Application Management** (10 types):
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

**4. Financial Planning** (6 types):
- Currency rate change alert (>5%)
- Scholarship deadlines
- New scholarship matching profile
- Funding opportunities
- Cost estimate update
- Financial aid reminder

**5. Community & Support** (5 types):
- New message from counselor
- Discussion reply
- Question answered
- Peer success story
- Study buddy request

**6. System & Account** (7 types):
- Password reset
- Security alert (new device)
- Payment confirmation
- Subscription renewal
- Feature update
- Maintenance notice
- Account verification

**7. AI & Automation** (6 types):
- Document review completed
- Essay feedback ready
- AI research results
- Personalized recommendation
- Application checklist generated
- School data update complete

#### C. Delivery Channels

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

---

## 5. Database Architecture

### Complete ERD (Entity Relationship Diagram)

**Current Tables** (11):
- user_profiles, user_preferences, programs, applications, documents
- saved_programs, chat_logs, country_estimates, reminder_system
- sessions, auth.users

**Phase 2 Additions** (10):
- universities, countries, cities, application_guides, scholarship_opportunities
- courses, program_courses, alumni_testimonials, program_scholarships, program_comparisons

**Phase 3 Additions** (4):
- african_countries, flight_routes, database_update_logs, notification_preferences

**Cost Calculator Integration**:
- city_living_costs (integrated into cities table)
- country_visa_requirements (integrated into countries table)

**Total Tables**: 25+ tables

### Key Relationships

```
universities (1) ←→ (many) programs
universities (1) ←→ (many) alumni_testimonials
universities (1) ←→ (many) application_guides
universities (1) ←→ (many) program_scholarships

countries (1) ←→ (many) cities
countries (1) ←→ (many) application_guides

programs (1) ←→ (many) program_courses
programs (1) ←→ (many) saved_programs
programs (1) ←→ (many) applications
programs (1) ←→ (many) program_scholarships

courses (1) ←→ (many) program_courses
courses (many) ←→ (many) programs (via program_courses)

user_profiles (1) ←→ (many) saved_programs
user_profiles (1) ←→ (many) applications
user_profiles (1) ←→ (many) documents
user_profiles (1) ←→ (many) program_comparisons
user_profiles (1) ←→ (1) user_preferences
```

**Security & Policies**:
- All tables have Row Level Security (RLS) enabled
- Performance indexes on foreign keys and search fields
- Audit trail with `created_at`, `updated_at` on all tables

---

## 6. Technical Specifications

### Performance Requirements

| Metric | Target | Current |
|--------|--------|---------|
| Load time (3G) | <3s | ~2.5s |
| Load time (4G) | <1.5s | ~2.0s |
| API response (p95) | <200ms | ~200ms |
| Database queries (p95) | <150ms | ~180ms |
| Cache hit rate | >75% | 0% |
| Offline functionality | 100% core | 0% |

### Security & Compliance

- **GDPR Compliant**: Data encryption (at rest, in transit)
- **Authentication**: RLS policies on all tables
- **Rate Limiting**: 10 req/sec per user
- **Input Validation**: XSS/CSRF protection
- **Content Security**: Security headers and CSP

### Accessibility

- **WCAG 2.1 AA compliance**
- Screen reader support with ARIA labels
- Keyboard navigation for all interactive elements
- High contrast mode support
- 4.5:1 color contrast minimum
- Focus indicators visible

### Scalability Targets

- Support 100K concurrent users
- 10K programs in database (targeting 50K+ by Phase 3)
- 1M searches per month capacity
- 99.9% uptime SLA
- Disaster recovery (RTO: 1h, RPO: 5min)

---

## 7. Implementation Roadmap

### Phase 1: MVP Deployment (Current - 3 days)
- Deploy to Netlify with proper configuration
- Populate 50+ programs in database
- Onboard 10-20 Nigerian student testers
- Collect initial feedback and iterate

### Phase 2: Enhanced Features (Weeks 1-2 post-launch)
- **Week 1**: PWA implementation + Database schema enhancement
- **Week 2**: School details pages + Multi-country cost calculator

### Phase 3: Advanced Automation (Weeks 3-8 post-Phase 2)
- **Weeks 3-4**: AI auto-scraping agent development and testing
- **Weeks 5-6**: Self-updating database system implementation
- **Weeks 7-8**: Comprehensive notification system integration

### Phase 4: Expansion (Months 3-6)
- Multi-country African expansion (10 countries with full localization)
- Community features and forums
- Premium tier features and monetization
- Mobile native apps (leveraging PWA foundation)

---

## 8. Success Metrics & KPIs

### User Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| User acquisition | 10K users | 6 months |
| Profile completion | 70% activation rate | Ongoing |
| Engagement | 5+ sessions/week | Active users |
| Retention | 60% D30 retention | Monthly |
| PWA install rate | 35% of users | Post-Phase 2 |

### Product Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Program database | 10K programs | 12 months |
| Search success rate | >90% | Ongoing |
| Auto-scraping success | >85% accuracy | Post-Phase 3 |
| Data freshness | >95% updated monthly | Ongoing |
| Notification engagement | >30% open rate | Post-Phase 3 |

### Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Premium conversion | 8% of active users | 6 months |
| Revenue per user | $5-15/month | 12 months |
| Customer acquisition cost | <$20 | Ongoing |
| Lifetime value | >$150 | 12 months |
| Churn rate | <5% monthly | Ongoing |

### Technical Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Page load time (p95) | <2s | ~2.5s |
| API response time (p95) | <150ms | ~200ms |
| Uptime | >99.9% | TBD |
| Error rate | <0.1% | TBD |
| Cache hit rate | >75% | 0% |

---

## Summary

This PRD V2.0 consolidates all existing plans and specifications into a single, actionable document:

✅ **Original MVP PRD** (src/prd.txt - 129 lines)
✅ **Current Implementation** (AKADA_PLATFORM_DOCUMENTATION.md - 1,969 lines)
✅ **Cost Calculator Plan** (cost-calculator-enhancement.plan.md - 397 lines)
✅ **School Details Plan** (school-details-system.plan.md - 602 lines)
✅ **Deployment Plan** (akada-pre-deployment-readiness.plan.md - 506 lines)
🆕 **PWA Specifications** with offline-first architecture
🆕 **AI Auto-Scraping Agent** with ethical compliance
🆕 **Self-Updating Database** with automated data maintenance
🆕 **Comprehensive Notification System** with multi-channel delivery
🆕 **Institution Pages & Course Catalog** (October 2025 brainstorming session - Section 3.3)
🆕 **Program Comparison Feature** with database persistence and 3-program grid view
🆕 **Alumni Testimonial System** with approval workflow and ratings

**Total**: This document serves as the single source of truth for Phases 2-4 development, providing actionable specifications for transforming the MVP into a production-grade platform.

**Version Updates**:
- **V2.0** (January 2025): Consolidation of all Phase 1-3 plans
- **V2.1** (October 2025): Added Institution Pages, Course Catalog, Program Comparison, Alumni Testimonials (5 new tables, 9-section ProgramDetailPage, 6-sprint roadmap)

**Next Steps**:
1. ✅ PRD V2.1 updated with institution & course catalog features
2. ⏭️ Begin Sprint 1: Database migration (5 new tables)
3. ⏭️ Follow 6-sprint roadmap to completion (~56 hours)
4. ⏭️ Expand to PRD V3.0 after Phase 2 with real user feedback


