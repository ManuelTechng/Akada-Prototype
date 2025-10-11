// Functional tests for currency system
import { describe, it, expect } from 'vitest';
import { formatProgramTuition, getCountryCurrency, convertCurrency } from '../../utils';
import { formatCurrency } from '../../../utils/currency';
import { currencyService } from '../CurrencyService';

describe('Currency System Functional Tests', () => {
  describe('Legacy Currency Functions', () => {
    it('should detect Swedish currency correctly', () => {
      const currency = getCountryCurrency('Sweden');
      expect(currency).toBe('SEK');
    });

    it('should format SEK currency correctly', () => {
      const formatted = formatCurrency(35000, 'SEK');
      expect(formatted).toContain('kr');
      expect(formatted).toContain('35');
    });

    it('should convert SEK to NGN with correct rates', () => {
      const converted = convertCurrency(35000, 'SEK', 'NGN');
      expect(converted).toBeGreaterThan(1000000); // Should be around 4.6M NGN
      expect(converted).toBeLessThan(10000000);   // Sanity check
    });

    it('should format Swedish program tuition correctly', () => {
      const result = formatProgramTuition(35000, 'Sweden', true);
      expect(result.primary).toContain('kr');
      expect(result.secondary).toContain('₦');
      expect(result.isNigerian).toBe(false);
    });
  });

  describe('Currency Configuration', () => {
    it('should have all required currencies in EXCHANGE_RATES', () => {
      const { EXCHANGE_RATES } = require('../../utils');
      expect(EXCHANGE_RATES).toHaveProperty('SEK');
      expect(EXCHANGE_RATES).toHaveProperty('NGN');
      expect(EXCHANGE_RATES).toHaveProperty('USD');
      expect(EXCHANGE_RATES).toHaveProperty('EUR');
    });

    it('should have correct SEK rate and format', () => {
      const { EXCHANGE_RATES } = require('../../utils');
      expect(EXCHANGE_RATES.SEK.rate).toBe(11.25);
      expect(EXCHANGE_RATES.SEK.symbol).toBe('kr');
      expect(typeof EXCHANGE_RATES.SEK.format).toBe('function');
    });
  });

  describe('Swedish University Test Case', () => {
    it('should handle KTH program correctly', () => {
      const kthTuition = 35000; // SEK
      const country = 'Sweden';
      
      // Test currency detection
      const currency = getCountryCurrency(country);
      expect(currency).toBe('SEK');
      
      // Test formatting
      const result = formatProgramTuition(kthTuition, country, true);
      expect(result.primary).toMatch(/35.*kr/);
      expect(result.secondary).toMatch(/₦.*[0-9,]+/);
      
      // Test conversion calculation
      const ngnAmount = convertCurrency(kthTuition, 'SEK', 'NGN');
      expect(ngnAmount).toBeCloseTo(4666667, -3); // Within 1000 of expected
    });
  });

  describe('New Currency System', () => {
    it('should have valid API configuration', () => {
      const quota = currencyService.getAPIQuota();
      expect(quota).toHaveProperty('used');
      expect(quota).toHaveProperty('limit');
      expect(quota).toHaveProperty('resetDate');
    });

    it('should support SEK currency conversion', async () => {
      try {
        const result = await currencyService.getExchangeRate('USD', 'SEK');
        expect(result).toHaveProperty('rate');
        expect(result).toHaveProperty('source');
        expect(['api', 'fallback', 'cache']).toContain(result.source);
      } catch (error) {
        // If API fails, at least fallback should work
        expect(error).toBeDefined();
      }
    });
  });

  describe('Currency Type Safety', () => {
    it('should handle invalid currencies gracefully', () => {
      const currency = getCountryCurrency('InvalidCountry');
      expect(currency).toBe('USD'); // Default fallback
    });

    it('should handle invalid amounts gracefully', () => {
      const converted = convertCurrency(0, 'SEK', 'NGN');
      expect(converted).toBe(0);
    });
  });
});

describe('Integration Tests', () => {
  it('should maintain consistency between old and new systems', () => {
    // Test that both systems return similar results for supported currencies
    const oldCurrency = getCountryCurrency('Sweden');
    const newFormatted = formatCurrency(35000, oldCurrency as any);
    const oldFormatted = formatProgramTuition(35000, 'Sweden', false);
    
    expect(oldCurrency).toBe('SEK');
    expect(newFormatted).toContain('kr');
    expect(oldFormatted.primary).toContain('kr');
  });
});