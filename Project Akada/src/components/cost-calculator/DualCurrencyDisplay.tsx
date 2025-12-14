import React from 'react';
import { useProgramTuition } from '../../hooks/useProgramTuition';

interface DualCurrencyDisplayProps {
  /** Amount in USD */
  amountUSD: number;
  /** Destination country for currency context */
  destinationCountry: string;
  /** Home country code (default: 'NGA' for Nigeria) */
  homeCountry?: string;
  /** Text size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show loading state */
  showLoading?: boolean;
  /** Custom class names */
  className?: string;
}

const sizeClasses = {
  sm: {
    primary: 'text-sm',
    secondary: 'text-xs'
  },
  md: {
    primary: 'text-base',
    secondary: 'text-sm'
  },
  lg: {
    primary: 'text-lg font-semibold',
    secondary: 'text-sm'
  },
  xl: {
    primary: 'text-2xl font-bold',
    secondary: 'text-sm'
  }
};

/**
 * Component for displaying costs in both destination and home currency
 * Uses real-time exchange rates via useProgramTuition hook
 *
 * Example output: "$45,000 CAD (≈ ₦28,125,000)"
 */
export const DualCurrencyDisplay: React.FC<DualCurrencyDisplayProps> = ({
  amountUSD,
  destinationCountry,
  homeCountry = 'Nigeria',
  size = 'md',
  showLoading = true,
  className = ''
}) => {
  const { primary, secondary, isLoading, hasError } = useProgramTuition(
    amountUSD,
    destinationCountry,
    {
      showConversion: true,
      enableRealTime: true,
      cacheTime: 300000 // 5 minutes
    }
  );

  const sizes = sizeClasses[size];

  if (isLoading && showLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className={`${sizes.primary} text-gray-400 dark:text-gray-500`}>
          Loading...
        </div>
      </div>
    );
  }

  if (hasError && !secondary) {
    // Fallback to simple USD display if conversion fails
    return (
      <div className={className}>
        <div className={`${sizes.primary} text-gray-900 dark:text-white`}>
          ${amountUSD.toLocaleString()}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`${sizes.primary} text-gray-900 dark:text-white`}>
        {primary}
      </div>
      {secondary && (
        <div className={`${sizes.secondary} text-gray-500 dark:text-gray-400 mt-0.5`}>
          ≈ {secondary}
        </div>
      )}
    </div>
  );
};

/**
 * Inline variant for compact display (single line)
 */
export const DualCurrencyInline: React.FC<DualCurrencyDisplayProps> = ({
  amountUSD,
  destinationCountry,
  homeCountry = 'Nigeria',
  className = ''
}) => {
  const { primary, secondary, isLoading, hasError } = useProgramTuition(
    amountUSD,
    destinationCountry,
    {
      showConversion: true,
      enableRealTime: true,
      cacheTime: 300000
    }
  );

  if (isLoading) {
    return <span className={`text-gray-400 ${className}`}>Loading...</span>;
  }

  if (hasError && !secondary) {
    return <span className={className}>${amountUSD.toLocaleString()}</span>;
  }

  return (
    <span className={className}>
      {primary}
      {secondary && <span className="text-gray-500 dark:text-gray-400"> (≈ {secondary})</span>}
    </span>
  );
};

export default DualCurrencyDisplay;
