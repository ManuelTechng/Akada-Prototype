# Profile Settings Integration Guide

## Adding Profile Settings to Your App

### 1. Import the ProfileSettingsPage

Add the import to your `App.tsx`:

```typescript
// Add this import with your other page imports
import ProfileSettingsPage from './pages/ProfileSettingsPage';
```

### 2. Update Your Routes

Add the profile settings route to your existing dashboard routes in `App.tsx`:

```typescript
{/* In your dashboard routes section */}
<Route path="/dashboard" element={
  !user ? <Navigate to="/login" replace /> : <AppLayout />
}>
  {/* ... existing routes ... */}
  <Route path="profile" element={<Profile />} />
  <Route path="profile/settings" element={<ProfileSettingsPage />} />
  {/* ... other routes ... */}
</Route>
```

### 3. Add Navigation Links

#### Option A: Replace existing profile page
If you want to replace the existing profile page with the new settings page:

```typescript
// Replace the existing profile route
<Route path="profile" element={<ProfileSettingsPage />} />
```

#### Option B: Add as a separate settings page
Add navigation to the profile settings from your existing profile page or navigation menu:

```typescript
// In your Profile component or navigation
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

// Add this button/link somewhere in your UI
<Link 
  to="/dashboard/profile/settings"
  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
>
  <Settings className="w-4 h-4 mr-2" />
  Profile Settings
</Link>
```

### 4. Update Your App Layout

If you're using a sidebar or navigation menu, add the profile settings link:

```typescript
// In your AppLayout component or navigation
const navigationItems = [
  // ... existing items
  {
    name: 'Profile Settings',
    href: '/dashboard/profile/settings',
    icon: Settings
  }
];
```

### 5. Complete Integration Example

Here's a complete example of how to add it to your existing `App.tsx`:

```typescript
// Add this import at the top
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// In your AppRoutes component, update the dashboard routes:
<Route path="/dashboard" element={
  !user ? <Navigate to="/login" replace /> : <AppLayout />
}>
  <Route index element={<Dashboard />} />
  <Route path="search" element={<ProgramSearchPage />} />
  <Route path="programs/:programId" element={<ProgramDetailsPage userId={user?.id || ''} />} />
  <Route path="recommended" element={<RecommendedProgramsPage userId={user?.id || ''} />} />
  <Route path="saved-programs" element={<MySavedProgramsPage userId={user?.id || ''} />} />
  <Route path="applications" element={<Applications />} />
  <Route path="documents" element={<Documents />} />
  <Route path="resources" element={<Resources />} />
  <Route path="community" element={<Community />} />
  <Route path="profile" element={<Profile />} />
  <Route path="profile/settings" element={<ProfileSettingsPage />} />
  <Route path="calculator" element={<CostCalculator />} />
  <Route path="document-review" element={<DocumentReview />} />
  <Route path="chat" element={<ChatAssistant />} />
</Route>
```

### 6. Database Setup

Before using the profile settings page, make sure to run the database setup:

```bash
# Run the setup script
npm run setup:profile
```

Or manually execute the SQL script in your Supabase dashboard:

1. Go to SQL Editor in Supabase
2. Copy and paste the contents of `scripts/setup-profile-storage.sql`
3. Execute the script

### 7. Testing

Test the integration by:

1. Starting your development server: `npm run dev`
2. Logging in to your app
3. Navigating to `/dashboard/profile/settings`
4. Testing the profile form and avatar upload

### 8. Mobile Navigation

For mobile users, consider adding the profile settings to your mobile menu:

```typescript
// In your mobile navigation component
const mobileMenuItems = [
  // ... existing items
  {
    name: 'Profile Settings',
    href: '/dashboard/profile/settings',
    icon: Settings
  }
];
```

## Quick Start

1. **Copy the files** created in this session to your project
2. **Run the setup script**: `npm run setup:profile`
3. **Add the import** to your `App.tsx`
4. **Add the route** to your dashboard routes
5. **Add navigation links** where appropriate
6. **Test the functionality**

## Navigation Flow

```
Dashboard → Profile → Settings
     ↓
/dashboard/profile/settings
```

This creates a logical flow where users can access their profile settings from the main profile page or directly via the URL.

## Alternative: Standalone Route

If you prefer a standalone route outside of the dashboard, you can add:

```typescript
<Route path="/profile/settings" element={
  !user ? <Navigate to="/login" replace /> : 
  <ProfileSettingsPage />
} />
```

This would make the profile settings accessible at `/profile/settings` without the dashboard wrapper.
