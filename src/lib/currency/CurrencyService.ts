// Core currency service for Akada multicurrency system
import type { 
  ExchangeRate, 
  CurrencyServiceConfig, 
  APIResponse, 
  CurrencyConversion,
  RateFetchOptions,
  CurrencyEventListener,
  CurrencyEvent
} from './types';
import { getCurrencyServiceConfig, FALLBACK_RATES, isValidCurrency } from './config';
import { currencyCache } from './cache';
import { 
  CurrencyError, 
  CurrencyErrorFactory, 
  RetryHandler, 
  CircuitBreaker, 
  FallbackRateProvider 
} from './errors';

/**
 * Enhanced Currency Service with real-time API integration
 * Handles exchange rate fetching, caching, and fallback mechanisms
 */
export class CurrencyService {
  private config: CurrencyServiceConfig;
  private cache = currencyCache;
  private apiQuota = { used: 0, limit: 1000, resetDate: new Date() };
  private eventListeners: CurrencyEventListener[] = [];
  private retryHandler = new RetryHandler();
  private circuitBreaker = new CircuitBreaker();
  
  constructor(config?: Partial<CurrencyServiceConfig>) {
    this.config = { 
      ...getCurrencyServiceConfig(),
      ...config 
    };
    
    // Initialize API quota tracking
    this.loadApiQuota();
  }

  /**
   * Get exchange rate between two currencies with smart fallback
   */
  async getExchangeRate(
    from: string, 
    to: string, 
    options: RateFetchOptions = {}
  ): Promise<ExchangeRate> {
    // Validate currencies
    if (!isValidCurrency(from) || !isValidCurrency(to)) {
      throw CurrencyErrorFactory.invalidCurrency(`${from}/${to}`);
    }

    // Same currency conversion
    if (from === to) {
      return {
        from,
        to,
        rate: 1,
        timestamp: new Date(),
        source: 'cache'
      };
    }

    const {
      strategy = 'hybrid',
      maxAge = this.config.cacheTTL,
      forceRefresh = false,
      fallbackOnError = this.config.fallbackEnabled
    } = options;

    try {
      // Check cache first (unless forced refresh)
      if (!forceRefresh && (strategy === 'cached' || strategy === 'hybrid')) {
        const cached = await this.cache.getRate(from, to);
        if (cached && this.isRateValid(cached, maxAge)) {
          return cached;
        }
      }

      // Try API fetch with circuit breaker and retry logic
      if (strategy === 'realtime' || strategy === 'hybrid') {
        if (this.canUseAPI()) {
          try {
            const rate = await this.circuitBreaker.execute(() =>
              this.retryHandler.execute(() => this.fetchRateFromAPI(from, to))
            );
            
            await this.cache.setRate(from, to, rate, 'api');
            this.recordAPIUsage();
            
            this.emit('rate_updated', { from, to, rate, source: 'api' });
            
            return {
              from,
              to,
              rate,
              timestamp: new Date(),
              source: 'api'
            };
          } catch (apiError) {
            console.warn(`API fetch failed for ${from}/${to}:`, apiError);
            
            this.emit('api_error', { 
              error: apiError instanceof CurrencyError ? apiError : CurrencyErrorFactory.apiUnavailable('fixer', apiError as Error),
              from,
              to 
            });

            if (!fallbackOnError) {
              throw apiError;
            }
          }
        }
      }

      // Use enhanced fallback rates
      if (strategy === 'fallback' || fallbackOnError) {
        const fallbackRate = FallbackRateProvider.getRate(from, to);
        if (fallbackRate !== null) {
          await this.cache.setRate(from, to, fallbackRate, 'fallback');
          
          this.emit('fallback_used', { from, to, rate: fallbackRate });
          
          return {
            from,
            to,
            rate: fallbackRate,
            timestamp: new Date(),
            source: 'fallback'
          };
        }
      }

      throw CurrencyErrorFactory.conversionFailed(from, to);

    } catch (error) {
      if (error instanceof CurrencyError) {
        throw error;
      }
      
      throw CurrencyErrorFactory.networkError(error instanceof Error ? error : undefined);
    }
  }

