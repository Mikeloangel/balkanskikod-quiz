import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  readStorage,
  writeStorage,
  getTrackProgress,
  patchTrackProgress,
  addAttempt,
  markTrackSolved,
  revealSerbianTitle,
  applyHint,
  giveUpTrack,
  resetProgress,
} from './storage'
import { STORAGE_KEY, STORAGE_VERSION } from './types'

// Mock localStorage with persistent storage
const mockStorage: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('storage', () => {
  beforeEach(() => {
    // Clear the mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    
    // Reset all mocks and restore default implementations
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key: string) => mockStorage[key] || null);
    mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
    });
    mockLocalStorage.removeItem.mockImplementation((key: string) => {
      delete mockStorage[key];
    });
    mockLocalStorage.clear.mockImplementation(() => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    });
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('readStorage', () => {
    it('should return empty storage when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      const result = readStorage()
      
      expect(result).toEqual({
        version: STORAGE_VERSION,
        tracks: {},
        stats: {},
      })
    })

    it('should return empty storage when localStorage contains invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      const result = readStorage()
      
      expect(result).toEqual({
        version: STORAGE_VERSION,
        tracks: {},
        stats: {},
      })
    })

    it('should return parsed storage when localStorage contains valid data', () => {
      const mockData = {
        version: STORAGE_VERSION,
        tracks: {
          'track-001': {
            trackId: 'track-001',
            status: 'in_progress',
            attemptsCount: 1,
            attemptsHistory: ['test'],
            hintsUsedCount: 0,
            revealedSerbianTitle: false,
            revealedByGiveUp: false,
          },
        },
        stats: {
          test: 'data',
        },
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))
      const result = readStorage()
      
      expect(result).toEqual(mockData)
    })

    it('should sanitize invalid track progress data', () => {
      const mockData = {
        version: STORAGE_VERSION,
        tracks: {
          'track-001': {
            trackId: 'track-001',
            status: 'invalid_status',
            attemptsCount: 'invalid',
            attemptsHistory: ['test1', 'test2'],
            hintsUsedCount: 'invalid',
            revealedSerbianTitle: 'invalid',
            revealedByGiveUp: 'invalid',
          },
        },
        stats: {},
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))
      const result = readStorage()
      
      expect(result.tracks['track-001']).toEqual({
        trackId: 'track-001',
        status: 'revealed', // normalized from invalid status (revealedByGiveUp=true)
        attemptsCount: 0, // sanitized from invalid
        attemptsHistory: ['test1', 'test2'],
        hintsUsedCount: 0, // sanitized from invalid
        revealedSerbianTitle: true, // sanitized from invalid
        revealedByGiveUp: true, // sanitized from invalid
        solvedAt: undefined,
      })
    })

    it('should limit attempts history to 20 items', () => {
      const mockData = {
        version: STORAGE_VERSION,
        tracks: {
          'track-001': {
            trackId: 'track-001',
            status: 'in_progress',
            attemptsCount: 25,
            attemptsHistory: Array.from({ length: 25 }, (_, i) => `attempt-${i}`),
            hintsUsedCount: 0,
            revealedSerbianTitle: false,
            revealedByGiveUp: false,
          },
        },
        stats: {},
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))
      const result = readStorage()
      
      expect(result.tracks['track-001'].attemptsHistory).toHaveLength(20)
      expect(result.tracks['track-001'].attemptsHistory[0]).toBe('attempt-5')
    })
  })

  describe('writeStorage', () => {
    it('should write storage to localStorage', () => {
      const mockStorage = {
        version: STORAGE_VERSION,
        tracks: {},
        stats: {},
      }
      
      writeStorage(mockStorage)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify({
          ...mockStorage,
          version: STORAGE_VERSION,
        })
      )
    })
  })

  describe('getTrackProgress', () => {
    it('should return default progress for non-existent track', () => {
      const result = getTrackProgress('track-001')
      
      expect(result).toEqual({
        trackId: 'track-001',
        status: 'not_started',
        attemptsCount: 0,
        attemptsHistory: [],
        hintsUsedCount: 0,
        revealedSerbianTitle: false,
        revealedByGiveUp: false,
        solvedAt: undefined,
      })
    })

    it('should return existing track progress', () => {
      const mockData = {
        version: STORAGE_VERSION,
        tracks: {
          'track-001': {
            trackId: 'track-001',
            status: 'solved',
            attemptsCount: 3,
            attemptsHistory: ['test1', 'test2', 'test3'],
            hintsUsedCount: 1,
            revealedSerbianTitle: true,
            revealedByGiveUp: false,
            solvedAt: '2025-01-01T00:00:00.000Z',
          },
        },
        stats: {},
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))
      const result = getTrackProgress('track-001')
      
      expect(result).toEqual(mockData.tracks['track-001'])
    })
  })

  describe('patchTrackProgress', () => {
    it('should update track progress', () => {
      const result = patchTrackProgress('track-001', (current) => ({
        ...current,
        status: 'in_progress',
        attemptsCount: 1,
      }))
      
      expect(result.status).toBe('in_progress')
      expect(result.attemptsCount).toBe(1)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should sanitize updated progress', () => {
      const result = patchTrackProgress('track-001', (current) => ({
        ...current,
        // @ts-expect-error - intentionally invalid for sanitization test
        status: 'invalid_status',
        // @ts-expect-error - intentionally invalid for sanitization test
        attemptsCount: 'invalid',
        attemptsHistory: ['test1', 'test2'],
        // @ts-expect-error - intentionally invalid for sanitization test
        hintsUsedCount: 'invalid',
        // @ts-expect-error - intentionally invalid for sanitization test
        revealedSerbianTitle: 'invalid',
        // @ts-expect-error - intentionally invalid for sanitization test
        revealedByGiveUp: 'invalid',
      }))
      
      expect(result.status).toBe('revealed')
      expect(result.attemptsCount).toBe(0)
      expect(result.hintsUsedCount).toBe(0)
      expect(result.revealedSerbianTitle).toBe(true)
      expect(result.revealedByGiveUp).toBe(true)
    })
  })

  describe('addAttempt', () => {
    it('should add attempt to track progress', () => {
      const result = addAttempt('track-001', 'test answer')
      
      expect(result.attemptsCount).toBe(1)
      expect(result.attemptsHistory).toContain('test answer')
      expect(result.status).toBe('in_progress')
    })

    it('should maintain attempts history limit', () => {
      // Add 20 attempts
      for (let i = 0; i < 20; i++) {
        addAttempt('track-001', `attempt-${i}`)
      }
      
      let result = getTrackProgress('track-001')
      expect(result.attemptsHistory).toHaveLength(20)
      
      // Add one more to test the limit
      addAttempt('track-001', 'new attempt')
      result = getTrackProgress('track-001')
      expect(result.attemptsHistory).toHaveLength(20)
      expect(result.attemptsHistory[0]).toBe('attempt-1')
      expect(result.attemptsHistory[19]).toBe('new attempt')
    })
  })

  describe('markTrackSolved', () => {
    it('should mark track as solved', () => {
      const result = markTrackSolved('track-001')
      
      expect(result.status).toBe('solved')
      expect(result.solvedAt).toBeDefined()
      expect(result.revealedByGiveUp).toBe(false)
    })

    it('should not change status if already solved', () => {
      // First mark as solved
      let result = markTrackSolved('track-001')
      const solvedAt = result.solvedAt
      
      // Mark again
      result = markTrackSolved('track-001')
      
      expect(result.status).toBe('solved')
      expect(result.solvedAt).toBe(solvedAt)
    })
  })

  describe('revealSerbianTitle', () => {
    it('should reveal Serbian title', () => {
      const result = revealSerbianTitle('track-001')
      
      expect(result.revealedSerbianTitle).toBe(true)
    })
  })

  describe('applyHint', () => {
    it('should increment hints used count', () => {
      const result = applyHint('track-001')
      
      expect(result.hintsUsedCount).toBe(1)
    })

    it('should increment hints used count multiple times', () => {
      let result = applyHint('track-001')
      result = applyHint('track-001')
      result = applyHint('track-001')
      
      expect(result.hintsUsedCount).toBe(3)
    })
  })

  describe('giveUpTrack', () => {
    it('should mark track as revealed by give up', () => {
      const result = giveUpTrack('track-001')
      
      expect(result.status).toBe('revealed')
      expect(result.revealedByGiveUp).toBe(true)
    })
  })

  describe('resetProgress', () => {
    it('should reset all progress and set reset timestamp', () => {
      // Add some progress first
      addAttempt('track-001', 'test')
      markTrackSolved('track-001')
      
      resetProgress()
      
      const storage = readStorage()
      
      expect(storage.tracks).toEqual({})
      expect(storage.stats.resetAt).toBeDefined()
      expect(storage.version).toBe(STORAGE_VERSION)
    })
  })
})