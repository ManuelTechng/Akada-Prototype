# 🌙 Akada Dark Mode Implementation Guide

## Overview

Akada's dark mode system is designed specifically for Nigerian users with 3G connectivity, providing:
- **Consistent theming** across all components
- **System preference detection** with manual override
- **Optimized colors** for data visualization and accessibility
- **Reduced eye strain** for extended study sessions

## 🎯 Key Features

### 1. **Unified Theme System**
- Single source of truth via `useDarkMode` hook
- Automatic system preference detection
- Persistent user preferences
- Smooth transitions between themes

### 2. **Nigerian-Optimized Colors**
- **NGN Currency**: Green tones for Nigerian Naira
- **USD Currency**: Blue tones for US Dollar
- **High Contrast**: Optimized for mobile screens
- **Data Visualization**: Clear chart colors in both modes

### 3. **3G-Optimized Performance**
- CSS variables for instant theme switching
- Minimal bundle size impact
- Efficient class-based implementation

## 🚀 Usage

### Basic Theme Hook
```typescript
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, isDark, toggleTheme, setMode } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};
```

### Pre-built Classes Hook
```typescript
import { useDarkModeClasses } from '../hooks/useDarkModeClasses';

const MyComponent = () => {
  const classes = useDarkModeClasses();
  
  return (
    <div className={classes.bg.primary}>
      <h1 className={classes.text.primary}>Title</h1>
      <p className={classes.text.secondary}>Description</p>
      <button className={classes.button.primary}>
        Action
      </button>
    </div>
  );
};
```

### Dark Mode Toggle Component
```typescript
import DarkModeToggle from '../components/ui/DarkModeToggle';

// Switch variant (default)
<DarkModeToggle />

// Button variant with system option
<DarkModeToggle variant="buttons" />

// Without label
<DarkModeToggle showLabel={false} />
```

## 🎨 Color System

### Background Colors
- **Primary**: `bg-white dark:bg-gray-900`
- **Secondary**: `bg-gray-50 dark:bg-gray-800`
- **Elevated**: `bg-white dark:bg-gray-800 shadow-sm`

### Text Colors
- **Primary**: `text-gray-900 dark:text-gray-100`
- **Secondary**: `text-gray-600 dark:text-gray-300`
- **Accent**: `text-indigo-600 dark:text-indigo-400`

### Interactive Elements
- **Primary Button**: `bg-indigo-600 dark:bg-indigo-500`
- **Secondary Button**: `bg-gray-100 dark:bg-gray-700`
- **Input Fields**: `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`

## 📱 Nigerian-Specific Features

### Currency Colors
```typescript
// NGN (Nigerian Naira) - Green theme
className="text-green-600 dark:text-green-400"

// USD (US Dollar) - Blue theme  
className="text-blue-600 dark:text-blue-400"
```

### Data Visualization
```typescript
// Chart colors optimized for both themes
const chartColors = {
  light: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'],
  dark: ['#60A5FA', '#34D399', '#FBBF24', '#F87171']
};
```

## 🔧 Best Practices

### 1. **Always Use Dark Mode Classes**
```typescript
// ✅ Good
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// ❌ Bad
<div className="bg-white text-gray-900">
```

### 2. **Use Pre-built Class Combinations**
```typescript
// ✅ Good - Consistent and tested
const classes = useDarkModeClasses();
<div className={classes.card}>

// ❌ Bad - Manual and error-prone
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
```

### 3. **Test Both Themes**
- Always test components in both light and dark modes
- Verify contrast ratios meet accessibility standards
- Check data visualization clarity

### 4. **Handle System Preferences**
```typescript
// ✅ Good - Respects user's system preference
const { mode, setMode } = useTheme();

// Allow users to choose system, light, or dark
<select onChange={(e) => setMode(e.target.value)}>
  <option value="system">System</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>
```

## 🐛 Common Issues

### 1. **Flash of Wrong Theme**
**Problem**: Brief flash of light theme on page load
**Solution**: Use CSS variables and proper SSR handling

### 2. **Inconsistent Colors**
**Problem**: Some components don't match the theme
**Solution**: Use `useDarkModeClasses` hook for consistency

### 3. **Poor Contrast**
**Problem**: Text hard to read in dark mode
**Solution**: Use tested color combinations from the design system

## 🔄 Migration Guide

### From Old Theme System
```typescript
// Old way
const { theme } = useTheme();
const isDark = theme === 'dark';

// New way
const { isDark, theme, mode } = useTheme();
// Now includes system preference support
```

### Adding Dark Mode to Existing Components
1. Import `useDarkModeClasses`
2. Replace hardcoded classes with theme-aware classes
3. Test in both modes
4. Verify accessibility

## 📊 Performance Impact

- **Bundle Size**: +2KB for complete dark mode system
- **Runtime**: Negligible performance impact
- **Memory**: CSS variables cached by browser
- **3G Optimized**: Instant theme switching without re-downloads

## 🎯 Nigerian User Benefits

1. **Reduced Data Usage**: Efficient CSS-based implementation
2. **Better Battery Life**: Dark mode reduces screen power consumption
3. **Eye Comfort**: Optimized for extended study sessions
4. **Cultural Relevance**: NGN currency highlighting in green
5. **Accessibility**: High contrast ratios for various lighting conditions
