# Dashboard Enhancement Backlog

## Current Dashboard: FigmaDashboard.tsx ✅

**Location:** `src/components/dashboard/FigmaDashboard.tsx`
**Status:** Production (58 lines, 9 widgets, 96/100 score)
**Features:** Full Supabase integration, glassmorphism design, dark/light themes, per-widget loading

---

## Features Salvaged from Legacy Dashboards

### 1. Program Recommendations Widget

**From:** `src/components/Dashboard.tsx` (deleted)

**Design Pattern:**
```tsx
// Colorful gradient card design
<div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20
               rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30
               hover:shadow-lg transition-all duration-300">
  <div className="flex items-start justify-between mb-4">
    <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
      <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
    </div>
    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
      98% Match
    </span>
  </div>

  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
    {program.name}
  </h3>

  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4" />
      {program.university} • {program.country}
    </div>
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4" />
      {formatNGN(program.tuition_fee)}/year
    </div>
  </div>
</div>
```

**Implementation TODO:**
- [ ] Create `src/components/widgets/ProgramRecommendationsWidget.tsx`
- [ ] Fetch from recommendations API/algorithm
- [ ] Use gradient background pattern
- [ ] Show match percentage
- [ ] Display 3-6 recommendations in grid

---

### 2. Saved Programs Widget

**From:** `src/components/app/Dashboard.tsx` (deleted)

**Design Pattern:**
```tsx
// Sortable list with drag handles
<div className="space-y-3">
  {savedPrograms.map((program) => (
    <div key={program.id}
         className="bg-card rounded-lg border border-border p-4
                    hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3">
        {/* Drag handle for sorting */}
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

        <div className="flex-1">
          <h4 className="font-medium text-foreground">{program.name}</h4>
          <p className="text-sm text-muted-foreground">{program.university}</p>
        </div>

        <button className="p-2 hover:bg-destructive/10 rounded-md">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  ))}
</div>
```

**Implementation TODO:**
- [ ] Create `src/components/widgets/SavedProgramsWidget.tsx`
- [ ] Fetch from `saved_programs` table
- [ ] Add drag-and-drop reordering (react-beautiful-dnd)
- [ ] Show 5-10 most recent
- [ ] Link to full saved programs page

---

### 3. Tasks Widget

**From:** `src/components/Dashboard.tsx` (deleted)

**Design Pattern:**
```tsx
// Task checklist with progress
<div className="space-y-3">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-foreground">Tasks to Complete</h3>
    <span className="text-sm text-muted-foreground">
      {completedCount}/{totalCount} completed
    </span>
  </div>

  {tasks.map((task) => (
    <div key={task.id}
         className="flex items-start gap-3 p-3 rounded-lg
                    hover:bg-muted/50 transition-colors">
      <input
        type="checkbox"
        checked={task.completed}
        className="mt-1 h-4 w-4 rounded border-input"
      />
      <div className="flex-1">
        <p className={cn(
          "text-sm",
          task.completed ? "text-muted-foreground line-through" : "text-foreground"
        )}>
          {task.text}
        </p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Due: {formatDate(task.dueDate)}
          </p>
        )}
      </div>
    </div>
  ))}
</div>
```

**Implementation TODO:**
- [ ] Create `src/components/widgets/TasksWidget.tsx`
- [ ] Integrate with task management system
- [ ] Add due date tracking
- [ ] Allow task creation/completion
- [ ] Show 5-10 pending tasks

---

## Other Useful Patterns

### NGN Currency Formatting (from Dashboard.tsx)
```typescript
// Currency formatting utility
const formatNGN = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
```

**Action:** Already exists in `src/utils/currency.ts` ✅

---

### TokenizedButton Component (from app/Dashboard.tsx)
```tsx
// Semantic button component
<TokenizedButton
  variant="primary"  // or "secondary", "destructive"
  onClick={handleClick}
>
  <Plus className="h-5 w-5" />
  <span>New Application</span>
</TokenizedButton>
```

**Action:** Check if exists globally, if not extract to `src/components/ui/TokenizedButton.tsx`

---

### Progress Indicators (from Dashboard.tsx)
```tsx
// Circular progress with percentage
<div className="relative w-16 h-16">
  <svg className="transform -rotate-90 w-16 h-16">
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      className="text-gray-200 dark:text-gray-700"
    />
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
      strokeDasharray={`${(percentage / 100) * 175.93} 175.93`}
      className="text-primary"
    />
  </svg>
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-sm font-semibold">{percentage}%</span>
  </div>
</div>
```

**Action:** Consider adding to ProfileCompletionWidget or create reusable component

---

## Priority Implementation Order

1. **HIGH**: ProgramRecommendationsWidget
   - Adds valuable feature missing from current dashboard
   - Uses AI/algorithm for personalized recommendations
   - High user value

2. **MEDIUM**: SavedProgramsWidget
   - Quick access to saved programs from dashboard
   - Drag-and-drop for prioritization
   - Links to full saved programs page

3. **LOW**: TasksWidget
   - Nice-to-have for task management
   - Depends on task system implementation
   - Can be added later

---

## Design System Notes

All new widgets should follow FigmaDashboard patterns:

1. **Theme Support:** Dark/Light variants
2. **Loading States:** Skeleton loaders per widget
3. **Error Handling:** Graceful error boundaries
4. **Data Fetching:** Custom hooks (e.g., `useRecommendations()`)
5. **Styling:** HSL semantic tokens, glassmorphism optional
6. **Spacing:** Consistent gap-4/gap-5/gap-6
7. **Responsive:** Grid breakpoints (md:, lg:, xl:)

---

## References

- **Active Dashboard:** `src/components/dashboard/FigmaDashboard.tsx`
- **Widget Examples:** `src/components/widgets/*`
- **Glass Components:** `src/components/glass/*`
- **Theme System:** `src/contexts/ThemeContext.tsx`
- **HSL Colors:** `src/index.css` (CSS variables)
