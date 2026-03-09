export type TrackProgressStatus = 'not_started' | 'in_progress' | 'solved' | 'revealed';

export interface TrackProgress {
  trackId: string;
  status: TrackProgressStatus;
  attemptsCount: number;
  attemptsHistory: string[];
  hintsUsedCount: number;
  revealedSerbianTitle: boolean;
  revealedByGiveUp: boolean;
  solvedAt?: string;
}
