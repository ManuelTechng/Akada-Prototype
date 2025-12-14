import React, { forwardRef } from 'react';
import { useDesignTokens } from '../../hooks/useDesignTokens';

interface TokenizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  currency?: boolean;
  fullWidth?: boolean;
}

/**
 * Input component built with design tokens
 * Demonstrates proper token usage for forms, Nigerian currency formatting, and accessibility
 */
const TokenizedInput = forwardRef<HTMLInputElement, TokenizedInputProps>(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  currency = false,
  fullWidth = true,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const { colors, spacing, typography, borderRadius, currency: currencyUtils } = useDesignTokens();

  const inputStyles = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${spacing.sm} ${spacing.md}`,
    paddingLeft: icon && iconPosition === 'left' ? spacing.xl : spacing.md,
    paddingRight: icon && iconPosition === 'right' ? spacing.xl : spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans.join(', '),
    borderRadius: borderRadius.md,
    border: `1px solid ${error ? colors.status.error : colors.border()}`,
    backgroundColor: disabled ? colors.surface('secondary') : colors.surface('primary'),
    color: colors.text('primary'),
    outline: 'none',
    transition: 'all 150ms ease',
    minHeight: spacing.touch, // 44px for accessibility
    ':focus': {
      borderColor: colors.primary[500],
      boxShadow: `0 0 0 3px ${colors.primary[100]}`
    },
    '::placeholder': {
      color: colors.text('tertiary')
    }
  };

  const labelStyles = {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.status.error : colors.text('primary')
  };

  const helperTextStyles = {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: error ? colors.status.error : colors.text('secondary')
  };

  const iconStyles = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    [iconPosition === 'left' ? 'left' : 'right']: spacing.sm,
    color: colors.text('tertiary'),
    pointerEvents: 'none' as const,
    zIndex: 1
  };

  const containerStyle = {
    position: 'relative' as const,
    width: fullWidth ? '100%' : 'auto'
  };

  // Format currency values for Nigerian market
  const formatValue = (value: string) => {
    if (!currency || !value) return value;
    
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const number = parseFloat(numericValue);
    
    if (isNaN(number)) return '';
    
    return currencyUtils.format(number, 'NGN');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currency) {
      const formatted = formatValue(e.target.value);
      e.target.value = formatted;
    }
    props.onChange?.(e);
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyles}>
          {label}
          {props.required && <span style={{ color: colors.status.error }}> *</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {icon && <div style={iconStyles}>{icon}</div>}
        
        <input
          ref={ref}
          style={inputStyles}
          className={className}
          disabled={disabled}
          placeholder={currency ? `${currencyUtils.symbol}0` : props.placeholder}
          {...props}
          onChange={handleChange}
        />
      </div>
      
      {(error || helperText) && (
        <div style={helperTextStyles}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

TokenizedInput.displayName = 'TokenizedInput';

export default TokenizedInput; 