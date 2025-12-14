// Currency detection service for automatic user preference detection
import { getCurrencyFromCountry, getCurrencyFromLocale } from './utils';
import { isValidCurrency } from './config';

export interface LocationInfo {
  country: string;
  countryCode: string;
  region: string;
  city?: string;
}

export interface DetectionResult {
  currency: string;
  confidence: number;
  source: 'stored' | 'location' | 'locale' | 'default';
  fallback?: string[];
}

/**
 * Service for detecting user's preferred currency automatically
 */
export class CurrencyDetectionService {
  private readonly storageKey = 'akada_detected_currency';
  private readonly confidenceThresholds = {
    stored: 1.0,
    location: 0.9,
    locale: 0.7,
    default: 0.5
  };

  /**
   * Detect user's most likely preferred currency
   */
  async detectUserCurrency(userId?: string): Promise<DetectionResult> {
    try {
      // 1. Check stored preference (highest confidence)
      const stored = this.getStoredCurrency(userId);
      if (stored) {
        return {
          currency: stored,
          confidence: this.confidenceThresholds.stored,
          source: 'stored'
        };
      }

      // 2. Try IP-based location detection
      try {
        const locationCurrency = await this.detectFromLocation();
        if (locationCurrency) {
          // Store for future use
          this.storeCurrency(locationCurrency, userId);
          
          return {
            currency: locationCurrency,
            confidence: this.confidenceThresholds.location,
            source: 'location',
            fallback: this.getLocationFallbacks(locationCurrency)
          };
        }
      } catch (error) {
        console.warn('Location-based currency detection failed:', error);
      }

      // 3. Browser locale detection
      const localeCurrency = this.detectFromLocale();
      if (localeCurrency) {
        this.storeCurrency(localeCurrency, userId);
        
        return {
          currency: localeCurrency,
          confidence: this.confidenceThresholds.locale,
          source: 'locale',
          fallback: this.getLocaleFallbacks(localeCurrency)
        };
      }

      // 4. Default to NGN (Akada's primary market)
      const defaultCurrency = 'NGN';
      this.storeCurrency(defaultCurrency, userId);
      
      return {
        currency: defaultCurrency,
        confidence: this.confidenceThresholds.default,
        source: 'default',
        fallback: ['USD', 'GHS', 'KES']
      };

    } catch (error) {
      console.error('Currency detection failed completely:', error);
      
      // Emergency fallback
      return {
        currency: 'NGN',
        confidence: 0.1,
        source: 'default',
        fallback: ['USD']
      };
    }
  }

