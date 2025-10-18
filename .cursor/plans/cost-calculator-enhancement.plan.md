# Cost Calculator Enhancement Plan - Multi-Country African Focus

## Overview
Redesign the existing Cost Calculator to provide industry-standard, comprehensive cost estimation for students from African countries planning to study abroad. The calculator will support multiple African home countries and provide accurate, city-specific costs for destination countries.

## Phase 1: Enhanced Cost Categories & Data Structure

### New Cost Categories to Add:

#### 1. Air Travel Costs
- **Round-trip ticket** (home country to destination)
- **Annual return trips** (holidays, emergencies)
- **Domestic travel** within study country
- **Route support**: Nigeria, Ghana, Kenya, South Africa, Egypt, and other African countries to global study destinations

#### 2. City-Specific Living Costs (replacing country-only)
- **Accommodation** (by city tier: major/mid-tier/small)
- **Food & groceries**
- **Local transport**
- **Utilities**
- Support major cities across African countries

#### 3. Pre-Arrival Costs
- **Passport/document attestation**
- **Medical examinations** (TB tests, vaccinations)
- **Language proficiency tests** (IELTS/TOEFL/PTE)
- **Visa application fees** (varies by home country)
- **Background checks/police clearance**
- **Document translation/notarization**

#### 4. Initial Setup Costs
- **Security deposits** (accommodation)
- **Furniture & household items**
- **Initial groceries & essentials**
- **SIM card & initial utilities setup**
- **Textbooks** (first semester)
- **Kitchen essentials**
- **Bedding & linens**

#### 5. Ongoing Hidden Costs
- **Health insurance** (already exists, enhance with country requirements)
- **Phone & internet**
- **Personal care & clothing**
- **Entertainment & social activities**
- **Study materials** (printing, software subscriptions)
- **Professional memberships** (if required for program)
- **Emergency fund buffer** (5-10% of total costs)

## Phase 2: Database Schema - Multi-Country Support

### New Tables:

#### 1. `african_countries`
```sql
CREATE TABLE african_countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(3) NOT NULL UNIQUE, -- ISO 3166-1 alpha-3
  country_name VARCHAR(100) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  currency_symbol VARCHAR(5),
  flag_emoji VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Initial data:** Nigeria (NGN), Ghana (GHS), Kenya (KES), South Africa (ZAR), Egypt (EGP), Uganda (UGX), Tanzania (TZS), Rwanda (RWF), Ethiopia (ETB), Morocco (MAD)

#### 2. `city_living_costs`
```sql
CREATE TABLE city_living_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_country VARCHAR(100) NOT NULL,
  city_name VARCHAR(100) NOT NULL,
  city_tier VARCHAR(20) NOT NULL, -- 'major', 'mid', 'small'
  accommodation_min DECIMAL(10,2) NOT NULL,
  accommodation_max DECIMAL(10,2) NOT NULL,
  food_monthly DECIMAL(10,2) NOT NULL,
  transport_monthly DECIMAL(10,2) NOT NULL,
  utilities_monthly DECIMAL(10,2) NOT NULL,
  entertainment_monthly DECIMAL(10,2),
  currency_code VARCHAR(3) NOT NULL,
  data_source VARCHAR(100), -- 'numbeo', 'official', 'user_reported'
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Example data:**
- Canada: Toronto (major), Vancouver (major), Calgary (mid), Halifax (small)
- UK: London (major), Manchester (mid), Edinburgh (mid), Cardiff (small)
- USA: New York (major), Boston (major), Austin (mid), Ann Arbor (small)

#### 3. `flight_routes`
```sql
CREATE TABLE flight_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_country_code VARCHAR(3) NOT NULL,
  destination_country_code VARCHAR(3) NOT NULL,
  avg_economy_cost DECIMAL(10,2) NOT NULL,
  avg_business_cost DECIMAL(10,2),
  currency_code VARCHAR(3) NOT NULL,
  peak_season_multiplier DECIMAL(4,2) DEFAULT 1.3,
  budget_airline_available BOOLEAN DEFAULT false,
  typical_layovers INTEGER DEFAULT 1,
  avg_flight_duration_hours INTEGER,
  data_source VARCHAR(100),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(origin_country_code, destination_country_code)
);
```

