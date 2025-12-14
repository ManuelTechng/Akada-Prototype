import React from 'react';
import { useDesignTokens } from '../../hooks/useDesignTokens';

interface TokenizedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button component built with design tokens
 * Demonstrates proper token usage for colors, spacing, typography, and accessibility
 */
const TokenizedButton: React.FC<TokenizedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useDesignTokens();

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: borderRadius.md,
      fontFamily: typography.fontFamily.sans.join(', '),
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 150ms ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      textDecoration: 'none',
      opacity: disabled ? '0.6' : '1'
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: colors.primary[500],
          color: 'white',
          boxShadow: shadows.sm,
          ':hover': {
            backgroundColor: colors.primary[600],
            boxShadow: shadows.md
          }
        };
      
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: colors.surface('secondary'),
          color: colors.text('primary'),
          border: `1px solid ${colors.border()}`,
          boxShadow: shadows.sm,
          ':hover': {
            backgroundColor: colors.surface('tertiary'),
            borderColor: colors.primary[300]
          }
        };
      
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: colors.primary[500],
          border: `2px solid ${colors.primary[500]}`,
          ':hover': {
            backgroundColor: colors.primary[50],
            borderColor: colors.primary[600]
          }
        };
      
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: colors.text('primary'),
          ':hover': {
            backgroundColor: colors.surface('secondary')
          }
        };
      
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${spacing.xs} ${spacing.sm}`,
          fontSize: typography.fontSize.sm,
          minHeight: spacing.touch // 44px minimum for accessibility
        };
      
      case 'lg':
        return {
          padding: `${spacing.md} ${spacing.xl}`,
          fontSize: typography.fontSize.lg,
          minHeight: spacing.touchLarge // 48px for larger buttons
        };
      
      default: // md
        return {
          padding: `${spacing.sm} ${spacing.lg}`,
          fontSize: typography.fontSize.base,
          minHeight: spacing.touch
        };
    }
  };

  const buttonStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    width: fullWidth ? '100%' : 'auto'
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      style={buttonStyles}
    >
      {children}
    </button>
  );
};

export default TokenizedButton; 