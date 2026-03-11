import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Track } from '@/shared/models';
import type { TrackProgress } from '@/shared/models';

export interface TrackGameUIState {
  shouldShowStartCta: boolean;
  canUseHint: boolean;
  canShowHintButton: boolean;
  openedHints: string[];
  attemptsForView: string[];
  pageTitle: string;
  difficultyStars: string;
  isSolved: boolean;
  isRevealed: boolean;
  isFinished: boolean;
  isTrackInProgress: boolean;
}

export interface TrackGameUIContextType {
  state: TrackGameUIState;
}

const TrackGameUIContext = createContext<TrackGameUIContextType | null>(null);

/* eslint-disable react-refresh/only-export-components */
export const useTrackGameUI = (): TrackGameUIContextType => {
  const context = useContext(TrackGameUIContext);
  if (!context) {
    throw new Error('useTrackGameUI must be used within TrackGameUIProvider');
  }
  return context;
};

export interface TrackGameUIProviderProps {
  children: ReactNode;
  track: Track;
  progress: TrackProgress;
  startedProgressSignature: string | null;
}

export const TrackGameUIProvider: React.FC<TrackGameUIProviderProps> = ({ 
  children, 
  track,
  progress,
  startedProgressSignature
}) => {
  const gameUIState = useMemo(() => {
    const isSolved = progress.status === 'solved';
    const isRevealed = progress.status === 'revealed';
    const isFinished = isSolved || isRevealed;
    const isTrackInProgress = progress.status === 'in_progress';
    
    const progressSignature = [
      progress.status,
      progress.attemptsCount,
      progress.hintsUsedCount,
      progress.revealedSerbianTitle,
      progress.revealedByGiveUp,
    ].join('|');
    
    const hasStartedInCurrentProgress = startedProgressSignature === progressSignature;
    
    const shouldShowStartCta =
      !isFinished &&
      progress.attemptsCount === 0 &&
      progress.hintsUsedCount === 0 &&
      !progress.revealedSerbianTitle &&
      !hasStartedInCurrentProgress;

    const openedHints = track.hints.slice(0, progress.hintsUsedCount);
    const canUseHint = progress.hintsUsedCount < track.hints.length;
    const canShowHintButton = canUseHint || !progress.revealedSerbianTitle;
    
    const pageTitle = isFinished ? track.names.serbian : track.names.safe;
    const attemptsForView = [...progress.attemptsHistory].reverse();
    const difficultyStars = '★'.repeat(track.difficulty).padEnd(5, '☆');

    return {
      shouldShowStartCta,
      canUseHint,
      canShowHintButton,
      openedHints,
      attemptsForView,
      pageTitle,
      difficultyStars,
      isSolved,
      isRevealed,
      isFinished,
      isTrackInProgress,
    };
  }, [track, progress, startedProgressSignature]);

  const value: TrackGameUIContextType = {
    state: gameUIState,
  };

  return (
    <TrackGameUIContext.Provider value={value}>
      {children}
    </TrackGameUIContext.Provider>
  );
};
