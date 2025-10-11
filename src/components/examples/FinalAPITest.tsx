// Final test to confirm API is working and why usage might still show zero
import React, { useState, useEffect } from 'react';
import { currencyService } from '../../lib/currency/CurrencyService';
import { formatProgramTuitionAsync } from '../../lib/utils';

/**
 * Final test to verify the API is actually being called
 */
export function FinalAPITest() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runFinalTest = async () => {
    setLoading(true);
    const testResults: any = {
      startTime: new Date().toISOString(),
      quotaBefore: currencyService.getAPIQuota(),
    };

    console.log('🚀 Starting comprehensive API test...');

    try {
      // Test 1: Direct CurrencyService call
      console.log('1. Testing direct CurrencyService...');
      const directResult = await currencyService.getExchangeRate('SEK', 'NGN', { 
        strategy: 'realtime',
        forceRefresh: true 
      });
      testResults.directService = directResult;

      // Test 2: The exact function ProgramCard uses
      console.log('2. Testing formatProgramTuitionAsync (what ProgramCard should use)...');
      const programResult = await formatProgramTuitionAsync(35000, 'Sweden', true);
      testResults.programFunction = programResult;

      // Test 3: Check quota increase
      testResults.quotaAfter = currencyService.getAPIQuota();
      testResults.quotaIncreased = testResults.quotaAfter.used > testResults.quotaBefore.used;

      // Test 4: Check if API key is working
      console.log('3. Testing API key validity...');
      try {
        const apiTestUrl = `https://api.fixer.io/v1/latest?access_key=${import.meta.env.VITE_FIXER_API_KEY}&base=USD&symbols=SEK`;
        const apiResponse = await fetch(apiTestUrl);
        const apiData = await apiResponse.json();
        testResults.apiKeyTest = {
          success: apiData.success,
          error: apiData.error,
          hasData: !!apiData.rates?.SEK
        };
      } catch (apiError) {
        testResults.apiKeyTest = { error: String(apiError) };
      }

    } catch (error) {
      testResults.error = String(error);
      console.error('Test failed:', error);
    }

    testResults.endTime = new Date().toISOString();
    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🔬 Final API Verification Test
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive test to confirm API is working and identify any remaining issues
        </p>
      </div>

      {/* Test Button */}
      <div className="flex justify-center">
        <button
          onClick={runFinalTest}
          disabled={loading}
          className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-semibold text-lg"
        >
          {loading ? 'Running Comprehensive Test...' : '🚀 Run Final API Test'}
        </button>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {/* API Key Test */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
              🔑 API Key Validation
            </h4>
            {results.apiKeyTest && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">API Success:</span>
                    <div className={`mt-1 p-2 rounded font-mono ${
                      results.apiKeyTest.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {results.apiKeyTest.success ? '✅ Valid' : '❌ Invalid'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Has SEK Data:</span>
                    <div className={`mt-1 p-2 rounded font-mono ${
                      results.apiKeyTest.hasData 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {results.apiKeyTest.hasData ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </div>
                {results.apiKeyTest.error && (
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-800 rounded text-red-800 dark:text-red-200 font-mono text-xs">
                    Error: {JSON.stringify(results.apiKeyTest.error)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Service Test */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">
              🎯 Direct CurrencyService Test
            </h4>
            {results.directService ? (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Rate:</span>
                    <div className="mt-1 p-2 bg-green-100 dark:bg-green-800 rounded font-mono">
                      {results.directService.rate}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Source:</span>
                    <div className={`mt-1 p-2 rounded font-mono ${
                      results.directService.source === 'api' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {results.directService.source}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <div className="mt-1 p-2 bg-green-100 dark:bg-green-800 rounded font-mono text-xs">
                      {new Date(results.directService.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400 font-mono text-sm">
                Failed or no result
              </div>
            )}
          </div>

          {/* Program Function Test */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-3">
              🎨 formatProgramTuitionAsync Test (What ProgramCard Uses)
            </h4>
            {results.programFunction ? (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Primary:</span>
                    <div className="mt-1 p-2 bg-purple-100 dark:bg-purple-800 rounded font-mono">
                      {results.programFunction.primary}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Secondary:</span>
                    <div className="mt-1 p-2 bg-purple-100 dark:bg-purple-800 rounded font-mono">
                      {results.programFunction.secondary || 'None'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Real-time:</span>
                    <div className={`mt-1 p-2 rounded font-mono ${
                      results.programFunction.isRealTime 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {results.programFunction.isRealTime ? '✅ Yes' : '⚠️ No'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400 font-mono text-sm">
                Failed or no result
              </div>
            )}
          </div>

          {/* Quota Check */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">
              📊 API Quota Tracking
            </h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Before:</span>
                  <div className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-800 rounded font-mono">
                    {results.quotaBefore?.used || 0} / {results.quotaBefore?.limit || 1000}
                  </div>
                </div>
                <div>
                  <span className="font-medium">After:</span>
                  <div className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-800 rounded font-mono">
                    {results.quotaAfter?.used || 0} / {results.quotaAfter?.limit || 1000}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Increased:</span>
                  <div className={`mt-1 p-2 rounded font-mono ${
                    results.quotaIncreased 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {results.quotaIncreased ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
              </div>
              
              {!results.quotaIncreased && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-800 rounded border border-red-300 dark:border-red-600">
                  <p className="text-red-800 dark:text-red-200 font-medium text-sm">
                    🚨 Quota didn't increase - API might not be called or using cache/fallback
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3">
              📋 Test Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  results.apiKeyTest?.success ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span>API Key is {results.apiKeyTest?.success ? 'valid' : 'invalid'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  results.directService?.source === 'api' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                <span>Direct API call {results.directService?.source === 'api' ? 'succeeded' : 'used fallback'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  results.programFunction?.isRealTime ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                <span>Program function is {results.programFunction?.isRealTime ? 'using real-time' : 'using fallback'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  results.quotaIncreased ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span>API quota {results.quotaIncreased ? 'increased' : 'did not increase'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinalAPITest;