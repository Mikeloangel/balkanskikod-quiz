import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { radioTracks } from '@/shared/config/radioTracks';
import { getRadioStorage, setRadioStorage } from '@/shared/radio';
import type { RadioTrack, RadioState } from '@/shared/radio';
import { getGameAudioRef } from './audioGameUtils';

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

  const updateProgress = useCallback(() => {
    if (audioRef.current && state.isPlaying) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      
      setState(prev => ({
        ...prev,
        currentTime,
        duration,
        totalPlayedTime: prev.totalPlayedTime + 1, // Увеличиваем на 1 секунду, т.к. updateProgress вызывается каждую секунду
      }));

      setState(prev => {
        const currentTotalPlayedTime = prev.totalPlayedTime;
        if (currentTotalPlayedTime >= MAX_PLAY_TIME_MS) {
          return {
            ...prev,
            isPlaying: false,
            error: 'Максимальное время прослушивания достигнуто (30 минут)',
          };
        }
        return prev;
      });
    }
  }, [state.isPlaying]);

  const startProgressTracking = useCallback(() => {
    clearProgressInterval();
    progressIntervalRef.current = setInterval(updateProgress, 1000);
  }, [clearProgressInterval, updateProgress]);

  const setupMaxPlayTimeout = useCallback(() => {
    clearMaxPlayTimeout();
    const remainingTime = MAX_PLAY_TIME_MS - state.totalPlayedTime;
    
    if (remainingTime > 0) {
      maxPlayTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          error: 'Максимальное время прослушивания достигнуто (30 минут)',
        }));
      }, remainingTime);
    }
  }, [clearMaxPlayTimeout, state.totalPlayedTime]);

  const play = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

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
            // Устанавливаем playbackStartTime только если не было паузы (т.е. трек начинается сначала)
            playbackStartTime: prev.playbackStartTime === null ? now : prev.playbackStartTime,
            error: null,
          }));
          
          setRadioStorage({
      currentTrackId: currentTrack.id,
      // Сохраняем текущий playbackStartTime
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
          
          // Вызываем callback для паузы игрового плеера
          onPlay?.();
        })
        .catch(() => {
          setState(prev => ({
            ...prev,
            error: 'Не удалось воспроизвести трек',
          }));
        });
    }
  }, [currentTrack, startProgressTracking, setupMaxPlayTimeout, state.totalPlayedTime, state.playbackStartTime, state.currentTime, onPlay]);

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
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      setState(prev => ({ ...prev, volume }));
    }
  }, []);

  const nextTrack = useCallback(() => {
    // Берем случайный трек, отличный от текущего
    const availableTracks = radioTracks.filter(track => track.id !== state.currentTrackId);
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const nextTrack = availableTracks[randomIndex];
    
    if (!nextTrack) return;

    setState(prev => ({
      ...prev,
      currentTrackId: nextTrack.id,
      currentTime: 0,
      duration: 0,
    }));

    setRadioStorage({
      currentTrackId: nextTrack.id,
      playbackStartTime: null,
      totalPlayedTime: state.totalPlayedTime,
    });
  }, [state.currentTrackId, state.totalPlayedTime]);

  const nextTrackAndPlay = useCallback(() => {
    // Берем случайный трек, отличный от текущего
    const availableTracks = radioTracks.filter(track => track.id !== state.currentTrackId);
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const nextTrack = availableTracks[randomIndex];
    
    if (!nextTrack) return;

    setState(prev => ({
      ...prev,
      currentTrackId: nextTrack.id,
      currentTime: 0,
      duration: 0,
      isPlaying: true, // Устанавливаем флаг воспроизведения
    }));

    setRadioStorage({
      currentTrackId: nextTrack.id,
      playbackStartTime: null,
      totalPlayedTime: state.totalPlayedTime,
    });
  }, [state.currentTrackId, state.totalPlayedTime]);

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
      // Если нет сохраненного трека или он не найден, берем случайный
      const randomIndex = Math.floor(Math.random() * radioTracks.length);
      trackId = radioTracks[randomIndex]?.id || null;
    }

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentTrackId: trackId,
        totalPlayedTime: storage.totalPlayedTime,
      }));
    }, 0);
  }, []);

  const resolveLocalTrackUrl = (localPath: string): string => {
  if (/^https?:\/\//i.test(localPath)) {
    return localPath;
  }

  const normalizedPath = localPath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

  useEffect(() => {
    if (!currentTrack) return;

    // Если трек тот же самый, не пересоздаем audio
    if (audioRef.current && audioRef.current.src === resolveLocalTrackUrl(currentTrack.links.local)) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio();
    audio.src = resolveLocalTrackUrl(currentTrack.links.local);
    // Громкость установится в отдельном useEffect
    audioRef.current = audio;

    const handleEnded = () => {
      // Проверяем лимит времени перед запуском следующего трека
      if (state.totalPlayedTime >= MAX_PLAY_TIME_MS) {
        setState(prev => ({
          ...prev,
          isPlaying: false,
        }));
        return;
      }
      nextTrackAndPlay();
    };

    const handleError = () => {
      setState(prev => ({
        ...prev,
        error: 'Ошибка загрузки трека',
      }));
      // Проверяем лимит времени перед запуском следующего трека
      if (state.totalPlayedTime >= MAX_PLAY_TIME_MS) {
        return;
      }
      setTimeout(nextTrack, 2000);
    };

    const handleLoadedMetadata = () => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setState(prev => ({
          ...prev,
          duration: audio.duration,
        }));
      }
    };

    const handleTimeUpdate = () => {
      const audio = audioRef.current;
      if (audio) {
        setState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
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
  }, [currentTrack, nextTrack, nextTrackAndPlay, state.totalPlayedTime]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  useEffect(() => {
    if (audioRef.current && state.isPlaying && currentTrack) {
      // Автоматически запускаем воспроизведение если isPlaying=true
      audioRef.current.play().catch(() => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          error: 'Не удалось воспроизвести трек',
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
