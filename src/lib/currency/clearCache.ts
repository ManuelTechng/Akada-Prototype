/**
 * Currency Cache Management Utilities
 *
 * Use this to clear stale currency rates after updating FALLBACK_RATES
 * or when switching between API sources
 */

import { currencyService } from './CurrencyService';
import { currencyCache } from './cache';

/**
 * Clear all currency caches
 * Call this after updating exchange rates in config.ts
 */
export const clearAllCurrencyCaches = (): void => {
  console.log('🧹 Clearing all currency caches...');

  try {
    // Clear service cache
    currencyService.clearCache();
    console.log('✅ Service cache cleared');

    // Clear localStorage cache
    currencyCache.clear();
    console.log('✅ localStorage cache cleared');

    // Clear API quota (reset to allow fresh API calls)
    localStorage.removeItem('currency_api_quota');
    console.log('✅ API quota reset');

    // Clear any cached bulk rates
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('exchange_rate_') || key.startsWith('rates_bulk_'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`✅ Removed ${keysToRemove.length} cached rate entries`);

    console.log('✨ All currency caches cleared successfully!');
    console.log('🔄 Next currency conversion will fetch fresh rates');

  } catch (error) {
    console.error('❌ Error clearing currency caches:', error);
    throw error;
  }
};

/**
 * Clear cache for specific currency pair
 */
export const clearCurrencyPair = (from: string, to: string): void => {
  console.log(`🧹 Clearing cache for ${from}/${to}...`);

  try {
    const key = `exchange_rate_${from}_${to}`;
    localStorage.removeItem(key);

    // Also clear reverse pair
    const reverseKey = `exchange_rate_${to}_${from}`;
    localStorage.removeItem(reverseKey);

    console.log(`✅ Cache cleared for ${from}/${to}`);
  } catch (error) {
    console.error(`❌ Error clearing cache for ${from}/${to}:`, error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const stats = currencyService.getCacheStats();
  const apiQuota = currencyService.getAPIQuota();

  console.log('📊 Currency Cache Statistics:');
  console.log('  Cache entries:', stats);
  console.log('  API Quota:', apiQuota);

  return { cache: stats, apiQuota };
};

/**
 * Force refresh all rates from API
 */
export const forceRefreshRates = async (baseCurrency: string = 'NGN'): Promise<void> => {
  console.log(`🔄 Force refreshing rates for ${baseCurrency}...`);

  try {
    const currencies = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'GHS', 'KES', 'ZAR'];
    const rates = await currencyService.getBulkRates(baseCurrency, currencies, {
      forceRefresh: true,
      strategy: 'realtime'
    });

    console.log('✅ Rates refreshed:', rates);
    return;
  } catch (error) {
    console.error('❌ Error refreshing rates:', error);
    console.log('⚠️ Will use fallback rates');
  }
};

/**
 * Validate current CAD to NGN rate
 * Expected: 1 CAD = 1050 NGN (October 2025)
 */
export const validateCADtoNGN = async (): Promise<boolean> => {
  console.log('🔍 Validating CAD to NGN conversion rate...');

  try {
    const rate = await currencyService.getExchangeRate('CAD', 'NGN');
    const expectedRate = 1050;
    const tolerance = 50; // ±50 NGN tolerance

    const isValid = Math.abs(rate.rate - expectedRate) <= tolerance;

    console.log(`Current rate: 1 CAD = ${rate.rate.toFixed(2)} NGN`);
    console.log(`Expected rate: 1 CAD = ${expectedRate} NGN`);
    console.log(`Source: ${rate.source}`);
    console.log(isValid ? '✅ Rate is correct!' : '❌ Rate is incorrect!');

    // Test conversion
    const conversion = await currencyService.convertAmount(35000, 'CAD', 'NGN');
    console.log(`\nTest conversion: C$35,000 = ₦${conversion.convertedAmount.toLocaleString()}`);
    console.log(`Expected: C$35,000 = ₦36,750,000`);

    return isValid;
  } catch (error) {
    console.error('❌ Error validating rate:', error);
    return false;
  }
};

/**
 * Run full currency system health check
 */
export const runCurrencyHealthCheck = async (): Promise<void> => {
  console.log('🏥 Running currency system health check...\n');

  // 1. Check cache stats
  console.log('1️⃣ Cache Statistics:');
  getCacheStats();
  console.log();

  // 2. Validate CAD to NGN
  console.log('2️⃣ Validating CAD to NGN:');
  await validateCADtoNGN();
  console.log();

  // 3. Test other major pairs
  console.log('3️⃣ Testing other major currency pairs:');
  const pairs = [
    { from: 'USD', to: 'NGN', expected: 1500 },
    { from: 'GBP', to: 'NGN', expected: 1905 },
    { from: 'EUR', to: 'NGN', expected: 1620 }
  ];

  for (const { from, to, expected } of pairs) {
    try {
      const rate = await currencyService.getExchangeRate(from, to);
      const diff = Math.abs(rate.rate - expected);
      const status = diff <= 50 ? '✅' : '⚠️';
      console.log(`${status} ${from}/${to}: ${rate.rate.toFixed(2)} (expected ~${expected}, source: ${rate.source})`);
    } catch (error) {
      console.log(`❌ ${from}/${to}: Error -`, error);
    }
  }

  console.log('\n✨ Health check complete!');
};

/**
 * Add to window for easy console access in development
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).currencyUtils = {
    clearCache: clearAllCurrencyCaches,
    clearPair: clearCurrencyPair,
    getStats: getCacheStats,
    forceRefresh: forceRefreshRates,
    validateCAD: validateCADtoNGN,
    healthCheck: runCurrencyHealthCheck
  };

  console.log(`
💰 Currency Utilities Available:

  currencyUtils.clearCache()     - Clear all currency caches
  currencyUtils.clearPair(from, to) - Clear specific pair cache
  currencyUtils.getStats()        - View cache statistics
  currencyUtils.forceRefresh()    - Force refresh from API
  currencyUtils.validateCAD()     - Validate CAD→NGN rate
  currencyUtils.healthCheck()     - Run full health check
  `);
}

export default {
  clearAllCurrencyCaches,
  clearCurrencyPair,
  getCacheStats,
  forceRefreshRates,
  validateCADtoNGN,
  runCurrencyHealthCheck
};
