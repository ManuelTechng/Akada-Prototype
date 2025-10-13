// Main export file for enhanced Akada currency system
// Combines existing currency utilities with new real-time API capabilities

// Core service and types
export { CurrencyService, currencyService } from './CurrencyService';
export { CurrencyCache, currencyCache } from './cache';
export * from './types';
export * from './config';

// Enhanced formatters that integrate with real-time rates
export { 
  formatNGNWithRealTime,
  formatUSDWithRealTime, 
  convertWithRealTime,
  formatMultiCurrency
} from './formatters';

// React hooks for currency functionality
export {
  useCurrency,
  useCurrencyConversion,
  useMultiCurrency,
  useCurrencyPreferences
} from './hooks';

// Detection and user preferences
export { CurrencyDetectionService } from './detection';

// Error handling and recovery
export {
  CurrencyError,
  CurrencyErrorFactory,
  CurrencyErrorType,
  RetryHandler,
  CircuitBreaker,
  FallbackRateProvider
} from './errors';

// NOTE: Legacy currency utilities are available in '../currency' if needed
// They are not re-exported here to avoid circular dependencies

// Enhanced utilities that replace static ones
export {
  formatCurrencyWithAPI,
  convertCurrencyWithAPI,
  getBulkConversions,
  getCurrencySymbol,
  isAfricanCurrency,
  getSupportedCurrencies
} from './utils';

// Default export combining all functionality
export default {
  // Core service
  service: currencyService,
  cache: currencyCache,
  
  // Enhanced formatters
  formatNGN: formatNGNWithRealTime,
  formatUSD: formatUSDWithRealTime,
  convertCurrency: convertWithRealTime,
  formatMultiple: formatMultiCurrency,
  
  // Utilities
  format: formatCurrencyWithAPI,
  convert: convertCurrencyWithAPI,
  bulk: getBulkConversions,
  
  // Legacy support - import manually from '../currency' if needed
  legacy: {
    // Available but not auto-imported to avoid circular dependencies
  }
};