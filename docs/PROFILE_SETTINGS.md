# Profile Settings Feature

This document outlines the complete Profile Settings feature for the Akada MVP application.

## Overview

The Profile Settings page allows users to manage their personal information, upload profile pictures, and track their profile completion progress. This feature integrates with Supabase for data storage and includes real-time progress tracking.

## Features

### ✅ Implemented Features

1. **User Avatar Management**
   - Upload profile pictures (JPEG, PNG, GIF, WebP)
   - Automatic image optimization and storage in Supabase
   - Default avatar fallback for users without profile pictures
   - File size limit: 10MB
   - Drag-and-drop support coming soon

2. **Profile Completion Tracking**
   - Real-time circular progress indicator
   - Dynamic completion percentage calculation
   - Visual indicators for incomplete fields
   - Tooltip showing missing fields

3. **Comprehensive User Information Form**
   - Personal details (name, email, phone, bio, date of birth)
   - Educational information (level, university, field of study, GPA)
   - Address information (complete address fields)
   - Form validation with real-time feedback
   - Auto-save functionality

4. **Database Integration**
   - Supabase integration for profile storage
   - Real-time data synchronization
   - Row Level Security (RLS) for data protection
   - Automatic timestamp tracking

5. **User Experience**
   - Mobile-responsive design (optimized for 375px screens)
   - Loading states and progress indicators
   - Success/error toast notifications
   - Smooth transitions and animations
   - Accessibility compliance (WCAG 2.1 AA)

## Technical Implementation

### File Structure

```
src/
├── pages/
│   └── ProfileSettingsPage.tsx          # Main profile settings page
├── components/
│   └── ui/
│       └── CircularProgress.tsx         # Reusable progress indicator
├── lib/
│   ├── profileUtils.ts                  # Profile-related utility functions
│   ├── updateProfile.ts                 # Legacy profile functions (now re-exports)
│   └── types.ts                         # TypeScript type definitions
└── scripts/
    ├── setup-profile-storage.js         # JavaScript setup script
    └── setup-profile-storage.sql        # SQL setup script
```

### Database Schema

#### user_profiles table
```sql
CREATE TABLE public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  bio TEXT,
  date_of_birth DATE,
  education_level TEXT,
  current_university TEXT,
  field_of_study TEXT,
  gpa DECIMAL(3,2),
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  test_scores JSONB,
  study_preferences JSONB,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Storage bucket
- **Bucket name**: `avatars`
- **Access**: Public read, authenticated write
- **File types**: JPEG, PNG, GIF, WebP
- **Size limit**: 10MB

## Setup Instructions

### 1. Database Setup

Run the database setup script:

```bash
npm run setup:profile
```

Or manually execute the SQL script in your Supabase dashboard:

1. Go to SQL Editor in your Supabase dashboard
2. Execute the contents of `scripts/setup-profile-storage.sql`

### 2. Environment Variables

Ensure your `.env` file includes:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For setup script
```

### 3. Storage Policies

The setup script automatically creates these storage policies:

- Users can upload their own avatars
- Users can update their own avatars
- Users can delete their own avatars
- Public read access for avatar viewing

### 4. Row Level Security (RLS)

The following RLS policies are automatically applied:

- Users can only read their own profile
- Users can only insert their own profile
- Users can only update their own profile

## Usage

### Navigation

Add the Profile Settings page to your app's navigation:

```typescript
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// In your router configuration
{
  path: '/profile/settings',
  element: <ProfileSettingsPage />
}
```

### Profile Completion Calculation

The system calculates completion based on these weighted fields:

| Field | Weight | Icon |
|-------|--------|------|
| Full Name | 20% | User |
| Email | 15% | Mail |
| Phone Number | 10% | Phone |
| Bio | 15% | File Text |
| Date of Birth | 10% | Calendar |
| Education Level | 15% | User |
| Current University | 10% | User |
| Field of Study | 10% | User |
| City | 5% | Map Pin |
| Profile Picture | 15% | Camera |

