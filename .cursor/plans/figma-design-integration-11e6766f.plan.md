<!-- 11e6766f-3b68-448e-99a2-8fd487ce6a27 a51d3d23-bbc4-4a64-b937-7973637ad2d6 -->
# Figma Modern UI Redesign Integration Plan

## Overview

Merge the Figma-exported modern UI components and styling into the existing Akada application, maintaining all current functionality (routing, authentication, Supabase integration) while achieving pixel-perfect visual fidelity with responsive behavior.

## Phase 1: Foundation Setup

### 1.1 CSS Variables & Design Tokens

- Copy CSS variables from `Akada Modern UI Redesign/src/styles/globals.css` to `src/index.css`
- Merge the Figma design tokens (colors, spacing, typography) with existing tokens
- Update custom variants for dark mode (`@custom-variant dark`)
- Add Figma's radius and shadow variables
- Keep existing currency and theme-related CSS

### 1.2 Asset Migration

- Copy all logo assets from `Akada Modern UI Redesign/src/assets/` to `src/assets/`
  - `430a52e73dc288723ed79d46ec10415bf74e2494.png` (dark logo)
  - `33a5db83050df89685f494eda5d3b2bfe7baef28.png` (dark mini logo)
  - `8a98d98a4de9f43fe1d2f143a82daf20405de5b4.png` (light logo)
  - `c6c86106cf320bf8a749490dc3051da0953af25f.png` (light mini logo)
- Update asset import paths to use direct relative imports instead of `figma:asset/`

### 1.3 UI Component Updates

- Update existing UI components in `src/components/ui/` with Figma styling:
  - `button.tsx` - Update variants, sizes, shadows, and borders
  - `card.tsx` - Add Figma's glass morphism styles and borders
  - `switch.tsx` - Already fixed, verify styling matches Figma
  - `avatar.tsx` - Verify styling consistency
- Keep existing component logic and TypeScript interfaces

## Phase 2: Layout Components

### 2.1 Sidebar Integration

- Update `src/components/layouts/DarkSidebar.tsx`:
  - Merge Figma's styling (exact colors, spacing, shadows)
  - Keep existing mobile menu functionality
  - Update logo imports to use new asset paths
  - Maintain routing functionality with `useNavigate` and `useLocation`
  - Keep theme toggle functionality with existing `useTheme` hook
  - Add collapsed state logic from Figma version
  - Fix navigation paths to match current routing structure:
    - Dashboard: `/app` (not `/dashboard`)
    - Programs: `/app/programs` (not just `/app`)

- Create `src/components/layouts/LightSidebar.tsx` (new file):
  - Copy from Figma export with same functional updates as DarkSidebar
  - Ensure light mode colors match Figma design

### 2.2 Header Integration

- Update `src/components/layouts/DarkHeader.tsx`:
  - Merge Figma's header styling (search bar, notifications, user menu)
  - Keep mobile menu toggle functionality
  - Maintain existing prop interfaces

- Create `src/components/layouts/LightHeader.tsx` (new file):
  - Copy from Figma export with light mode styling

## Phase 3: Dashboard Widgets

### 3.1 Glass Card Components

Update existing glass components with Figma's exact styling:

**`src/components/glass/GlassWelcomeCardDark.tsx`:**

- Update background gradients, borders, shadows
- Match padding, rounded corners from Figma
- Keep responsive breakpoints (sm, lg, xl)
- Maintain emoji and button functionality

**`src/components/glass/GlassStatsGridDark.tsx`:**

- Update metric card styling (100%, 0, 5, Set)
- Match Figma's exact colors and hover states
- Keep existing responsive grid layout

**`src/components/glass/GlassActionCardDark.tsx`:**

- Update "Next Best Action" card styling
- Match Figma's CTA button design

Create light mode versions:

- `src/components/glass/GlassWelcomeCard.tsx`
- `src/components/glass/GlassStatsGrid.tsx`
- `src/components/glass/GlassActionCard.tsx`

### 3.2 Widget Components

Update widgets to match Figma styling while keeping data integration:

**`src/components/widgets/ProfileCompletionWidget.tsx`:**

- Update card background, borders, shadows to match Figma
- Change circular progress from `w-24 h-24` to `w-20 sm:w-24`
- Update progress colors to use `emerald-500` instead of `green-500`
- Add responsive text sizing (`text-xs sm:text-sm`)
- Keep existing `profileItems` data structure
- Maintain percentage calculation logic

**`src/components/widgets/NotificationsWidget.tsx`:**

- Update card styling with Figma's glass morphism
- Match notification item styling (background, padding, borders)
- Keep existing notification data structure
- Add "View All" button styling from Figma

**`src/components/widgets/RecentActivitiesWidget.tsx`:**

- Update activity item cards with Figma styling
- Match icon backgrounds and colors
- Keep timestamp formatting

**`src/components/widgets/ApplicationWidget.tsx`:**

