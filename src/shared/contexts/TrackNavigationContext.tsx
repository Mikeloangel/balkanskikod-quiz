import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { tracksSortedByAddedDate } from '@/shared/config';
import type { Track } from '@/shared/models';

export interface TrackNavigationState {
  currentTrack: Track;
  previousTrack: Track | null;
  nextTrack: Track | null;
  currentTrackIndex: number;
}

export interface TrackNavigationActions {
  goToPreviousTrack: () => void;
  goToNextTrack: () => void;
  canGoToPrevious: boolean;
  canGoToNext: boolean;
}

export interface TrackNavigationContextType {
  state: TrackNavigationState;
  actions: TrackNavigationActions;
}

const TrackNavigationContext = createContext<TrackNavigationContextType | null>(null);

/* eslint-disable react-refresh/only-export-components */
export const useTrackNavigation = (): TrackNavigationContextType => {
  const context = useContext(TrackNavigationContext);
  if (!context) {
    throw new Error('useTrackNavigation must be used within TrackNavigationProvider');
  }
  return context;
};

export interface TrackNavigationProviderProps {
  children: ReactNode;
  currentTrack: Track;
}

export const TrackNavigationProvider: React.FC<TrackNavigationProviderProps> = ({ 
  children, 
  currentTrack 
}) => {
  const navigationState = useMemo(() => {
    const currentTrackIndex = tracksSortedByAddedDate.findIndex((item) => item.id === currentTrack.id);
    const previousTrack = currentTrackIndex > 0 ? tracksSortedByAddedDate[currentTrackIndex - 1] : null;
    const nextTrack = currentTrackIndex >= 0 && currentTrackIndex < tracksSortedByAddedDate.length - 1
      ? tracksSortedByAddedDate[currentTrackIndex + 1]
      : null;

    return {
      currentTrack,
      previousTrack,
      nextTrack,
      currentTrackIndex,
    };
  }, [currentTrack]);

  const navigationActions = useMemo(() => ({
    goToPreviousTrack: () => {
      if (navigationState.previousTrack) {
        window.location.hash = `/track/${navigationState.previousTrack.id}`;
      }
    },
    goToNextTrack: () => {
      if (navigationState.nextTrack) {
        window.location.hash = `/track/${navigationState.nextTrack.id}`;
      }
    },
    canGoToPrevious: !!navigationState.previousTrack,
    canGoToNext: !!navigationState.nextTrack,
  }), [navigationState]);

  const value: TrackNavigationContextType = {
    state: navigationState,
    actions: navigationActions,
  };

  return (
    <TrackNavigationContext.Provider value={value}>
      {children}
    </TrackNavigationContext.Provider>
  );
};
