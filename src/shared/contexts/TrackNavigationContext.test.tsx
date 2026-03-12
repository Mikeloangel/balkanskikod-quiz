import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrackNavigationProvider, useTrackNavigation } from './TrackNavigationContext';
import { tracksSortedByAddedDate } from '../config';

describe('TrackNavigationContext', () => {
  const mockTrack = tracksSortedByAddedDate[0];

  it('should provide current track navigation state', () => {
    const { result } = renderHook(() => useTrackNavigation(), {
      wrapper: ({ children }) => (
        <TrackNavigationProvider currentTrack={mockTrack}>
          {children}
        </TrackNavigationProvider>
      ),
    });

    expect(result.current.state.currentTrack).toEqual(mockTrack);
    expect(result.current.state.currentTrackIndex).toBe(0);
  });

  it('should calculate previous and next tracks correctly', () => {
    const { result } = renderHook(() => useTrackNavigation(), {
      wrapper: ({ children }) => (
        <TrackNavigationProvider currentTrack={tracksSortedByAddedDate[1]}>
          {children}
        </TrackNavigationProvider>
      ),
    });

    expect(result.current.state.previousTrack?.id).toBe(tracksSortedByAddedDate[0].id);
    expect(result.current.state.nextTrack?.id).toBe(tracksSortedByAddedDate[2].id);
  });

  it('should handle first and last track boundaries', () => {
    const { result: firstResult } = renderHook(() => useTrackNavigation(), {
      wrapper: ({ children }) => (
        <TrackNavigationProvider currentTrack={tracksSortedByAddedDate[0]}>
          {children}
        </TrackNavigationProvider>
      ),
    });

    expect(firstResult.current.state.previousTrack).toBeNull();
    expect(firstResult.current.state.nextTrack?.id).toBe(tracksSortedByAddedDate[1].id);

    const { result: lastResult } = renderHook(() => useTrackNavigation(), {
      wrapper: ({ children }) => (
        <TrackNavigationProvider currentTrack={tracksSortedByAddedDate[tracksSortedByAddedDate.length - 1]}>
          {children}
        </TrackNavigationProvider>
      ),
    });

    expect(lastResult.current.state.nextTrack).toBeNull();
    expect(lastResult.current.state.previousTrack?.id).toBe(tracksSortedByAddedDate[tracksSortedByAddedDate.length - 2].id);
  });

  it('should provide navigation actions', () => {
    const { result } = renderHook(() => useTrackNavigation(), {
      wrapper: ({ children }) => (
        <TrackNavigationProvider currentTrack={mockTrack}>
          {children}
        </TrackNavigationProvider>
      ),
    });

    expect(typeof result.current.actions.goToPreviousTrack).toBe('function');
    expect(typeof result.current.actions.goToNextTrack).toBe('function');
    expect(typeof result.current.actions.canGoToPrevious).toBe('boolean');
    expect(typeof result.current.actions.canGoToNext).toBe('boolean');
  });

  it('should calculate canGoToPrevious and canGoToNext correctly', () => {
    const { result: firstResult } = renderHook(() => useTrackNavigation(), {
      wrapper: ({ children }) => (
        <TrackNavigationProvider currentTrack={tracksSortedByAddedDate[0]}>
          {children}
        </TrackNavigationProvider>
      ),
    });

    expect(firstResult.current.actions.canGoToPrevious).toBe(false);
    expect(firstResult.current.actions.canGoToNext).toBe(true);

    const { result: lastResult } = renderHook(() => useTrackNavigation(), {
      wrapper: ({ children }) => (
        <TrackNavigationProvider currentTrack={tracksSortedByAddedDate[tracksSortedByAddedDate.length - 1]}>
          {children}
        </TrackNavigationProvider>
      ),
    });

    expect(lastResult.current.actions.canGoToPrevious).toBe(true);
    expect(lastResult.current.actions.canGoToNext).toBe(false);
  });
});
