# Implementation Plan: Akada Phase 2 Enhanced Implementation

## Overview

Implementation of Phase 2 enhancements for the Akada platform, including consolidated database schema, enhanced cost calculator, PWA functionality, improved recommendations engine, dashboard widget fixes, and Amara AI assistant enhancements. This plan transforms the existing plan into actionable development tasks.

## Requirements Summary

- **Database Foundation**: Create 6 new tables (universities, countries, cities, flight_routes, application_guides, scholarships) and enhance programs table
- **Enhanced Cost Calculator**: Multi-country support, contextual UX, tabbed interface, visualizations with Recharts
- **PWA Implementation**: Service worker, offline storage with IndexedDB, smart install prompts
- **Enhanced Recommendations**: AI-powered ranking, study buddy matching, career pathway analysis
- **Dashboard Polish**: Replace hardcoded data with real API calls in Dashboard.tsx lines 28-128
- **Amara AI Enhancement**: Integration with new Phase 2 features, contextual awareness, cost intelligence
- **Admin Interface**: Retool deployment with 5 management apps
- **n8n Integration**: AI-powered school scraping workflows

## Research Findings

### Best Practices

- **Existing Supabase Patterns**: Current queries use `.from('table').select('*')` pattern with error handling
- **Component Structure**: React functional components with TypeScript interfaces, hooks for state management
- **Cost Calculation**: Existing `CostCalculator.tsx` uses state management with `useState` and `useMemo` for calculations
- **Dashboard Architecture**: Multiple dashboard components exist (`Dashboard.tsx`, `SmartDashboard.tsx`) with hardcoded data arrays
- **AI Integration**: Current implementation uses OpenAI and Gemini APIs for chat functionality

### Reference Implementations

- **Database Queries**: `src/lib/program.ts` shows Supabase query patterns with filters, joins, and error handling
- **Cost Calculation**: `src/lib/costCalculation.ts` demonstrates existing cost calculation logic
- **Recommendations**: `src/lib/recommendations.ts` contains `calculateAdvancedMatchScore` and `fetchPersonalizedRecommendations`
- **Chat Components**: `src/lib/openai.ts` and `src/components/app/ChatAssistant.tsx` show current AI integration
- **Dashboard Components**: `src/components/Dashboard.tsx` lines 28-128 contain hardcoded data that needs replacement

### Technology Decisions

- **Database**: Supabase PostgreSQL with existing TypeScript types in `database.types.ts`
- **State Management**: React hooks (useState, useEffect, useMemo) following existing patterns
- **UI Components**: Existing Lucide React icons, Tailwind CSS classes, and component structure
- **Charts**: Recharts integration for cost visualization components
- **Offline Storage**: Dexie for IndexedDB integration, following PWA best practices

## Implementation Tasks

### Phase 1: Database Foundation (Week 1)

1. **Create Consolidated Database Schema Migration**
   - Description: Create comprehensive migration script with 6 new tables and enhanced programs table
   - Files to create: `supabase/migrations/YYYYMMDD_phase2_consolidated_schema.sql`
   - Dependencies: None
   - Estimated effort: 4 hours

2. **Implement Supabase Query Services**
   - Description: Create TypeScript services for universities, locations, and flights following existing patterns
   - Files to create: 
     - `src/lib/supabase/queries/universities.ts`
     - `src/lib/supabase/queries/locations.ts`
     - `src/lib/supabase/queries/flights.ts`
   - Dependencies: Database migration complete
   - Estimated effort: 6 hours

3. **Build FlightCostService API Abstraction**
   - Description: Create API-ready service class for flight cost fetching with caching and fallback logic
   - Files to create: `src/lib/flights/service.ts`
   - Dependencies: Database schema and query services
   - Estimated effort: 4 hours

4. **Setup Retool Admin Interface**
   - Description: Deploy and configure Retool admin dashboard with 5 management apps
   - Files to create: Retool configuration and deployment scripts
   - Dependencies: Database schema complete
   - Estimated effort: 8 hours

### Phase 2: Enhanced Cost Calculator (Week 2)

5. **Redesign CostCalculator Component**
   - Description: Major overhaul with contextual country/city selection, tabbed interface, enhanced cost sections
   - Files to modify: `src/components/CostCalculator.tsx`
   - Files to create: `src/components/cost-calculator/CostCharts.tsx`, `src/components/cost-calculator/PreDepartureCosts.tsx`
   - Dependencies: Database queries and location services
   - Estimated effort: 12 hours

