export type TrackProgressStatus = 'not_started' | 'in_progress' | 'solved' | 'revealed';

export type TrackProgress = {
  trackId: string;
  status: TrackProgressStatus;
  attemptsCount: number;
  attemptsHistory: string[];
  hintsUsedCount: number;
  revealedSerbianTitle: boolean;
  revealedByGiveUp: boolean;
  solvedAt?: string;
};

export type AppStatsSnapshot = {
  resetAt?: string;
};

export type StorageSchema = {
  version: number;
  tracks: Record<string, TrackProgress>;
  stats: AppStatsSnapshot;
};

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'balkanski-kod-storage';