**Example data:**
- NGA → CAN: ~$1200-1500 (Lagos → Toronto)
- GHA → GBR: ~$800-1100 (Accra → London)
- KEN → USA: ~$1000-1400 (Nairobi → New York)

#### 4. `country_visa_requirements`
```sql
CREATE TABLE country_visa_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_country VARCHAR(100) NOT NULL,
  applicant_country_code VARCHAR(3) NOT NULL,
  visa_type VARCHAR(50) NOT NULL, -- 'study_permit', 'student_visa'
  visa_fee DECIMAL(10,2) NOT NULL,
  biometrics_fee DECIMAL(10,2),
  medical_exam_fee DECIMAL(10,2),
  processing_time_days INTEGER,
  currency_code VARCHAR(3) NOT NULL,
  requires_ielts BOOLEAN DEFAULT false,
  requires_medical BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Phase 3: User Experience - Country Selection Flow

### Key UX Flow:

1. **Home Country Selection** (First Step)
   - Dropdown: "Where are you applying from?"
   - Options: Nigeria, Ghana, Kenya, South Africa, etc.
   - Saves to user profile for future calculations

2. **Destination Country & City Selection**
   - "Where do you want to study?" → Country
   - "Which city?" → City dropdown (filtered by tier)
   - Auto-loads city-specific living costs

3. **Dynamic Cost Adjustments**
   - Flight costs: Calculated based on origin → destination
   - Visa fees: Loaded based on applicant nationality
   - Currency display: Show costs in both home currency and destination currency
   - Pre-arrival costs: Adjusted for home country requirements

4. **Cost Breakdown Sections**
   - **Pre-Departure Costs** (one-time)
     - Visa & documentation
     - Medical exams
     - Language tests
     - Flight ticket
   - **Initial Setup Costs** (one-time, first month)
     - Deposits
     - Furniture & essentials
     - Initial groceries
   - **Recurring Costs** (monthly/annual)
     - Tuition
     - Accommodation
     - Living expenses
     - Insurance
     - Return flights (annual)
   - **Emergency Buffer** (10% recommended)

5. **Multi-Currency Display**
   - Primary: Destination currency (CAD, USD, GBP, etc.)
   - Secondary: Home country currency (NGN, GHS, KES, etc.)
   - Use existing `useProgramTuition` hook for real-time conversion

## Phase 4: Implementation Steps

### Step 1: Database Setup
- Create 4 new tables in Supabase
- Seed initial data for 10 African countries
- Add living cost data for top 20 study cities
- Add flight route estimates for major routes
- Add visa requirement data for top destinations

### Step 2: Update TypeScript Interfaces
```typescript
interface EnhancedCostBreakdown {
  // Existing fields
  tuition: number
  applicationFees: number

  // New fields
  homeCountry: string // Country code
  destinationCity: string

  // Pre-Departure (one-time)
  visaFees: number
  medicalExams: number
  languageTests: number // IELTS/TOEFL
  documentAttestation: number
  initialFlightTicket: number

  // Setup (one-time)
  securityDeposit: number
  furniture: number
  initialGroceries: number
  initialUtilities: number
  textbooks: number

  // Recurring (monthly)
  accommodation: number
  food: number
  transport: number
  utilities: number
  phoneInternet: number
  entertainment: number
  healthInsurance: number

  // Annual
  annualReturnFlights: number
  booksAndSupplies: number

