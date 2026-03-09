import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import type { AudioActions, AudioContextType } from './audioTypes';

const AudioContext = createContext<AudioContextType | null>(null);

/* eslint-disable react-refresh/only-export-components */
export const useAudioState = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioState must be used within AudioProvider');
  }
  return context;
};

export interface AudioProviderProps {
  children: ReactNode;
  initialInputValue?: string;
  src?: string;
  onEnded?: () => void;
  onError?: (error: string) => void;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ 
  children, 
  initialInputValue = '',
  src,
  onEnded,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState(initialInputValue);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      const errorMessage = 'Audio playback error';
      setError(errorMessage);
      setIsPlaying(false);
      onError?.(errorMessage);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded, onError]);

  const actions: AudioActions = {
    play: () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          setError('Failed to play audio');
        });
      }
    },
    
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    },
    
    setCurrentTime: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    
    setDuration: (newDuration: number) => {
      setDuration(newDuration);
    },
    
    setError: (newError: string) => {
      setError(newError);
    },
    
    setInputValue: (value: string) => {
      setInputValue(value);
    },
    
    reset: () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setError('');
      setInputValue('');
    },
  };

  const value: AudioContextType = {
    state: {
      isPlaying,
      currentTime,
      duration,
      error,
      inputValue,
    },
    actions,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio 
        ref={audioRef}
        src={src}
        style={{ display: 'none' }}
      />
    </AudioContext.Provider>
  );
};
