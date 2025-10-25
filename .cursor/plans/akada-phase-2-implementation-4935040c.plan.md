<!-- 4935040c-a2f3-4170-b37a-cb589e757188 11cf3a6c-8fcc-4e6b-b38b-5e209863b88a -->
# Akada Phase 2: School Details, Cost Calculator & PWA Implementation

## Overview

4-week sprint implementing consolidated database schema, enhanced cost calculator with multi-country/flight support, Retool admin interface, n8n scraping workflows, and PWA functionality.

**Key Decisions:**

- Consolidated schema (cities, countries, flight_routes in unified tables)
- School Details FIRST (database foundation)
- Broad program scope (Nigeria + African countries, all disciplines)
- API-ready flight architecture (manual seed, API integration Phase 3)
- Retool for admin CRUD (programs, countries, cities, flights, universities)
- n8n for AI scraping workflows
- Contextual cost calculator UX (Option C)
- 2-currency display (destination + home)

---

## Week 1: School Details System (Database Foundation)

### Database Schema Design

Create consolidated tables in Supabase:

**1. Enhanced `countries` table:**

```sql
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT,
  currency_code VARCHAR(3),
  currency_symbol VARCHAR(5),
  
  -- Visa/Immigration
  visa_type TEXT,
  visa_fee_usd DECIMAL(10,2),
  visa_processing_days INTEGER,
  requires_biometrics BOOLEAN,
  requires_medical BOOLEAN,
  language_requirements TEXT,
  work_permit_hours_weekly INTEGER,
  post_study_work_duration TEXT,
  
  -- Living costs
  avg_living_cost_monthly_usd DECIMAL(10,2),
  living_cost_min_usd DECIMAL(10,2),
  living_cost_max_usd DECIMAL(10,2),
  healthcare_cost_monthly_usd DECIMAL(10,2),
  
  -- Country info
  climate TEXT,
  timezone TEXT,
  safety_index DECIMAL(5,2),
  is_origin_country BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. Enhanced `cities` table:**

```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code VARCHAR(3) REFERENCES countries(country_code),
  tier TEXT CHECK (tier IN ('major', 'mid', 'small')),
  
  -- Demographics
  population INTEGER,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  
  -- Living costs (monthly, local currency)
  accommodation_min DECIMAL(10,2),
  accommodation_max DECIMAL(10,2),
  food_monthly DECIMAL(10,2),
  transport_monthly DECIMAL(10,2),
  utilities_monthly DECIMAL(10,2),
  entertainment_monthly DECIMAL(10,2),
  currency_code VARCHAR(3) NOT NULL,
  
  -- City info
  climate TEXT,
  public_transport_quality TEXT CHECK (public_transport_quality IN ('excellent', 'good', 'fair', 'poor')),
  student_friendly_rating DECIMAL(3,1),
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. New `universities` table:**

```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code VARCHAR(3) REFERENCES countries(country_code),
  city_id UUID REFERENCES cities(id),
  
  -- Basic info
  type TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  founded_year INTEGER,
  
  -- Rankings
  ranking_world INTEGER,
  ranking_national INTEGER,
  
  -- Students
  total_students INTEGER,
  international_students INTEGER,
  acceptance_rate DECIMAL(5,2),
  
  -- Metadata
  accreditations TEXT[],
  contact_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**4. New `flight_routes` table (API-ready):**

```sql
CREATE TABLE flight_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_country_code VARCHAR(3) REFERENCES countries(country_code),
  destination_country_code VARCHAR(3) REFERENCES countries(country_code),
  
  -- Cost data
  avg_economy_cost DECIMAL(10,2) NOT NULL,
  avg_business_cost DECIMAL(10,2),
  currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Metadata (API-ready architecture)
  data_source TEXT NOT NULL CHECK (data_source IN ('manual', 'skyscanner_api', 'amadeus_api', 'google_flights', 'user_reported')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  api_provider TEXT,
  api_route_id TEXT,
  real_time_available BOOLEAN DEFAULT false,
  
  -- Flight details
  peak_season_multiplier DECIMAL(4,2) DEFAULT 1.3,
  typical_layovers INTEGER DEFAULT 1,
  avg_flight_duration_hours INTEGER,
  budget_airline_available BOOLEAN DEFAULT false,
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(origin_country_code, destination_country_code, data_source)
);