  // Buffer
  emergencyFund: number
}
```

### Step 3: Component Updates (CostCalculator.tsx)

**Add new sections:**
1. Country selection section (top)
2. Flight costs section
3. Pre-arrival costs section
4. Setup costs section
5. Enhanced breakdown with timeline view

**New hooks:**
```typescript
const useFlightCosts = (originCountry: string, destinationCountry: string)
const useCityLivingCosts = (city: string, country: string)
const useVisaRequirements = (applicantCountry: string, destinationCountry: string)
```

### Step 4: Visualization Enhancements

**Add charts using recharts:**
- Pie chart: Cost distribution
- Bar chart: One-time vs recurring costs
- Timeline: When costs are due (pre-departure, month 1, ongoing)
- Comparison chart: Multiple programs side-by-side

### Step 5: Save/Compare Functionality

**Features:**
- Save calculation with name
- Load previous calculations
- Compare up to 3 programs side-by-side
- Export comparison as PDF

### Step 6: PDF Export

**Enhanced export includes:**
- Detailed cost breakdown
- Charts and visualizations
- Payment timeline
- Checklist for each cost category
- Currency conversion rates used
- Date generated

## Phase 5: Scalability & Data Management

### Initial African Countries (Launch):
1. **Nigeria** (NGN) - Primary market
2. **Ghana** (GHS)
3. **Kenya** (KES)
4. **South Africa** (ZAR)
5. **Egypt** (EGP)
6. **Uganda** (UGX)
7. **Tanzania** (TZS)
8. **Rwanda** (RWF)
9. **Ethiopia** (ETB)
10. **Morocco** (MAD)

### Expansion Strategy:
- All country data stored in database tables
- Admin interface to add new countries (future feature)
- API integration for real-time flight costs (future - Skyscanner API)
- Community-sourced city cost data (future - user submissions)
- Automatic currency rate updates (already implemented)

### Data Sources:
- **Flight costs**: Google Flights, Skyscanner averages, user reports
- **Living costs**: Numbeo, official university estimates, expatistan
- **Visa fees**: Official government websites
- **Medical costs**: Standard clinic rates in home countries

## Phase 6: Mobile Responsiveness

### Enhancements:
- Collapsible sections for smaller screens
- Swipeable cards for cost categories
- Bottom sheet for country/city selection
- Sticky total cost summary
- Progressive disclosure (show advanced options only when needed)

## Estimated Complexity

### Development Effort:
- **Database**: 4 new tables, seed ~500 data rows
- **Backend**: 3 new hooks, data fetching functions
- **Frontend**: ~300 new lines of code in CostCalculator.tsx
- **New dependencies**:
  - `recharts` (charts)
  - `jspdf` + `jspdf-autotable` (PDF export)
- **Testing**: Update existing tests, add new test cases
- **Time**: 3-4 development sessions (8-12 hours)

### Priority:
1. **High Priority** (Must-have for launch):
   - Home country selection
   - Flight costs
   - City-specific living costs
   - Pre-arrival costs section
   - Multi-currency display

2. **Medium Priority** (Nice-to-have for launch):
   - Charts and visualizations
   - Save/compare functionality
   - Payment timeline

3. **Low Priority** (Post-launch):
   - PDF export
   - Admin interface for data management
   - Real-time flight API integration
   - User-contributed cost data

## Success Metrics

### User Engagement:
- Calculator completion rate > 70%
- Average time spent: 5-8 minutes
- Return usage rate > 40%

### Accuracy:
- Cost estimates within ±15% of actual expenses
- User feedback rating > 4.0/5.0

### Coverage:
- Support 10 African countries at launch
- Cover top 30 study destinations
- 50+ cities with detailed living cost data

## Technical Considerations

### Performance:
- Lazy load city data (only when country selected)
- Cache flight costs (update weekly)
- Debounce currency conversion API calls
- Optimize re-renders with React.memo

### Data Quality:
- Regular updates (quarterly review)
- User feedback mechanism for cost accuracy
- Version control for cost data
- Display "last updated" dates

### Accessibility:
- Screen reader support for all inputs
- Keyboard navigation
- High contrast mode support
- Clear error messages

## Next Steps

1. **Get user approval** on this plan
2. **Create database tables** and seed initial data
3. **Update TypeScript interfaces** and types
4. **Implement country selection** UI
5. **Add flight costs** section
6. **Add pre-arrival costs** section
7. **Add setup costs** section
8. **Implement visualization** (charts)
9. **Add save/compare** functionality
10. **Test with real user scenarios** from different African countries

---

**Plan Status**: Draft - Awaiting User Approval
**Last Updated**: 2025-10-17
**Est. Completion**: 3-4 development sessions
