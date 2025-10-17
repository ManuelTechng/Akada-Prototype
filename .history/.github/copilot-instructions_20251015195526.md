# Akada Prototype - AI Coding Agent Instructions

## 🎯 Project Overview

**Akada** is a student program discovery and application management platform built with React, TypeScript, Vite, and Supabase. It helps students find educational programs, manage applications, and navigate the study abroad process with AI assistance.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router v6
- **State**: React Context API + Custom Hooks
- **Testing**: Vitest + React Testing Library

### Project Structure
```
src/
├── components/      # Reusable UI components
│   ├── layouts/    # DarkSidebar, DarkHeader (used across all protected pages)
│   ├── dashboard/  # Dashboard-specific widgets
│   ├── ui/         # shadcn/ui components
│   └── app/        # Feature-specific components
├── contexts/       # React Context providers (Auth, Theme, SavedPrograms, Notifications)
├── pages/          # Route components
├── lib/            # External integrations (Supabase, currency API)
├── utils/          # Helper functions (envCheck, cacheManager)
├── hooks/          # Custom React hooks
└── types/          # TypeScript type definitions
```

## 🛣️ Routing Convention (Industry Standard)

**All protected routes use `/app/*` pattern with consistent DarkSidebar layout:**

```typescript
/app                 → Dashboard (default landing page after login)
/app/programs        → Program search
/app/saved           → Saved programs
/app/recommended     → AI recommendations
/app/applications    → Application tracking
/app/resources       → Educational resources
/app/community       → Community features
/app/calculator      → Cost calculator
/app/assistant       → AI Assistant (Amara)
/app/settings        → User settings
```

**Key Pattern**: Dashboard is at `/app` (root), not `/app/dashboard` - matches industry standards (Notion, Linear, Vercel).

## 🎨 Layout System

### Protected Routes Pattern
ALL protected pages must use the `ProtectedRoute` wrapper which includes:
- **DarkSidebar** (navigation, theme toggle, user menu)
- **Background effects** (gradient overlays)
- **Mobile sidebar** (state management)
- **Auth protection** (automatic redirect to /login if not authenticated)

```typescript
// Correct pattern for ALL /app/* routes
<Route path="/app/programs" element={
  <ProtectedRoute>
    <ProgramSearchPage />
  </ProtectedRoute>
} />
```

### DarkSidebar Navigation
- Dashboard highlights when on `/app` exactly
- Other routes highlight when pathname starts with their path
- Mobile sidebar toggles with overlay
- Supports collapsed/expanded states

## 🔐 Authentication Flow

### AuthContext Pattern
- Lives in `src/contexts/AuthContext.tsx`
- Provides: `user`, `userProfile`, `loading`, `initialized`, `signIn`, `signOut`, `updateProfile`
- Uses Supabase Auth with localStorage persistence
- **Critical**: Always check `initialized` before `loading` to avoid race conditions

```typescript
const { user, loading, initialized } = useAuth();

// Always check initialized first
if (loading && !initialized) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

### Profile Management
- Profiles stored in `profiles` table (Supabase)
- Include: `user_id`, `full_name`, `email`, `citizenship`, `target_countries`, etc.
- Fetched on auth initialization with timeout protection (5s)
- Use `getProfile(userId)` from `src/lib/auth.ts`

## 💾 Data Management

### Supabase Client
- Initialized in `src/lib/supabase.ts`
- Storage fallback: localStorage → sessionStorage → memory
- Never log API keys (even in development)
- Use `supabase.from('table_name')` for queries

### Caching Strategy
- Currency rates: 24h TTL in localStorage
- Program searches: Session-based caching
- Cache utilities available in dev console: `clearCache()`, `cacheStats()`
- Cache manager in `src/lib/cacheManager.ts`

### SavedProgramsContext
- Manages user's saved programs
- Auto-fetches on mount for authenticated users
- Optimistic updates for better UX
- Use `useSavedPrograms()` hook to access

## 🎨 Styling Conventions

### TailwindCSS Classes
- **Dark theme by default**: Use `dark:` variants
- **Glass morphism pattern**: `bg-gray-900/50 backdrop-blur-xl border border-white/5`
- **Gradients**: `bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950`
- **Indigo accent**: `bg-indigo-500`, `text-indigo-400`, `border-indigo-500`
- **Spacing**: Consistent 4px grid (p-4, gap-4, space-y-4)

### Component Patterns
- Use shadcn/ui components from `src/components/ui/`
- Import lucide-react icons individually: `import { Icon } from 'lucide-react'`
- Always provide `key` prop in mapped components
- Use TypeScript interfaces for props

## 🔧 Development Workflow

### Running the App
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run test         # Run tests (Vitest)
npm run lint         # ESLint check
```

