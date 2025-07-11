/**
 * Safe localStorage utilities to prevent JSON parsing errors
 * Handles cases where objects are stored as "[object Object]" strings
 */

export class SafeStorage {
  /**
   * Safely get an item from localStorage with JSON parsing
   */
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      
      if (!item) {
        return defaultValue;
      }
      
      // Check for invalid "[object Object]" string
      if (item === "[object Object]") {
        console.warn(`SafeStorage: Invalid value detected for key "${key}", removing`);
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      // Try to parse as JSON
      return JSON.parse(item);
    } catch (error) {
      console.warn(`SafeStorage: Failed to parse item for key "${key}":`, error);
      // Remove the corrupted item
      localStorage.removeItem(key);
      return defaultValue;
    }
  }

  /**
   * Safely set an item to localStorage with JSON stringification
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`SafeStorage: Failed to set item for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Safely remove an item from localStorage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`SafeStorage: Failed to remove item for key "${key}":`, error);
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up any corrupted localStorage entries
   */
  static cleanup(): void {
    if (!this.isAvailable()) return;

    const keysToRemove: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        const value = localStorage.getItem(key);
        if (value === "[object Object]") {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.warn(`SafeStorage: Removing corrupted entry for key "${key}"`);
        localStorage.removeItem(key);
      });
      
      if (keysToRemove.length > 0) {
        console.log(`SafeStorage: Cleaned up ${keysToRemove.length} corrupted entries`);
      }
    } catch (error) {
      console.error('SafeStorage: Failed to cleanup localStorage:', error);
    }
  }
}

/**
 * Safe sessionStorage utilities
 */
export class SafeSessionStorage {
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = sessionStorage.getItem(key);
      
      if (!item) {
        return defaultValue;
      }
      
      if (item === "[object Object]") {
        console.warn(`SafeSessionStorage: Invalid value detected for key "${key}", removing`);
        sessionStorage.removeItem(key);
        return defaultValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.warn(`SafeSessionStorage: Failed to parse item for key "${key}":`, error);
      sessionStorage.removeItem(key);
      return defaultValue;
    }
  }

  static setItem<T>(key: string, value: T): boolean {
    try {
      const stringValue = JSON.stringify(value);
      sessionStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`SafeSessionStorage: Failed to set item for key "${key}":`, error);
      return false;
    }
  }

  static removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`SafeSessionStorage: Failed to remove item for key "${key}":`, error);
    }
  }
}
