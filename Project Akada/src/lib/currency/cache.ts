// Currency caching system for Akada multicurrency support
import type { CacheEntry, ExchangeRate, CurrencyError } from './types';
import { CACHE_KEYS } from './config';

/**
 * Multi-level caching system for currency exchange rates
 * Level 1: Memory cache (fastest)
 * Level 2: localStorage (persistent across sessions)
 * Level 3: API fetch (slowest but most accurate)
 */
export class CurrencyCache {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly TTL: number;
  private readonly maxMemoryEntries = 100;
  
  constructor(ttlSeconds: number = 3600) {
    this.TTL = ttlSeconds * 1000; // Convert to milliseconds
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.TTL / 4);
  }

  /**
   * Get cached exchange rate with multi-level lookup
   */
  async get(key: string): Promise<ExchangeRate | null> {
    // Level 1: Memory cache (fastest)
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data;
    }

    // Level 2: localStorage (persistent)
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: CacheEntry<ExchangeRate> = JSON.parse(stored);
        
        // Convert string dates back to Date objects
        parsed.timestamp = new Date(parsed.timestamp);
        parsed.expiry = new Date(parsed.expiry);
        parsed.data.timestamp = new Date(parsed.data.timestamp);
        if (parsed.data.validUntil) {
          parsed.data.validUntil = new Date(parsed.data.validUntil);
        }
        
        if (!this.isExpired(parsed)) {
          // Promote to memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          // Remove expired localStorage entry
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Currency cache localStorage read failed:', error);
    }

    return null;
  }

  /**
   * Store exchange rate in both memory and localStorage
   */
  async set(key: string, rate: ExchangeRate): Promise<void> {
    const now = new Date();
    const expiry = new Date(now.getTime() + this.TTL);
    
    const entry: CacheEntry<ExchangeRate> = {
      data: {
        ...rate,
        source: 'cache',
        validUntil: expiry
      },
      timestamp: now,
      expiry,
      key
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);
    
    // Manage memory cache size
    if (this.memoryCache.size > this.maxMemoryEntries) {
      this.evictOldestMemoryEntry();
    }

    // Store in localStorage
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Currency cache localStorage write failed:', error);
      // Try to free up space
      this.clearLocalStorageCache();
      
      // Retry once
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (retryError) {
        console.error('Currency cache localStorage retry failed:', retryError);
      }
    }
  }

  /**
   * Get exchange rate for currency pair
   */
  async getRate(from: string, to: string): Promise<ExchangeRate | null> {
    const key = CACHE_KEYS.EXCHANGE_RATE(from, to);
    return this.get(key);
  }

  /**
   * Store exchange rate for currency pair
   */
  async setRate(from: string, to: string, rate: number, source: 'api' | 'fallback' = 'api'): Promise<void> {
    const key = CACHE_KEYS.EXCHANGE_RATE(from, to);
    const exchangeRate: ExchangeRate = {
      from,
      to,
      rate,
      timestamp: new Date(),
      source
    };
    
    await this.set(key, exchangeRate);
  }

  /**
   * Store multiple rates from bulk API response
   */
  async setBulkRates(base: string, rates: Record<string, number>, source: 'api' | 'fallback' = 'api'): Promise<void> {
    const promises = Object.entries(rates).map(([currency, rate]) =>
      this.setRate(base, currency, rate, source)
    );
    
    await Promise.all(promises);
    
    // Also cache the bulk response
    const bulkKey = CACHE_KEYS.RATES_BULK(base);
    const now = new Date();
    const bulkData = {
      base,
      rates,
      timestamp: now,
      source
    };
    
    await this.set(bulkKey, bulkData as any);
  }

  /**
   * Get bulk rates for a base currency
   */
  async getBulkRates(base: string): Promise<Record<string, number> | null> {
    const key = CACHE_KEYS.RATES_BULK(base);
    const cached = await this.get(key);
    
    if (cached && (cached as any).rates) {
      return (cached as any).rates;
    }
    
    return null;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear localStorage cache
    this.clearLocalStorageCache();
  }

  /**
   * Clear specific currency pair cache
   */
  clearRate(from: string, to: string): void {
    const key = CACHE_KEYS.EXCHANGE_RATE(from, to);
    this.memoryCache.delete(key);
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear localStorage cache entry:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    localStorageEntries: number;
    memorySize: string;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const memoryEntries = this.memoryCache.size;
    
    // Count localStorage entries
    let localStorageEntries = 0;
    let oldestEntry: Date | undefined;
    let newestEntry: Date | undefined;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('exchange_rate_') || key?.startsWith('rates_bulk_')) {
          localStorageEntries++;
          
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              const timestamp = new Date(parsed.timestamp);
              
              if (!oldestEntry || timestamp < oldestEntry) {
                oldestEntry = timestamp;
              }
              if (!newestEntry || timestamp > newestEntry) {
                newestEntry = timestamp;
              }
            }
          } catch (error) {
            // Skip invalid entries
          }
        }
      }
    } catch (error) {
      console.warn('Failed to calculate localStorage stats:', error);
    }

    // Estimate memory size
    const memorySize = `${Math.round((this.memoryCache.size * 200) / 1024)} KB`;

    return {
      memoryEntries,
      localStorageEntries,
      memorySize,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return new Date() > entry.expiry;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage cache (limited cleanup to avoid blocking)
    this.cleanupLocalStorage();
  }

  /**
   * Clean up expired localStorage entries (limited batch)
   */
  private cleanupLocalStorage(): void {
    try {
      const keysToRemove: string[] = [];
      let checked = 0;
      const maxCheck = 20; // Limit to avoid blocking
      
      for (let i = 0; i < localStorage.length && checked < maxCheck; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('exchange_rate_') || key?.startsWith('rates_bulk_')) {
          checked++;
          
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              const expiry = new Date(parsed.expiry);
              
              if (new Date() > expiry) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // Invalid entry, mark for removal
            keysToRemove.push(key);
          }
        }
      }
      
      // Remove expired entries
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove expired cache entry ${key}:`, error);
        }
      });
      
    } catch (error) {
      console.warn('localStorage cleanup failed:', error);
    }
  }

  /**
   * Clear all currency-related localStorage entries
   */
  private clearLocalStorageCache(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('exchange_rate_') || 
            key?.startsWith('rates_bulk_') ||
            key?.startsWith('currency_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  /**
   * Evict oldest entry from memory cache
   */
  private evictOldestMemoryEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp.getTime() < oldestTime) {
        oldestTime = entry.timestamp.getTime();
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }
}

// Global cache instance
export const currencyCache = new CurrencyCache();

export default currencyCache;