  /**
   * Detect currency from IP-based geolocation
   */
  private async detectFromLocation(): Promise<string | null> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Geolocation API error');
      }
      
      const countryCode = data.country_code;
      if (countryCode) {
        const currency = getCurrencyFromCountry(countryCode);
        
        if (currency && isValidCurrency(currency)) {
          console.log(`Detected currency ${currency} from location ${countryCode}`);
          return currency;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('IP geolocation failed:', error);
      
      // Try alternative service
      try {
        const fallbackResponse = await fetch('https://api.country.is/');
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const currency = getCurrencyFromCountry(fallbackData.country);
          
          if (currency && isValidCurrency(currency)) {
            console.log(`Detected currency ${currency} from fallback location service`);
            return currency;
          }
        }
      } catch (fallbackError) {
        console.warn('Fallback geolocation also failed:', fallbackError);
      }
      
      return null;
    }
  }

  /**
   * Detect currency from browser locale
   */
  private detectFromLocale(): string | null {
    try {
      // Try navigator.language first
      const primaryLocale = navigator.language;
      let currency = getCurrencyFromLocale(primaryLocale);
      
      if (currency && isValidCurrency(currency)) {
        console.log(`Detected currency ${currency} from primary locale ${primaryLocale}`);
        return currency;
      }
      
      // Try navigator.languages array
      if (navigator.languages) {
        for (const locale of navigator.languages) {
          currency = getCurrencyFromLocale(locale);
          if (currency && isValidCurrency(currency)) {
            console.log(`Detected currency ${currency} from locale ${locale}`);
            return currency;
          }
        }
      }
      
      // Try to extract from Intl.NumberFormat
      try {
        const numberFormat = new Intl.NumberFormat();
        const resolvedOptions = numberFormat.resolvedOptions();
        
        if (resolvedOptions.locale) {
          currency = getCurrencyFromLocale(resolvedOptions.locale);
          if (currency && isValidCurrency(currency)) {
            console.log(`Detected currency ${currency} from Intl locale ${resolvedOptions.locale}`);
            return currency;
          }
        }
      } catch (intlError) {
        console.warn('Intl.NumberFormat detection failed:', intlError);
      }
      
      return null;
    } catch (error) {
      console.warn('Locale-based currency detection failed:', error);
      return null;
    }
  }

  /**
   * Get stored currency preference
   */
  private getStoredCurrency(userId?: string): string | null {
    try {
      const key = userId ? `${this.storageKey}_${userId}` : this.storageKey;
      const stored = localStorage.getItem(key);
      
      if (stored && isValidCurrency(stored)) {
        // Check if stored currency is still valid (not too old)
        const timestampKey = `${key}_timestamp`;
        const timestamp = localStorage.getItem(timestampKey);
        
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
          
          if (age < maxAge) {
            return stored;
          } else {
            // Clear old preference
            localStorage.removeItem(key);
            localStorage.removeItem(timestampKey);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to read stored currency:', error);
      return null;
    }
  }

  /**
   * Store detected currency preference
   */
  private storeCurrency(currency: string, userId?: string): void {
    try {
      const key = userId ? `${this.storageKey}_${userId}` : this.storageKey;
      localStorage.setItem(key, currency);
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.warn('Failed to store detected currency:', error);
    }
  }

  /**
   * Get fallback currencies based on detected location
   */
  private getLocationFallbacks(currency: string): string[] {
    const fallbacks: Record<string, string[]> = {
      NGN: ['USD', 'GHS', 'KES', 'ZAR'],
      GHS: ['NGN', 'USD', 'XOF'],
      KES: ['NGN', 'USD', 'TZS'],
      ZAR: ['NGN', 'USD', 'BWP'],
      EGP: ['NGN', 'USD', 'SAR'],
      USD: ['NGN', 'EUR', 'GBP'],
      EUR: ['USD', 'GBP', 'NGN'],
      GBP: ['USD', 'EUR', 'NGN'],
      CAD: ['USD', 'NGN'],
      AUD: ['USD', 'NGN']
    };
    
    return fallbacks[currency] || ['NGN', 'USD'];
  }

  /**
   * Get fallback currencies based on locale
   */
  private getLocaleFallbacks(currency: string): string[] {
    // Similar to location fallbacks but potentially different priorities
    return this.getLocationFallbacks(currency);
  }

  /**
   * Force refresh detection (bypass cache)
   */
  async refreshDetection(userId?: string): Promise<DetectionResult> {
    // Clear stored preference
    try {
      const key = userId ? `${this.storageKey}_${userId}` : this.storageKey;
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    } catch (error) {
      console.warn('Failed to clear stored currency:', error);
    }
    
    return this.detectUserCurrency(userId);
  }

  /**
   * Get detection confidence explanation
   */
  getConfidenceExplanation(result: DetectionResult): string {
    switch (result.source) {
      case 'stored':
        return 'Based on your previously selected preference';
      case 'location':
        return 'Detected from your location';
      case 'locale':
        return 'Detected from your browser language settings';
      case 'default':
        return 'Using default currency for Nigerian users';
      default:
        return 'Unknown detection method';
    }
  }

  /**
   * Validate and suggest currency based on program location
   */
  suggestCurrencyForProgram(
    programCountry: string,
    userCurrency: string
  ): { suggested: string; reason: string } {
    const programCurrency = getCurrencyFromCountry(programCountry);
    
    if (programCurrency && programCurrency !== userCurrency) {
      return {
        suggested: programCurrency,
        reason: `Programs in ${programCountry} typically use ${programCurrency}`
      };
    }
    
    return {
      suggested: userCurrency,
      reason: 'Using your preferred currency'
    };
  }
}

// Global service instance
export const currencyDetectionService = new CurrencyDetectionService();

export default currencyDetectionService;