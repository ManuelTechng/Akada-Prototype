// Design System Tokens for Akada Study Abroad Platform
// Optimized for Nigerian users with 3G connectivity

export const akadaTokens = {
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#4f46e5',  // Main brand color (Indigo-600 from PRD)
      600: '#4338ca',
      700: '#3730a3',
      800: '#312e81',
      900: '#1e1b4b'
    },
    surface: {
      light: '#ffffff',
      lightSecondary: '#f8fafc',
      lightTertiary: '#f1f5f9',
      dark: '#1f2937',  // Gray-800 from PRD
      darkSecondary: '#111827',
      darkTertiary: '#374151'
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
      primaryDark: '#f9fafb',
      secondaryDark: '#d1d5db',
      tertiaryDark: '#9ca3af'
    },
    status: {
      success: '#10b981',
      successLight: '#d1fae5',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      error: '#ef4444',
      errorLight: '#fee2e2',
      info: '#3b82f6',
      infoLight: '#dbeafe'
    },
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#374151',
      focus: '#4f46e5'
    }
  },
  
  // Nigerian-specific formatting and localization
  currency: {
    locale: 'en-NG',
    currency: 'NGN',
    exchangeRate: 1500, // 1 USD = 1500 NGN from PRD
    symbol: '₦',
    formatter: (amount: number, currency: 'NGN' | 'USD' = 'NGN') => {
      if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
      }
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(amount);
    },
    convertUsdToNgn: (usdAmount: number) => usdAmount * 1500,
    convertNgnToUsd: (ngnAmount: number) => ngnAmount / 1500
  },
  
  // 3G-optimized spacing for data-constrained layouts
  spacing: {
    // Touch targets
    touch: '44px', // Minimum touch target for mobile accessibility
    touchLarge: '48px', // Larger touch target for primary actions
    
    // Compact spacing for efficient layouts
    compact: '8px', // For data-constrained layouts
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    
    // Container spacing
    containerPadding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px'
    }
  },
  
  // Typography optimized for Nigerian context
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // Responsive breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px'
  },
  
  // Animation and transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
    toast: 1060
  }
} as const;

// Type definitions for better TypeScript support
export type AkadaTokens = typeof akadaTokens;
export type ColorTokens = typeof akadaTokens.colors;
export type SpacingTokens = typeof akadaTokens.spacing;
export type TypographyTokens = typeof akadaTokens.typography;

// Utility functions for common token usage
export const getColorToken = (path: string) => {
  const keys = path.split('.');
  let value: any = akadaTokens.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const formatCurrency = akadaTokens.currency.formatter;
export const convertCurrency = {
  usdToNgn: akadaTokens.currency.convertUsdToNgn,
  ngnToUsd: akadaTokens.currency.convertNgnToUsd
};

// CSS Custom Properties generator for runtime theme switching
export const generateCSSVariables = (theme: 'light' | 'dark' = 'light') => {
  const colors = akadaTokens.colors;
  return {
    '--akada-primary-50': colors.primary[50],
    '--akada-primary-500': colors.primary[500],
    '--akada-primary-600': colors.primary[600],
    '--akada-primary-900': colors.primary[900],
    '--akada-surface-primary': theme === 'light' ? colors.surface.light : colors.surface.dark,
    '--akada-surface-secondary': theme === 'light' ? colors.surface.lightSecondary : colors.surface.darkSecondary,
    '--akada-text-primary': theme === 'light' ? colors.text.primary : colors.text.primaryDark,
    '--akada-text-secondary': theme === 'light' ? colors.text.secondary : colors.text.secondaryDark,
    '--akada-border': theme === 'light' ? colors.border.light : colors.border.dark,
  } as const;
};