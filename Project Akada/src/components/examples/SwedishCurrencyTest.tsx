// Test component to verify Swedish currency fixes
import React from 'react';
import { formatProgramTuition } from '../../lib/utils';
import { formatCurrency as newFormatCurrency } from '../../utils/currency';
import { useProgramTuition } from '../../hooks/useProgramTuition';

/**
 * Test component to verify Swedish currency is working correctly
 */
export function SwedishCurrencyTest() {
  // Test Swedish university program
  const testAmount = 120000; // SEK
  const swedishTuition = useProgramTuition(testAmount, 'Sweden', { enableRealTime: false });

  // Test the legacy function directly
  const legacyResult = formatProgramTuition(testAmount, 'Sweden', true);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Swedish Currency Test: 120,000 SEK Tuition
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Testing if Swedish programs show SEK (kr) instead of EUR (€)
        </p>
      </div>

      {/* Hook Test */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          📊 useProgramTuition Hook Test
        </h4>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Primary:</span>
              <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800 rounded font-mono">
                {swedishTuition.primary}
              </div>
            </div>
            <div>
              <span className="font-medium">Secondary (NGN):</span>
              <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800 rounded font-mono">
                {swedishTuition.secondary || 'None'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className={`px-2 py-1 rounded ${swedishTuition.isLoading ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
              Loading: {swedishTuition.isLoading ? 'Yes' : 'No'}
            </span>
            <span className={`px-2 py-1 rounded ${swedishTuition.hasError ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
              Error: {swedishTuition.hasError ? 'Yes' : 'No'}
            </span>
            <span className={`px-2 py-1 rounded ${swedishTuition.isRealTime ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
              Real-time: {swedishTuition.isRealTime ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Legacy Function Test */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
          🔧 formatProgramTuition Function Test
        </h4>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Primary:</span>
              <div className="mt-1 p-2 bg-green-100 dark:bg-green-800 rounded font-mono">
                {legacyResult.primary}
              </div>
            </div>
            <div>
              <span className="font-medium">Secondary (NGN):</span>
              <div className="mt-1 p-2 bg-green-100 dark:bg-green-800 rounded font-mono">
                {legacyResult.secondary || 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Currency Format Test */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
          🎯 Direct Currency Formatting Test
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">New formatCurrency (SEK):</span>
            <div className="mt-1 p-2 bg-purple-100 dark:bg-purple-800 rounded font-mono">
              {newFormatCurrency(testAmount, 'SEK')}
            </div>
          </div>
          <div>
            <span className="font-medium">Legacy formatCurrency (SEK):</span>
            <div className="mt-1 p-2 bg-purple-100 dark:bg-purple-800 rounded font-mono">
              {(() => {
                try {
                  // Import legacy formatCurrency
                  const { formatCurrency } = require('../../lib/utils');
                  return formatCurrency(testAmount, 'SEK');
                } catch (error) {
                  return `Error: ${error}`;
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Test */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
          💱 Currency Conversion Test (SEK → NGN)
        </h4>
        <div className="text-sm space-y-2">
          <div>
            <span className="font-medium">Amount in SEK:</span>
            <span className="ml-2 font-mono">120,000 kr</span>
          </div>
          <div>
            <span className="font-medium">Converted to NGN:</span>
            <span className="ml-2 font-mono">
              {(() => {
                try {
                  const { convertCurrency } = require('../../lib/utils');
                  const ngnAmount = convertCurrency(testAmount, 'SEK', 'NGN');
                  const { formatCurrency } = require('../../lib/utils');
                  return formatCurrency(ngnAmount, 'NGN');
                } catch (error) {
                  return `Error: ${error}`;
                }
              })()}
            </span>
          </div>
          <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
            Rate used: 1 SEK = {(1500 / 11.25).toFixed(4)} NGN (based on 1 USD = 1500 NGN, 1 USD = 11.25 SEK)
          </div>
        </div>
      </div>

      {/* Expected vs Actual */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-2">
          ✅ Expected Results
        </h4>
        <div className="text-sm space-y-1">
          <div>• Primary display should show: <span className="font-mono">120 000 kr</span></div>
          <div>• Secondary should show NGN conversion: <span className="font-mono">~₦16,000,000</span></div>
          <div>• Currency symbol should be <span className="font-mono">kr</span> NOT <span className="font-mono">€</span></div>
          <div>• Conversion rate: 1 SEK ≈ 133.33 NGN</div>
        </div>
      </div>
    </div>
  );
}

export default SwedishCurrencyTest;