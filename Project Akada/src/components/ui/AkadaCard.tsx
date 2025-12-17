import React from 'react';
import { useDesignTokens } from '../../hooks/useDesignTokens';

interface AkadaCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Card component using Akada design tokens
 * Demonstrates proper use of spacing, colors, and shadows from the design system
 */
const AkadaCard: React.FC<AkadaCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = ''
}) => {
  const { colors, spacing, shadows, borderRadius } = useDesignTokens();

  const getVariantStyles = () => {
    const baseStyles = {
      backgroundColor: colors.surface('primary'),
      borderRadius: borderRadius.lg,
      transition: 'all 150ms ease'
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: shadows.md,
          border: 'none'
        };
      case 'outlined':
        return {
          ...baseStyles,
          border: `1px solid ${colors.border()}`,
          boxShadow: 'none'
        };
      default:
        return {
          ...baseStyles,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border()}`
        };
    }
  };

  const getPaddingValue = () => {
    switch (padding) {
      case 'sm':
        return spacing.md;
      case 'lg':
        return spacing.xl;
      default:
        return spacing.lg;
    }
  };

  const cardStyles = {
    ...getVariantStyles(),
    padding: getPaddingValue()
  };

  return (
    <div
      className={`w-full ${className}`}
      style={cardStyles}
    >
      {children}
    </div>
  );
};

export default AkadaCard;