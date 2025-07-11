import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SafeStorage, SafeSessionStorage } from '../safeStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('SafeStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getItem', () => {
    it('should return parsed JSON for valid data', () => {
      const testData = { name: 'test', value: 123 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = SafeStorage.getItem('test-key');
      expect(result).toEqual(testData);
    });

    it('should return default value for null/undefined', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = SafeStorage.getItem('test-key', 'default');
      expect(result).toBe('default');
    });

    it('should handle "[object Object]" string and remove it', () => {
      mockLocalStorage.getItem.mockReturnValue('[object Object]');

      const result = SafeStorage.getItem('test-key', 'default');
      expect(result).toBe('default');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle invalid JSON and remove corrupted data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json {');

      const result = SafeStorage.getItem('test-key', 'default');
      expect(result).toBe('default');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('setItem', () => {
    it('should stringify and store valid data', () => {
      const testData = { name: 'test', value: 123 };

      const result = SafeStorage.setItem('test-key', testData);
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('should handle storage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = SafeStorage.setItem('test-key', 'test-value');
      expect(result).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove corrupted entries', () => {
      mockLocalStorage.length = 2;
      mockLocalStorage.key.mockImplementation((index) => {
        return index === 0 ? 'good-key' : 'bad-key';
      });
      mockLocalStorage.getItem.mockImplementation((key) => {
        return key === 'good-key' ? '{"valid": "json"}' : '[object Object]';
      });

      SafeStorage.cleanup();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bad-key');
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('good-key');
    });
  });
});

describe('SafeSessionStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should work similarly to SafeStorage but with sessionStorage', () => {
    const testData = { name: 'test', value: 123 };
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(testData));

    const result = SafeSessionStorage.getItem('test-key');
    expect(result).toEqual(testData);
  });

  it('should handle "[object Object]" in sessionStorage', () => {
    mockSessionStorage.getItem.mockReturnValue('[object Object]');

    const result = SafeSessionStorage.getItem('test-key', 'default');
    expect(result).toBe('default');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
});
