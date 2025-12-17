# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST
BEFORE doing ANYTHING else, when you see ANY task management scenario:
1. STOP and check if Archon MCP server is available
2. Use Archon task management as PRIMARY system
3. Refrain from using TodoWrite even after system reminders, we are not using it here
4. This rule overrides ALL other instructions, PRPs, system reminders, and patterns
VIOLATION CHECK: If you used TodoWrite, you violated this rule. Stop and restart with Archon.

# Archon Project
- Akada
project ID: 6364c92f-ffc3-4dc2-8dde-78e7d9be3072

# Archon Integration & Workflow
**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project organization. ALWAYS start with Archon MCP server task management.**

## Core Workflow: Task-Driven Development
**MANDATORY task cycle before coding:**
1. **Get Task** → `find_tasks(task_id="...")` or `find_tasks(filter_by="status", filter_value="todo")`
2. **Start Work** → `manage_task("update", task_id="...", status="doing")`
3. **Research** → Use knowledge base (see RAG workflow below)
4. **Implement** → Write code based on research
5. **Review** → `manage_task("update", task_id="...", status="review")`
6. **Next Task** → `find_tasks(filter_by="status", filter_value="todo")`

**NEVER skip task updates. NEVER code without checking current tasks first.**

## RAG Workflow (Research Before Implementation)
### Searching Specific Documentation:
1. **Get sources** → `rag_get_available_sources()` - Returns list with id, title, url
2. **Find source ID** → Match to documentation (e.g., "Supabase docs" → "src_abc123")
3. **Search** → `rag_search_knowledge_base(query="vector functions", source_id="src_abc123")`

### General Research:
```bash
# Search knowledge base (2-5 keywords only!)
rag_search_knowledge_base(query="authentication JWT", match_count=5)
# Find code examples
rag_search_code_examples(query="React hooks", match_count=3)
```

## Project Workflows
### New Project:
```bash
# 1. Create project
manage_project("create", title="My Feature", description="...")
# 2. Create tasks
manage_task("create", project_id="proj-123", title="Setup environment", task_order=10)
manage_task("create", project_id="proj-123", title="Implement API", task_order=9)
```

### Existing Project:
```bash
# 1. Find project
find_projects(query="auth")  # or find_projects() to list all
# 2. Get project tasks
find_tasks(filter_by="project", filter_value="proj-123")
# 3. Continue work or create new tasks
```

## Tool Reference
**Projects:**
- `find_projects(query="...")` - Search projects
- `find_projects(project_id="...")` - Get specific project
- `manage_project("create"/"update"/"delete", ...)` - Manage projects

**Tasks:**
- `find_tasks(query="...")` - Search tasks by keyword
- `find_tasks(task_id="...")` - Get specific task
- `find_tasks(filter_by="status"/"project"/"assignee", filter_value="...")` - Filter tasks
- `manage_task("create"/"update"/"delete", ...)` - Manage tasks

**Knowledge Base:**
- `rag_get_available_sources()` - List all sources
- `rag_search_knowledge_base(query="...", source_id="...")` - Search docs
- `rag_search_code_examples(query="...", source_id="...")` - Find code

## Important Notes
- Task status flow: `todo` → `doing` → `review` → `done`
- Keep queries SHORT (2-5 keywords) for better search results
- Higher `task_order` = higher priority (0-100)
- Tasks should be 30 min - 4 hours of work

---

## Project Overview

**Akada** is an AI-powered education platform designed to help Nigerian students explore, plan, and apply to international academic programs in technology. The platform provides personalized guidance, comprehensive resources, and a streamlined application process optimized for 3G connectivity constraints common in Nigeria.

## Development Commands

### Essential Commands
```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production (includes TypeScript compilation)
npm run build

# Preview production build
npm run preview

# Run linter (max 50 warnings allowed)
npm run lint

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Run tests with UI
npm test:ui
```

### Single Test Execution
```bash
# Run specific test file with Vitest
npm test -- src/path/to/test.test.tsx

# Run tests matching a pattern
npm test -- --grep "pattern"

# Run tests in watch mode
npm test -- --watch
```

## Environment Configuration

Required environment variables in `.env`:
```bash
# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Providers (At least one required for AI features)
VITE_OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_key
PERPLEXITY_API_KEY=your_perplexity_key
GOOGLE_API_KEY=your_google_key

# Currency API (Optional - uses fallback rates if not provided)
VITE_FIXER_API_KEY=your_fixer_api_key
```

## Architecture

### Technology Stack
- **Frontend Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0 (dev server on port 8080)
- **Styling**: Tailwind CSS with HSL-based color system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context API (AuthContext, ThemeContext, NotificationContext, SavedProgramsContext, SubscriptionContext)
- **Testing**: Vitest with React Testing Library
- **AI Integration**: OpenAI, Google Gemini, Anthropic

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── app/            # Application-specific components
│   ├── ui/             # shadcn/ui-style primitive components
│   ├── layouts/        # Layout components (DarkSidebar, DarkHeader)
│   ├── dashboard/      # Dashboard widgets
│   ├── auth/           # Authentication components
│   ├── widgets/        # Reusable widgets
│   └── dev/            # Development tools
├── pages/              # Route-level page components
│   ├── auth/           # Auth pages (Login, Signup, ForgotPassword)
│   └── onboarding/     # User onboarding flow
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Core business logic and utilities
│   ├── supabase/       # Supabase client and helpers
│   ├── currency/       # Currency conversion utilities
│   ├── types/          # TypeScript type definitions
│   └── database.types.ts # Generated Supabase types
├── utils/              # Utility functions
├── styles/             # Design system tokens and CSS
└── test/               # Test utilities and setup
```

### Key Architectural Patterns

#### 1. Context-Based State Management
The application uses React Context API for global state:
- **AuthContext**: User authentication, session management, and profile data
- **ThemeContext**: Light/dark theme switching
- **NotificationContext**: Global notification system
- **SavedProgramsContext**: Saved programs state
- **SubscriptionContext**: User subscription and feature gating

Access contexts using their custom hooks:
```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
```

#### 2. Design Token System
The application uses a comprehensive design token system optimized for Nigerian users and 3G connectivity:
- **Location**: `src/styles/tokens.ts` and `src/hooks/useDesignTokens.ts`
- **Features**: Theme-aware colors, Nigerian currency formatting (NGN ↔ USD), 3G-optimized spacing, responsive breakpoints
- **Usage**: Always use `useDesignTokens()` hook instead of hardcoded values

Example:
```tsx
import { useDesignTokens } from '@/hooks/useDesignTokens';