**Total**: 100%

### API Functions

#### Core Functions

```typescript
// Get user profile
const profile = await getUserProfile(userId);

// Update user profile
await updateUserProfile(userId, profileData);

// Calculate completion percentage
const percentage = await calculateProfileCompletion(userId);

// Upload avatar
const avatarUrl = await uploadProfileAvatar(userId, file);

// Delete avatar
await deleteProfileAvatar(userId);
```

## Styling

The page uses Tailwind CSS with the following color scheme:

- **Primary**: `indigo-600` (#4f46e5)
- **Secondary**: `gray-800` (#1f2937)
- **Background**: `gray-50` (#f9fafb)
- **Success**: `green-600` (#059669)
- **Warning**: `amber-600` (#d97706)
- **Error**: `red-600` (#dc2626)

## Mobile Optimization

The page is optimized for mobile devices with:

- Responsive grid layouts
- Touch-friendly form elements
- Optimized image loading
- Mobile-first design approach
- Maximum width constraints for readability

## Performance Considerations

- **Image optimization**: Automatic compression and format optimization
- **Lazy loading**: Profile data is loaded asynchronously
- **Debounced updates**: Form changes are debounced to prevent excessive API calls
- **Caching**: Profile data is cached in memory during the session
- **Progressive enhancement**: Core functionality works without JavaScript

## Testing

### Manual Testing Checklist

- [ ] User can upload profile picture
- [ ] Profile completion percentage updates correctly
- [ ] Form validation works for all fields
- [ ] Data persists after page refresh
- [ ] Mobile layout displays correctly
- [ ] Loading states show appropriately
- [ ] Success/error messages display
- [ ] Accessibility features work (keyboard navigation, screen readers)

### Test Data

Use these test values for comprehensive testing:

```typescript
const testProfile = {
  full_name: "John Doe",
  email: "john.doe@example.com",
  phone_number: "+1 (555) 123-4567",
  bio: "Computer Science student interested in AI and machine learning.",
  date_of_birth: "1995-06-15",
  education_level: "Masters",
  current_university: "University of Lagos",
  field_of_study: "Computer Science",
  gpa: 3.8,
  address_line1: "123 Main Street",
  city: "Lagos",
  state_province: "Lagos State",
  postal_code: "100001",
  country: "Nigeria"
};
```

## Troubleshooting

### Common Issues

1. **Avatar upload fails**
   - Check storage bucket permissions
   - Verify file size is under 10MB
   - Ensure file type is supported

2. **Profile data not saving**
   - Check RLS policies are correctly applied
   - Verify user authentication
   - Check network connectivity

3. **Progress percentage not updating**
   - Ensure all form fields are properly registered
   - Check completion calculation logic
   - Verify watched values are updating

### Debug Mode

Enable debug logging by adding to your environment:

```env
VITE_DEBUG_PROFILE=true
```

## Future Enhancements

### Planned Features

- [ ] Drag-and-drop avatar upload
- [ ] Multiple profile pictures
- [ ] Profile picture cropping
- [ ] Export profile data
- [ ] Profile sharing
- [ ] Advanced validation rules
- [ ] Profile templates
- [ ] Bulk import/export

### Performance Improvements

- [ ] Image CDN integration
- [ ] Progressive image loading
- [ ] Offline profile editing
- [ ] Background sync
- [ ] Optimistic updates

## Contributing

When contributing to the Profile Settings feature:

1. Follow the existing code style and patterns
2. Add appropriate TypeScript types
3. Include proper error handling
4. Add loading states for async operations
5. Test on mobile devices
6. Update this documentation

## Support

For issues related to the Profile Settings feature:

1. Check the troubleshooting section
2. Review the browser console for errors
3. Verify Supabase configuration
4. Check network requests in Developer Tools
5. Test with different user accounts

---

*Last updated: July 2025*