CREATE INDEX idx_flight_routes_lookup ON flight_routes(origin_country_code, destination_country_code);
```

**5. New `application_guides` table:**

```sql
CREATE TABLE application_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES universities(id),
  title TEXT NOT NULL,
  overview TEXT,
  steps JSONB NOT NULL,
  required_documents TEXT[],
  application_fee_usd DECIMAL(10,2),
  typical_response_weeks INTEGER,
  tips TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**6. New `scholarship_opportunities` table:**

```sql
CREATE TABLE scholarship_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT,
  university_id UUID REFERENCES universities(id),
  country_code VARCHAR(3) REFERENCES countries(country_code),
  
  -- Funding details
  type TEXT CHECK (type IN ('full', 'partial', 'tuition-waiver', 'stipend')),
  amount_min_usd DECIMAL(10,2),
  amount_max_usd DECIMAL(10,2),
  coverage TEXT[],
  
  -- Eligibility
  eligible_countries TEXT[],
  requirements TEXT[],
  application_deadline DATE,
  website TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**7. Update `programs` table:**

```sql
ALTER TABLE programs ADD COLUMN university_id UUID REFERENCES universities(id);
ALTER TABLE programs ADD COLUMN city_id UUID REFERENCES cities(id);
```

### Migration Script

Create `supabase/migrations/YYYYMMDD_phase2_consolidated_schema.sql`:

- Create all 6 new tables
- Add RLS policies for all tables
- Create indexes for performance
- Seed initial data (10 African countries, 5 destination countries, 20 cities, 30 flight routes)

### Backend Queries & Services

**Create `src/lib/supabase/queries/universities.ts`:**

```typescript
export async function getUniversityWithDetails(id: string) {
  return supabase
    .from('universities')
    .select(`
      *,
      city:cities(*),
      country:countries(*),
      programs(*)
    `)
    .eq('id', id)
    .single();
}
```

**Create `src/lib/supabase/queries/locations.ts`:**

```typescript
export async function getCountryInfo(countryCode: string) { /* ... */ }
export async function getCityInfo(cityId: string) { /* ... */ }
export async function getCitiesByCountry(countryCode: string) { /* ... */ }
```

**Create `src/lib/flights/service.ts` (API-ready abstraction):**

```typescript
export class FlightCostService {
  async getFlightCost(originCountry: string, destCountry: string): Promise<FlightCostResult> {
    // 1. Try database (manual + cached API)
    const cached = await this.getFromDatabase(originCountry, destCountry);
    if (cached && this.isFresh(cached)) return cached;
    
    // 2. Try API (Phase 3 - currently disabled)
    if (this.isApiEnabled()) {
      const apiResult = await this.fetchFromApi(originCountry, destCountry);
      if (apiResult) {
        await this.cacheApiResult(apiResult);
        return apiResult;
      }
    }
    
    // 3. Fallback to stale data
    if (cached) return { ...cached, isStale: true };
    
    throw new FlightDataNotFoundError();
  }
  
  private isFresh(data: FlightRoute): boolean {
    const FRESHNESS_DAYS = 30;
    return daysSinceUpdate(data.last_updated) < FRESHNESS_DAYS;
  }
  
  private isApiEnabled(): boolean {
    return import.meta.env.VITE_FLIGHT_API_ENABLED === 'true';
  }
}
```

### Retool Admin Interface Setup

Deploy Retool at `admin.akada.com` with 5 main apps:

**1. Countries Manager:**

- Table view with filters (region, active status)
- CRUD forms for all country fields
- Bulk CSV import
- Export functionality

**2. Cities Manager:**

- Table view filtered by country
- Living cost fields with currency selector
- Bulk import (CSV with validation)
- Staleness alerts (>90 days since update)

**3. Flight Routes Manager:**

- Table with origin/destination dropdowns
- Cost entry in USD (auto-convert display)
- Data source selector (manual/api)
- Staleness alerts (>30 days)
- Bulk CSV import template

**4. Universities Manager:**

- CRUD interface for university data
- Link to cities/countries
- Programs list per university
- Application guide editor

**5. Programs Manager (Enhanced):**

- Existing program CRUD
- NEW: Link to university_id
- NEW: Link to city_id
- Bulk import with university mapping

### Data Seeding Strategy

**Tier 1 (Week 1 - Launch Critical):**

- **Origin Countries (10):** Nigeria, Ghana, Kenya, South Africa, Egypt, Uganda, Tanzania, Rwanda, Ethiopia, Morocco
- **Destination Countries (5):** USA, Canada, UK, Germany, Australia
- **Cities (20):** Lagos, Accra, Nairobi; Toronto, Vancouver; London, Manchester; Berlin; Sydney, Melbourne; New York, Boston
- **Flight Routes (30):** All origin → destination combinations (10 × 5 = 50, seed top 30)
- **Universities (20):** Extract from existing programs + add top universities

**Tier 2 (Week 2-3 - Enhancement):**

- 30 more cities
- Remaining 20 flight routes
- 30 more universities
- Application guides for top 10 universities

---

## Week 2: Enhanced Cost Calculator

### Cost Calculator Architecture

**New TypeScript interfaces (`src/lib/types/cost-calculator.ts`):**

```typescript
interface EnhancedCostBreakdown {
  // User context
  homeCountry: string;
  destinationCountry: string;
  destinationCity: string;
  programId: string;
  
