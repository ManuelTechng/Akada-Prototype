// Optimized Design Tokens for 3G Networks
// Tree-shakeable and minimal bundle size

// Core colors only - most frequently used
export const coreColors = {
  primary: {
    400: '#818cf8',
    500: '#4f46e5', // Main brand
    600: '#4338ca'
  },
  surface: {
    light: '#ffffff',
    dark: '#1f2937'
  },
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    primaryDark: '#f9fafb',
    secondaryDark: '#d1d5db'
  },
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
  },
  border: {
    light: '#e5e7eb',
    dark: '#374151'
  }
} as const;

// Minimal spacing for 3G optimization
export const compactSpacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',  // Reduced from 16px
  lg: '20px',  // Reduced from 24px
  xl: '28px',  // Reduced from 32px
  touch: '44px', // Accessibility minimum
  compact: '6px' // Ultra-compact for 3G
} as const;

// Essential typography only
export const coreTypography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600'
  }
} as const;

// Nigerian currency essentials
export const currency = {
  ngn: '₦',
  exchangeRate: 1500,
  format: (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  },
  convertUSD: (usd: number): number => usd * 1500
} as const;

// Minimal border radius
export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px'
} as const;

// Optimized breakpoints
export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px'
} as const;

// Performance utilities
export const getThemeColor = (isLight: boolean) => ({
  surface: isLight ? coreColors.surface.light : coreColors.surface.dark,
  text: isLight ? coreColors.text.primary : coreColors.text.primaryDark,
  textSecondary: isLight ? coreColors.text.secondary : coreColors.text.secondaryDark,
  border: isLight ? coreColors.border.light : coreColors.border.dark
});

// Tree-shakeable utilities
export const createButtonStyles = (variant: 'primary' | 'secondary', isLight: boolean) => {
  const theme = getThemeColor(isLight);
  
  if (variant === 'primary') {
    return {
      backgroundColor: coreColors.primary[500],
      color: 'white',
      padding: `${compactSpacing.sm} ${compactSpacing.lg}`,
      borderRadius: borderRadius.md,
      border: 'none',
      fontFamily: coreTypography.fontFamily,
      fontSize: coreTypography.fontSize.base,
      fontWeight: coreTypography.fontWeight.medium,
      minHeight: compactSpacing.touch,
      cursor: 'pointer'
    };
  }
  
  return {
    backgroundColor: theme.surface,
    color: theme.text,
    padding: `${compactSpacing.sm} ${compactSpacing.lg}`,
    borderRadius: borderRadius.md,
    border: `1px solid ${theme.border}`,
    fontFamily: coreTypography.fontFamily,
    fontSize: coreTypography.fontSize.base,
    fontWeight: coreTypography.fontWeight.medium,
    minHeight: compactSpacing.touch,
    cursor: 'pointer'
  };
};

export const createCardStyles = (isLight: boolean) => {
  const theme = getThemeColor(isLight);
  
  return {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: borderRadius.lg,
    padding: compactSpacing.lg,
    color: theme.text
  };
};

// 3G-optimized CSS custom properties (minimal set)
export const createCSSVariables = (isLight: boolean) => {
  const theme = getThemeColor(isLight);
  
  return {
    '--akada-primary': coreColors.primary[500],
    '--akada-surface': theme.surface,
    '--akada-text': theme.text,
    '--akada-border': theme.border,
    '--akada-spacing-sm': compactSpacing.sm,
    '--akada-spacing-md': compactSpacing.md,
    '--akada-spacing-lg': compactSpacing.lg,
    '--akada-radius': borderRadius.md
  };
};

// Type exports for tree-shaking
export type CoreColors = typeof coreColors;
export type CompactSpacing = typeof compactSpacing;
export type CoreTypography = typeof coreTypography; 