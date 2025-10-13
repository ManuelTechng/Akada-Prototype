# 🔄 Cursor Agent Task Assignments & Tracking

## Current Status: Day 1-2 Complete ✅
- Database fixes: ✅ Complete
- Unified preference service: ✅ Complete  
- Foundation ready for parallel development: ✅

## 📋 Cursor Agent Assignments (Task 4 Subtasks)

### **Priority 1: NGN Currency System** (Subtask 4.1)
**Status:** 🟡 Pending  
**Estimated Time:** 30 minutes  
**Dependencies:** None - can start immediately

**Cursor Prompt:**
```
Create a Nigerian-focused currency formatting utility at src/utils/currency.ts that:

REQUIREMENTS:
- Formats amounts in NGN with proper comma separators
- Handles large numbers (₦30,000,000) compactly for mobile  
- Includes USD to NGN conversion using 1500 rate from PRD
- Uses 'en-NG' locale formatting
- Exports formatNGN, convertUSD, formatCompact functions
- Include TypeScript types and JSDoc comments
- Must work offline (no API calls)

EXAMPLE USAGE:
formatNGN(30000000) // "₦30,000,000"
formatCompact(30000000) // "₦30M" 
convertUSD(20000) // 30000000 (20k USD = 30M NGN)

IMPLEMENTATION NOTES:
- Use Intl.NumberFormat for proper localization
- Handle edge cases (negative numbers, zero, undefined)
- Export both full and compact formatting options
- Include tests for different number ranges
```

---

### **Priority 2: Design System Tokens** (Subtask 4.2)  
**Status:** 🟡 Pending  
**Estimated Time:** 45 minutes  
**Dependencies:** Currency system (4.1)

**Cursor Prompt:**
```
Create Akada design system tokens at src/styles/tokens.ts that:

REQUIREMENTS:
- Use colors from PRD: indigo-600 #4f46e5, gray-800 #1f2937, white #ffffff
- Include success #10b981, warning #f59e0b, error #ef4444
- Mobile-first breakpoints (375px primary, 768px tablet, 1024px desktop)  
- 3G-optimized spacing (44px touch targets, 8px compact)
- Typography scale for Nigerian users
- Dark mode color variants
- Export as both CSS custom properties and JS object

STRUCTURE:
export const akadaTokens = {
  colors: { primary, surface, success, warning, error, dark variants },
  spacing: { touch: '44px', compact: '8px', etc },
  typography: { fontFamilies, fontSizes, lineHeights },
  breakpoints: { mobile: '375px', tablet: '768px', desktop: '1024px' },
  currency: { locale: 'en-NG', exchangeRate: 1500 }
}

DELIVERABLES:
- tokens.ts file with complete token system
- tokens.css file with CSS custom properties  
- Documentation in comments explaining Nigerian-specific choices
```

---

### **Priority 3: Mobile-First Program Cards** (Subtask 4.3)
**Status:** 🟡 Pending  
**Estimated Time:** 1-2 hours  
**Dependencies:** Design tokens (4.2)

**Cursor Prompt:**
```
Create mobile-first program card component at src/components/ui/ProgramCard.tsx:

REQUIREMENTS:
- 375px mobile optimization with thumb-friendly design
- Use design tokens from tokens.ts for all styling
- Skeleton loading state for 3G optimization  
- Save/unsave buttons (UI only, no API calls yet)
- Accessibility: ARIA labels, keyboard navigation, 4.5:1 contrast
- NGN currency formatting using currency utils
- Display: program name, university, country, cost, duration, match score

PROPS INTERFACE:
interface ProgramCardProps {
  program: {
    id: string
    name: string
    university: string  
    country: string
    tuition_fee: number
    match_score?: number
    scholarship_available: boolean
  }
  loading?: boolean
  onSave?: (programId: string) => void
  isSaved?: boolean
}

DESIGN REQUIREMENTS:
- Card elevation on hover (micro-interaction)
- Match score badge (color-coded: >80 green, >60 yellow, <60 gray)
- Scholarship indicator if available
- Mobile-first responsive design
- Touch-friendly save button (44px minimum)
```

