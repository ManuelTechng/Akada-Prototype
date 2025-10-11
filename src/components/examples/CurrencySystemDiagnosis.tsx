// Diagnosis of why API usage is zero and system is using fallback
import React, { useState } from 'react';
import { formatProgramTuition } from '../../lib/utils';
import { useProgramTuition } from '../../hooks/useProgramTuition';
import { currencyService } from '../../lib/currency/CurrencyService';
import { useCurrency } from '../../lib/currency/hooks';

/**
 * Diagnoses why the currency system shows zero API usage
 */
export function CurrencySystemDiagnosis() {
  const [testComplete, setTestComplete] = useState(false);
  const [results, setResults] = useState<any>({});

  // Test the legacy hook (what the app currently uses)
  const legacyHookResult = useProgramTuition(35000, 'Sweden', { enableRealTime: false });
  
  // Test the new currency service
  const { getExchangeRate } = useCurrency();

  const runDiagnosis = async () => {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      apiQuotaBefore: currencyService.getAPIQuota(),
    };

    // Test 1: Legacy function (what ProgramCard uses)
    console.log('🔍 Testing legacy formatProgramTuition...');
    const legacyResult = formatProgramTuition(35000, 'Sweden', true);
    diagnostics.legacyFunction = legacyResult;

    // Test 2: Legacy hook (what ProgramCard uses)
    console.log('🔍 Testing useProgramTuition hook...');
    diagnostics.legacyHook = {
      primary: legacyHookResult.primary,
      secondary: legacyHookResult.secondary,
      isRealTime: legacyHookResult.isRealTime,
      hasError: legacyHookResult.hasError
    };

    // Test 3: New CurrencyService (not used by app yet)
    console.log('🔍 Testing new CurrencyService...');
    try {
      const newServiceResult = await getExchangeRate('SEK', 'NGN');
      diagnostics.newService = newServiceResult;
    } catch (error) {
      diagnostics.newService = { error: String(error) };
    }

    // Test 4: Check API quota after
    diagnostics.apiQuotaAfter = currencyService.getAPIQuota();
    diagnostics.apiUsageIncreased = diagnostics.apiQuotaAfter.used > diagnostics.apiQuotaBefore.used;

    setResults(diagnostics);
    setTestComplete(true);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🔍 Currency System Diagnosis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Why API usage shows zero: The app is using legacy functions, not the new API-enabled CurrencyService!
        </p>
      </div>

      {/* Root Cause */}
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <h4 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">
          🚨 Root Cause: Legacy System Still in Use
        </h4>
        
        <div className="space-y-4 text-red-700 dark:text-red-400">
          <div className="bg-red-100 dark:bg-red-800 p-4 rounded border-l-4 border-red-500">
            <h5 className="font-medium mb-2">What the App Currently Uses:</h5>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><code>formatProgramTuition()</code> - Uses static <code>EXCHANGE_RATES</code> object</li>
              <li><code>useProgramTuition()</code> - Calls legacy function, no API</li>
              <li><code>ProgramCard.tsx</code> - Imports and uses legacy functions</li>
              <li><strong>Result:</strong> Zero API calls, manual fallback rates used</li>
            </ul>
          </div>

          <div className="bg-green-100 dark:bg-green-800 p-4 rounded border-l-4 border-green-500">
            <h5 className="font-medium mb-2 text-green-800 dark:text-green-300">What Should Be Used:</h5>
            <ul className="list-disc pl-5 space-y-1 text-sm text-green-700 dark:text-green-400">
              <li><code>CurrencyService</code> - Makes real API calls to Fixer.io</li>
              <li><code>useCurrency()</code> - Hook that uses CurrencyService</li>
              <li><code>useProgramCurrency()</code> - New hook with database integration</li>
              <li><strong>Result:</strong> Real API calls, live exchange rates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
          🧪 Live Diagnosis Test
        </h4>
        
        {!testComplete ? (
          <button
            onClick={runDiagnosis}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Run Full Diagnosis
          </button>
        ) : (
          <div className="space-y-4">
            {/* Legacy Function Test */}
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded">
              <h5 className="font-medium mb-2">1. Legacy formatProgramTuition() Test:</h5>
              <div className="font-mono text-sm">
                <div>Primary: {results.legacyFunction?.primary}</div>
                <div>Secondary: {results.legacyFunction?.secondary}</div>
                <div className="text-yellow-600 dark:text-yellow-400">
                  ⚠️ Uses static rates, no API call made
                </div>
              </div>
            </div>

            {/* Legacy Hook Test */}
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded">
              <h5 className="font-medium mb-2">2. Legacy useProgramTuition() Hook Test:</h5>
              <div className="font-mono text-sm">
                <div>Primary: {results.legacyHook?.primary}</div>
                <div>Real-time: {results.legacyHook?.isRealTime ? 'Yes' : 'No'}</div>
                <div>Has Error: {results.legacyHook?.hasError ? 'Yes' : 'No'}</div>
                <div className="text-yellow-600 dark:text-yellow-400">
                  ⚠️ Real-time disabled or using fallback
                </div>
              </div>
            </div>

            {/* New Service Test */}
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded">
              <h5 className="font-medium mb-2">3. New CurrencyService Test:</h5>
              <div className="font-mono text-sm">
                {results.newService?.error ? (
                  <div className="text-red-600 dark:text-red-400">
                    Error: {results.newService.error}
                  </div>
                ) : (
                  <>
                    <div>Rate: {results.newService?.rate}</div>
                    <div>Source: {results.newService?.source}</div>
                    <div className={results.newService?.source === 'api' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                      {results.newService?.source === 'api' ? '✅ API call made!' : '⚠️ Using fallback'}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* API Usage Check */}
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded">
              <h5 className="font-medium mb-2">4. API Usage Check:</h5>
              <div className="font-mono text-sm">
                <div>Before: {results.apiQuotaBefore?.used} / {results.apiQuotaBefore?.limit}</div>
                <div>After: {results.apiQuotaAfter?.used} / {results.apiQuotaAfter?.limit}</div>
                <div className={results.apiUsageIncreased ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {results.apiUsageIncreased ? '✅ API usage increased!' : '❌ No API usage increase'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Solution */}
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
          ✅ Solution: Migrate to New Currency System
        </h4>
        
        <div className="space-y-4 text-green-700 dark:text-green-400">
          <div>
            <h5 className="font-medium mb-2">Option 1: Update ProgramCard.tsx (Quick Fix)</h5>
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded font-mono text-sm">
              <div className="text-red-600 dark:text-red-400">- import &#123; useProgramTuition &#125; from '../../hooks/useProgramTuition';</div>
              <div className="text-green-600 dark:text-green-400">+ import &#123; useCurrency &#125; from '../../lib/currency/hooks';</div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Option 2: Update Legacy Hook (Medium Fix)</h5>
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded text-sm">
              Modify <code>useProgramTuition.ts</code> to use <code>CurrencyService</code> internally
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Option 3: Full Migration (Best Solution)</h5>
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded text-sm">
              Use the new <code>useProgramCurrency()</code> hook with database integration
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Test */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">
          🔧 Immediate Test: Force API Usage
        </h4>
        <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-3">
          To verify the API is working, we need to bypass the legacy functions and call CurrencyService directly.
        </p>
        <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded font-mono text-sm">
          <div>// This would make a real API call:</div>
          <div>const rate = await currencyService.getExchangeRate('SEK', 'NGN');</div>
          <div>// Current ProgramCard uses static rates instead</div>
        </div>
      </div>
    </div>
  );
}

export default CurrencySystemDiagnosis;