6. **Implement Recharts Visualizations**
   - Description: Add pie charts for cost distribution, bar charts for cost breakdown, timeline views
   - Files to create: `src/components/cost-calculator/CostCharts.tsx`
   - Dependencies: CostCalculator redesign
   - Estimated effort: 6 hours

7. **Add Multi-Currency Display**
   - Description: Implement 2-currency display (destination + home) using existing useProgramTuition hook
   - Files to modify: Cost calculator components and currency utilities
   - Dependencies: CostCalculator component updates
   - Estimated effort: 4 hours

### Phase 3: PWA Implementation (Week 3)

8. **Create Service Worker**
   - Description: Implement cache-first for assets, network-first for data, offline fallback
   - Files to create: `public/service-worker.js`, `public/offline.html`
   - Dependencies: None
   - Estimated effort: 6 hours

9. **Implement IndexedDB Offline Storage**
   - Description: Set up Dexie database for programs, saved programs, and user profile offline storage
   - Files to create: `src/lib/offline-db.ts`
   - Dependencies: Service worker complete
   - Estimated effort: 4 hours

10. **Build Smart Install Prompt**
    - Description: Create component with timing logic (2+ visits OR 5+ page views) for PWA installation
    - Files to create: `src/components/InstallPrompt.tsx`
    - Dependencies: Service worker and offline storage
    - Estimated effort: 3 hours

### Phase 4: Enhanced Recommendations & Dashboard Polish (Week 5)

11. **Enhance Recommendations Engine**
    - Description: Upgrade existing recommendations with AI-powered ranking, study buddy matching, career pathways
    - Files to modify: `src/lib/recommendations.ts`
    - Files to create: `src/lib/recommendations/smart-ranking.ts`
    - Dependencies: Database schema and user behavior tracking
    - Estimated effort: 10 hours

12. **Fix Dashboard Hardcoded Data**
    - Description: Replace hardcoded data arrays in Dashboard.tsx lines 28-128 with real API calls
    - Files to modify: `src/components/Dashboard.tsx`
    - Files to create: 
      - `src/hooks/useUserApplications.ts`
      - `src/hooks/useUserProgressStats.ts`
      - `src/hooks/useUserTasks.ts`
    - Dependencies: Recommendation system updates
    - Estimated effort: 8 hours

### Phase 5: Amara AI Assistant Enhancement (Week 5)

13. **Create Enhanced Context Services**
    - Description: Integrate Amara with new database tables for contextual awareness
    - Files to create:
      - `src/lib/amara/enhanced-context.ts`
      - `src/lib/amara/cost-intelligence.ts`
      - `src/lib/amara/school-guidance.ts`
    - Dependencies: Database services and cost calculator
    - Estimated effort: 12 hours

14. **Update Chat Components**
    - Description: Enhance ChatButton and chat system with Phase 2 feature integration
    - Files to modify: `src/components/ChatButton.tsx`, `src/lib/chat.ts`
    - Dependencies: Enhanced context services
    - Estimated effort: 6 hours

### Phase 6: n8n Integration & Testing (Parallel)

15. **Setup n8n Scraping Workflow**
    - Description: Deploy n8n on Railway and create school scraping workflow with OpenAI integration
    - Files to create: n8n workflow configuration
    - Dependencies: Database schema complete
    - Estimated effort: 8 hours

16. **Create n8n Client Integration**
    - Description: Build client for requesting school scraping and add "Request School" button
    - Files to create: `src/lib/n8n/client.ts`
    - Files to modify: `src/components/ProgramSearch.tsx`
    - Dependencies: n8n workflow setup
    - Estimated effort: 4 hours

17. **Testing & Performance Audit**
    - Description: Unit tests for new services, E2E tests for user flows, Lighthouse audit
    - Files to create: Test files for new components and services
    - Dependencies: All core features implemented
    - Estimated effort: 10 hours

## Codebase Integration Points

### Files to Modify
- `src/components/Dashboard.tsx` - Replace hardcoded data with real API calls (lines 28-128)
- `src/components/CostCalculator.tsx` - Major overhaul for Phase 2 requirements
- `src/lib/recommendations.ts` - Enhance with smart ranking algorithms
- `src/components/ChatButton.tsx` - Add Phase 2 feature integration
- `src/lib/chat.ts` - Enhance contextual response system
- `src/components/ProgramSearch.tsx` - Add "Request School" button

