# Akada Design System Tokens

This directory contains the design system tokens for the Akada Study Abroad Platform, optimized for Nigerian users with 3G connectivity constraints.

## Overview

The design system provides a comprehensive set of tokens including:
- **Colors**: Primary brand colors, surface colors, text colors, and status colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: 3G-optimized spacing with touch targets and compact layouts
- **Currency**: Nigerian-specific formatting with NGN/USD conversion
- **Responsive**: Breakpoints and utility functions
- **Effects**: Shadows, border radius, and animations

## Usage

### Basic Hook Usage

```tsx
import { useDesignTokens } from '../hooks/useDesignTokens';

const MyComponent = () => {
  const { colors, spacing, currency } = useDesignTokens();
  
  return (
    <div style={{
      backgroundColor: colors.surface('primary'),
      padding: spacing.lg,
      color: colors.text('primary')
    }}>
      Price: {currency.format(150000, 'NGN')}
    </div>
  );
};
```

### Currency Formatting

```tsx
import { useDesignTokens } from '../hooks/useDesignTokens';

const PriceDisplay = ({ amount }: { amount: number }) => {
  const { currency } = useDesignTokens();
  
  return (
    <div>
      <p>NGN: {currency.format(amount, 'NGN')}</p>
      <p>USD: {currency.format(currency.convert.ngnToUsd(amount), 'USD')}</p>
      <p>Exchange Rate: 1 USD = ₦{currency.exchangeRate}</p>
    </div>
  );
};
```

### Theme-Aware Components

```tsx
import { useDesignTokens } from '../hooks/useDesignTokens';

const ThemedButton = ({ children }: { children: React.ReactNode }) => {
  const { colors, spacing, borderRadius } = useDesignTokens();
  
  const buttonStyle = {
    backgroundColor: colors.primary[500],
    color: colors.surface('primary'),
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    border: 'none',
    minHeight: spacing.touch, // 44px minimum touch target
    cursor: 'pointer'
  };
  
  return <button style={buttonStyle}>{children}</button>;
};
```

### Responsive Design

```tsx
import { useDesignTokens } from '../hooks/useDesignTokens';

const ResponsiveCard = () => {
  const { spacing, breakpoints } = useDesignTokens();
  
  return (
    <div 
      className={`
        p-4 sm:p-6 lg:p-8
        w-full sm:w-auto
        max-w-sm sm:max-w-md lg:max-w-lg
      `}
      style={{
        padding: spacing.containerPadding.mobile,
        '@media (min-width: 640px)': {
          padding: spacing.containerPadding.tablet
        },
        '@media (min-width: 1024px)': {
          padding: spacing.containerPadding.desktop
        }
      }}
    >
      Responsive content
    </div>
  );
};
```

## Components Using Design Tokens

### CurrencyDisplay Component

```tsx
import CurrencyDisplay from '../ui/CurrencyDisplay';

<CurrencyDisplay 
  amount={150000} 
  currency="NGN" 
  showConversion={true} 
/>
```

### AkadaCard Component

```tsx
import AkadaCard from '../ui/AkadaCard';

<AkadaCard variant="elevated" padding="lg">
  <h3>Card Title</h3>
  <p>Card content with proper spacing and theming</p>
</AkadaCard>
```

## Nigerian-Specific Features

### Currency Conversion
- Automatic NGN ↔ USD conversion
- Exchange rate: 1 USD = ₦1,500 (as per PRD)
- Proper Nigerian locale formatting

### 3G Optimization
- Compact spacing options for data-constrained layouts
- Optimized touch targets (44px minimum)
- Efficient component sizing

### Localization
- Nigerian English locale support
- Naira symbol (₦) integration
- Culturally appropriate design patterns

## Color System

### Primary Colors
```tsx
colors.primary[50]  // Very light indigo
colors.primary[500] // Main brand color
colors.primary[600] // Darker variant
colors.primary[900] // Darkest variant
```

### Surface Colors (Theme-aware)
```tsx
colors.surface('primary')   // Main background
colors.surface('secondary') // Secondary background
colors.surface('tertiary')  // Tertiary background
```

### Text Colors (Theme-aware)
```tsx
colors.text('primary')   // Main text
colors.text('secondary') // Secondary text
colors.text('tertiary')  // Tertiary text
```

### Status Colors
```tsx
colors.status.success // Green for success states
colors.status.warning // Yellow for warning states
colors.status.error   // Red for error states
colors.status.info    // Blue for info states
```

## Spacing System

### Standard Spacing
```tsx
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px
spacing.lg    // 24px
spacing.xl    // 32px
spacing.xxl   // 48px
```

### Touch Targets
```tsx
spacing.touch      // 44px - Minimum touch target
spacing.touchLarge // 48px - Larger touch target
```

### Compact Spacing
```tsx
spacing.compact // 8px - For data-constrained layouts
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Test with 3G constraints** - use compact spacing when appropriate
3. **Consider Nigerian context** - show prices in NGN with USD conversion
4. **Maintain accessibility** - use minimum touch targets (44px)
5. **Support both themes** - use theme-aware color functions
6. **Optimize for mobile** - prioritize mobile-first responsive design

## Migration Guide

To migrate existing components to use design tokens:

1. Import the `useDesignTokens` hook
2. Replace hardcoded colors with token-based colors
3. Replace hardcoded spacing with token-based spacing
4. Use currency utilities for price displays
5. Apply responsive utilities for breakpoints

### Before
```tsx
const OldComponent = () => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: '24px',
    color: '#1f2937'
  }}>
    Price: ₦150,000
  </div>
);
```

### After
```tsx
const NewComponent = () => {
  const { colors, spacing, currency } = useDesignTokens();
  
  return (
    <div style={{
      backgroundColor: colors.surface('primary'),
      padding: spacing.lg,
      color: colors.text('primary')
    }}>
      Price: {currency.format(150000, 'NGN')}
    </div>
  );
};
```

## Contributing

When adding new tokens:
1. Follow the existing naming conventions
2. Consider 3G optimization implications
3. Test with both light and dark themes
4. Document Nigerian-specific considerations
5. Add TypeScript types for new token categories