  // Pre-Departure (one-time)
  visaFees: number;
  medicalExams: number;
  languageTests: number;
  documentAttestation: number;
  initialFlightTicket: number;
  
  // Setup (one-time, month 1)
  securityDeposit: number;
  furniture: number;
  initialGroceries: number;
  textbooks: number;
  
  // Recurring (monthly)
  tuition: number; // annual/12
  accommodation: number;
  food: number;
  transport: number;
  utilities: number;
  phoneInternet: number;
  healthInsurance: number; // annual/12
  entertainment: number;
  
  // Annual
  annualReturnFlights: number;
  
  // Totals
  totalPreDeparture: number;
  totalSetup: number;
  totalMonthlyRecurring: number;
  totalFirstYear: number;
  emergencyFund: number; // 10%
  grandTotal: number;
  
  // Display currencies
  displayCurrency: string; // destination
  homeCurrency: string;
  exchangeRate: number;
}
```

### UI Components

**Update `src/components/CostCalculator.tsx`:**

**Step 1: Country Selection (Contextual)**

```typescript
// If user came from program page, pre-populate
const [homeCountry, setHomeCountry] = useState(
  user?.profile?.home_country || ''
);
const [destCountry, setDestCountry] = useState(
  programData?.country || ''
);
```

**Step 2: City Selection**

```typescript
const { data: cities } = useCitiesByCountry(destCountry);
// Dropdown filtered by tier
```

**Step 3: Enhanced Cost Sections**

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <Tab value="overview">Overview</Tab>
    <Tab value="pre-departure">Pre-Departure</Tab>
    <Tab value="setup">Initial Setup</Tab>
    <Tab value="recurring">Monthly Costs</Tab>
    <Tab value="timeline">Payment Timeline</Tab>
  </TabsList>
  
  <TabsContent value="overview">
    <CostSummaryCards />
    <CostDistributionChart /> {/* Recharts Pie */}
  </TabsContent>
  
  <TabsContent value="pre-departure">
    <PreDepartureCosts 
      visa={visaFees}
      medical={medicalCosts}
      flight={flightCost}
    />
  </TabsContent>
  
  {/* ... other tabs */}
</Tabs>
```

**Visualization Components:**

Install Recharts:

```bash
npm install recharts
```

Create `src/components/cost-calculator/CostCharts.tsx`:

```typescript
import { PieChart, Pie, BarChart, Bar } from 'recharts';

export function CostDistributionChart({ data }: Props) {
  const chartData = [
    { name: 'Pre-Departure', value: data.totalPreDeparture },
    { name: 'Setup', value: data.totalSetup },
    { name: 'Tuition', value: data.tuition * 12 },
    { name: 'Living', value: data.totalMonthlyRecurring * 12 },
  ];
  
  return (
    <PieChart width={400} height={300}>
      <Pie data={chartData} dataKey="value" nameKey="name" />
    </PieChart>
  );
}
```

### Multi-Currency Display

Leverage existing `useProgramTuition` hook:

```typescript
const { convertedAmount, rate } = useProgramTuition(
  costInDestCurrency,
  destCurrency,
  homeCurrency
);
```

Display format:

```
Total First Year: $45,000 CAD (≈ ₦28,125,000)
```

---

## Week 3: PWA Implementation

### Service Worker

Create `public/service-worker.js`:

```javascript
const CACHE_NAME = 'akada-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch: Cache-first for assets, network-first for data
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.url.includes('/api/') || request.url.includes('supabase')) {
    // Network-first for API calls
    event.respondWith(networkFirst(request));
  } else {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request));
  }
});
```

