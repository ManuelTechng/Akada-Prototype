// Example component showing how to use the new currency-aware program system
import React from 'react';
import { useProgramCurrency } from '../../hooks/useProgramCurrency';
import { ProgramCurrencyDisplay, ProgramCurrencyBadge } from '../ui/ProgramCurrencyDisplay';
import { useAuth } from '../../contexts/AuthContext';

interface ProgramCurrencyExampleProps {
  programId: string;
}

/**
 * Example component demonstrating the new currency-aware program system
 */
export function ProgramCurrencyExample({ programId }: ProgramCurrencyExampleProps) {
  const { user } = useAuth();
  const { program, loading, error, refresh } = useProgramCurrency(programId, user?.id);

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-red-800 dark:text-red-300">
          <p className="font-medium">Failed to load program currency data</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">Program not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
      {/* Program Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {program.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {program.university} • {program.country}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {program.degree_type}
            </p>
          </div>
          
          {/* Currency badges */}
          <div className="flex flex-col items-end space-y-2">
            {program.tuition_fee_currency && (
              <ProgramCurrencyBadge 
                currency={program.tuition_fee_currency}
                className="text-xs"
              />
            )}
            {program.user_currency && program.user_currency !== program.tuition_fee_currency && (
              <ProgramCurrencyBadge 
                currency={`Showing in ${program.user_currency}`}
                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              />
            )}
          </div>
        </div>
      </div>

      {/* Currency Display */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Program Costs
        </h4>
        <ProgramCurrencyDisplay
          program={program}
          showOriginal={true}
          showConversionRate={true}
          className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
        />
      </div>

      {/* Compact Display Example */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Compact Display (for cards)
        </h4>
        <ProgramCurrencyDisplay
          program={program}
          compact={true}
          showOriginal={false}
          className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg"
        />
      </div>

      {/* Raw Data (for debugging) */}
      <details className="mt-4">
        <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          Raw Currency Data (Debug)
        </summary>
        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200 overflow-auto">
          {JSON.stringify(
            {
              original_tuition: program.tuition_fee_original,
              tuition_currency: program.tuition_fee_currency,
              converted_tuition: program.tuition_fee_converted,
              conversion_rate: program.tuition_conversion_rate,
              user_currency: program.user_currency,
              last_update: program.last_currency_update,
              source: program.currency_source
            },
            null,
            2
          )}
        </pre>
      </details>

      {/* Action to refresh currency data */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={refresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm"
        >
          Refresh Currency Data
        </button>
        <p className="text-xs text-gray-500 mt-2">
          This will fetch the latest exchange rates and update conversions
        </p>
      </div>
    </div>
  );
}

export default ProgramCurrencyExample;