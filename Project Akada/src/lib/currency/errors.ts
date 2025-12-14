// Currency system error types and handlers for Akada
export enum CurrencyErrorType {
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

export class CurrencyError extends Error {
  public readonly type: CurrencyErrorType;
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly fallbackAvailable: boolean;
  public readonly details?: any;
  public readonly cause?: Error;

  constructor(
    type: CurrencyErrorType,
    message: string,
    options: {
      code?: string;
      retryable?: boolean;
      fallbackAvailable?: boolean;
      details?: any;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'CurrencyError';
    this.type = type;
    this.code = options.code || type;
    this.retryable = options.retryable ?? false;
    this.fallbackAvailable = options.fallbackAvailable ?? true;
    this.details = options.details;
    this.cause = options.cause;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      fallbackAvailable: this.fallbackAvailable,
      details: this.details,
      stack: this.stack
    };
  }
}

/**
 * Error factory for creating consistent currency errors
 */
export class CurrencyErrorFactory {
  static apiUnavailable(provider: string, cause?: Error): CurrencyError {
    return new CurrencyError(
      CurrencyErrorType.API_UNAVAILABLE,
      `Currency API provider ${provider} is unavailable`,
      {
        code: 'API_DOWN',
        retryable: true,
        fallbackAvailable: true,
        details: { provider },
        cause
      }
    );
  }

  static invalidCurrency(currency: string): CurrencyError {
    return new CurrencyError(
      CurrencyErrorType.INVALID_CURRENCY,
      `Invalid currency code: ${currency}`,
      {
        code: 'INVALID_CURRENCY',
        retryable: false,
        fallbackAvailable: false,
        details: { currency }
      }
    );
  }

  static conversionFailed(from: string, to: string, cause?: Error): CurrencyError {
    return new CurrencyError(
      CurrencyErrorType.CONVERSION_FAILED,
      `Failed to convert ${from} to ${to}`,
      {
        code: 'CONVERSION_ERROR',
        retryable: true,
        fallbackAvailable: true,
        details: { from, to },
        cause
      }
    );
  }

  static rateLimitExceeded(resetTime?: Date): CurrencyError {
    return new CurrencyError(
      CurrencyErrorType.RATE_LIMIT_EXCEEDED,
      'API rate limit exceeded',
      {
        code: 'RATE_LIMIT',
        retryable: true,
        fallbackAvailable: true,
        details: { resetTime }
      }
    );
  }

  static networkError(cause?: Error): CurrencyError {
    return new CurrencyError(
      CurrencyErrorType.NETWORK_ERROR,
      'Network connection failed',
      {
        code: 'NETWORK_ERROR',
        retryable: true,
        fallbackAvailable: true,
        cause
      }
    );
  }

  static quotaExceeded(): CurrencyError {
    return new CurrencyError(
      CurrencyErrorType.QUOTA_EXCEEDED,
      'API quota exceeded for this billing period',
      {
        code: 'QUOTA_EXCEEDED',
        retryable: false,
        fallbackAvailable: true
      }
    );
  }

  static invalidAmount(amount: number): CurrencyError {
    return new CurrencyError(
      CurrencyErrorType.INVALID_AMOUNT,
      `Invalid amount: ${amount}`,
      {
        code: 'INVALID_AMOUNT',
        retryable: false,
        fallbackAvailable: false,
        details: { amount }
      }
    );
  }
}

/**
 * Retry configuration for different error types
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: CurrencyErrorType[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
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

/**
 * Retry utility with exponential backoff
 */
export class RetryHandler {
  constructor(private config: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  async execute<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        if (error instanceof CurrencyError) {
          if (!error.retryable || !this.config.retryableErrors.includes(error.type)) {
            throw error;
          }
          
          // Special handling for rate limits
          if (error.type === CurrencyErrorType.RATE_LIMIT_EXCEEDED && error.details?.resetTime) {
            const waitTime = error.details.resetTime.getTime() - Date.now();
            if (waitTime > 0 && waitTime < this.config.maxDelay) {
              await this.delay(waitTime);
              continue;
            }
          }
        }
        
        // Don't retry on last attempt
        if (attempt === this.config.maxAttempts) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1),
          this.config.maxDelay
        );
        
