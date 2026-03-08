import { describe, it, expect } from 'vitest';
import { progressReducer, type ProgressState } from './progressReducer';
import type { TrackProgress } from '../model/types';

const createInitialState = (): ProgressState => ({
  tracks: {},
  stats: {},
  isLoading: false,
  error: null,
});

describe('progressReducer', () => {
  describe('ADD_ATTEMPT', () => {
    it('should add attempt to new track', () => {
      const state = createInitialState();
      const action = { type: 'ADD_ATTEMPT' as const, trackId: 'track-1', answer: 'Test answer' };

      const result = progressReducer(state, action);

      expect(result.tracks['track-1']).toEqual({
        trackId: 'track-1',
        status: 'in_progress',
        attemptsCount: 1,
        attemptsHistory: ['Test answer'],
        hintsUsedCount: 0,
        revealedSerbianTitle: false,
        revealedByGiveUp: false,
      });
    });

    it('should not add attempt to solved track', () => {
      const existingProgress: TrackProgress = {
        trackId: 'track-1',
        status: 'solved',
        attemptsCount: 2,
        attemptsHistory: ['First', 'Second'],
        hintsUsedCount: 0,
        revealedSerbianTitle: false,
        revealedByGiveUp: false,
        solvedAt: '2024-01-01T00:00:00Z',
      };
      const state = { ...createInitialState(), tracks: { 'track-1': existingProgress } };
      const action = { type: 'ADD_ATTEMPT' as const, trackId: 'track-1', answer: 'New answer' };

      const result = progressReducer(state, action);

      expect(result.tracks['track-1']).toEqual(existingProgress);
    });

    it('should maintain only last 20 attempts', () => {
      const existingProgress: TrackProgress = {
        trackId: 'track-1',
        status: 'in_progress',
        attemptsCount: 20,
        attemptsHistory: Array.from({ length: 20 }, (_, i) => `Attempt ${i + 1}`),
        hintsUsedCount: 0,
        revealedSerbianTitle: false,
        revealedByGiveUp: false,
      };
      const state = { ...createInitialState(), tracks: { 'track-1': existingProgress } };
      const action = { type: 'ADD_ATTEMPT' as const, trackId: 'track-1', answer: 'New attempt' };

      const result = progressReducer(state, action);

      expect(result.tracks['track-1'].attemptsHistory).toHaveLength(20);
      expect(result.tracks['track-1'].attemptsHistory[0]).toBe('Attempt 2');
      expect(result.tracks['track-1'].attemptsHistory[19]).toBe('New attempt');
    });
  });

  describe('MARK_SOLVED', () => {
    it('should mark track as solved', () => {
      const existingProgress: TrackProgress = {
        trackId: 'track-1',
        status: 'in_progress',
        attemptsCount: 2,
        attemptsHistory: ['First', 'Second'],
        hintsUsedCount: 1,
        revealedSerbianTitle: false,
        revealedByGiveUp: false,
      };
      const state = { ...createInitialState(), tracks: { 'track-1': existingProgress } };
      const action = { type: 'MARK_SOLVED' as const, trackId: 'track-1' };

      const result = progressReducer(state, action);

      expect(result.tracks['track-1']).toEqual({
        ...existingProgress,
        status: 'solved',
        solvedAt: expect.any(String),
        revealedByGiveUp: false,
      });
    });
  });

  describe('APPLY_HINT', () => {
    it('should increment hints used count', () => {
      const existingProgress: TrackProgress = {
        trackId: 'track-1',
        status: 'in_progress',
        attemptsCount: 1,
        attemptsHistory: ['First'],
        hintsUsedCount: 2,
        revealedSerbianTitle: false,
        revealedByGiveUp: false,
      };
      const state = { ...createInitialState(), tracks: { 'track-1': existingProgress } };
      const action = { type: 'APPLY_HINT' as const, trackId: 'track-1' };

      const result = progressReducer(state, action);

      expect(result.tracks['track-1'].hintsUsedCount).toBe(3);
    });
  });

  describe('RESET_PROGRESS', () => {
    it('should reset all progress', () => {
      const state: ProgressState = {
        tracks: {
          'track-1': {
            trackId: 'track-1',
            status: 'solved',
            attemptsCount: 5,
            attemptsHistory: ['a', 'b', 'c', 'd', 'e'],
            hintsUsedCount: 2,
            revealedSerbianTitle: true,
            revealedByGiveUp: false,
            solvedAt: '2024-01-01T00:00:00Z',
          },
        },
        stats: { resetAt: '2024-01-01T00:00:00Z' },
        isLoading: false,
        error: null,
      };
      const action = { type: 'RESET_PROGRESS' as const };

      const result = progressReducer(state, action);

      expect(result.tracks).toEqual({});
      expect(result.stats.resetAt).toStrictEqual(expect.any(String));
    });
  });

  describe('LOAD_FROM_STORAGE', () => {
    it('should load tracks from storage', () => {
      const state = createInitialState();
      const storageData = {
        version: 1,
        tracks: {
          'track-1': {
            trackId: 'track-1',
            status: 'solved' as const,
            attemptsCount: 3,
            attemptsHistory: ['a', 'b', 'c'],
            hintsUsedCount: 1,
            revealedSerbianTitle: false,
            revealedByGiveUp: false,
            solvedAt: '2024-01-01T00:00:00Z',
          },
        },
        stats: { resetAt: '2024-01-01T00:00:00Z' },
      };
      const action = { type: 'LOAD_FROM_STORAGE' as const, payload: storageData };

      const result = progressReducer(state, action);

      expect(result.tracks).toEqual(storageData.tracks);
      expect(result.stats).toEqual(storageData.stats);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(null);
    });
  });

  describe('SET_LOADING', () => {
    it('should set loading state', () => {
      const state = createInitialState();
      const action = { type: 'SET_LOADING' as const, loading: true };

      const result = progressReducer(state, action);

      expect(result.isLoading).toBe(true);
    });
  });

  describe('SET_ERROR', () => {
    it('should set error state', () => {
      const state = createInitialState();
      const action = { type: 'SET_ERROR' as const, error: 'Test error' };

      const result = progressReducer(state, action);

      expect(result.error).toBe('Test error');
      expect(result.isLoading).toBe(false);
    });
  });
});
