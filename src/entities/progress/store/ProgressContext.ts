import { createContext } from 'react';
import type { ProgressState } from './progressReducer';

export interface ProgressStore {
  state: ProgressState;
  actions: {
    addAttempt: (trackId: string, answer: string) => void;
    markTrackSolved: (trackId: string) => void;
    revealSerbianTitle: (trackId: string) => void;
    applyHint: (trackId: string) => void;
    giveUpTrack: (trackId: string) => void;
    resetProgress: () => void;
    loadFromStorage: () => Promise<void>;
  };
}

export const ProgressContext = createContext<ProgressStore | null>(null);
