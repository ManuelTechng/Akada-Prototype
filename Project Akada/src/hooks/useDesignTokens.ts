import { useTheme } from '../contexts/ThemeContext';
import { akadaTokens, generateCSSVariables, formatCurrency, convertCurrency } from '../styles/tokens';

/**
 * Custom hook to access design tokens with theme awareness
 * Provides easy access to colors, spacing, typography, and utilities
 */
export const useDesignTokens = () => {
  const { theme } = useTheme();

  // Get theme-aware color tokens
  const getThemeColor = (colorPath: string) => {
    const keys = colorPath.split('.');
    let value: any = akadaTokens.colors;
    for (const key of keys) {
      value = value[key];
      if (!value) break;
    }
    return value;
  };

  // Get surface colors based on current theme
  const getSurfaceColor = (level: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
    const surfaceMap = {
      primary: theme === 'light' ? akadaTokens.colors.surface.light : akadaTokens.colors.surface.dark,
      secondary: theme === 'light' ? akadaTokens.colors.surface.lightSecondary : akadaTokens.colors.surface.darkSecondary,
      tertiary: theme === 'light' ? akadaTokens.colors.surface.lightTertiary : akadaTokens.colors.surface.darkTertiary
    };
    return surfaceMap[level];
  };

  // Get text colors based on current theme
  const getTextColor = (level: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
    const textMap = {
      primary: theme === 'light' ? akadaTokens.colors.text.primary : akadaTokens.colors.text.primaryDark,
      secondary: theme === 'light' ? akadaTokens.colors.text.secondary : akadaTokens.colors.text.secondaryDark,
      tertiary: theme === 'light' ? akadaTokens.colors.text.tertiary : akadaTokens.colors.text.tertiaryDark
    };
    return textMap[level];
  };

  // Get border color based on current theme
  const getBorderColor = () => {
    return theme === 'light' ? akadaTokens.colors.border.light : akadaTokens.colors.border.dark;
  };

  return {
    // Core tokens
    tokens: akadaTokens,
    theme,
    
    // Color utilities
    colors: {
      primary: akadaTokens.colors.primary,
      status: akadaTokens.colors.status,
      get: getThemeColor,
      surface: getSurfaceColor,
      text: getTextColor,
      border: getBorderColor,
    },
    
    // Spacing utilities
    spacing: akadaTokens.spacing,
    
    // Typography utilities
    typography: akadaTokens.typography,
    
    // Nigerian-specific utilities
    currency: {
      format: formatCurrency,
      convert: convertCurrency,
      symbol: akadaTokens.currency.symbol,
      locale: akadaTokens.currency.locale,
      exchangeRate: akadaTokens.currency.exchangeRate
    },
    
    // Layout utilities
    breakpoints: akadaTokens.breakpoints,
    shadows: akadaTokens.shadows,
    borderRadius: akadaTokens.borderRadius,
    zIndex: akadaTokens.zIndex,
    
    // Animation utilities
    animation: akadaTokens.animation,
    
    // CSS variables for dynamic theming
    cssVariables: generateCSSVariables(theme),
    
    // Utility functions
    utils: {
      // Responsive value selector
      responsive: <T>(values: { mobile?: T; tablet?: T; desktop?: T; default: T }) => {
        // This would typically be used with a useBreakpoint hook
        // For now, return default value
        return values.default;
      },
      
      // Get spacing value with px suffix
      spacing: (key: keyof typeof akadaTokens.spacing) => {
        const value = akadaTokens.spacing[key];
        return typeof value === 'string' ? value : `${value}px`;
      },
      
      // Compose class names with tokens
      className: (...classes: (string | undefined | null | false)[]) => {
        return classes.filter(Boolean).join(' ');
      }
    }
  };
};

// Type exports for better TypeScript support
export type DesignTokensHook = ReturnType<typeof useDesignTokens>;