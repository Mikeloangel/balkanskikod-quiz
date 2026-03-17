import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { radioTracks } from '@/shared/config/radioTracks';
import { getRadioStorage, setRadioStorage } from '@/shared/radio';
import type { RadioTrack, RadioState } from '@/shared/radio';
import { getGameAudioRef } from './audioGameUtils';
import { resolveLocalTrackUrl } from '@/shared/lib/url';
import i18n from '@/shared/i18n';

interface RadioContextType {
  state: RadioState;
  currentTrack: RadioTrack | null;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  openTrackInSuno: () => void;
  resetError: () => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

const MAX_PLAY_TIME_MINUTES = Number(import.meta.env.VITE_RADIO_MAX_PLAY_TIME_MINUTES) || 30;
const MAX_PLAY_TIME_MS = MAX_PLAY_TIME_MINUTES * 60 * 1000;

const initialState: RadioState = {
  currentTrackId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  playbackStartTime: null,
  totalPlayedTime: 0,
  error: null,
};

export interface RadioProviderProps {
  children: ReactNode;
  onPlay?: () => void; // callback для паузы игрового плеера
}

export const RadioProvider: React.FC<RadioProviderProps> = ({ children, onPlay }) => {
  const [state, setState] = useState<RadioState>(initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const maxPlayTimeoutRef = useRef<number | null>(null);
  // Ref to always have fresh totalPlayedTime in closures
  const totalPlayedTimeRef = useRef(0);

  useEffect(() => {
    totalPlayedTimeRef.current = state.totalPlayedTime;
  }, [state.totalPlayedTime]);

  const currentTrack = state.currentTrackId
    ? radioTracks.find(track => track.id === state.currentTrackId) || null
    : null;

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const clearMaxPlayTimeout = useCallback(() => {
    if (maxPlayTimeoutRef.current) {
      clearTimeout(maxPlayTimeoutRef.current);
      maxPlayTimeoutRef.current = null;
    }
  }, []);

  /** Stop playback due to max time limit */
  const stopDueToLimit = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    clearProgressInterval();
    clearMaxPlayTimeout();
    setState(prev => ({
      ...prev,
      isPlaying: false,
      error: i18n.t('errorMaxPlayTime', { ns: 'radio' }),
    }));
  }, [clearProgressInterval, clearMaxPlayTimeout]);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setState(prev => {
      if (!prev.isPlaying) return prev;

      const newTotalPlayed = prev.totalPlayedTime + 1000;

      // Persist every 5 seconds
      if (newTotalPlayed % 5000 < 1000) {
        setRadioStorage({ totalPlayedTime: newTotalPlayed });
      }

      if (newTotalPlayed >= MAX_PLAY_TIME_MS) {
        audio.pause();
        clearProgressInterval();
        clearMaxPlayTimeout();
        return {
          ...prev,
          isPlaying: false,
          totalPlayedTime: newTotalPlayed,
          error: i18n.t('errorMaxPlayTime', { ns: 'radio' }),
        };
      }

      return {
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        totalPlayedTime: newTotalPlayed,
      };
    });
  }, [clearProgressInterval, clearMaxPlayTimeout]);

  const startProgressTracking = useCallback(() => {
    clearProgressInterval();
    progressIntervalRef.current = setInterval(updateProgress, 1000);
  }, [clearProgressInterval, updateProgress]);

  const setupMaxPlayTimeout = useCallback(() => {
    clearMaxPlayTimeout();
    const remainingTime = MAX_PLAY_TIME_MS - totalPlayedTimeRef.current;

    if (remainingTime > 0) {
      maxPlayTimeoutRef.current = setTimeout(() => {
        stopDueToLimit();
      }, remainingTime);
    }
  }, [clearMaxPlayTimeout, stopDueToLimit]);

  const play = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    // Check limit before playing
    if (totalPlayedTimeRef.current >= MAX_PLAY_TIME_MS) {
      stopDueToLimit();
      return;
    }

    // Восстанавливаем позицию воспроизведения
    audioRef.current.currentTime = state.currentTime;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          const now = Date.now();
          setState(prev => ({
            ...prev,
            isPlaying: true,
            playbackStartTime: prev.playbackStartTime === null ? now : prev.playbackStartTime,
            error: null,
          }));

          setRadioStorage({
            currentTrackId: currentTrack.id,
            playbackStartTime: state.playbackStartTime === null ? now : state.playbackStartTime,
            totalPlayedTime: state.totalPlayedTime,
          });

          startProgressTracking();
          setupMaxPlayTimeout();

          // Ставим на паузу игровой плеер через глобальный ref
          const gameAudio = getGameAudioRef();
          if (gameAudio) {
            gameAudio.pause();
          }

          onPlay?.();
        })
        .catch(() => {
          setState(prev => ({
            ...prev,
            error: i18n.t('errorPlaybackFailed', { ns: 'radio' }),
          }));
        });
    }
  }, [currentTrack, startProgressTracking, setupMaxPlayTimeout, stopDueToLimit, state.totalPlayedTime, state.playbackStartTime, state.currentTime, onPlay]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();

    const playedTime = state.playbackStartTime
      ? state.totalPlayedTime + (Date.now() - state.playbackStartTime)
      : state.totalPlayedTime;

    setState(prev => ({
      ...prev,
      isPlaying: false,
      totalPlayedTime: playedTime,
    }));

    setRadioStorage({
      currentTrackId: state.currentTrackId,
      playbackStartTime: null,
      totalPlayedTime: playedTime,
    });

    clearProgressInterval();
    clearMaxPlayTimeout();
  }, [state.playbackStartTime, state.totalPlayedTime, state.currentTrackId, clearProgressInterval, clearMaxPlayTimeout]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ ...prev, volume: clampedVolume }));

    // Синхронизируем громкость с игровым плеером
    const gameAudio = getGameAudioRef();
    if (gameAudio) {
      gameAudio.setVolume(clampedVolume);
    }

    setRadioStorage({ volume: clampedVolume });
  }, []);

  const nextTrack = useCallback(() => {
    const availableTracks = radioTracks.filter(track => track.id !== state.currentTrackId);
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const next = availableTracks[randomIndex];

    if (!next) return;

    setState(prev => ({
      ...prev,
      currentTrackId: next.id,
      currentTime: 0,
      duration: 0,
    }));

    setRadioStorage({
      currentTrackId: next.id,
      playbackStartTime: null,
      totalPlayedTime: totalPlayedTimeRef.current,
    });
  }, [state.currentTrackId]);

  const nextTrackAndPlay = useCallback(() => {
    // Check limit before auto-playing next track
    if (totalPlayedTimeRef.current >= MAX_PLAY_TIME_MS) {
      stopDueToLimit();
      return;
    }

    const availableTracks = radioTracks.filter(track => track.id !== state.currentTrackId);
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const next = availableTracks[randomIndex];

    if (!next) return;

    setState(prev => ({
      ...prev,
      currentTrackId: next.id,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    }));

    setRadioStorage({
      currentTrackId: next.id,
      playbackStartTime: null,
      totalPlayedTime: totalPlayedTimeRef.current,
    });
  }, [state.currentTrackId, stopDueToLimit]);

  const openTrackInSuno = useCallback(() => {
    if (currentTrack?.links.suno) {
      window.open(currentTrack.links.suno, '_blank');
    }
  }, [currentTrack]);

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    const storage = getRadioStorage();

    let trackId = storage.currentTrackId;
    if (!trackId || !radioTracks.find(track => track.id === trackId)) {
      const randomIndex = Math.floor(Math.random() * radioTracks.length);
      trackId = radioTracks[randomIndex]?.id || null;
    }

    const restoredVolume = storage.volume ?? 0.7;

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentTrackId: trackId,
        totalPlayedTime: storage.totalPlayedTime,
        volume: restoredVolume,
      }));
    }, 0);
  }, []);

  useEffect(() => {
    if (!currentTrack) return;

    if (audioRef.current && audioRef.current.src === resolveLocalTrackUrl(currentTrack.links.local)) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio();
    audio.src = resolveLocalTrackUrl(currentTrack.links.local);
    audioRef.current = audio;

    const handleEnded = () => {
      // Use ref for fresh value
      if (totalPlayedTimeRef.current >= MAX_PLAY_TIME_MS) {
        stopDueToLimit();
        return;
      }
      nextTrackAndPlay();
    };

    const handleError = () => {
      setState(prev => ({
        ...prev,
        error: i18n.t('errorLoadFailed', { ns: 'radio' }),
      }));
      if (totalPlayedTimeRef.current >= MAX_PLAY_TIME_MS) {
        return;
      }
      setTimeout(nextTrack, 2000);
    };

    const handleLoadedMetadata = () => {
      const a = audioRef.current;
      if (a && a.duration) {
        setState(prev => ({
          ...prev,
          duration: a.duration,
        }));
      }
    };

    const handleTimeUpdate = () => {
      const a = audioRef.current;
      if (a) {
        setState(prev => ({
          ...prev,
          currentTime: a.currentTime,
        }));
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
      audio.src = '';
    };
  }, [currentTrack, nextTrack, nextTrackAndPlay, stopDueToLimit]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  useEffect(() => {
    if (audioRef.current && state.isPlaying && currentTrack) {
      audioRef.current.play().catch(() => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          error: i18n.t('errorPlaybackFailed', { ns: 'radio' }),
        }));
      });
    }
  }, [state.isPlaying, currentTrack]);

  useEffect(() => {
    return () => {
      clearProgressInterval();
      clearMaxPlayTimeout();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [clearProgressInterval, clearMaxPlayTimeout]);

  const value: RadioContextType = {
    state,
    currentTrack,
    play,
    pause,
    setVolume,
    nextTrack,
    openTrackInSuno,
    resetError,
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useRadio = (): RadioContextType => {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used within RadioProvider');
  }
  return context;
};