---

### **Priority 4: Dark Mode Infrastructure** (Subtask 4.4)
**Status:** 🟡 Pending  
**Estimated Time:** 1 hour  
**Dependencies:** Design tokens (4.2)

**Cursor Prompt:**
```
Create dark mode system with these files:

1. src/hooks/useDarkMode.ts - React hook for theme management
2. src/styles/dark-theme.css - Dark mode CSS variables
3. Update tokens.ts with dark mode variants

REQUIREMENTS:
- System preference detection (prefers-color-scheme)
- localStorage persistence for user choice
- Smooth transitions between themes
- Optimized for data visualization (better contrast for charts)
- Works offline (no external dependencies)

HOOK INTERFACE:
export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(boolean)
  const toggle = () => void
  return { isDark, setIsDark, toggle }
}

IMPLEMENTATION:
- Auto-detect system preference on first visit
- Store user preference in localStorage
- Apply 'dark' class to document.documentElement
- Provide CSS custom properties for both themes
- Include focus states optimized for both modes
```

---

### **Priority 5: Performance Optimization Utilities** (Subtask 4.5)
**Status:** 🟡 Pending  
**Estimated Time:** 1 hour  
**Dependencies:** Program cards (4.3), Dark mode (4.4)

**Cursor Prompt:**
```
Create performance utilities at src/utils/performance.ts for 3G optimization:

REQUIREMENTS:
- Lazy loading hook for images and components
- Bundle size optimization utilities  
- 3G network detection and adaptation
- Image compression helpers
- Service worker utilities for offline caching

UTILITIES TO CREATE:
1. useLazyImage() - Intersection Observer based image loading
2. useReducedMotion() - Respect prefers-reduced-motion
3. useNetworkStatus() - Detect 3G/slow connections
4. compressImage() - Client-side image optimization
5. preloadCritical() - Preload critical assets

EXAMPLE:
const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  // Implementation with Intersection Observer
  return { imageSrc, isLoaded }
}

FOCUS: Nigerian internet conditions (3G speeds, data costs, intermittent connectivity)
```

---

### **Priority 6: Component Library Setup** (Subtask 4.6)
**Status:** 🟡 Pending  
**Estimated Time:** 1.5 hours  
**Dependencies:** Performance utilities (4.5)

**Cursor Prompt:**
```
Set up component library infrastructure:

REQUIREMENTS:
- Create src/components/index.ts barrel exports
- Set up Storybook for component documentation
- Configure build system for tree-shaking
- Create component templates and guidelines
- Document Nigerian-specific design patterns

FILES TO CREATE:
1. src/components/index.ts - Export all components
2. .storybook/main.js - Storybook configuration
3. stories/ - Component stories and documentation
4. src/components/templates/ - Reusable templates
5. docs/component-guidelines.md - Design system docs

GUIDELINES TO DOCUMENT:
- Mobile-first design principles (375px optimization)
- 3G performance patterns
- NGN currency display standards
- Accessibility requirements (WCAG 2.1 AA)
- Dark mode implementation patterns
- Nigerian cultural localization notes
```

## 📊 Tracking Method

**To update progress:**
1. **Report completed subtasks**: "Completed subtask 4.1 - NGN Currency System"
2. **I'll update Task Master**: Mark subtasks as done and track dependencies
3. **Coordinate integration**: Share any issues or integration needs

**Current parallel work:**
- **Claude**: Working on advanced features (dashboard widgets, onboarding)
- **Cursor**: Working on design system foundation (Tasks 4.1-4.6)

## 🎯 Success Criteria
- All subtasks have clear deliverables and acceptance criteria
- Dependencies are properly managed (4.1 → 4.2 → 4.3, etc.)
- Integration points are well-defined
- Nigerian-specific requirements are prioritized

**Update me on any completions and I'll track progress in Task Master!** 🚀
