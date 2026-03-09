import { createContext, useContext, useRef, type ReactNode } from 'react';

interface AudioControlContextType {
  pauseGameAudio: () => void;
}

const AudioControlContext = createContext<AudioControlContextType | null>(null);

export const useAudioControl = (): AudioControlContextType => {
  const context = useContext(AudioControlContext);
  if (!context) {
    throw new Error('useAudioControl must be used within AudioControlProvider');
  }
  return context;
};

export interface AudioControlProviderProps {
  children: ReactNode;
}

export const AudioControlProvider: React.FC<AudioControlProviderProps> = ({ children }) => {
  const gameAudioRef = useRef<{ pause: () => void } | null>(null);

  const pauseGameAudio = () => {
    if (gameAudioRef.current) {
      gameAudioRef.current.pause();
    }
  };

  const value: AudioControlContextType = {
    pauseGameAudio,
  };

  return (
    <AudioControlContext.Provider value={value}>
      {children}
    </AudioControlContext.Provider>
  );
};

// Экспортируем ref для регистрации игрового аудио
export const registerGameAudio = (audioElement: { pause: () => void }) => {
  // Это будет импортировано и использовано в AudioProvider
  if (typeof window !== 'undefined') {
    (window as any).__gameAudioRef = audioElement;
  }
};

export const getGameAudioRef = (): { pause: () => void } | null => {
  if (typeof window !== 'undefined') {
    return (window as any).__gameAudioRef || null;
  }
  return null;
};