### Environment Variables
Required in `.env.local`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENAI_API_KEY=
```

Check with: `checkEnvironmentVariables()` (auto-runs on app start)

### Console Utilities (Development)
```javascript
// Currency management
currencyUtils.clearCache()
currencyUtils.validateCAD()

// Cache management
clearCache()
cacheStats()
hardRefresh()
```

## 🐛 Common Issues & Solutions

### Issue: Auth context re-renders excessively
- **Cause**: Multiple state updates in AuthContext
- **Solution**: Use single state update or reducer pattern
- **Location**: `src/contexts/AuthContext.tsx`

### Issue: Route not using DarkSidebar
- **Cause**: Route not wrapped in `ProtectedRoute`
- **Solution**: Always use `<ProtectedRoute><YourComponent /></ProtectedRoute>`
- **Location**: `src/App.tsx`

### Issue: Component not importing correctly
- **Cause**: Named vs default exports
- **Solution**: Check export type: `export function Component()` vs `export default Component`

### Issue: Lazy loading fails
- **Cause**: Syntax error in lazy-loaded component
- **Solution**: Check console for specific file causing error, fix syntax/JSX issues

## 📝 Code Style

### TypeScript
- **Strict mode enabled**: Always type function parameters and return values
- **Interface over type**: Use `interface` for object shapes
- **Avoid `any`**: Use `unknown` or proper types
- **Enums for constants**: Use TypeScript enums for fixed values

### React Patterns
- **Functional components only**: No class components
- **Custom hooks**: Extract reusable logic to `src/hooks/`
- **Context + hooks**: For global state (not Redux)
- **Lazy loading**: Use `lazy()` for route components
- **Suspense**: Always provide fallback UI

### Error Handling
- **Try-catch**: Wrap Supabase calls in try-catch
- **Error boundaries**: Root-level ErrorBoundary catches component errors
- **User feedback**: Show toast notifications for errors (use NotificationContext)

## 🚀 Performance

### Optimization Patterns
- Lazy load route components
- Use `React.memo()` for expensive components
- Debounce search inputs (300ms standard)
- Virtualize long lists (react-window)
- Cache API responses (24h for static data)

### Bundle Size
- Tree-shake icons: Import individually
- Code-split by route
- Lazy load non-critical features
- Use dynamic imports for heavy libraries

## 🔒 Security

### Best Practices
- **Never log**: API keys, tokens, or sensitive user data
- **Row Level Security**: Enabled on all Supabase tables
- **Input validation**: Validate all user inputs
- **XSS prevention**: Never use `dangerouslySetInnerHTML` without sanitization
- **Auth checks**: Always verify user authentication server-side (Supabase RLS)

## 🧪 Testing

### Test Patterns
- **Unit tests**: For utility functions (`src/utils/`)
- **Component tests**: For reusable components
- **Integration tests**: For key user flows (auth, search, save)
- **E2E tests**: For critical paths (planned, not yet implemented)

### Testing Utilities
```typescript
// Mock Supabase
vi.mock('./lib/supabase')

// Mock AuthContext
const mockAuth = { user: mockUser, loading: false, initialized: true }
```

## 📚 Key Files to Reference

### Must-Read Files
1. `src/App.tsx` - Routing structure, ProtectedRoute pattern
2. `src/contexts/AuthContext.tsx` - Authentication logic
3. `src/components/layouts/DarkSidebar.tsx` - Navigation structure
4. `src/lib/supabase.ts` - Database client setup
5. `ROUTING_UPDATE_COMPLETE.md` - Latest routing changes

### Configuration Files
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Design tokens
- `tsconfig.json` - TypeScript settings
- `.env.local` - Environment variables (not in repo)

## 🎯 When Making Changes

### Adding New Pages
1. Create component in `src/pages/` or `src/components/app/`
2. Add lazy import in `src/App.tsx`
3. Add route with `ProtectedRoute` wrapper
4. Add to `navItems` in `DarkSidebar.tsx` if needed
5. Test navigation and auth protection

### Modifying Auth
1. Changes go in `src/contexts/AuthContext.tsx`
2. Update profile table schema in Supabase if needed
3. Test sign in, sign out, and session persistence
4. Verify RLS policies in Supabase

### UI Components
1. Check `src/components/ui/` for existing shadcn components first
2. Follow existing patterns for glass morphism and dark theme
3. Ensure mobile responsiveness (test at 375px, 768px, 1024px)
4. Use semantic HTML and ARIA labels for accessibility

---

**Last Updated**: October 15, 2025  
**Version**: 1.0  
**Maintainer**: Akada Team
