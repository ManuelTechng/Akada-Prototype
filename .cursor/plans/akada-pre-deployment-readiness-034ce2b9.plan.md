<!-- 034ce2b9-f938-4671-a768-5c00862257ff 0e0f7b4f-6db5-46b9-9fea-e999a7ff859a -->
# Akada Pre-Deployment Plan

## Overview

Prepare Akada application for internal testing deployment on Netlify (via GitHub), addressing 2 critical blockers and setting up Phase 2 database enhancements.

## Current Status: 70% Deployment-Ready

**Critical Blockers Identified:**

1. ❌ Empty programs database (only 22 entries, need 50+ minimum)
2. ❌ Missing deployment configuration (netlify.toml)

**Working Components:**

- ✅ Authentication & user management
- ✅ Dashboard & widgets
- ✅ Profile management
- ✅ Saved programs (125ms performance)
- ✅ Document upload & AI review
- ✅ Cost calculator with NGN support
- ✅ AI chat assistant

---

## Phase 1: Critical Deployment Preparation (2-3 Days)

### Step 1: Create Netlify Deployment Configuration

**File to Create:** `netlify.toml` in project root

**Configuration Required:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**Environment Variables to Set in Netlify Dashboard:**

- `VITE_SUPABASE_URL` (from your Supabase project)
- `VITE_SUPABASE_ANON_KEY` (from your Supabase project)
- `VITE_GEMINI_API_KEY` (or `VITE_OPENAI_API_KEY`)
- `VITE_FIXER_API_KEY` (optional, for currency conversion)

**GitHub Integration:**

- Connect repository to Netlify
- Netlify will auto-deploy on push to main/master branch
- Set up branch deploys for preview environments

---

### Step 2: Populate Programs Database

**Target:** Minimum 50 international programs for Nigerian students

**Data Structure (from migrations):**

```sql
programs (
  id uuid,
  university text,
  name text,
  degree_type text,
  country text,
  tuition_fee numeric (in NGN),
  specialization text,
  location text,
  city text,
  duration text,
  has_scholarships boolean,
  scholarship_available boolean,
  application_deadline date,
  website text,
  requirements text[],
  entry_requirements text,
  language_requirements text,
  study_level text,
  description text
)
```

**Program Distribution Strategy:**

- **USA**: 15-20 programs (popular destination)
- **UK**: 10-15 programs (Commonwealth ties)
- **Canada**: 8-10 programs (immigration-friendly)
- **Germany**: 5-7 programs (low tuition)
- **Australia**: 5-7 programs (quality education)
- **Netherlands/Ireland**: 5 programs (English-taught)

**Specialization Mix:**

- Computer Science/IT: 40%
- Engineering: 20%
- Business/MBA: 20%
- Data Science/AI: 10%
- Other (Design, Health): 10%

**Tuition Range (in NGN):**

- Budget-friendly: ₦5M - ₦15M (20%)
- Mid-range: ₦15M - ₦30M (50%)
- Premium: ₦30M - ₦50M (30%)

**Data Entry Options:**

1. **Manual Entry**: Use Supabase dashboard SQL editor
2. **Bulk Import**: Create CSV and import via Supabase
3. **Web Scraping**: Build script to extract from university websites
4. **Use Template**: Copy/modify existing 22 programs

**SQL Template for Bulk Insert:**

```sql
INSERT INTO programs (
  university, name, degree_type, country, tuition_fee,
  specialization, city, duration, has_scholarships, currency
) VALUES
('Stanford University', 'Master of Computer Science', 'Master''s', 'USA', 45000000, 'Computer Science', 'Stanford', '2 years', true, 'NGN'),
('MIT', 'Master of Engineering', 'Master''s', 'USA', 52500000, 'Engineering', 'Cambridge', '2 years', true, 'NGN'),
-- ... add 48 more programs
```

**Verification After Import:**

```sql
-- Check program count
SELECT COUNT(*) FROM programs;

-- Verify country distribution
SELECT country, COUNT(*) FROM programs GROUP BY country;

-- Check tuition range
SELECT 
  COUNT(CASE WHEN tuition_fee < 15000000 THEN 1 END) as budget,
  COUNT(CASE WHEN tuition_fee BETWEEN 15000000 AND 30000000 THEN 1 END) as mid_range,
  COUNT(CASE WHEN tuition_fee > 30000000 THEN 1 END) as premium
FROM programs;
```

