import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getRadioStorage, setRadioStorage, clearRadioStorage } from './storage';

const RADIO_STORAGE_KEY = 'balkanski-kod-radio-state';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Radio Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getRadioStorage', () => {
    it('should return default storage when localStorage is empty', () => {
      const storage = getRadioStorage();
      
      expect(storage).toEqual({
        currentTrackId: null,
        playbackStartTime: null,
        totalPlayedTime: 0,
      });
    });

    it('should return stored data when localStorage has valid data', () => {
      const testData = {
        currentTrackId: 'track-001',
        playbackStartTime: 1234567890,
        totalPlayedTime: 15000,
      };
      
      localStorageMock.setItem(RADIO_STORAGE_KEY, JSON.stringify(testData));
      const storage = getRadioStorage();
      
      expect(storage).toEqual(testData);
    });

    it('should return default storage when localStorage has invalid data', () => {
      localStorageMock.setItem(RADIO_STORAGE_KEY, 'invalid json');
      
      // Suppress console.warn for this test
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const storage = getRadioStorage();
      
      expect(storage).toEqual({
        currentTrackId: null,
        playbackStartTime: null,
        totalPlayedTime: 0,
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('setRadioStorage', () => {
    it('should set data in localStorage', () => {
      const testData = {
        currentTrackId: 'track-003',
        playbackStartTime: 1234567890,
        totalPlayedTime: 25000,
      };
      
      setRadioStorage(testData);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        RADIO_STORAGE_KEY,
        JSON.stringify(testData)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      // Suppress console.warn for this test
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(() => {
        setRadioStorage({ currentTrackId: 'track-001' });
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearRadioStorage', () => {
    it('should call localStorage.removeItem', () => {
      clearRadioStorage();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(RADIO_STORAGE_KEY);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.removeItem to throw an error
      localStorageMock.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      // Suppress console.warn for this test
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(() => {
        clearRadioStorage();
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
});
