// Test component to verify API usage vs fallback
import React, { useState, useEffect } from 'react';
import { currencyService } from '../../lib/currency/CurrencyService';
import { useCurrency } from '../../lib/currency/hooks';

/**
 * Test component to verify API usage and track quota
 */
export function CurrencyAPITest() {
  const [apiQuota, setApiQuota] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getExchangeRate, error } = useCurrency();

  useEffect(() => {
    // Load initial API quota
    const quota = currencyService.getAPIQuota();
    setApiQuota(quota);
  }, []);

  const runAPITest = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: SEK to NGN (the Swedish issue)
      console.log('Testing SEK to NGN conversion...');
      const sekResult = await getExchangeRate('SEK', 'NGN');
      results.push({
        test: 'SEK → NGN',
        result: sekResult,
        source: sekResult?.source || 'unknown',
        rate: sekResult?.rate || 'N/A'
      });

      // Test 2: USD to NGN
      const usdResult = await getExchangeRate('USD', 'NGN');
      results.push({
        test: 'USD → NGN',
        result: usdResult,
        source: usdResult?.source || 'unknown',
        rate: usdResult?.rate || 'N/A'
      });

      // Test 3: EUR to NGN
      const eurResult = await getExchangeRate('EUR', 'NGN');
      results.push({
        test: 'EUR → NGN',
        result: eurResult,
        source: eurResult?.source || 'unknown',
        rate: eurResult?.rate || 'N/A'
      });

      // Update quota after tests
      const newQuota = currencyService.getAPIQuota();
      setApiQuota(newQuota);

    } catch (err) {
      console.error('API test failed:', err);
      results.push({
        test: 'API Test',
        result: null,
        source: 'error',
        rate: `Error: ${err}`
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const clearCache = () => {
    currencyService.clearCache();
    alert('Cache cleared! Next API calls will fetch fresh data.');
  };

  const checkConfig = () => {
    const config = {
      hasApiKey: !!import.meta.env.VITE_FIXER_API_KEY,
      apiKey: import.meta.env.VITE_FIXER_API_KEY ? 
        `${import.meta.env.VITE_FIXER_API_KEY.substring(0, 8)}...` : 'Missing',
      baseUrl: import.meta.env.VITE_CURRENCY_API_BASE_URL || 'Not set',
      fallbackEnabled: import.meta.env.VITE_CURRENCY_FALLBACK_ENABLED === 'true',
      cacheTTL: import.meta.env.VITE_CURRENCY_CACHE_TTL || 'Not set'
    };
    console.log('Currency API Config:', config);
    return config;
  };

  const config = checkConfig();

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔍 Currency API Usage Test
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Testing if the system is using the Fixer API or falling back to manual rates
        </p>
      </div>

      {/* Configuration Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
          📋 API Configuration Status
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">API Key:</span>
            <div className={`mt-1 p-2 rounded font-mono ${
              config.hasApiKey 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            }`}>
              {config.hasApiKey ? `✅ ${config.apiKey}` : '❌ Missing'}
            </div>
          </div>
          <div>
            <span className="font-medium">Base URL:</span>
            <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800 rounded font-mono text-xs">
              {config.baseUrl}
            </div>
          </div>
          <div>
            <span className="font-medium">Fallback Enabled:</span>
            <div className={`mt-1 p-2 rounded font-mono ${
              config.fallbackEnabled 
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' 
                : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            }`}>
              {config.fallbackEnabled ? '⚠️ Yes (may use fallback)' : '✅ No (API only)'}
            </div>
          </div>
          <div>
            <span className="font-medium">Cache TTL:</span>
            <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800 rounded font-mono">
              {config.cacheTTL} seconds
            </div>
          </div>
        </div>
      </div>

      {/* API Quota Status */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-3">
          📊 API Quota Status
        </h4>
        {apiQuota ? (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Used:</span>
              <div className="mt-1 p-2 bg-purple-100 dark:bg-purple-800 rounded font-mono text-lg">
                {apiQuota.used}
              </div>
            </div>
            <div>
              <span className="font-medium">Limit:</span>
              <div className="mt-1 p-2 bg-purple-100 dark:bg-purple-800 rounded font-mono text-lg">
                {apiQuota.limit}
              </div>
            </div>
            <div>
              <span className="font-medium">Reset Date:</span>
              <div className="mt-1 p-2 bg-purple-100 dark:bg-purple-800 rounded font-mono text-xs">
                {new Date(apiQuota.resetDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-purple-700 dark:text-purple-400">Loading quota information...</p>
        )}
        
        {apiQuota?.used === 0 && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-800 rounded border border-red-300 dark:border-red-600">
            <p className="text-red-800 dark:text-red-200 font-medium">
              ⚠️ API Usage is ZERO - The system is likely using fallback rates, not the API!
            </p>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3">
          🧪 Test Controls
        </h4>
        <div className="flex space-x-3">
          <button
            onClick={runAPITest}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Testing...' : 'Run API Test'}
          </button>
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">
            📋 Test Results
          </h4>
          <div className="space-y-3">
            {testResults.map((test, index) => (
              <div key={index} className="p-3 bg-green-100 dark:bg-green-800 rounded border">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Test:</span>
                    <div className="font-mono">{test.test}</div>
                  </div>
                  <div>
                    <span className="font-medium">Source:</span>
                    <div className={`font-mono ${
                      test.source === 'api' ? 'text-green-600 dark:text-green-400' :
                      test.source === 'fallback' ? 'text-yellow-600 dark:text-yellow-400' :
                      test.source === 'cache' ? 'text-blue-600 dark:text-blue-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {test.source === 'api' ? '🟢 API' :
                       test.source === 'fallback' ? '🟡 Fallback' :
                       test.source === 'cache' ? '🔵 Cache' :
                       '🔴 Error'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Rate:</span>
                    <div className="font-mono">{test.rate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
            ❌ Error
          </h4>
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Troubleshooting */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">
          🔧 Troubleshooting API Usage
        </h4>
        <div className="text-yellow-700 dark:text-yellow-400 text-sm space-y-2">
          <div><strong>If API usage is 0:</strong></div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check if VITE_FIXER_API_KEY is valid (visit fixer.io to verify)</li>
            <li>Ensure fallback is not being used instead of API calls</li>
            <li>Check browser network tab for actual API requests</li>
            <li>Clear cache and run test again</li>
          </ul>
          
          <div className="mt-3"><strong>Expected behavior:</strong></div>
          <ul className="list-disc pl-5 space-y-1">
            <li>First call should show source: 'api' and increment usage counter</li>
            <li>Subsequent calls within cache TTL should show source: 'cache'</li>
            <li>API quota should increase with each unique API call</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CurrencyAPITest;