### IndexedDB Offline Storage

Create `src/lib/offline-db.ts`:

```typescript
import Dexie from 'dexie';

class AkadaDB extends Dexie {
  programs: Dexie.Table<Program, string>;
  savedPrograms: Dexie.Table<SavedProgram, string>;
  userProfile: Dexie.Table<UserProfile, string>;

  constructor() {
    super('AkadaDB');
    this.version(1).stores({
      programs: 'id, country, tuition_fee, specialization',
      savedPrograms: 'id, user_id, created_at',
      userProfile: 'user_id'
    });
  }
}

export const db = new AkadaDB();
```

### Install Prompt

Create `src/components/InstallPrompt.tsx`:

```typescript
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Smart timing: 2+ visits OR 5+ page views
    const visits = localStorage.getItem('visits') || 0;
    const pageViews = localStorage.getItem('pageViews') || 0;
    
    if (visits >= 2 || pageViews >= 5) {
      setShowPrompt(true);
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);
  
  const handleInstall = async () => {
    deferredPrompt?.prompt();
    const { outcome } = await deferredPrompt?.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Thanks for installing Akada!');
    }
    setShowPrompt(false);
  };
  
  return showPrompt ? (
    <Card className="fixed bottom-4 right-4">
      <CardContent>
        <p>Install Akada for offline access</p>
        <Button onClick={handleInstall}>Install</Button>
        <Button variant="ghost" onClick={() => setShowPrompt(false)}>
          Not now
        </Button>
      </CardContent>
    </Card>
  ) : null;
}
```

---

## Week 4: Testing & Polish

### Testing Strategy

**Unit Tests (`src/lib/flights/service.test.ts`):**

```typescript
describe('FlightCostService', () => {
  it('returns cached flight cost if fresh', async () => {
    const service = new FlightCostService();
    const cost = await service.getFlightCost('NGA', 'USA');
    expect(cost.cost).toBe(1350);
  });
  
  it('marks stale data appropriately', async () => {
    // Test with 35-day old data
    const cost = await service.getFlightCost('NGA', 'GBR');
    expect(cost.isStale).toBe(true);
  });
});
```

**E2E Tests:**

- Nigerian student → University of Toronto cost calculation
- Offline program search and save
- PWA install flow

### Performance Audit

Run Lighthouse on 3G:

- Target: LCP < 2.5s
- Target: FCP < 1.5s
- Target: TTI < 3.5s

### Pre-Launch Checklist

- [ ] All database migrations applied
- [ ] Retool admin fully functional
- [ ] 100+ programs seeded
- [ ] 30+ flight routes seeded
- [ ] Cost calculator tested with 5 real scenarios
- [ ] PWA installs successfully on iOS/Android
- [ ] Offline mode works for core features
- [ ] Currency conversions accurate
- [ ] Admin training completed
- [ ] User documentation updated

---

## Week 5: Enhanced Recommendations Engine & Dashboard Polish

### Enhanced Program Recommendations Engine

**Current System Analysis:**

- Existing recommendation system in `src/lib/recommendations.ts` with `calculateAdvancedMatchScore` and `fetchPersonalizedRecommendations`
- User behavior tracking via `trackUserBehavior` function
- Basic program matching implemented

**Enhanced Features to Add:**

**1. Smart Ranking Algorithm:**

```typescript
interface EnhancedRecommendationEngine {
  // AI-powered ranking based on success patterns and user behavior
  getRankedRecommendations(userId: string, limit?: number): Promise<RankedRecommendation[]>;
  
  // Study buddy matching (similar profiles analysis)
  findStudyBuddies(userId: string): Promise<StudyBuddyRecommendation[]>;
  
  // Career pathway recommendations
  suggestCareerPathways(profile: UserProfile): Promise<CareerPathway[]>;
  
  // "What if" analysis for profile changes
  analyzeProfileChanges(currentProfile: UserProfile, proposedChanges: Partial<UserProfile>): Promise<ImpactAnalysis>;
}

interface RankedRecommendation {
  program: Program;
  matchScore: number;
  confidence: number;
  reasoning: string[];
  successRate: number; // % of similar profiles who got accepted
  costBenefitScore: number;
  alternatives: Program[]; // Similar programs with different trade-offs
  studyBuddyCount?: number; // Number of similar applicants
}
```

