import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { RadioProvider, useRadio } from './RadioProvider';
import { AudioControlProvider } from './AudioControlContext';
import { getRadioStorage, setRadioStorage } from '@/shared/radio';
import { radioTracks } from '@/shared/config/radioTracks';

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

// Mock Audio constructor
class MockAudio {
  src: string = '';
  volume: number = 1;
  paused: boolean = true;
  currentTime: number = 0;
  duration: number = 0;
  
  eventListeners: Record<string, Function[]> = {};
  
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  removeEventListener(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }
  
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  
  pause() {
    this.paused = true;
  }
}

vi.stubGlobal('Audio', MockAudio);

// Mock setTimeout and setInterval
vi.useFakeTimers();

describe('RadioProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AudioControlProvider>
      <RadioProvider>{children}</RadioProvider>
    </AudioControlProvider>
  );

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRadio(), { wrapper });
    
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.volume).toBe(0.7);
    expect(result.current.state.error).toBe(null);
    // Проверяем что выбран какой-то трек из списка (случайный порядок)
    expect(result.current.currentTrack).toBeTruthy();
    expect(radioTracks).toContainEqual(result.current.currentTrack);
  });

  it('should load saved state from localStorage', () => {
    // Устанавливаем сохраненное состояние
    setRadioStorage({
      currentTrackId: radioTracks[1]?.id || 'track-002',
      playbackStartTime: null,
      totalPlayedTime: 15000,
    });
    
    const { result } = renderHook(() => useRadio(), { wrapper });
    
    expect(result.current.currentTrack?.id).toBe(radioTracks[1]?.id || 'track-002');
  });

  it('should handle play action', async () => {
    const { result } = renderHook(() => useRadio(), { wrapper });
    
    await act(async () => {
      result.current.play();
    });
    
    expect(result.current.state.isPlaying).toBe(true);
  });

  it('should handle pause action', async () => {
    const { result } = renderHook(() => useRadio(), { wrapper });
    
    // Сначала запускаем воспроизведение
    await act(async () => {
      result.current.play();
    });
    expect(result.current.state.isPlaying).toBe(true);
    
    // Затем останавливаем
    await act(async () => {
      result.current.pause();
    });
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('should handle volume change', async () => {
    const { result } = renderHook(() => useRadio(), { wrapper });
    
    await act(async () => {
      result.current.setVolume(0.5);
    });
    
    expect(result.current.state.volume).toBe(0.5);
  });

  it('should handle next track', async () => {
    const { result } = renderHook(() => useRadio(), { wrapper });
    
    const initialTrack = result.current.currentTrack?.id;
    
    await act(async () => {
      result.current.nextTrack();
    });
    
    const newTrack = result.current.currentTrack?.id;
    expect(newTrack).not.toBe(initialTrack);
  });

  it('should throw error when useRadio is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useRadio());
    }).toThrow('useRadio must be used within RadioProvider');
    
    consoleSpy.mockRestore();
  });
});
