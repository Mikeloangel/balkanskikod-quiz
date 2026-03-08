import { useReducer, useEffect, type ReactNode } from 'react';
import { progressReducer } from './progressReducer';
import { loadFromStorage, saveToStorage } from './localStorageMiddleware';
import { ProgressContext, type ProgressStore } from './ProgressContext';

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, {
    tracks: {},
    stats: {},
    isLoading: true,
    error: null,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', loading: true });
        const storageData = await loadFromStorage();
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: storageData });
      } catch (error) {
        console.error('Failed to load from storage:', error);
        dispatch({ type: 'SET_ERROR', error: 'Failed to load saved progress' });
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!state.isLoading) {
      saveToStorage({
        version: 1,
        tracks: state.tracks,
        stats: state.stats,
      });
    }
  }, [state.tracks, state.stats, state.isLoading]);

  const actions = {
    addAttempt: (trackId: string, answer: string) => {
      dispatch({ type: 'ADD_ATTEMPT', trackId, answer });
    },
    
    markTrackSolved: (trackId: string) => {
      dispatch({ type: 'MARK_SOLVED', trackId });
    },
    
    revealSerbianTitle: (trackId: string) => {
      dispatch({ type: 'REVEAL_SERBIAN', trackId });
    },
    
    applyHint: (trackId: string) => {
      dispatch({ type: 'APPLY_HINT', trackId });
    },
    
    giveUpTrack: (trackId: string) => {
      dispatch({ type: 'GIVE_UP', trackId });
    },
    
    resetProgress: () => {
      dispatch({ type: 'RESET_PROGRESS' });
    },
    
    loadFromStorage: async () => {
      try {
        dispatch({ type: 'SET_LOADING', loading: true });
        const storageData = await loadFromStorage();
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: storageData });
      } catch (error) {
        console.error('Failed to reload from storage:', error);
        dispatch({ type: 'SET_ERROR', error: 'Failed to reload progress' });
      }
    },
  };

  const value: ProgressStore = {
    state,
    actions,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
