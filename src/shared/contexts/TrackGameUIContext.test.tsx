import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrackGameUIProvider, useTrackGameUI } from './TrackGameUIContext';
import { tracks } from '../config';
import type { TrackProgress } from '../models';

describe('TrackGameUIContext', () => {
  const mockTrack = tracks[0];
  const mockProgress: TrackProgress = {
    trackId: 'track-001',
    status: 'in_progress',
    attemptsCount: 2,
    attemptsHistory: ['first attempt', 'second attempt'],
    hintsUsedCount: 1,
    revealedSerbianTitle: false,
    revealedByGiveUp: false,
  };

  it('should provide game UI state correctly', () => {
    const { result } = renderHook(() => useTrackGameUI(), {
      wrapper: ({ children }) => (
        <TrackGameUIProvider 
          track={mockTrack} 
          progress={mockProgress} 
          startedProgressSignature="in_progress|2|1|false|false"
        >
          {children}
        </TrackGameUIProvider>
      ),
    });

    expect(result.current.state.isSolved).toBe(false);
    expect(result.current.state.isRevealed).toBe(false);
    expect(result.current.state.isFinished).toBe(false);
    expect(result.current.state.isTrackInProgress).toBe(true);
  });

  it('should calculate shouldShowStartCta correctly', () => {
    const { result } = renderHook(() => useTrackGameUI(), {
      wrapper: ({ children }) => (
        <TrackGameUIProvider 
          track={mockTrack} 
          progress={mockProgress} 
          startedProgressSignature="different-signature"
        >
          {children}
        </TrackGameUIProvider>
      ),
    });

    expect(result.current.state.shouldShowStartCta).toBe(false);
  });

  it('should show start CTA when no progress and not started', () => {
    const newProgress: TrackProgress = {
      trackId: 'track-002',
      status: 'not_started',
      attemptsCount: 0,
      attemptsHistory: [],
      hintsUsedCount: 0,
      revealedSerbianTitle: false,
      revealedByGiveUp: false,
    };

    const { result } = renderHook(() => useTrackGameUI(), {
      wrapper: ({ children }) => (
        <TrackGameUIProvider 
          track={tracks[1]} 
          progress={newProgress} 
          startedProgressSignature={null}
        >
          {children}
        </TrackGameUIProvider>
      ),
    });

    expect(result.current.state.shouldShowStartCta).toBe(true);
  });

  it('should calculate hint states correctly', () => {
    const { result } = renderHook(() => useTrackGameUI(), {
      wrapper: ({ children }) => (
        <TrackGameUIProvider 
          track={mockTrack} 
          progress={mockProgress} 
          startedProgressSignature="in_progress|2|1|false|false"
        >
          {children}
        </TrackGameUIProvider>
      ),
    });

    expect(result.current.state.canUseHint).toBe(true);
    expect(result.current.state.canShowHintButton).toBe(true);
    expect(result.current.state.openedHints).toEqual([mockTrack.hints[0]]);
  });

  it('should handle solved track correctly', () => {
    const solvedProgress: TrackProgress = {
      ...mockProgress,
      status: 'solved',
      attemptsCount: 3,
    };

    const { result } = renderHook(() => useTrackGameUI(), {
      wrapper: ({ children }) => (
        <TrackGameUIProvider 
          track={mockTrack} 
          progress={solvedProgress} 
          startedProgressSignature="solved|3|1|false|false"
        >
          {children}
        </TrackGameUIProvider>
      ),
    });

    expect(result.current.state.isSolved).toBe(true);
    expect(result.current.state.isFinished).toBe(true);
    expect(result.current.state.pageTitle).toBe(mockTrack.names.serbian);
  });

  it('should format attempts for view correctly', () => {
    const { result } = renderHook(() => useTrackGameUI(), {
      wrapper: ({ children }) => (
        <TrackGameUIProvider 
          track={mockTrack} 
          progress={mockProgress} 
          startedProgressSignature="in_progress|2|1|false|false"
        >
          {children}
        </TrackGameUIProvider>
      ),
    });

    expect(result.current.state.attemptsForView).toEqual(['second attempt', 'first attempt']);
  });

  it('should generate difficulty stars correctly', () => {
    const { result } = renderHook(() => useTrackGameUI(), {
      wrapper: ({ children }) => (
        <TrackGameUIProvider 
          track={mockTrack} 
          progress={mockProgress} 
          startedProgressSignature="in_progress|2|1|false|false"
        >
          {children}
        </TrackGameUIProvider>
      ),
    });

    expect(result.current.state.difficultyStars).toBe('★☆☆☆☆');
  });
});