### New Files to Create
- `supabase/migrations/YYYYMMDD_phase2_consolidated_schema.sql`
- `src/lib/supabase/queries/universities.ts`
- `src/lib/supabase/queries/locations.ts`
- `src/lib/supabase/queries/flights.ts`
- `src/lib/flights/service.ts`
- `src/lib/offline-db.ts`
- `src/lib/n8n/client.ts`
- `src/lib/recommendations/smart-ranking.ts`
- `src/lib/next-best-action-service.ts`
- `src/hooks/useUserApplications.ts`
- `src/hooks/useUserProgressStats.ts`
- `src/hooks/useUserTasks.ts`
- `src/lib/amara/enhanced-context.ts`
- `src/lib/amara/cost-intelligence.ts`
- `src/lib/amara/school-guidance.ts`
- `src/components/cost-calculator/CostCharts.tsx`
- `src/components/cost-calculator/PreDepartureCosts.tsx`
- `src/components/InstallPrompt.tsx`
- `public/service-worker.js`
- `public/offline.html`

### Existing Patterns to Follow
- Supabase queries: Use `.from('table').select('*')` pattern with proper error handling as shown in `src/lib/program.ts`
- Component structure: React functional components with TypeScript interfaces following existing dashboard patterns
- State management: useState and useMemo patterns from existing CostCalculator implementation
- AI integration: Follow existing OpenAI integration patterns from `src/lib/openai.ts`

## Technical Design

### Architecture Diagram
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase DB    │    │   External      │
│   (React/Vite)  │    │   (PostgreSQL)   │    │   Services      │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Dashboard     │◄──►│ • universities   │    │ • n8n (Railway) │
│ • CostCalc      │    │ • countries      │◄──►│ • OpenAI API    │
│ • PWA (Dexie)   │    │ • cities         │    │ • Flight APIs   │
│ • Chat/AI       │    │ • flight_routes  │    │                 │
│ • Admin (Retool)│    │ • programs       │    └─────────────────┘
└─────────────────┘    │ • applications   │
                       └──────────────────┘
```

### Data Flow
1. User interactions trigger API calls to Supabase queries
2. Enhanced recommendations use new database tables and AI algorithms
3. Cost calculator integrates with flight_routes and cities tables
4. PWA caches static assets and stores user data offline
5. Amara AI uses enhanced context from new database tables
6. Admin interface (Retool) manages all data tables directly

## Dependencies and Libraries
- `recharts` - For cost visualization charts
- `dexie` - For IndexedDB offline storage
- Existing: `@supabase/supabase-js`, `lucide-react`, `tailwindcss`

## Testing Strategy
- Unit tests for FlightCostService, cost calculations, and currency conversions
- Integration tests for database queries and Supabase operations
- E2E tests for complete user flows: search → program view → cost calculation → save
- PWA tests for offline functionality and install flow
- Accessibility tests for WCAG 2.1 AA compliance

## Success Criteria
- [ ] All 6 new database tables created and seeded with Tier 1 data
- [ ] Enhanced cost calculator with contextual UX and multi-currency display
- [ ] PWA installs successfully and works offline for core features
- [ ] Dashboard shows real user data instead of hardcoded arrays
- [ ] Recommendations engine provides AI-powered personalized results
- [ ] Amara AI assistant can answer questions about new Phase 2 features
- [ ] Admin interface fully functional for data management
- [ ] n8n scraping workflow successfully populates university data
- [ ] Lighthouse scores: LCP < 2.5s, FCP < 1.5s, TTI < 3.5s
- [ ] All existing functionality remains intact

## Notes and Considerations

- **Migration Strategy**: Create comprehensive migration that can be run in development and production
- **Backward Compatibility**: Ensure existing user data and functionality remain intact during Phase 2 rollout
- **Performance**: Index database tables appropriately, especially for flight_routes lookup patterns
- **Error Handling**: Follow existing patterns for graceful degradation when APIs are unavailable
- **Security**: Implement proper RLS policies for all new database tables
- **Monitoring**: Add logging for new services to track usage and performance

---
*This plan is ready for execution with `/execute-plan`*
