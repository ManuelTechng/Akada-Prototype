// Tests for currency error handling and fallback mechanisms
import { describe, it, expect, jest, beforeEach } from '@testing-library/jest-dom';
import { 
  CurrencyError, 
  CurrencyErrorFactory, 
  CurrencyErrorType,
  RetryHandler,
  CircuitBreaker,
  FallbackRateProvider
} from '../errors';

describe('Currency Error Handling', () => {
  describe('CurrencyError', () => {
    it('should create error with correct properties', () => {
      const error = new CurrencyError(
        CurrencyErrorType.API_UNAVAILABLE,
        'Service unavailable',
        {
          code: 'API_DOWN',
          retryable: true,
          fallbackAvailable: true,
          details: { provider: 'fixer' }
        }
      );

      expect(error.type).toBe(CurrencyErrorType.API_UNAVAILABLE);
      expect(error.message).toBe('Service unavailable');
      expect(error.code).toBe('API_DOWN');
      expect(error.retryable).toBe(true);
      expect(error.fallbackAvailable).toBe(true);
      expect(error.details).toEqual({ provider: 'fixer' });
    });

    it('should serialize to JSON correctly', () => {
      const error = CurrencyErrorFactory.networkError();
      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'CurrencyError');
      expect(json).toHaveProperty('type', CurrencyErrorType.NETWORK_ERROR);
      expect(json).toHaveProperty('retryable', true);
    });
  });

  describe('CurrencyErrorFactory', () => {
    it('should create API unavailable error', () => {
      const error = CurrencyErrorFactory.apiUnavailable('fixer');
      
      expect(error.type).toBe(CurrencyErrorType.API_UNAVAILABLE);
      expect(error.message).toContain('fixer');
      expect(error.retryable).toBe(true);
    });

    it('should create invalid currency error', () => {
      const error = CurrencyErrorFactory.invalidCurrency('XXX');
      
      expect(error.type).toBe(CurrencyErrorType.INVALID_CURRENCY);
      expect(error.message).toContain('XXX');
      expect(error.retryable).toBe(false);
    });

    it('should create conversion failed error', () => {
      const error = CurrencyErrorFactory.conversionFailed('USD', 'NGN');
      
      expect(error.type).toBe(CurrencyErrorType.CONVERSION_FAILED);
      expect(error.message).toContain('USD');
      expect(error.message).toContain('NGN');
      expect(error.retryable).toBe(true);
    });

    it('should create rate limit exceeded error', () => {
      const resetTime = new Date();
      const error = CurrencyErrorFactory.rateLimitExceeded(resetTime);
      
      expect(error.type).toBe(CurrencyErrorType.RATE_LIMIT_EXCEEDED);
      expect(error.details?.resetTime).toBe(resetTime);
      expect(error.retryable).toBe(true);
    });
  });

  describe('RetryHandler', () => {
    let retryHandler: RetryHandler;

    beforeEach(() => {
      retryHandler = new RetryHandler({
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2,
        retryableErrors: [CurrencyErrorType.NETWORK_ERROR]
      });
    });

    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await retryHandler.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(CurrencyErrorFactory.networkError())
        .mockRejectedValueOnce(CurrencyErrorFactory.networkError())
        .mockResolvedValue('success');

      const result = await retryHandler.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValue(CurrencyErrorFactory.invalidCurrency('XXX'));

      await expect(retryHandler.execute(operation)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max attempts', async () => {
      const operation = jest.fn()
        .mockRejectedValue(CurrencyErrorFactory.networkError());

      await expect(retryHandler.execute(operation)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker(2, 1000); // 2 failures, 1 second reset
    });

    it('should start in closed state', () => {
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should open after failure threshold', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('fail'));

      // First failure
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
      expect(circuitBreaker.getState()).toBe('CLOSED');

      // Second failure - should open circuit
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should reject immediately when open', async () => {
      const operation = jest.fn();
      
      // Force circuit to open
      const failingOperation = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();

      // Now circuit is open, should reject immediately
      await expect(circuitBreaker.execute(operation)).rejects.toThrow('circuit breaker');
      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe('FallbackRateProvider', () => {
    it('should return direct rate', () => {
      const rate = FallbackRateProvider.getRate('USD', 'NGN');
      expect(rate).toBe(1500);
    });

    it('should return inverse rate', () => {
      const rate = FallbackRateProvider.getRate('NGN', 'USD');
      expect(rate).toBe(1 / 1500);
    });

    it('should return 1 for same currency', () => {
      const rate = FallbackRateProvider.getRate('USD', 'USD');
      expect(rate).toBe(1);
    });

    it('should return null for unsupported pair', () => {
      const rate = FallbackRateProvider.getRate('XXX', 'YYY');
      expect(rate).toBeNull();
    });

    it('should calculate cross rates via USD', () => {
      const rate = FallbackRateProvider.getRate('EUR', 'NGN');
      expect(rate).toBeCloseTo(1.08 * 1500); // EUR to USD to NGN
    });

    it('should check if rate is available', () => {
      expect(FallbackRateProvider.hasRate('USD', 'NGN')).toBe(true);
      expect(FallbackRateProvider.hasRate('XXX', 'YYY')).toBe(false);
    });

    it('should return supported currencies', () => {
      const currencies = FallbackRateProvider.getSupportedCurrencies();
      expect(currencies).toContain('USD');
      expect(currencies).toContain('NGN');
      expect(currencies).toContain('EUR');
      expect(currencies).toContain('GBP');
    });
  });

  describe('Error Integration', () => {
    it('should handle complete failure chain gracefully', async () => {
      const retryHandler = new RetryHandler();
      const circuitBreaker = new CircuitBreaker();

      const failingOperation = jest.fn().mockRejectedValue(
        CurrencyErrorFactory.apiUnavailable('test')
      );

      // Should exhaust retries and then circuit should open
      await expect(
        circuitBreaker.execute(() => retryHandler.execute(failingOperation))
      ).rejects.toThrow();

      // Fallback should still work
      const fallbackRate = FallbackRateProvider.getRate('USD', 'NGN');
      expect(fallbackRate).toBe(1500);
    });
  });
});

// Mock tests for real error scenarios
describe('Real Error Scenarios', () => {
  it('should handle network timeout', () => {
    const error = CurrencyErrorFactory.networkError(new Error('Request timeout'));
    expect(error.type).toBe(CurrencyErrorType.NETWORK_ERROR);
    expect(error.retryable).toBe(true);
  });

  it('should handle API quota exceeded', () => {
    const error = CurrencyErrorFactory.quotaExceeded();
    expect(error.type).toBe(CurrencyErrorType.QUOTA_EXCEEDED);
    expect(error.retryable).toBe(false);
    expect(error.fallbackAvailable).toBe(true);
  });

  it('should handle invalid amount', () => {
    const error = CurrencyErrorFactory.invalidAmount(-100);
    expect(error.type).toBe(CurrencyErrorType.INVALID_AMOUNT);
    expect(error.retryable).toBe(false);
    expect(error.details?.amount).toBe(-100);
  });
});

export {};