**2. Implementation Plan:**

- **Enhance `src/lib/recommendations.ts`** with new ranking algorithms
- **Create `src/lib/recommendations/smart-ranking.ts`** for AI-powered scoring
- **Add user behavior patterns** to database for long-term learning
- **Integrate with existing `getUserRecommendations`** function

### Dashboard Widget Fixes

**Critical Issues Found:**

**1. Hardcoded Data in `src/components/Dashboard.tsx`:**

- Lines 28-65: `recommendedPrograms` array (hardcoded)
- Lines 67-83: `activeApplications` array (hardcoded)
- Lines 86-101: `progressStats` array (hardcoded)
- Lines 103-128: `tasksToComplete` array (hardcoded)

**2. Fix Plan:**

**Replace `src/components/Dashboard.tsx` hardcoded data:**

```typescript
// BEFORE (hardcoded):
const recommendedPrograms = [
  {
    id: '1',
    name: 'Master of Science in Computer Science',
    // ... hardcoded data
  }
];

// AFTER (real API calls):
const { data: recommendedPrograms, loading: programsLoading } = usePersonalizedPrograms(5);
const { data: activeApplications, loading: applicationsLoading } = useUserApplications();
const { data: progressStats, loading: statsLoading } = useUserProgressStats();
const { data: tasksToComplete, loading: tasksLoading } = useUserTasks();
```

**3. Create New Hooks:**

```typescript
// src/hooks/useUserApplications.ts
export function useUserApplications() {
  // Real API calls to get user's application data
}

// src/hooks/useUserProgressStats.ts  
export function useUserProgressStats() {
  // Real calculations based on user profile completion, applications, etc.
}

// src/hooks/useUserTasks.ts
export function useUserTasks() {
  // Real task generation based on user's current state and deadlines
}
```

**4. Enhanced Next Best Action Logic:**

```typescript
interface NextBestActionService {
  getNextBestAction(userId: string): Promise<NextBestAction>;
}

interface NextBestAction {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'profile' | 'application' | 'deadline' | 'budget' | 'document';
  actionUrl: string;
  estimatedTime: string;
  impactScore: number; // 1-10 how much this helps user's goals
}
```

### Premium Features Foundation

**Setup for Premium Subscription Model:**

**1. Feature Flag System:**

```typescript
interface PremiumFeatures {
  unlimitedRecommendations: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  aiDocumentReview: boolean;
  studyBuddyMatching: boolean;
  careerPathwayAnalysis: boolean;
}
```

**2. Subscription Tiers:**

- **Basic**: ₦2,000/month - Core features + 5 AI reviews/month
- **Premium**: ₦5,000/month - All features + unlimited AI reviews + priority support

### Amara AI Assistant Enhancement

**Current System Analysis:**

- Existing AI chat in `src/lib/chat.ts` using Gemini with contextual responses
- Components: `ChatButton.tsx`, `ChatAssistant.tsx`, `AIAssistant.tsx`
- Basic contextual awareness through user profile and preferences

**Enhanced Features to Add:**

**1. Phase 2 Feature Integration:**

```typescript
interface AmaraEnhancedContext {
  // New database awareness
  getUniversityDetails(universityId: string): Promise<UniversityWithDetails>;
  getCityLivingCosts(cityId: string): Promise<CityInfo>;
  getCountryVisaInfo(countryCode: string): Promise<CountryInfo>;
  getFlightRoutes(origin: string, destination: string): Promise<FlightRoute[]>;
  
  // Enhanced conversation context
  enrichWithProgramContext(message: string, programId?: string): Promise<EnrichedContext>;
  enrichWithUserJourney(userId: string, message: string): Promise<UserJourneyContext>;
}
```

**2. Cost Calculator Intelligence:**

```typescript
interface AmaraCostIntelligence {
  // Explain cost breakdowns
  explainCostBreakdown(costData: EnhancedCostBreakdown): string;
  
  // Suggest optimizations
  suggestCostOptimization(userId: string, programId: string): Promise<OptimizationTip[]>;
  
  // Compare costs across programs
  compareProgramCosts(programIds: string[], userId: string): Promise<CostComparison>;
}

interface OptimizationTip {
  category: 'accommodation' | 'transport' | 'food' | 'utilities';
  suggestion: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

**3. School-Specific Guidance:**

```typescript
interface AmaraSchoolGuidance {
  // University-specific advice
  getApplicationTips(universityId: string, programId: string): Promise<ApplicationTip[]>;
  
