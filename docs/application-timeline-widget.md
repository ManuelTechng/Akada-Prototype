# Application Timeline Widget Documentation

## Overview

The **Application Timeline Widget** helps Nigerian students track their study abroad applications, deadlines, and urgent tasks. It’s a mobile-first, accessible, and visually engaging component that integrates with Akada’s data layer and design system.

---

## Features

- **Timeline Visualization:**  
  - Card-based, vertical stack on mobile; horizontal timeline on desktop/tablet
  - Timeline connectors for visual flow

- **Urgency Indicators:**  
  - Color-coded dots/badges for overdue, urgent, upcoming, and future deadlines
  - Real-time countdown timers for urgent/overdue items

- **Status Badges:**  
  - Application status shown as colored badges:  
    - `planning` (gray), `submitted` (blue), `in-review` (yellow), `accepted` (green), `rejected` (red), `deferred` (orange)

- **Quick Actions:**  
  - “View Details”, “Submit Now”, “Set Reminder” buttons on each card
  - “Submit Now” navigates to the application form
  - “Set Reminder” triggers a calendar event

- **Mobile-Optimized:**  
  - Card stack layout, swipe-to-dismiss for completed apps, pull-to-refresh for updates

- **Empty State:**  
  - Friendly illustration, motivational message, and “Browse Programs” CTA when no applications exist

- **Loading State:**  
  - Uses `SkeletonLoader` for smooth loading experience

- **Nigerian Context:**  
  - Dates in DD/MM/YYYY, fees in NGN (₦), WAT timezone, local motivational copy

- **Accessibility:**  
  - Keyboard navigation, ARIA roles, color contrast, screen reader support

- **Dark Mode:**  
  - Fully supported, with readable color tokens

---

## File Structure

- `src/components/dashboard/ApplicationTimelineWidget.tsx`  
  Main widget component

- `src/hooks/useDashboard.ts`  
  Provides `useApplicationTimeline` hook for data

- `src/styles/tokens.ts`  
  Design tokens for colors, spacing, etc.

- `src/components/ui/SkeletonLoader.tsx`  
  For loading states

- `src/utils/currency.ts`  
  NGN currency formatting

- `src/components/ProfileCompletionWidget.tsx`  
  Reference for UI/UX patterns

---

## Data Flow

```typescript
const {
  applications, // Array of application objects
  stats,        // { total, overdueCount, urgentCount, upcomingCount }
  nextDeadline, // { daysLeft, programs }
  insights,     // Array of insight strings
  loading       // boolean
} = useApplicationTimeline();
```

Each application:
```typescript
{
  id: string,
  status: 'planning' | 'submitted' | 'in-review' | 'accepted' | 'rejected' | 'deferred',
  deadline: string, // ISO date
  created_at: string,
  programs: {
    name: string,
    university: string,
    country: string,
    application_fee: number
  }
}
```

---

## UI/UX Details

### Timeline & Cards

- **Mobile:**  
  - Vertical stack, each card shows:
    - Program name, university, country
    - Deadline (DD/MM/YYYY, WAT)
    - Application fee: “₦75,000”
    - Status badge
    - Urgency indicator (dot or badge)
    - Countdown timer (if urgent/overdue)
    - Quick actions

- **Tablet:**  
  - Two-column layout, expanded details

- **Desktop:**  
  - Horizontal timeline, all details visible

### Urgency Logic

- **Overdue:** deadline < today (🔴)
- **Urgent:** deadline ≤ 7 days (🟠)
- **Upcoming:** 8–30 days (🟡)
- **Future:** >30 days (🟢)

### Status Badges

- `planning`: gray
- `submitted`: blue
- `in-review`: yellow
- `accepted`: green
- `rejected`: red
- `deferred`: orange

### Countdown Timers

- Show days/hours/minutes left
- Animate for <24h, alert for <1h (optional)
- Use `react-countdown` or custom logic

### Quick Actions

- **View Details:** expands card
- **Submit Now:** navigates to form
- **Set Reminder:** adds to calendar

### Empty State

- Illustration (student + docs)
- “Start Your Journey!” message
- “Track your applications and never miss a deadline”
- “Browse Programs” CTA

---

## Accessibility

- Semantic HTML (cards as `<section>`, timeline as `<ol>`)
- ARIA roles for timeline, status, and actions
- Sufficient color contrast (tokens)
- Keyboard navigation for all actions
- Screen reader labels for urgency/status

---

## Performance

- Virtualize list for 10+ items
- Lazy load details
- Cache countdowns
- Debounce updates
- Use `React.memo` for cards

---

## Responsive Design

- **Mobile (375px):**  
  - Single column, swipe actions, compact cards
- **Tablet (768px):**  
  - Two columns, expanded details
- **Desktop (1024px+):**  
  - Horizontal timeline, all details visible

---

## Advanced Features

- **Smart Grouping:** by urgency, status, or country
- **Batch Actions:** select multiple for bulk updates
- **Progress Indicators:** show % complete
- **Deadline Predictions:** “Allow 2 days for this application”
- **Success Animations:** confetti on submission

---

## Testing

- 10+ applications (scroll/virtualize)
- Only overdue apps (urgency messaging)
- No applications (empty state)
- Rapid deadline updates (real-time sync)
- Offline mode (cached deadlines)

---

## Example Usage

```tsx
import ApplicationTimelineWidget from 'src/components/dashboard/ApplicationTimelineWidget'

const Dashboard = () => (
  <div>
    {/* ...other widgets... */}
    <ApplicationTimelineWidget />
  </div>
)
```

---

## References

- `src/hooks/useDashboard.ts` – Data hook
- `src/components/ProfileCompletionWidget.tsx` – UI pattern
- `src/styles/tokens.ts` – Design tokens
- `src/utils/currency.ts` – NGN formatting
- `src/components/ui/SkeletonLoader.tsx` – Loading state

---

## Quick Implementation Checklist

- [x] Timeline widget renders with urgency/status indicators
- [x] Countdown timers update in real-time
- [x] Nigerian date/currency formatting
- [x] Mobile swipe actions
- [x] Motivational empty state
- [x] Quick actions for urgent tasks
- [x] Timeline visualization is clear
- [x] Skeleton loading states
- [x] Dark mode support
- [x] Accessibility (WCAG 2.1 AA)

---

**Summary:**  
This document covers all features, data, UI/UX, accessibility, performance, and testing for the Application Timeline Widget in Akada-Prototype. For code review or edge case checks, see the referenced files or ask for a review. 