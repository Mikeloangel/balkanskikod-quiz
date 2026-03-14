import { createContext } from 'react';

interface AudioControlContextType {
  pauseGameAudio: () => void;
}

export const AudioControlContext = createContext<AudioControlContextType | null>(null);