- Update application timeline styling
- Match Figma's tab design (All, Urgent, Upcoming)
- Keep existing application data structure

**`src/components/widgets/CostAnalysisWidget.tsx`:**

- Update budget utilization chart styling
- Match Figma's donut chart design
- Keep existing cost calculation logic
- Integrate with existing `useCostVisualization` hook

**`src/components/widgets/QuickActionsWidget.tsx`:**

- Update action button cards
- Match Figma's hover states and icons
- Keep existing navigation functionality

## Phase 4: Dashboard Page Integration

### 4.1 Update FigmaDashboard Component

**File:** `src/components/dashboard/FigmaDashboard.tsx`

- Import theme-aware components (both dark and light versions)
- Add `useTheme` hook from `src/contexts/ThemeContext`
- Implement conditional rendering based on theme:
  ```tsx
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  {isDark ? <DarkSidebar /> : <LightSidebar />}
  {isDark ? <ProfileCompletionWidget /> : <ProfileCompletionWidgetLight />}
  ```

- Keep mobile sidebar state management
- Maintain existing grid layout structure
- Update spacing to match Figma (px-4 sm:px-6 lg:px-8)

### 4.2 Data Integration

Ensure all widgets connect to existing data sources:

- Profile completion connects to user profile data
- Notifications fetch from notification context
- Applications integrate with application tracking
- Cost analysis uses currency conversion utilities
- Recent activities fetch from activity feed

## Phase 5: Theme Provider Integration

### 5.1 Update Theme Context

**File:** `src/contexts/ThemeContext.tsx`

- Verify theme toggle functionality works with new components
- Ensure `setTheme` function properly updates dark/light mode
- Test theme persistence across page reloads
- Validate theme changes trigger component re-renders

### 5.2 Theme-Aware Styling

Add theme-conditional classes throughout:

- Background gradients (dark vs light)
- Text colors (white vs slate-900)
- Border colors (white/10 vs gray-200)
- Shadow styles (dark vs light mode shadows)

## Phase 6: Responsive Design

### 6.1 Mobile Breakpoints

Implement responsive classes across all components:

- Base (mobile): minimum sizing
- `sm:` (640px): small tablets
- `md:` (768px): tablets
- `lg:` (1024px): laptops
- `xl:` (1280px): desktops

### 6.2 Mobile-Specific Features

- Sidebar collapse/expand on mobile
- Mobile menu overlay
- Touch-friendly button sizes
- Stacked layouts on small screens
- Responsive typography scaling

## Phase 7: Testing & Refinement

### 7.1 Visual Verification

- Compare each component with Figma screenshots
- Verify pixel-perfect spacing, colors, shadows
- Check responsive behavior at all breakpoints
- Test dark/light theme switching

### 7.2 Functional Testing

- Verify all navigation links work
- Test theme toggle functionality
- Ensure sidebar collapse works
- Validate mobile menu behavior
- Test data loading and display

### 7.3 Integration Testing

- Verify authentication flow still works
- Test Supabase data fetching
- Validate currency conversion displays
- Check profile data integration
- Test notification system

## Phase 8: Cleanup

### 8.1 Remove Legacy Code

- Delete old dashboard components if no longer needed
- Remove unused styling utilities
- Clean up duplicate CSS variables

### 8.2 Code Organization

- Ensure consistent import paths
- Organize components by feature
- Update component exports in index files
- Add TypeScript types where missing

### 8.3 Documentation

- Update component documentation
- Document new styling patterns
- Add responsive design guidelines
- Document theme usage

## Key Files to Modify

**Critical Path:**

1. `src/index.css` - Add Figma design tokens
2. `src/components/layouts/DarkSidebar.tsx` - Update styling + routing
3. `src/components/layouts/DarkHeader.tsx` - Update styling
4. `src/components/dashboard/FigmaDashboard.tsx` - Add theme awareness
5. All widget files in `src/components/widgets/` - Merge Figma styling
6. All glass components in `src/components/glass/` - Merge Figma styling

**Supporting Files:**

- `src/components/ui/` - Update base UI components
- `src/contexts/ThemeContext.tsx` - Verify theme integration
- `src/App.tsx` - Ensure routing still works

## Success Criteria

- Visual match: 95%+ pixel-perfect to Figma design
- Responsive: Works flawlessly on mobile, tablet, desktop
- Functional: All existing features work without regression
- Performance: No performance degradation
- Theme: Smooth dark/light mode switching
- Data: All data integration working correctly

### To-dos

- [ ] Set up CSS variables, design tokens, and asset migration
- [ ] Update sidebar and header components with Figma styling
- [ ] Update glass card components (Welcome, Stats, Action)
- [ ] Update all dashboard widgets with Figma styling while maintaining data hooks
- [ ] Integrate theme-aware rendering in FigmaDashboard component
- [ ] Implement and test responsive behavior across all breakpoints
- [ ] Visual verification, functional testing, and integration testing
- [ ] Remove legacy code, organize imports, and update documentation