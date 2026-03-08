import { describe, it, expect } from 'vitest'
import {
  getTrackProgressSafe,
  isTrackNew,
  getGlobalStats,
  getLastSolvedTracks,
} from './stats'
import type { Track } from '@/shared/models'
import type { StorageSchema } from './types'

describe('stats', () => {
  const mockTracks: Track[] = [
    {
      id: 'track-001',
      names: {
        safe: 'Safe Name 1',
        serbian: 'Serbian Name 1',
        russian: 'Russian Name 1',
        original: 'Original Name 1',
      },
      links: {
        local: '/tracks/track-001.mp3',
        suno: 'https://suno.com/song/1',
      },
      hints: ['Hint 1'],
      difficulty: 1,
      dates: {
        added: '2025-01-01',
      },
    },
    {
      id: 'track-002',
      names: {
        safe: 'Safe Name 2',
        serbian: 'Serbian Name 2',
        russian: 'Russian Name 2',
        original: 'Original Name 2',
      },
      links: {
        local: '/tracks/track-002.mp3',
        suno: 'https://suno.com/song/2',
      },
      hints: ['Hint 2'],
      difficulty: 2,
      dates: {
        added: '2025-01-02',
      },
    },
    {
      id: 'track-003',
      names: {
        safe: 'Safe Name 3',
        serbian: 'Serbian Name 3',
        russian: 'Russian Name 3',
        original: 'Original Name 3',
      },
      links: {
        local: '/tracks/track-003.mp3',
        suno: 'https://suno.com/song/3',
      },
      hints: ['Hint 3'],
      difficulty: 3,
      dates: {
        added: '2025-01-03',
      },
    },
  ]

  const mockStorage: StorageSchema = {
    version: 1,
    tracks: {
      'track-001': {
        trackId: 'track-001',
        status: 'solved',
        attemptsCount: 3,
        attemptsHistory: ['answer1', 'answer2', 'answer3'],
        hintsUsedCount: 1,
        revealedSerbianTitle: false,
        revealedByGiveUp: false,
        solvedAt: '2025-01-10T10:00:00.000Z',
      },
      'track-002': {
        trackId: 'track-002',
        status: 'in_progress',
        attemptsCount: 2,
        attemptsHistory: ['answer1', 'answer2'],
        hintsUsedCount: 0,
        revealedSerbianTitle: true,
        revealedByGiveUp: false,
      },
      'track-003': {
        trackId: 'track-003',
        status: 'revealed',
        attemptsCount: 5,
        attemptsHistory: ['answer1', 'answer2', 'answer3', 'answer4', 'answer5'],
        hintsUsedCount: 2,
        revealedSerbianTitle: false,
        revealedByGiveUp: true,
      },
    },
    stats: {},
  }

  describe('getTrackProgressSafe', () => {
    it('should return track progress when it exists', () => {
      const result = getTrackProgressSafe(mockStorage, 'track-001')
      
      expect(result).toEqual(mockStorage.tracks['track-001'])
    })

    it('should return undefined when track progress does not exist', () => {
      const result = getTrackProgressSafe(mockStorage, 'track-999')
      
      expect(result).toBeUndefined()
    })
  })

  describe('isTrackNew', () => {
    it('should return true for recently added track with no progress', () => {
      const recentTrack = {
        ...mockTracks[0],
        dates: {
          added: new Date().toISOString(),
        },
      }
      
      const result = isTrackNew(recentTrack, undefined)
      expect(result).toBe(true)
    })

    it('should return false for recently added track with progress', () => {
      const recentTrack = {
        ...mockTracks[0],
        dates: {
          added: new Date().toISOString(),
        },
      }
      
      const result = isTrackNew(recentTrack, mockStorage.tracks['track-001'])
      expect(result).toBe(false)
    })

    it('should return false for old track with no progress', () => {
      const oldTrack = {
        ...mockTracks[0],
        dates: {
          added: '2020-01-01',
        },
      }
      
      const result = isTrackNew(oldTrack, undefined)
      expect(result).toBe(false)
    })

    it('should return false for old track with progress', () => {
      const oldTrack = {
        ...mockTracks[0],
        dates: {
          added: '2020-01-01',
        },
      }
      
      const result = isTrackNew(oldTrack, mockStorage.tracks['track-001'])
      expect(result).toBe(false)
    })

    it('should return false for track with invalid date', () => {
      const invalidDateTrack = {
        ...mockTracks[0],
        dates: {
          added: 'invalid-date',
        },
      }
      
      const result = isTrackNew(invalidDateTrack, undefined)
      expect(result).toBe(false)
    })

    it('should return false for track with attempts', () => {
      const recentTrack = {
        ...mockTracks[0],
        dates: {
          added: new Date().toISOString(),
        },
      }
      
      const progressWithAttempts = {
        ...mockStorage.tracks['track-001'],
        attemptsCount: 1,
      }
      
      const result = isTrackNew(recentTrack, progressWithAttempts)
      expect(result).toBe(false)
    })

    it('should return false for track with hints used', () => {
      const recentTrack = {
        ...mockTracks[0],
        dates: {
          added: new Date().toISOString(),
        },
      }
      
      const progressWithHints = {
        ...mockStorage.tracks['track-001'],
        hintsUsedCount: 1,
      }
      
      const result = isTrackNew(recentTrack, progressWithHints)
      expect(result).toBe(false)
    })

    it('should return false for track with revealed Serbian title', () => {
      const recentTrack = {
        ...mockTracks[0],
        dates: {
          added: new Date().toISOString(),
        },
      }
      
      const progressWithSerbian = {
        ...mockStorage.tracks['track-001'],
        revealedSerbianTitle: true,
      }
      
      const result = isTrackNew(recentTrack, progressWithSerbian)
      expect(result).toBe(false)
    })

    it('should return false for track that was given up', () => {
      const recentTrack = {
        ...mockTracks[0],
        dates: {
          added: new Date().toISOString(),
        },
      }
      
      const progressGivenUp = {
        ...mockStorage.tracks['track-001'],
        revealedByGiveUp: true,
      }
      
      const result = isTrackNew(recentTrack, progressGivenUp)
      expect(result).toBe(false)
    })
  })

  describe('getGlobalStats', () => {
    it('should calculate stats correctly', () => {
      const result = getGlobalStats(mockTracks, mockStorage)
      
      expect(result).toEqual({
        totalTracks: 3,
        solvedTracks: 1,
        revealedTracks: 1,
        inProgressTracks: 1,
        solveRatePercent: 33,
        averageAttempts: 3,
        solvedWithoutHints: 0,
        solvedWithSerbianHint: 0,
      })
    })

    it('should handle empty tracks array', () => {
      const result = getGlobalStats([], mockStorage)
      
      expect(result).toEqual({
        totalTracks: 0,
        solvedTracks: 0,
        revealedTracks: 0,
        inProgressTracks: 0,
        solveRatePercent: 0,
        averageAttempts: 0,
        solvedWithoutHints: 0,
        solvedWithSerbianHint: 0,
      })
    })

    it('should handle tracks with no progress', () => {
      const emptyStorage: StorageSchema = {
        version: 1,
        tracks: {},
        stats: {},
      }
      
      const result = getGlobalStats(mockTracks, emptyStorage)
      
      expect(result).toEqual({
        totalTracks: 3,
        solvedTracks: 0,
        revealedTracks: 0,
        inProgressTracks: 0,
        solveRatePercent: 0,
        averageAttempts: 0,
        solvedWithoutHints: 0,
        solvedWithSerbianHint: 0,
      })
    })

    it('should calculate solve rate percentage correctly', () => {
      const storageWithTwoSolved: StorageSchema = {
        ...mockStorage,
        tracks: {
          ...mockStorage.tracks,
          'track-002': {
            ...mockStorage.tracks['track-002'],
            status: 'solved',
            solvedAt: '2025-01-11T10:00:00.000Z',
          },
        },
      }
      
      const result = getGlobalStats(mockTracks, storageWithTwoSolved)
      expect(result.solveRatePercent).toBe(67) // 2 out of 3 tracks solved
    })

    it('should calculate average attempts correctly', () => {
      const storageWithMultipleSolved: StorageSchema = {
        ...mockStorage,
        tracks: {
          ...mockStorage.tracks,
          'track-002': {
            ...mockStorage.tracks['track-002'],
            status: 'solved',
            solvedAt: '2025-01-11T10:00:00.000Z',
            attemptsCount: 5,
          },
        },
      }
      
      const result = getGlobalStats(mockTracks, storageWithMultipleSolved)
      // (3 + 5) / 2 = 4
      expect(result.averageAttempts).toBe(4)
    })

    it('should count solved without hints correctly', () => {
      const storageWithMixedHints: StorageSchema = {
        ...mockStorage,
        tracks: {
          ...mockStorage.tracks,
          'track-002': {
            ...mockStorage.tracks['track-002'],
            status: 'solved',
            solvedAt: '2025-01-11T10:00:00.000Z',
            hintsUsedCount: 0,
            revealedSerbianTitle: false,
          },
        },
      }
      
      const result = getGlobalStats(mockTracks, storageWithMixedHints)
      expect(result.solvedWithoutHints).toBe(1) // track-002
    })

    it('should count solved with Serbian hint correctly', () => {
      const storageWithSerbianHint: StorageSchema = {
        ...mockStorage,
        tracks: {
          ...mockStorage.tracks,
          'track-002': {
            ...mockStorage.tracks['track-002'],
            status: 'solved',
            solvedAt: '2025-01-11T10:00:00.000Z',
            revealedSerbianTitle: true,
          },
        },
      }
      
      const result = getGlobalStats(mockTracks, storageWithSerbianHint)
      expect(result.solvedWithSerbianHint).toBe(1) // track-002
    })
  })

  describe('getLastSolvedTracks', () => {
    it('should return last solved tracks sorted by date', () => {
      const result = getLastSolvedTracks(mockTracks, mockStorage, 5)
      
      expect(result).toEqual([mockTracks[0]]) // Only track-001 is solved
    })

    it('should limit results to specified limit', () => {
      const storageWithMultipleSolved: StorageSchema = {
        ...mockStorage,
        tracks: {
          ...mockStorage.tracks,
          'track-002': {
            ...mockStorage.tracks['track-002'],
            status: 'solved',
            solvedAt: '2025-01-09T10:00:00.000Z',
          },
          'track-003': {
            ...mockStorage.tracks['track-003'],
            status: 'solved',
            solvedAt: '2025-01-08T10:00:00.000Z',
          },
        },
      }
      
      const result = getLastSolvedTracks(mockTracks, storageWithMultipleSolved, 2)
      expect(result).toHaveLength(2)
      expect(result[0]).toBe(mockTracks[0]) // Most recent
      expect(result[1]).toBe(mockTracks[1]) // Second most recent
    })

    it('should return empty array when no tracks are solved', () => {
      const emptyStorage: StorageSchema = {
        version: 1,
        tracks: {},
        stats: {},
      }
      
      const result = getLastSolvedTracks(mockTracks, emptyStorage, 5)
      expect(result).toEqual([])
    })

    it('should handle tracks without solvedAt date', () => {
      const storageWithIncompleteSolved: StorageSchema = {
        ...mockStorage,
        tracks: {
          ...mockStorage.tracks,
          'track-002': {
            ...mockStorage.tracks['track-002'],
            status: 'solved',
            solvedAt: undefined,
          },
        },
      }
      
      const result = getLastSolvedTracks(mockTracks, storageWithIncompleteSolved, 5)
      expect(result).toEqual([mockTracks[0]]) // Only track-001 has valid solvedAt
    })

    it('should sort tracks by solvedAt date in descending order', () => {
      const storageWithMultipleSolved: StorageSchema = {
        ...mockStorage,
        tracks: {
          ...mockStorage.tracks,
          'track-002': {
            ...mockStorage.tracks['track-002'],
            status: 'solved',
            solvedAt: '2025-01-12T10:00:00.000Z', // Most recent
          },
          'track-003': {
            ...mockStorage.tracks['track-003'],
            status: 'solved',
            solvedAt: '2025-01-07T10:00:00.000Z', // Oldest
          },
        },
      }
      
      const result = getLastSolvedTracks(mockTracks, storageWithMultipleSolved, 5)
      expect(result).toEqual([mockTracks[1], mockTracks[0], mockTracks[2]])
    })
  })
})