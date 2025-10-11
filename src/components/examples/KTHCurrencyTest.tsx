// Real-world test using actual KTH program data
import React from 'react';
import { formatProgramTuition, getCountryCurrency, convertCurrency } from '../../lib/utils';
import { formatCurrency as newFormatCurrency } from '../../utils/currency';

/**
 * Test component using real KTH program data
 */
export function KTHCurrencyTest() {
  // Real KTH program data
  const kthProgram = {
    name: 'MSc Computer Engineering',
    university: 'KTH Royal Institute of Technology',
    country: 'Sweden',
    tuition_fee: 35000, // This should be in SEK
    location: 'Stockholm, Sweden'
  };

  // Test currency detection
  const detectedCurrency = getCountryCurrency(kthProgram.country);
  const legacyFormatResult = formatProgramTuition(kthProgram.tuition_fee, kthProgram.country, true);

  // Test conversion calculations
  let sekToNgnConversion = 0;
  let ngnFormatted = '';
  try {
    sekToNgnConversion = convertCurrency(kthProgram.tuition_fee, 'SEK', 'NGN');
    const { formatCurrency } = require('../../lib/utils');
    ngnFormatted = formatCurrency(sekToNgnConversion, 'NGN');
  } catch (error) {
    ngnFormatted = `Error: ${error}`;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          KTH Currency Test: Real Program Data
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          <div><strong>Program:</strong> {kthProgram.name}</div>
          <div><strong>University:</strong> {kthProgram.university}</div>
          <div><strong>Location:</strong> {kthProgram.location}</div>
          <div><strong>Tuition Fee:</strong> {kthProgram.tuition_fee.toLocaleString()}</div>
        </div>
      </div>

      {/* Currency Detection */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
          🔍 Currency Detection
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Country:</span>
            <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-800 rounded font-mono">
              {kthProgram.country}
            </div>
          </div>
          <div>
            <span className="font-medium">Detected Currency:</span>
            <div className={`mt-1 p-2 rounded font-mono ${
              detectedCurrency === 'SEK' 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            }`}>
              {detectedCurrency} {detectedCurrency === 'SEK' ? '✅' : '❌ Should be SEK'}
            </div>
          </div>
        </div>
      </div>

      {/* Formatting Results */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">
          💰 Currency Formatting Results
        </h4>
        <div className="space-y-4 text-sm">
          <div>
            <span className="font-medium">formatProgramTuition() Result:</span>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Primary (Original Currency):</span>
                <div className="mt-1 p-2 bg-green-100 dark:bg-green-800 rounded font-mono text-lg">
                  {legacyFormatResult.primary}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Secondary (NGN Conversion):</span>
                <div className="mt-1 p-2 bg-green-100 dark:bg-green-800 rounded font-mono">
                  {legacyFormatResult.secondary || 'None'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="font-medium">Direct SEK Formatting:</span>
            <div className="mt-1 p-2 bg-green-100 dark:bg-green-800 rounded font-mono text-lg">
              {newFormatCurrency(kthProgram.tuition_fee, 'SEK')}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Details */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">
          🔄 Conversion Calculations
        </h4>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Original Amount:</span>
              <div className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-800 rounded font-mono">
                35,000 SEK
              </div>
            </div>
            <div>
              <span className="font-medium">Exchange Rate:</span>
              <div className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-800 rounded font-mono">
                1 SEK = {(1500/11.25).toFixed(2)} NGN
              </div>
            </div>
            <div>
              <span className="font-medium">Converted Amount:</span>
              <div className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-800 rounded font-mono">
                {ngnFormatted}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-yellow-700 dark:text-yellow-400 pt-2 border-t border-yellow-200">
            <strong>Calculation:</strong> 35,000 SEK × {(1500/11.25).toFixed(4)} = {sekToNgnConversion.toLocaleString()} NGN
          </div>
        </div>
      </div>

      {/* Validation */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3">
          ✅ Validation Checklist
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${detectedCurrency === 'SEK' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Currency detected as SEK (not EUR)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${legacyFormatResult.primary.includes('kr') ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Currency symbol shows 'kr' (not '€')</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${legacyFormatResult.secondary ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>NGN conversion is displayed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${sekToNgnConversion > 1000000 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Conversion amount is reasonable (35,000 SEK ≈ 4.7M NGN)</span>
          </div>
        </div>
      </div>

      {/* Expected Final Display */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">
          🎯 Expected Final Display in App
        </h4>
        <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded font-mono text-lg">
          <div>35 000 kr</div>
          <div className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
            ~₦4,666,667
          </div>
        </div>
      </div>
    </div>
  );
}

export default KTHCurrencyTest;