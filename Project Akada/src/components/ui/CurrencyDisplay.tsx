import React from 'react';
import { useDesignTokens } from '../../hooks/useDesignTokens';

interface CurrencyDisplayProps {
  amount: number;
  currency?: 'NGN' | 'USD';
  showConversion?: boolean;
  className?: string;
}

/**
 * Currency display component using Akada design tokens
 * Automatically formats Nigerian Naira and USD with proper localization
 */
const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'NGN',
  showConversion = false,
  className = ''
}) => {
  const { currency: currencyTokens, colors } = useDesignTokens();

  const formattedAmount = currencyTokens.format(amount, currency);
  
  // Calculate conversion if needed
  const convertedAmount = currency === 'USD' 
    ? currencyTokens.convert.usdToNgn(amount)
    : currencyTokens.convert.ngnToUsd(amount);
  
  const convertedCurrency = currency === 'USD' ? 'NGN' : 'USD';
  const formattedConversion = currencyTokens.format(convertedAmount, convertedCurrency);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span 
        className="font-semibold"
        style={{ color: colors.primary[600] }}
      >
        {formattedAmount}
      </span>
      
      {showConversion && (
        <span 
          className="text-sm"
          style={{ color: colors.text('secondary') }}
        >
          (≈ {formattedConversion})
        </span>
      )}
    </div>
  );
};

export default CurrencyDisplay;