  // City-specific living guidance
  getCityLivingGuidance(cityId: string, userId: string): Promise<LivingGuidance>;
  
  // Visa and immigration assistance
  getVisaGuidance(userId: string, destinationCountry: string): Promise<VisaGuidance>;
}
```

**4. Enhanced Conversation Capabilities:**

```typescript
interface AmaraEnhancedConversation {
  // Timeline generation
  generatePersonalizedTimeline(userId: string, programId: string): Promise<ApplicationTimeline>;
  
  // Document review integration
  analyzeUserDocuments(userId: string, documentType: string): Promise<DocumentAnalysis>;
  
  // Proactive assistance
  suggestNextActions(userId: string): Promise<NextAction[]>;
}
```

**5. Implementation Plan:**

Create `src/lib/amara/enhanced-context.ts`:

- Integrate with new `universities`, `cities`, `countries`, `flight_routes` tables
- Add contextual awareness for cost calculator data
- Enhance existing `createContextualResponse` function

Update `src/components/ChatButton.tsx`:

- Add context enrichment based on current page/feature
- Integrate with cost calculator for real-time assistance
- Add university/city-specific quick actions

Create `src/lib/amara/cost-intelligence.ts`:

- Cost breakdown explanation service
- Optimization suggestion engine
- Program cost comparison tools

---

## n8n Integration (Parallel Setup)

### Deploy n8n on Railway

1. Create Railway project
2. Deploy n8n Docker image
3. Set environment variables
4. Access at `n8n.akada.com`

### Create Scraping Workflow

**Workflow: "School Request Handler"**

Nodes:

1. Webhook Trigger (`/webhook/scrape-school`)
2. HTTP Request (fetch university website)
3. OpenAI Node (extract data with GPT-4o)
4. Code Node (validate & score confidence)
5. Switch Node (route by confidence score)

6a. Supabase Insert (auto-approve if >85%)

6b. Webhook to Admin (manual review if <85%)

7. Notify User (webhook back to Akada)

### Akada Integration

Create `src/lib/n8n/client.ts`:

```typescript
export async function requestSchoolScraping(schoolName: string, userId: string) {
  await fetch('https://n8n.akada.com/webhook/scrape-school', {
    method: 'POST',
    body: JSON.stringify({ school_name: schoolName, user_id: userId })
  });
  
  toast.success(`Adding ${schoolName}! We'll notify you when ready (5-10 min).`);
}
```

Add to search results:

```tsx
{!programsFound && (
  <Button onClick={() => requestSchoolScraping(searchQuery, user.id)}>
    Request "{searchQuery}" to be added
  </Button>
)}
```

---

## Files to Create/Modify

### Migrations (new)

- `supabase/migrations/YYYYMMDD_create_consolidated_schema.sql`

### Queries (new)

- `src/lib/supabase/queries/universities.ts`
- `src/lib/supabase/queries/locations.ts`
- `src/lib/supabase/queries/flights.ts`

### Services (new)

- `src/lib/flights/service.ts`
- `src/lib/offline-db.ts`
- `src/lib/n8n/client.ts`

### Week 5 Services (new)

- `src/lib/recommendations/smart-ranking.ts`
- `src/lib/next-best-action-service.ts`
- `src/hooks/useUserApplications.ts`
- `src/hooks/useUserProgressStats.ts`
- `src/hooks/useUserTasks.ts`

### Amara AI Enhancement Services (new)

- `src/lib/amara/enhanced-context.ts`
- `src/lib/amara/cost-intelligence.ts`
- `src/lib/amara/school-guidance.ts`

### Components (new)

- `src/components/cost-calculator/CostCharts.tsx`
- `src/components/cost-calculator/PreDepartureCosts.tsx`
- `src/components/InstallPrompt.tsx`

### Components (modify)

- `src/components/CostCalculator.tsx` (major overhaul)
- `src/components/ProgramSearch.tsx` (add "Request School" button)

### Week 5 Components (modify)

- `src/components/Dashboard.tsx` (replace hardcoded data with real API calls)
- `src/lib/recommendations.ts` (enhance with smart ranking algorithms)

### Amara AI Enhancement Components (modify)

- `src/components/ChatButton.tsx` (add Phase 2 feature integration and enhanced context awareness)
- `src/lib/chat.ts` (enhance existing contextual response system with new database tables)

### Public (new)

- `public/service-worker.js`
- `public/offline.html`

### Dependencies

```bash
npm install recharts dexie
```

### Week 5 To-dos (Enhanced Recommendations & Dashboard Polish)

- [ ] **Enhanced Recommendations Engine**: Upgrade existing `src/lib/recommendations.ts` with AI-powered ranking algorithms, study buddy matching, and career pathway suggestions
- [ ] **Amara AI Assistant Enhancement**: Integrate Amara with new Phase 2 features - add contextual awareness for school details, cost calculator assistance, and enhanced conversation capabilities using new database tables
- [ ] **Amara Contextual Integration**: Create `src/lib/amara/enhanced-context.ts` to integrate with new universities, cities, countries, and flight_routes database tables
- [ ] **Amara Cost Intelligence**: Build `src/lib/amara/cost-intelligence.ts` for cost breakdown explanations, optimization suggestions, and program cost comparisons
- [ ] **Amara School Guidance**: Develop `src/lib/amara/school-guidance.ts` for university-specific application tips, city living guidance, and visa assistance
- [ ] **ChatButton Enhancement**: Update `src/components/ChatButton.tsx` to add context enrichment based on current page/feature and integrate with cost calculator for real-time assistance
- [ ] **Dashboard Widget Fixes**: Replace hardcoded data in `src/components/Dashboard.tsx` lines 28-128 (recommendedPrograms, activeApplications, progressStats, tasksToComplete) with real API calls
- [ ] **Create Real Data Hooks**: Build `useUserApplications`, `useUserProgressStats`, and `useUserTasks` hooks to replace hardcoded dashboard data
- [ ] **Enhanced Next Best Action**: Implement smart `NextBestActionService` with AI-powered recommendations based on user context and deadlines
- [ ] **Premium Features Foundation**: Set up feature flag system and subscription tiers (Basic ₦2,000/month, Premium ₦5,000/month) for revenue generation
- [ ] **Study Buddy Matching**: Implement similar profile analysis to connect users with comparable academic backgrounds and goals
- [ ] **Career Pathway Analysis**: Build system to suggest programs based on long-term career goals and success patterns
- [ ] **User Behavior Analytics**: Enhance `trackUserBehavior` function to capture more detailed interaction patterns for better recommendations

### To-dos

- [ ] Create consolidated database schema migration with 6 new tables (universities, countries, cities, flight_routes, application_guides, scholarships) and update programs table
- [ ] Seed Tier 1 data: 10 African countries, 5 destination countries, 20 cities, 30 flight routes, 20 universities
- [ ] Create Supabase query functions for universities, locations, and flights with proper TypeScript types
- [ ] Build FlightCostService with API-ready abstraction layer (manual data now, API-ready for Phase 3)
- [ ] Deploy Retool admin at admin.akada.com with 5 apps: Countries, Cities, Flight Routes, Universities, Enhanced Programs managers
- [ ] Create CSV bulk import functionality in Retool for countries, cities, and flight routes with validation
- [ ] Redesign CostCalculator.tsx with contextual country/city selection, tabbed interface, and enhanced cost sections
- [ ] Add Recharts visualizations: pie chart (cost distribution), bar chart (one-time vs recurring), timeline view
- [ ] Implement 2-currency display (destination + home) throughout cost calculator using existing useProgramTuition hook
- [ ] Create service worker with cache-first for assets, network-first for data, and offline fallback
- [ ] Implement IndexedDB offline storage for programs, saved programs, and user profile using Dexie
- [ ] Build smart install prompt component with timing logic (2+ visits OR 5+ page views)
- [ ] Deploy n8n on Railway at n8n.akada.com and create school scraping workflow with OpenAI + Supabase integration
- [ ] Create n8n client in Akada app and add 'Request School' button to search results for missing programs
- [ ] Write unit tests for FlightCostService, cost calculations, and currency conversions
- [ ] Create E2E tests for complete user flows: search → program view → cost calculation → save
- [ ] Run Lighthouse audits on 3G, optimize to achieve LCP < 2.5s, FCP < 1.5s, TTI < 3.5s
- [ ] Conduct WCAG 2.1 AA accessibility audit and fix issues (keyboard nav, screen readers, color contrast)
- [ ] Update admin guide with Retool instructions, create user guide for new features, document n8n workflows
- [ ] Seed additional programs to reach 100+ total, covering Nigeria and African countries, broad disciplines beyond tech