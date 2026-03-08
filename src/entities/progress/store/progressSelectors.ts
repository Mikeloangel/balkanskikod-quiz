import type { Track } from '@/shared/models';
import type { ProgressState } from './progressReducer';
import type { TrackProgress, StorageSchema } from '@/entities/progress';
import { getGlobalStats, getLastSolvedTracks } from '@/entities/progress';

export const selectTrackProgress = (state: ProgressState, trackId: string): TrackProgress => {
  return state.tracks[trackId] ?? {
    trackId,
    status: 'not_started',
    attemptsCount: 0,
    attemptsHistory: [],
    hintsUsedCount: 0,
    revealedSerbianTitle: false,
    revealedByGiveUp: false,
  };
};

export const selectGlobalStats = (state: ProgressState, tracks: Track[]) => {
  const storageSchema: StorageSchema = {
    version: 1,
    tracks: state.tracks,
    stats: state.stats,
  };
  return getGlobalStats(tracks, storageSchema);
};

export const selectLastSolved = (state: ProgressState, tracks: Track[], limit: number) => {
  const storageSchema: StorageSchema = {
    version: 1,
    tracks: state.tracks,
    stats: state.stats,
  };
  return getLastSolvedTracks(tracks, storageSchema, limit);
};

export const selectIsTrackNew = (state: ProgressState, trackId: string, addedDate: string): boolean => {
  const progress = state.tracks[trackId];
  if (!progress || progress.attemptsCount === 0) {
    const addedTime = new Date(addedDate).getTime();
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return (now - addedTime) <= thirtyDaysInMs;
  }
  return false;
};

export const selectCompletionPercentage = (state: ProgressState, totalTracks: number): number => {
  if (totalTracks === 0) return 0;
  const solvedCount = Object.values(state.tracks).filter(
    track => track.status === 'solved'
  ).length;
  return Math.round((solvedCount / totalTracks) * 100);
};

export const selectInProgressCount = (state: ProgressState): number => {
  return Object.values(state.tracks).filter(
    track => track.status === 'in_progress'
  ).length;
};

export const selectNotStartedCount = (state: ProgressState): number => {
  return Object.values(state.tracks).filter(
    track => track.status === 'not_started'
  ).length;
};

export const selectSolvedCount = (state: ProgressState): number => {
  return Object.values(state.tracks).filter(
    track => track.status === 'solved'
  ).length;
};

export const selectRevealedCount = (state: ProgressState): number => {
  return Object.values(state.tracks).filter(
    track => track.status === 'revealed'
  ).length;
};
