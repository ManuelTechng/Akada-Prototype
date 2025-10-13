// Component for displaying program costs with currency awareness
import React from 'react';
import { formatCurrency } from '../../lib/currency/formatters';
import { formatNGN, formatUSD } from '../../utils/currency';
import type { Program } from '../../lib/types';

interface ProgramWithCurrency extends Program {
  tuition_fee_converted?: number;
  application_fee_converted?: number;
  tuition_conversion_rate?: number;
  application_conversion_rate?: number;
  user_currency?: string;
}

interface ProgramCurrencyDisplayProps {
  program: ProgramWithCurrency;
  showOriginal?: boolean;
  showConversionRate?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Display program costs with currency awareness and conversion
 */
export function ProgramCurrencyDisplay({
  program,
  showOriginal = true,
  showConversionRate = false,
  compact = false,
  className = ''
}: ProgramCurrencyDisplayProps) {
  const userCurrency = program.user_currency || 'NGN';
  const tuitionCurrency = program.tuition_fee_currency || 'USD';
  const applicationCurrency = program.application_fee_currency || 'USD';

  // Use original amounts if available, fallback to tuition_fee
  const originalTuition = program.tuition_fee_original || program.tuition_fee;
  const originalApplication = program.application_fee_original;

  // Use converted amounts if available
  const convertedTuition = program.tuition_fee_converted;
  const convertedApplication = program.application_fee_converted;

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return formatNGN(amount, { compact });
    } else if (currency === 'USD') {
      return formatUSD(amount, { compact });
    } else {
      return formatCurrency(amount, currency, { compact });
    }
  };

  const getTuitionDisplay = () => {
    // If we have a converted amount and it's different currency
    if (convertedTuition && userCurrency !== tuitionCurrency) {
      return (
        <div className="space-y-1">
          <div className="font-semibold text-lg">
            {formatAmount(convertedTuition, userCurrency)}
          </div>
          {showOriginal && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Original: {formatAmount(originalTuition, tuitionCurrency)}
            </div>
          )}
          {showConversionRate && program.tuition_conversion_rate && (
            <div className="text-xs text-gray-500">
              Rate: 1 {tuitionCurrency} = {program.tuition_conversion_rate.toFixed(4)} {userCurrency}
            </div>
          )}
        </div>
      );
    }

    // If same currency or no conversion available
    return (
      <div className="font-semibold text-lg">
        {formatAmount(originalTuition, tuitionCurrency)}
      </div>
    );
  };

  const getApplicationFeeDisplay = () => {
    if (!originalApplication) return null;

    // If we have a converted amount and it's different currency
    if (convertedApplication && userCurrency !== applicationCurrency) {
      return (
        <div className="space-y-1">
          <div className="font-medium">
            Application: {formatAmount(convertedApplication, userCurrency)}
          </div>
          {showOriginal && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Original: {formatAmount(originalApplication, applicationCurrency)}
            </div>
          )}
          {showConversionRate && program.application_conversion_rate && (
            <div className="text-xs text-gray-500">
              Rate: 1 {applicationCurrency} = {program.application_conversion_rate.toFixed(4)} {userCurrency}
            </div>
          )}
        </div>
      );
    }

    // If same currency or no conversion available
    return (
      <div className="font-medium">
        Application: {formatAmount(originalApplication, applicationCurrency)}
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tuition:</span>
          {getTuitionDisplay()}
        </div>
        {originalApplication && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Application:</span>
            {getApplicationFeeDisplay()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tuition Fee
        </div>
        {getTuitionDisplay()}
      </div>
      
      {originalApplication && (
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Application Fee
          </div>
          {getApplicationFeeDisplay()}
        </div>
      )}

      {/* Currency source information */}
      {program.currency_source && !compact && (
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
          Currency data: {program.currency_source}
          {program.last_currency_update && (
            <span className="ml-2">
              Updated: {new Date(program.last_currency_update).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simple currency badge for showing the original program currency
 */
export function ProgramCurrencyBadge({
  currency,
  className = ''
}: {
  currency: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 ${className}`}>
      {currency}
    </span>
  );
}

export default ProgramCurrencyDisplay;