        console.warn(`Currency operation failed (attempt ${attempt}/${this.config.maxAttempts}), retrying in ${delay}ms:`, error);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit breaker to prevent cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CurrencyError(
          CurrencyErrorType.SERVICE_ERROR,
          'Currency service circuit breaker is open',
          {
            code: 'CIRCUIT_OPEN',
            retryable: true,
            fallbackAvailable: true
          }
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}

/**
 * Fallback rate provider using static rates
 * Updated: October 2025 - Added CAD and updated rates
 */
export class FallbackRateProvider {
  private static readonly STATIC_RATES: Record<string, Record<string, number>> = {
    USD: {
      NGN: 1500,
      GHS: 12.5,
      KES: 130,
      ZAR: 18.5,
      EGP: 31,
      CAD: 1.43,
      GBP: 0.79,
      EUR: 0.92,
      AUD: 1.52,
      SEK: 10.85,
      NOK: 10.95,
      DKK: 6.85,
      CHF: 0.88,
      JPY: 149.50,
      SGD: 1.34,
      NZD: 1.68,
      HKD: 7.78
    },
    CAD: {
      NGN: 1050,      // CRITICAL FIX: 1 CAD = 1050 NGN (October 2025)
      USD: 0.699,     // 1 CAD = 0.699 USD (1/1.43)
      GBP: 0.55,      // 1 CAD = 0.55 GBP
      EUR: 0.64,      // 1 CAD = 0.64 EUR
      AUD: 1.06,      // 1 CAD = 1.06 AUD
      GHS: 8.75,      // 1 CAD = 8.75 GHS
      KES: 90.9,      // 1 CAD = 90.9 KES
      ZAR: 12.9       // 1 CAD = 12.9 ZAR
    },
    NGN: {
      USD: 1 / 1500,
      CAD: 1 / 1050,  // CRITICAL FIX: Added CAD rate
      GHS: 12.5 / 1500,
      KES: 130 / 1500,
      ZAR: 18.5 / 1500,
      EGP: 31 / 1500
    },
    EUR: {
      USD: 1.09,      // Updated from 1.08
      NGN: 1620,
      GBP: 0.86,      // Updated from 0.84
      CAD: 1.56       // Added CAD rate
    },
    GBP: {
      USD: 1.27,
      NGN: 1905,
      EUR: 1.16,      // Updated from 1.19
      CAD: 1.82       // Added CAD rate
    },
    AUD: {
      USD: 0.658,     // 1 AUD = 0.658 USD (1/1.52)
      NGN: 987,       // 1 AUD = 987 NGN
      CAD: 0.943      // 1 AUD = 0.943 CAD (1/1.06)
    },
    SEK: {
      USD: 0.092,     // 1 SEK = 0.092 USD (1/10.85)
      NGN: 138,       // 1 SEK = 138 NGN
      EUR: 0.085      // 1 SEK = 0.085 EUR
    },
    SGD: {
      USD: 0.746,     // 1 SGD = 0.746 USD (1/1.34)
      NGN: 1119,      // 1 SGD = 1119 NGN (0.746 * 1500)
      CAD: 1.067      // 1 SGD = 1.067 CAD
    },
    NOK: {
      USD: 0.091,     // 1 NOK = 0.091 USD (1/10.95)
      NGN: 137        // 1 NOK = 137 NGN
    },
    DKK: {
      USD: 0.146,     // 1 DKK = 0.146 USD (1/6.85)
      NGN: 219        // 1 DKK = 219 NGN
    },
    CHF: {
      USD: 1.136,     // 1 CHF = 1.136 USD (1/0.88)
      NGN: 1704       // 1 CHF = 1704 NGN
    },
    JPY: {
      USD: 0.0067,    // 1 JPY = 0.0067 USD (1/149.50)
      NGN: 10.03      // 1 JPY = 10.03 NGN
    },
    NZD: {
      USD: 0.595,     // 1 NZD = 0.595 USD (1/1.68)
      NGN: 893        // 1 NZD = 893 NGN
    },
    HKD: {
      USD: 0.129,     // 1 HKD = 0.129 USD (1/7.78)
      NGN: 193        // 1 HKD = 193 NGN
    }
  };

  static getRate(from: string, to: string): number | null {
    if (from === to) return 1;
    
    const fromRates = this.STATIC_RATES[from];
    if (fromRates && fromRates[to]) {
      return fromRates[to];
    }
    
    // Try inverse rate
    const toRates = this.STATIC_RATES[to];
    if (toRates && toRates[from]) {
      return 1 / toRates[from];
    }
    
    // Try USD as intermediary
    if (from !== 'USD' && to !== 'USD') {
      const fromToUsd = this.getRate(from, 'USD');
      const usdToTarget = this.getRate('USD', to);
      
      if (fromToUsd && usdToTarget) {
        return fromToUsd * usdToTarget;
      }
    }
    
    return null;
  }

  static hasRate(from: string, to: string): boolean {
    return this.getRate(from, to) !== null;
  }

  static getSupportedCurrencies(): string[] {
    const currencies = new Set<string>();
    
    Object.keys(this.STATIC_RATES).forEach(from => {
      currencies.add(from);
      Object.keys(this.STATIC_RATES[from]).forEach(to => {
        currencies.add(to);
      });
    });
    
    return Array.from(currencies).sort();
  }
}

export default {
  CurrencyError,
  CurrencyErrorFactory,
  RetryHandler,
  CircuitBreaker,
  FallbackRateProvider,
  CurrencyErrorType
};