---

### Step 3: Pre-Deployment Testing

**Local Production Build Test:**

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Check build output
ls -lh dist/
```

**Test Checklist:**

- [ ] Application builds without errors
- [ ] No TypeScript compilation errors
- [ ] Bundle size reasonable (<2MB total)
- [ ] All assets properly referenced
- [ ] Environment variables load correctly

**Feature Testing (Local Production Build):**

- [ ] User signup/login flow
- [ ] Dashboard loads with all widgets
- [ ] Program search returns 50+ results
- [ ] Filtering works (country, tuition, degree type)
- [ ] Save/unsave programs
- [ ] Document upload to Supabase
- [ ] AI chat responds correctly
- [ ] Profile settings save successfully
- [ ] Cost calculator displays properly
- [ ] Currency conversion works
- [ ] Mobile responsive (DevTools)
- [ ] No console errors

**Performance Testing:**

- [ ] Run Lighthouse audit (target: >70 on mobile)
- [ ] Test on simulated 3G network
- [ ] Check Time to Interactive (<5s on 3G)
- [ ] Verify lazy loading works
- [ ] Check bundle splitting effectiveness

---

### Step 4: Netlify Deployment Setup

**Netlify Project Setup (via GitHub):**

1. **Connect Repository:**

   - Log into Netlify
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub provider
   - Select Akada-Prototype repository
   - Authorize Netlify GitHub App

2. **Configure Build Settings:**

   - Build command: `npm run build` (auto-detected)
   - Publish directory: `dist` (auto-detected)
   - Node version: 18 (set in netlify.toml)

3. **Set Environment Variables:**

   - Navigate to Site settings → Environment variables
   - Add all required VITE_* variables
   - Mark sensitive variables as "Secret"

4. **Deploy Settings:**

   - Production branch: `main` (or `master`)
   - Enable branch deploys for `UI-Update` branch
   - Enable deploy previews for pull requests

5. **Custom Domain (Optional):**

   - Use Netlify subdomain: `akada.netlify.app`
   - Or configure custom domain later

**First Deployment:**

- Push netlify.toml to main branch
- Netlify auto-triggers build
- Monitor build logs for errors
- Verify deployment URL works

**Post-Deployment Verification:**

- [ ] Site accessible at Netlify URL
- [ ] All pages load correctly
- [ ] Authentication works (signup → login)
- [ ] Supabase connection active
- [ ] Program search functional
- [ ] No 404 errors for routes
- [ ] Mobile view renders properly

---

### Step 5: Quality Assurance & Bug Fixes

**QA Testing Matrix:**

| Feature | Desktop | Mobile | Status |

|---------|---------|--------|--------|

| Landing page | ⬜ | ⬜ | |

| Signup/Login | ⬜ | ⬜ | |

| Dashboard | ⬜ | ⬜ | |

| Program search | ⬜ | ⬜ | |

| Saved programs | ⬜ | ⬜ | |

| Profile settings | ⬜ | ⬜ | |

| Document upload | ⬜ | ⬜ | |

| AI chat | ⬜ | ⬜ | |

| Cost calculator | ⬜ | ⬜ | |

**Bug Triage:**

- **Critical**: Blocking user flows (fix immediately)
- **High**: Significant UX issues (fix before launch)
- **Medium**: Minor issues (fix in Phase 2)
- **Low**: Nice-to-haves (backlog)

**Common Issues to Check:**

- [ ] CORS errors with Supabase
- [ ] Environment variables not loading
- [ ] Redirect issues (404s)
- [ ] Authentication redirect loops
- [ ] Slow API responses
- [ ] Currency formatting errors
- [ ] Mobile layout issues

---

## Phase 2: Enhanced Database & Features (2 Weeks)

### Overview

Implement comprehensive school details system based on `school-details-system-d2dfea79.plan.md`

**Major Components:**

1. **Database Enhancement** (Week 1)

   - Create universities table (centralized university data)
   - Create countries table (comprehensive visa/cost info)
   - Create cities table (city-specific living costs)
   - Create application_guides table (step-by-step guides)
   - Create scholarship_opportunities table
   - Migrate existing programs to new schema

2. **New Pages & Features** (Week 2)

   - University detail page (`/universities/:id`) with tabbed interface
   - Enhanced program detail page (`/programs/:id`)
   - Scholarship listing & detail pages
   - Application tracking dashboard (Task #9)
   - Timeline builder (Task #11)

3. **Infrastructure Improvements**

   - Service worker implementation (offline mode)
   - Image optimization pipeline
   - Full 3G optimization
   - Payment gateway integration (Task #13)
   - Email reminder system (Task #14)

**Dependencies:**

- Phase 1 deployment successful
- User feedback collected from initial testers
- Database migration scripts prepared
- UI/UX refinements based on testing

**Detailed Plan:** See `school-details-system-d2dfea79.plan.md` for complete implementation spec

---

## Deployment Timeline

### Day 1: Configuration & Database

- **Morning**: Create netlify.toml, commit to GitHub
- **Afternoon**: Populate programs database (50+ entries)
- **Evening**: Test production build locally

### Day 2: Deployment & Initial Testing

- **Morning**: Connect GitHub to Netlify, configure environment variables
- **Afternoon**: First deployment, fix any build issues
- **Evening**: Full QA testing on staging

### Day 3: Launch & User Onboarding

- **Morning**: Final verification, deploy to production
- **Afternoon**: Onboard first 5-10 test users
- **Evening**: Monitor for issues, collect initial feedback

---

## Success Metrics

**Phase 1 Success Criteria:**

- [ ] Application deployed and publicly accessible
- [ ] Zero critical bugs in production
- [ ] All core features functional
- [ ] 10-20 test users onboarded
- [ ] Page load time <3s on 3G
- [ ] Positive user feedback (>70% satisfaction)

**Phase 2 Success Criteria:**

- [ ] Comprehensive university/program pages live
- [ ] Application tracking functional
- [ ] Offline mode working
- [ ] 50+ active users
- [ ] Database schema enhanced
- [ ] Performance improved (>80 Lighthouse score)

---

## Risk Mitigation

**Potential Risks:**

1. **Build Failures on Netlify**

   - Mitigation: Test build locally first, verify Node version compatibility

2. **Supabase Rate Limiting**

   - Mitigation: Monitor usage, implement caching, upgrade if needed

3. **API Key Exposure**

   - Mitigation: All keys in environment variables, .env in .gitignore

4. **User Data Issues**

   - Mitigation: Database backups enabled, RLS policies active

5. **Poor Performance on 3G**

   - Mitigation: Bundle optimization, lazy loading, CDN for assets

---

## Post-Launch Monitoring

**Metrics to Track:**

- Daily active users
- Program searches per user
- Saved programs per user
- Document uploads
- Authentication failures
- API error rates
- Page load times
- User feedback scores

**Tools:**

- Netlify Analytics (built-in)
- Supabase Dashboard (database metrics)
- Browser Console (error logging)
- Google Lighthouse (performance audits)
- User surveys (in-app or external)

**Critical Alerts:**

- Database connection failures
- Supabase quota exceeded (75% threshold)
- Build/deployment failures
- Authentication error spike (>5% of requests)

---

## Cost Estimates

**Phase 1 (Internal Testing - 20 users):**

- Netlify: Free tier (sufficient)
- Supabase: Free tier (sufficient)
- Gemini API: ~$10-20/month
- **Total: ~$10-20/month**

**Phase 2 (100+ users):**

- Netlify Pro: $19/month (optional)
- Supabase Pro: $25/month (recommended)
- Gemini API: ~$100-200/month
- CDN (Cloudflare): Free tier
- **Total: ~$150-250/month**

---

## Next Steps (Immediate Actions)

1. **Create netlify.toml** (30 mins)
2. **Populate programs database** (2-3 days)
3. **Test production build locally** (1 hour)
4. **Connect GitHub to Netlify** (30 mins)
5. **Configure environment variables** (30 mins)
6. **Deploy to staging** (1 hour)
7. **QA testing** (4 hours)
8. **Production deployment** (1 hour)
9. **User onboarding** (ongoing)

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