import type { Track } from '../../../shared/types/track';
import type { StorageSchema, TrackProgress } from './types';

export type GlobalStats = {
  totalTracks: number;
  solvedTracks: number;
  revealedTracks: number;
  inProgressTracks: number;
  solveRatePercent: number;
  averageAttempts: number;
  solvedWithoutHints: number;
  solvedWithSerbianHint: number;
};

export const getTrackProgressSafe = (
  storage: StorageSchema,
  trackId: string,
): TrackProgress | undefined => storage.tracks[trackId];

export const isTrackNew = (track: Track, progress: TrackProgress | undefined): boolean => {
  const addedTime = new Date(track.dates.added).getTime();
  if (Number.isNaN(addedTime)) {
    return false;
  }

  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const isAddedRecently = Date.now() - addedTime <= thirtyDaysInMs;
  const hasAnyProgress =
    (progress?.attemptsCount ?? 0) > 0 ||
    (progress?.hintsUsedCount ?? 0) > 0 ||
    Boolean(progress?.revealedSerbianTitle) ||
    Boolean(progress?.revealedByGiveUp) ||
    progress?.status === 'in_progress' ||
    progress?.status === 'solved' ||
    progress?.status === 'revealed';

  return isAddedRecently && !hasAnyProgress;
};

export const getGlobalStats = (tracks: Track[], storage: StorageSchema): GlobalStats => {
  const allProgress = tracks.map((track) => storage.tracks[track.id]);
  const solved = allProgress.filter((progress) => progress?.status === 'solved');
  const revealed = allProgress.filter((progress) => progress?.status === 'revealed');
  const inProgress = allProgress.filter((progress) => progress?.status === 'in_progress');

  const solvedAttemptsSum = solved.reduce(
    (sum, progress) => sum + progress.attemptsCount,
    0,
  );

  return {
    totalTracks: tracks.length,
    solvedTracks: solved.length,
    revealedTracks: revealed.length,
    inProgressTracks: inProgress.length,
    solveRatePercent: tracks.length > 0 ? Math.round((solved.length / tracks.length) * 100) : 0,
    averageAttempts:
      solved.length > 0 ? Number((solvedAttemptsSum / solved.length).toFixed(2)) : 0,
    solvedWithoutHints: solved.filter(
      (progress) => progress.hintsUsedCount === 0 && !progress.revealedSerbianTitle,
    ).length,
    solvedWithSerbianHint: solved.filter((progress) => progress.revealedSerbianTitle)
      .length,
  };
};

export const getLastSolvedTracks = (
  tracks: Track[],
  storage: StorageSchema,
  limit = 5,
): Track[] =>
  tracks
    .filter(
      (track) =>
        storage.tracks[track.id]?.status === 'solved' &&
        storage.tracks[track.id]?.solvedAt,
    )
    .sort((a, b) => {
      const dateA = new Date(storage.tracks[a.id].solvedAt ?? 0).getTime();
      const dateB = new Date(storage.tracks[b.id].solvedAt ?? 0).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);
