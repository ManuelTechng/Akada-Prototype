# Akada Multicurrency System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [API Integration](#api-integration)
5. [Error Handling](#error-handling)
6. [React Components](#react-components)
7. [Hooks & Utilities](#hooks--utilities)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Migration Guide](#migration-guide)
11. [Performance Optimization](#performance-optimization)
12. [Best Practices](#best-practices)

---

## Overview

The Akada Multicurrency System is a comprehensive, production-ready currency conversion and formatting solution designed specifically for the Nigerian education technology market. It provides real-time exchange rates, intelligent fallbacks, and seamless user experience across all currency operations.

### Key Features
- **Real-time API Integration**: Live exchange rates via Fixer.io API
- **Intelligent Fallback System**: Static rates when API unavailable
- **Nigerian Market Focus**: Optimized for NGN with support for 15+ currencies
- **Performance Optimized**: Multi-level caching and efficient batch processing
- **Error Resilient**: Circuit breakers, retry logic, and graceful degradation
- **React Integration**: Custom hooks and components for seamless UI integration

### Supported Currencies
| Currency | Code | Primary Use Case |
|----------|------|------------------|
| Nigerian Naira | NGN | Primary/local currency |
| US Dollar | USD | International standard |
| British Pound | GBP | UK programs |
| Euro | EUR | European programs |
| Canadian Dollar | CAD | Canadian programs |
| Australian Dollar | AUD | Australian programs |
| Ghanaian Cedi | GHS | West African programs |
| Kenyan Shilling | KES | East African programs |
| South African Rand | ZAR | Southern African programs |
| Egyptian Pound | EGP | North African programs |

---

## Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Akada Currency System                    │
├─────────────────────────────────────────────────────────────┤
│  React Components & Hooks                                   │
│  ├── useProgramTuition()     ├── CurrencyErrorBoundary     │
│  ├── useCurrency()           ├── FallbackDisplay           │
│  └── useMultiCurrency()      └── ErrorRecovery             │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                              │
│  ├── CurrencyService         ├── RetryHandler             │
│  ├── CurrencyCache           ├── CircuitBreaker           │
│  └── DetectionService        └── FallbackRateProvider     │
├─────────────────────────────────────────────────────────────┤
│  External APIs                                              │
│  ├── Fixer.io (Primary)      ├── Static Fallbacks        │
│  └── Future: Additional APIs └── Emergency Rates          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
```
User Request → React Hook → CurrencyService → Cache Check → API Call → Response Processing → UI Update
                    ↓              ↓             ↓           ↓              ↓
               Error Handler → Retry Logic → Fallback → Static Rates → Error Display
```

---

## Core Components

### 1. CurrencyService
**Location**: `/src/lib/currency/CurrencyService.ts`

The central orchestrator for all currency operations.

```typescript
import { currencyService } from '@/lib/currency/CurrencyService';

// Get exchange rate
const rate = await currencyService.getExchangeRate('USD', 'NGN');

// Convert amount
const conversion = await currencyService.convertAmount(1000, 'USD', 'NGN');

// Bulk conversions
const conversions = await currencyService.convertToMultiple(1000, 'USD', ['NGN', 'GHS', 'KES']);
```

**Key Methods:**
- `getExchangeRate(from, to, options)`: Get single exchange rate
- `convertAmount(amount, from, to, options)`: Convert specific amount
- `convertToMultiple(amount, from, targets, options)`: Batch conversions
- `getBulkRates(base, targets, options)`: Efficient bulk rate fetching
- `clearCache()`: Manual cache clearing
- `getAPIQuota()`: API usage monitoring

### 2. CurrencyCache
**Location**: `/src/lib/currency/cache.ts`

Multi-level caching system with memory and localStorage persistence.

```typescript
import { currencyCache } from '@/lib/currency/cache';

// Cache operations
await currencyCache.setRate('USD', 'NGN', 1500, 'api');
const rate = await currencyCache.getRate('USD', 'NGN');
await currencyCache.setBulkRates('USD', { NGN: 1500, GHS: 12.5 }, 'api');
```

**Features:**
- **Memory Cache**: Instant access for recent rates
- **localStorage**: Persistence across sessions
- **TTL Management**: Automatic expiration
- **Cleanup**: Automatic old data removal
- **Bulk Operations**: Efficient batch caching

### 3. Error Management
**Location**: `/src/lib/currency/errors.ts`

Comprehensive error handling with typed errors and recovery strategies.

```typescript
import { CurrencyErrorFactory, RetryHandler, CircuitBreaker } from '@/lib/currency/errors';

// Error creation
const error = CurrencyErrorFactory.apiUnavailable('fixer');
const networkError = CurrencyErrorFactory.networkError(originalError);

// Retry logic
const retryHandler = new RetryHandler();
const result = await retryHandler.execute(() => apiCall());

// Circuit breaker
const circuitBreaker = new CircuitBreaker();
const result = await circuitBreaker.execute(() => apiCall());
```

---

## API Integration

### Fixer.io Configuration
**Environment Variables:**
```bash
VITE_FIXER_API_KEY=your_api_key_here
VITE_FIXER_BASE_URL=https://api.fixer.io/v1
VITE_CURRENCY_CACHE_TTL=300000
VITE_CURRENCY_FALLBACK_ENABLED=true
```

### API Usage
```typescript
// Configuration in CurrencyService
const config = {
  apiKey: import.meta.env.VITE_FIXER_API_KEY,
  baseUrl: import.meta.env.VITE_FIXER_BASE_URL,
  timeout: 10000,
  cacheTTL: 300000, // 5 minutes
  fallbackEnabled: true
};
```

### Rate Limiting
- **Free Tier**: 100 requests/month
- **Basic Tier**: 1000 requests/month  
- **Professional**: 50,000 requests/month
- **Built-in Quotas**: Automatic tracking and management

---

## Error Handling

### Error Types
```typescript
enum CurrencyErrorType {
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  INVALID_CURRENCY = 'INVALID_CURRENCY', 
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  CACHE_ERROR = 'CACHE_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR'
}
```

### Recovery Strategies

#### 1. Retry Logic
```typescript
const retryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    CurrencyErrorType.API_UNAVAILABLE,
    CurrencyErrorType.NETWORK_ERROR,
    CurrencyErrorType.CONVERSION_FAILED,
    CurrencyErrorType.RATE_LIMIT_EXCEEDED
  ]
};
```

#### 2. Circuit Breaker
```typescript
const circuitBreaker = new CircuitBreaker(
  5,     // failure threshold
  60000  // reset timeout (1 minute)
);
```

#### 3. Fallback Rates
```typescript
// Static rates for offline scenarios
const fallbackRates = {
  USD: { NGN: 1500, GHS: 12.5, KES: 130 },
  NGN: { USD: 1/1500, GHS: 12.5/1500 },
  // ... more rates
};
```

---

## React Components

### 1. Error Boundary
**Location**: `/src/components/currency/ErrorBoundary.tsx`

```tsx
import { CurrencyErrorBoundary } from '@/components/currency/ErrorBoundary';

function App() {
  return (
    <CurrencyErrorBoundary
      fallback={<div>Currency service unavailable</div>}
      onError={(error, errorInfo) => console.error(error)}
      showErrorDetails={false}
    >
      <YourCurrencyComponents />
    </CurrencyErrorBoundary>
  );
}
```

### 2. Fallback Display
**Location**: `/src/components/currency/FallbackDisplay.tsx`

```tsx
import { FallbackCurrencyDisplay } from '@/components/currency/FallbackDisplay';

function ProgramCard({ tuition, country }) {
  return (
    <div>
      <FallbackCurrencyDisplay
        amount={tuition}
        fromCurrency="USD"
        toCurrency="NGN"
        showFallbackNotice={true}
      />
    </div>
  );
}
```

### 3. Error Recovery
**Location**: `/src/components/currency/ErrorRecovery.tsx`

```tsx
import { CurrencyErrorRecovery } from '@/components/currency/ErrorRecovery';

function Layout() {
  return (
    <div>
      <YourContent />
      <CurrencyErrorRecovery
        maxNotifications={3}
        autoRetryDelay={30000}
        showSuccessMessages={true}
        position="top-right"
      />
    </div>
  );
}
```

---

## Hooks & Utilities

### 1. useProgramTuition Hook
**Location**: `/src/hooks/useProgramTuition.ts`

Primary hook for program fee display with real-time conversion.

```tsx
import { useProgramTuition } from '@/hooks/useProgramTuition';

function ProgramCard({ amount, country }) {
  const tuition = useProgramTuition(amount, country, {
    showConversion: true,
    enableRealTime: true,
    cacheTime: 300000
  });

  if (tuition.isLoading) {
    return <div>Loading fees...</div>;
  }

  return (
    <div>
      <div className="price">
        {tuition.primary}
        {tuition.isRealTime && <span className="live-indicator">🟢 Live</span>}
      </div>
      {tuition.secondary && (
        <div className="conversion">{tuition.secondary}</div>
      )}
      {tuition.hasError && (
        <span className="error-indicator">⚠️ Approx</span>
      )}
    </div>
  );
}
```

### 2. useCurrency Hook
**Location**: `/src/lib/currency/hooks.ts`

Core currency operations hook.

```tsx
import { useCurrency } from '@/lib/currency/hooks';

function CurrencyConverter() {
  const { 
    loading, 
    error, 
    convertAmount, 
    getExchangeRate 
  } = useCurrency();

  const handleConvert = async () => {
    const result = await convertAmount(1000, 'USD', 'NGN');
    console.log(result); // { amount: 1000, convertedAmount: 1500000, ... }
  };

  return (
    <div>
      {loading && <div>Converting...</div>}
      {error && <div>Error: {error}</div>}
      <button onClick={handleConvert}>Convert</button>
    </div>
  );
}
```

### 3. useMultiCurrency Hook
```tsx
import { useMultiCurrency } from '@/lib/currency/hooks';

function MultiCurrencyDisplay({ amount, baseCurrency }) {
  const { 
    currencies, 
    loading, 
    error, 
    refresh 
  } = useMultiCurrency(amount, baseCurrency, ['NGN', 'USD', 'GBP'], {
    maxDisplay: 4,
    autoUpdate: true,
    updateInterval: 300000
  });

  return (
    <div>
      {currencies.map(currency => (
        <div key={currency.currency}>
          {currency.formatted}
        </div>
      ))}
    </div>
  );
}
```

### 4. Currency Formatting Functions
**Location**: `/src/lib/currency/formatters.ts`

```typescript
import { formatCurrency, formatCurrencyRange, formatCurrencyChange } from '@/lib/currency/formatters';

// Basic formatting
const formatted = formatCurrency(1500000, 'NGN'); // "₦1,500,000"

// Range formatting  
const range = formatCurrencyRange(1000000, 5000000, 'NGN'); // "₦1M - ₦5M"

// Change formatting
const change = formatCurrencyChange(1000000, 1200000, 'NGN'); // "+₦200K (+20%)"

// Context-aware formatting
const mobile = formatCurrencyAuto(1500000, 'NGN', 'mobile'); // "₦1.5M"
const comparison = formatCurrencyAuto(1500000, 'NGN', 'comparison'); // "₦1,500,000"
```

---

## Configuration

### 1. Environment Setup
**File**: `.env`
```bash
# Currency API Configuration
VITE_FIXER_API_KEY=your_fixer_api_key_here
VITE_FIXER_BASE_URL=https://api.fixer.io/v1

# Cache Configuration
VITE_CURRENCY_CACHE_TTL=300000
VITE_CURRENCY_MEMORY_LIMIT=1000
VITE_CURRENCY_STORAGE_PREFIX=akada_currency_

# Feature Flags
VITE_CURRENCY_FALLBACK_ENABLED=true
VITE_CURRENCY_REAL_TIME_ENABLED=true
VITE_CURRENCY_DEBUG_MODE=false

# Rate Limiting
VITE_CURRENCY_REQUEST_TIMEOUT=10000
VITE_CURRENCY_MAX_RETRIES=3
VITE_CURRENCY_CIRCUIT_BREAKER_THRESHOLD=5
```

### 2. Currency Configuration
**File**: `/src/lib/currency/config.ts`

```typescript
// Supported currencies with metadata
export const ALL_CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimals: 0,
    locale: 'en-NG',
    region: 'africa'
  },
  USD: {
    code: 'USD', 
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    locale: 'en-US',
    region: 'international'
  }
  // ... more currencies
};

// Service configuration
export const DEFAULT_SERVICE_CONFIG: CurrencyServiceConfig = {
  apiKey: import.meta.env.VITE_FIXER_API_KEY,
  baseUrl: 'https://api.fixer.io/v1',
  timeout: 10000,
  cacheTTL: 300000,
  fallbackEnabled: true,
  retryAttempts: 3
};
```

### 3. Database Migration
**File**: `/supabase/migrations/20250712_currency_standardization_ngn.sql`

```sql
-- Add currency preference columns
ALTER TABLE user_profiles 
ADD COLUMN preferred_currency VARCHAR(3) DEFAULT 'NGN',
ADD COLUMN secondary_currency VARCHAR(3) DEFAULT 'USD';

-- Convert existing USD amounts to NGN
UPDATE programs 
SET tuition_fee = tuition_fee * 1500 
WHERE country = 'Nigeria' AND tuition_fee < 50000;

-- Add currency validation function
CREATE OR REPLACE FUNCTION validate_currency_code(currency_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN currency_code IN ('NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR', 'EGP');
END;
$$ LANGUAGE plpgsql;
```

---

## Testing

### 1. Unit Tests
**File**: `/src/lib/currency/__tests__/errorHandling.test.ts`

```typescript
import { describe, it, expect } from '@jest/testing-library';
import { CurrencyErrorFactory, RetryHandler } from '../errors';

describe('Currency Error Handling', () => {
  it('should create API unavailable error', () => {
    const error = CurrencyErrorFactory.apiUnavailable('fixer');
    expect(error.type).toBe(CurrencyErrorType.API_UNAVAILABLE);
    expect(error.retryable).toBe(true);
  });

  it('should retry on retryable errors', async () => {
    const retryHandler = new RetryHandler();
    const operation = jest.fn()
      .mockRejectedValueOnce(CurrencyErrorFactory.networkError())
      .mockResolvedValue('success');

    const result = await retryHandler.execute(operation);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
```

### 2. Integration Tests
```typescript
describe('Currency Service Integration', () => {
  it('should handle complete failure chain gracefully', async () => {
    // Test API failure → retry → circuit breaker → fallback
    const service = new CurrencyService();
    
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    
    const result = await service.getExchangeRate('USD', 'NGN');
    
    // Should fallback to static rate
    expect(result.source).toBe('fallback');
    expect(result.rate).toBe(1500);
  });
});
```

### 3. Component Tests
```tsx
import { render, screen } from '@testing-library/react';
import { useProgramTuition } from '@/hooks/useProgramTuition';

const TestComponent = ({ amount, country }) => {
  const tuition = useProgramTuition(amount, country);
  return <div>{tuition.primary}</div>;
};

describe('useProgramTuition', () => {
  it('should display formatted tuition', () => {
    render(<TestComponent amount={25000} country="United States" />);
    expect(screen.getByText(/\$25,000/)).toBeInTheDocument();
  });
});
```

---

## Migration Guide

### From Legacy System

#### 1. Replace Static Functions
```typescript
// ❌ Old way (static rates)
import { formatCurrency, convertCurrency } from '@/lib/utils';
const formatted = formatCurrency(amount, currency);
const converted = convertCurrency(amount, from, to);

// ✅ New way (real-time rates)
import { useProgramTuition } from '@/hooks/useProgramTuition';
const tuition = useProgramTuition(amount, country);
```

#### 2. Update Components
```tsx
// ❌ Old ProgramCard
function ProgramCard({ program }) {
  const display = formatProgramTuition(program.tuition_fee, program.country);
  return <div>{display.primary}</div>;
}

// ✅ New ProgramCard
function ProgramCard({ program }) {
  const tuition = useProgramTuition(program.tuition_fee, program.country);
  
  return (
    <div>
      {tuition.isLoading ? (
        <div className="animate-pulse bg-gray-200 h-6 w-24 rounded" />
      ) : (
        <div>
          {tuition.primary}
          {tuition.isRealTime && <span className="text-green-500">🟢 Live</span>}
        </div>
      )}
    </div>
  );
}
```

#### 3. Database Migration
```bash
# Run the provided migration
npx supabase migration up 20250712_currency_standardization_ngn

# Or manually apply changes
psql -d your_database -f supabase/migrations/20250712_currency_standardization_ngn.sql
```

### Backward Compatibility
The system maintains backward compatibility through:
- Legacy function exports (marked as deprecated)
- Fallback to static rates when new system fails
- Gradual migration path with warnings

---

## Performance Optimization

### 1. Caching Strategy
```typescript
// Multi-level caching hierarchy
Memory Cache (instant) → localStorage (persistent) → API (fresh data)

// Cache TTL configuration
const cacheConfig = {
  memory: 60000,    // 1 minute
  storage: 300000,  // 5 minutes  
  api: 3600000      // 1 hour for bulk rates
};
```

### 2. Batch Processing
```typescript
// ❌ Individual requests (slow)
for (const program of programs) {
  const rate = await getExchangeRate('USD', 'NGN');
}

// ✅ Batch processing (fast)
const rates = await getBulkRates('USD', ['NGN', 'GHS', 'KES']);
```

### 3. Request Optimization
- **Debouncing**: Prevent rapid successive calls
- **Deduplication**: Avoid duplicate requests
- **Circuit Breaker**: Prevent cascade failures
- **Smart Retries**: Exponential backoff

### 4. Bundle Size Optimization
```typescript
// ❌ Import entire library
import * as currency from '@/lib/currency';

// ✅ Import only what you need
import { useProgramTuition } from '@/hooks/useProgramTuition';
import { formatCurrency } from '@/lib/currency/formatters';
```

---

## Best Practices

### 1. Error Handling
```tsx
// ✅ Always handle loading and error states
function CurrencyDisplay({ amount, currency }) {
  const { formatted, loading, error } = useCurrencyConversion(amount, 'USD', currency);
  
  if (loading) return <Skeleton />;
  if (error) return <FallbackDisplay amount={amount} currency={currency} />;
  
  return <div>{formatted}</div>;
}
```

### 2. Performance
```tsx
// ✅ Use appropriate cache times
const tuition = useProgramTuition(amount, country, {
  cacheTime: 300000,     // 5 minutes for program cards
  enableRealTime: true   // Always try real-time first
});

// ✅ Batch related requests
const programs = useBatchProgramTuition(programList, {
  enableRealTime: true,
  showConversion: true
});
```

### 3. User Experience
```tsx
// ✅ Provide visual feedback
<div className="price-display">
  {tuition.primary}
  {tuition.isRealTime && (
    <span className="live-indicator" title="Live exchange rates">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      Live
    </span>
  )}
  {tuition.hasError && (
    <span className="error-indicator" title="Using approximate rates">
      ⚠️ Approx
    </span>
  )}
</div>
```

### 4. Accessibility
```tsx
// ✅ Include proper ARIA labels and titles
<div
  className="currency-display"
  aria-label={`Tuition fee: ${tuition.primary} per year`}
  title={tuition.isRealTime ? 'Live exchange rates' : 'Approximate rates'}
>
  {tuition.primary}
</div>
```

### 5. Security
```typescript
// ✅ Validate currency inputs
function validateCurrency(currency: string): boolean {
  return isValidCurrency(currency) && currency.length === 3;
}

// ✅ Sanitize amounts
function validateAmount(amount: number): boolean {
  return isFinite(amount) && amount >= 0 && amount <= MAX_AMOUNT;
}
```

### 6. Monitoring
```typescript
// ✅ Track API usage
const quota = currencyService.getAPIQuota();
if (quota.used / quota.limit > 0.8) {
  console.warn('Approaching API quota limit');
}

// ✅ Monitor error rates
currencyService.addEventListener((event) => {
  if (event.type === 'api_error') {
    analytics.track('currency_api_error', {
      error: event.error.type,
      currency_pair: `${event.from}/${event.to}`
    });
  }
});
```

---

## API Reference

### CurrencyService Methods

#### `getExchangeRate(from, to, options?)`
```typescript
const rate = await currencyService.getExchangeRate('USD', 'NGN', {
  strategy: 'hybrid',    // 'realtime' | 'cached' | 'hybrid' | 'fallback'
  maxAge: 300000,        // Max cache age in ms
  forceRefresh: false,   // Bypass cache
  fallbackOnError: true // Use fallback on error
});
```

#### `convertAmount(amount, from, to, options?)`
```typescript
const conversion = await currencyService.convertAmount(1000, 'USD', 'NGN');
// Returns: { amount: 1000, fromCurrency: 'USD', toCurrency: 'NGN', convertedAmount: 1500000, exchangeRate: 1500, timestamp: Date }
```

#### `convertToMultiple(amount, from, targets, options?)`
```typescript
const conversions = await currencyService.convertToMultiple(1000, 'USD', ['NGN', 'GHS']);
// Returns: { NGN: { ... }, GHS: { ... } }
```

### Hook Signatures

#### `useProgramTuition(amount, country, options?)`
```typescript
interface UseProgramTuitionOptions {
  showConversion?: boolean;  // Show secondary currency
  enableRealTime?: boolean;  // Use API vs static rates
  cacheTime?: number;        // Cache duration in ms
}

interface TuitionDisplay {
  primary: string;           // Formatted primary amount
  secondary?: string;        // Formatted secondary amount
  isNigerian: boolean;       // Is Nigerian institution
  isRealTime: boolean;       // Using real-time rates
  isLoading: boolean;        // Loading state
  error: Error | null;       // Error if any
  hasError: boolean;         // Has error flag
}
```

#### `useCurrency()`
```typescript
const {
  loading,              // boolean
  error,                // string | null
  getExchangeRate,      // (from, to) => Promise<ExchangeRate>
  convertAmount,        // (amount, from, to) => Promise<CurrencyConversion>
  convertToMultiple,    // (amount, from, targets) => Promise<Record<string, CurrencyConversion>>
  clearCache,          // () => void
  getApiQuota,         // () => { used: number, limit: number, resetDate: Date }
  format,              // formatCurrency function
  isValidCurrency      // (currency) => boolean
} = useCurrency();
```

---

## Troubleshooting

### Common Issues

#### 1. "Circular dependency detected"
**Cause**: Importing old and new currency functions together
**Solution**: Use new system exclusively or import legacy functions directly
```typescript
// ❌ Causes circular dependency
import { formatCurrency } from '@/lib/currency';
import { formatNGN } from '@/lib/currency';

// ✅ Use new system
import { formatCurrency } from '@/lib/currency/formatters';

// ✅ Or import legacy directly
import { formatNGN } from '@/lib/currency';
```

#### 2. "API quota exceeded"
**Cause**: Too many API requests
**Solution**: Increase cache time, use batch requests, upgrade API plan
```typescript
// ✅ Increase cache time
const tuition = useProgramTuition(amount, country, {
  cacheTime: 600000 // 10 minutes instead of 5
});

// ✅ Use batch processing
const programs = useBatchProgramTuition(programList);
```

#### 3. "Currency not supported"
**Cause**: Using unsupported currency code
**Solution**: Check supported currencies list
```typescript
import { isValidCurrency, getSupportedCurrencies } from '@/lib/currency/config';

if (!isValidCurrency('XXX')) {
  console.log('Supported currencies:', getSupportedCurrencies());
}
```

#### 4. "Network timeout"
**Cause**: API server slow response
**Solution**: Increase timeout, check network
```typescript
const service = new CurrencyService({
  timeout: 15000 // Increase from default 10s
});
```

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('currency_debug', 'true');

// Check cache contents
console.log('Cache stats:', currencyCache.getStats());

// Monitor API calls
currencyService.addEventListener(console.log);
```

---

## Conclusion

The Akada Multicurrency System provides a robust, scalable solution for currency operations in international education platforms. With real-time API integration, intelligent fallbacks, comprehensive error handling, and optimized performance, it ensures reliable currency display and conversion across all user interactions.

For additional support or questions, refer to the inline code documentation or contact the development team.

---

**Last Updated**: July 2025  
**Version**: 1.0.0  
**Maintainer**: Akada Development Team