  /**
   * Convert amount between currencies
   */
  async convertAmount(
    amount: number,
    from: string,
    to: string,
    options: RateFetchOptions = {}
  ): Promise<CurrencyConversion> {
    if (!this.isValidAmount(amount)) {
      throw CurrencyErrorFactory.invalidAmount(amount);
    }

    try {
      const exchangeRate = await this.getExchangeRate(from, to, options);
      const convertedAmount = amount * exchangeRate.rate;

      return {
        amount,
        fromCurrency: from,
        toCurrency: to,
        convertedAmount,
        exchangeRate: exchangeRate.rate,
        timestamp: new Date()
      };
    } catch (error) {
      if (error instanceof CurrencyError) {
        throw error;
      }
      throw CurrencyErrorFactory.conversionFailed(from, to, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Convert amount to multiple target currencies
   */
  async convertToMultiple(
    amount: number,
    from: string,
    targets: string[],
    options: RateFetchOptions = {}
  ): Promise<Record<string, CurrencyConversion>> {
    const conversions = await Promise.allSettled(
      targets.map(async (to) => {
        const conversion = await this.convertAmount(amount, from, to, options);
        return [to, conversion] as [string, CurrencyConversion];
      })
    );

    const result: Record<string, CurrencyConversion> = {};
    
    conversions.forEach((result_item, index) => {
      if (result_item.status === 'fulfilled') {
        const [currency, conversion] = result_item.value;
        result[currency] = conversion;
      } else {
        console.warn(`Conversion failed for ${targets[index]}:`, result_item.reason);
      }
    });

    return result;
  }

  /**
   * Get multiple exchange rates in a single API call (when possible)
   */
  async getBulkRates(
    base: string,
    targets: string[],
    options: RateFetchOptions = {}
  ): Promise<Record<string, ExchangeRate>> {
    // Check if we can use cached bulk rates
    if (!options.forceRefresh) {
      const cached = await this.cache.getBulkRates(base);
      if (cached) {
        const result: Record<string, ExchangeRate> = {};
        targets.forEach(target => {
          if (cached[target]) {
            result[target] = {
              from: base,
              to: target,
              rate: cached[target],
              timestamp: new Date(),
              source: 'cache'
            };
          }
        });
        
        if (Object.keys(result).length === targets.length) {
          return result;
        }
      }
    }

    // Fetch from API
    if (this.canUseAPI()) {
      try {
        const apiRates = await this.fetchBulkRatesFromAPI(base, targets);
        await this.cache.setBulkRates(base, apiRates, 'api');
        this.recordAPIUsage();

        const result: Record<string, ExchangeRate> = {};
        Object.entries(apiRates).forEach(([target, rate]) => {
          result[target] = {
            from: base,
            to: target,
            rate,
            timestamp: new Date(),
            source: 'api'
          };
        });

        return result;
      } catch (error) {
        console.warn(`Bulk API fetch failed for ${base}:`, error);
      }
    }

    // Fallback to individual rate fetching
    const individualRates = await Promise.allSettled(
      targets.map(async (target) => {
        const rate = await this.getExchangeRate(base, target, options);
        return [target, rate] as [string, ExchangeRate];
      })
    );

    const result: Record<string, ExchangeRate> = {};
    individualRates.forEach((result_item, index) => {
      if (result_item.status === 'fulfilled') {
        const [target, rate] = result_item.value;
        result[target] = rate;
      }
    });

    return result;
  }

  /**
   * Clear all cached rates
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache_cleared', {});
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get API quota information
   */
  getAPIQuota() {
    return { ...this.apiQuota };
  }

  /**
   * Add event listener
   */
  addEventListener(listener: CurrencyEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: CurrencyEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // Private methods

  private async fetchRateFromAPI(from: string, to: string): Promise<number> {
    const url = `${this.config.baseUrl}/latest?access_key=${this.config.apiKey}&base=${from}&symbols=${to}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: APIResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.info || 'API request failed');
      }

      if (!data.rates || !(to in data.rates)) {
        throw new Error(`Rate not found for ${from}/${to}`);
      }

      return data.rates[to];
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw CurrencyErrorFactory.networkError(error);
      }
      
      throw CurrencyErrorFactory.apiUnavailable('fixer', error instanceof Error ? error : undefined);
    }
  }

  private async fetchBulkRatesFromAPI(base: string, targets: string[]): Promise<Record<string, number>> {
    const symbols = targets.join(',');
    const url = `${this.config.baseUrl}/latest?access_key=${this.config.apiKey}&base=${base}&symbols=${symbols}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: APIResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.info || 'Bulk API request failed');
      }

      return data.rates || {};
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }


  private isRateValid(rate: ExchangeRate, maxAgeSeconds: number): boolean {
    const ageMs = Date.now() - rate.timestamp.getTime();
    return ageMs < (maxAgeSeconds * 1000);
  }

  private isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && 
           !isNaN(amount) && 
           isFinite(amount) && 
           amount >= 0;
  }

  private canUseAPI(): boolean {
    if (!this.config.apiKey) return false;
    
    // Check if quota is exceeded
    const now = new Date();
    if (now > this.apiQuota.resetDate) {
      // Reset quota monthly
      this.apiQuota.used = 0;
      this.apiQuota.resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      this.saveApiQuota();
    }
    
    return this.apiQuota.used < this.apiQuota.limit;
  }

  private recordAPIUsage(): void {
    this.apiQuota.used++;
    this.saveApiQuota();
  }

  private loadApiQuota(): void {
    try {
      const stored = localStorage.getItem('currency_api_quota');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.apiQuota = {
          ...parsed,
          resetDate: new Date(parsed.resetDate)
        };
      }
    } catch (error) {
      console.warn('Failed to load API quota:', error);
    }
  }

  private saveApiQuota(): void {
    try {
      localStorage.setItem('currency_api_quota', JSON.stringify(this.apiQuota));
    } catch (error) {
      console.warn('Failed to save API quota:', error);
    }
  }


  private emit(type: CurrencyEvent['type'], data?: any): void {
    const event: CurrencyEvent = {
      type,
      timestamp: new Date(),
      data
    };

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Currency event listener error:', error);
      }
    });
  }
}

// Global currency service instance
export const currencyService = new CurrencyService();

export default currencyService;