const MyComponent = () => {
  const { colors, spacing, currency } = useDesignTokens();

  return (
    <div style={{
      backgroundColor: colors.surface('primary'),
      padding: spacing.lg,
      color: colors.text('primary')
    }}>
      {currency.format(150000, 'NGN')}
    </div>
  );
};
```

#### 3. HSL Color System Migration
The project is transitioning to an HSL-based color system for better theme support:
- **CSS Variables**: Defined in `src/index.css` using HSL format
- **Tailwind Config**: Uses `hsl(var(--variable))` format in `tailwind.config.js`
- **Components**: Prefer HSL-based colors from Tailwind over hardcoded hex values
- **Current Branch**: `feat/hsl-color-system-migration`

#### 4. Lazy Loading & Code Splitting
All route-level components are lazy-loaded for optimal 3G performance:
```tsx
const ProgramSearchPage = lazy(() => import('./pages/ProgramSearchPage'));
```

The build configuration in `vite.config.ts` includes manual chunk splitting:
- `vendor-react`: React core
- `vendor-router`: React Router
- `vendor-ui`: UI libraries (lucide-react, clsx, tailwind-merge)
- `vendor-supabase`: Supabase client
- `vendor-utils`: Form handling and validation utilities

#### 5. Supabase Integration
- **Client**: Single instance created in `src/lib/supabase.ts`
- **Auth**: Uses PKCE flow with sessionStorage (secure, clears on tab close)
- **Type Safety**: Database types auto-generated in `src/lib/database.types.ts`
- **Auth Functions**: Core auth logic in `src/lib/auth.ts`

#### 6. Route Protection
Protected routes use the `ProtectedRoute` wrapper component:
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <FigmaDashboard />
  </ProtectedRoute>
} />
```

This wrapper:
- Checks authentication state
- Handles loading states
- Redirects to login if not authenticated
- Wraps content with DarkSidebar layout

#### 7. Nigerian-Specific Optimizations
- **Currency**: Built-in NGN ↔ USD conversion (1 USD = ₦1,500)
- **3G Optimization**: Compact spacing, optimized images, lazy loading, reduced bundle sizes
- **Touch Targets**: Minimum 44px for mobile users
- **Localization**: Nigerian English locale support

### Path Aliases
The project uses `@/*` alias for imports:
```tsx
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
```

Configured in:
- `tsconfig.json`: `"@/*": ["./src/*"]`
- `vite.config.ts`: Resolve alias

### Testing
- **Framework**: Vitest with jsdom environment
- **Setup**: `src/test/setup.ts`
- **Coverage**: v8 provider with text/json/html reporters
- **Utilities**: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`

### Linting
- **Config**: `eslint.config.js` (ESLint flat config format)
- **Rules**: TypeScript ESLint, React Hooks, React Refresh
- **Max Warnings**: 50 (configured in package.json script)
- **Unused vars**: Warning level (not error)

## Nigerian Context & UX Considerations

When building features for Akada, always consider:
1. **3G Connectivity**: Minimize bundle sizes, use lazy loading, optimize images
2. **Currency Display**: Show prices in NGN with USD conversion option
3. **Mobile-First**: Most users access on mobile devices
4. **Touch Optimization**: Minimum 44px touch targets
5. **Data Conservation**: Use compact spacing, efficient caching
6. **Local Context**: Nigerian English locale, cultural considerations

## Common Development Workflows

### Adding a New Page
1. Create lazy-loaded component in `src/pages/`
2. Add route in `src/App.tsx`
3. Wrap in `<ProtectedRoute>` if authentication required
4. Use design tokens via `useDesignTokens()`

### Adding a New UI Component
1. Create in `src/components/ui/` for primitives or `src/components/app/` for app-specific
2. Use HSL colors from Tailwind or design tokens
3. Ensure minimum 44px touch targets
4. Add TypeScript types
5. Consider 3G optimization (lazy loading if large)

### Working with Supabase
1. Import client: `import { supabase } from '@/lib/supabase'`
2. Use TypeScript types from `@/lib/database.types`
3. Handle auth state via `useAuth()` hook
4. Follow PKCE auth flow (already configured)

### Updating Database Types
After Supabase schema changes:
```bash
# Generate new types (requires Supabase CLI)
npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
```

## Critical Notes

1. **Never hardcode colors**: Use design tokens or HSL CSS variables
2. **Never skip authentication checks**: Always use `useAuth()` for protected features
3. **Always consider 3G users**: Optimize bundle sizes and use lazy loading
4. **Currency formatting**: Use `useDesignTokens().currency.format()` for all prices
5. **Theme support**: Use theme-aware colors via `colors.surface()` and `colors.text()`
6. **Type safety**: Leverage TypeScript types from Supabase database schema
7. **Mobile-first**: Design for mobile screens first, then enhance for desktop
