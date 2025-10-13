// Demo component to test currency fixes for Swedish programs
import React from 'react';
import { formatCurrency, getCountryCurrency } from '../../utils/currency';
import { getCurrencyFromCountry } from '../../lib/currency/utils';

/**
 * Demo component showing the currency fix for Swedish programs
 */
export function CurrencyFixDemo() {
  const testCases = [
    { country: 'Sweden', amount: 120000, description: 'Swedish University Tuition' },
    { country: 'Norway', amount: 180000, description: 'Norwegian University Tuition' },
    { country: 'Denmark', amount: 0, description: 'Danish University (Free Tuition)' },
    { country: 'Germany', amount: 15000, description: 'German University Tuition' },
    { country: 'United States', amount: 45000, description: 'US University Tuition' }
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Currency Fix Demo: Before & After
      </h3>
      
      <div className="space-y-4">
        {testCases.map((testCase, index) => {
          const legacyCurrency = getCountryCurrency(testCase.country);
          const newCurrency = getCurrencyFromCountry(
            testCase.country === 'Sweden' ? 'SE' : 
            testCase.country === 'Norway' ? 'NO' :
            testCase.country === 'Denmark' ? 'DK' :
            testCase.country === 'Germany' ? 'DE' :
            testCase.country === 'United States' ? 'US' : 'XX'
          );

          return (
            <div 
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {testCase.description}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Before (Legacy) */}
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <div className="font-medium text-red-800 dark:text-red-300 mb-1">
                    ❌ Before (Legacy)
                  </div>
                  <div className="text-red-700 dark:text-red-400">
                    Country: {testCase.country}
                  </div>
                  <div className="text-red-700 dark:text-red-400">
                    Currency: <span className="font-mono">{legacyCurrency}</span>
                  </div>
                  <div className="text-red-700 dark:text-red-400">
                    Amount: {formatCurrency(testCase.amount, legacyCurrency as any)}
                  </div>
                </div>

                {/* After (Fixed) */}
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <div className="font-medium text-green-800 dark:text-green-300 mb-1">
                    ✅ After (Fixed)
                  </div>
                  <div className="text-green-700 dark:text-green-400">
                    Country: {testCase.country}
                  </div>
                  <div className="text-green-700 dark:text-green-400">
                    Currency: <span className="font-mono">{newCurrency || legacyCurrency}</span>
                  </div>
                  <div className="text-green-700 dark:text-green-400">
                    Amount: {formatCurrency(testCase.amount, (newCurrency || legacyCurrency) as any)}
                  </div>
                </div>
              </div>

              {/* Highlight Sweden Fix */}
              {testCase.country === 'Sweden' && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                  <div className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong>Sweden Fix:</strong> Changed from EUR (€) to SEK (kr) - Swedish programs now show correct currency!
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">
          What Was Fixed:
        </h4>
        <ul className="text-indigo-700 dark:text-indigo-400 text-sm space-y-1">
          <li>• <strong>Legacy Bug:</strong> Sweden was incorrectly mapped to EUR instead of SEK</li>
          <li>• <strong>Database:</strong> Already had correct SEK currency for Swedish programs</li>
          <li>• <strong>Frontend:</strong> Updated TypeScript types and currency mapping</li>
          <li>• <strong>Formatters:</strong> Added SEK, NOK, DKK support with proper symbols</li>
          <li>• <strong>New Hook:</strong> useProgramCurrency now accesses database currency fields</li>
        </ul>
      </div>
    </div>
  );
}

export default CurrencyFixDemo;