import type { TrackProgress, AppStatsSnapshot, StorageSchema, TrackProgressStatus } from '@/entities/progress';

export interface ProgressState {
  tracks: Record<string, TrackProgress>;
  stats: AppStatsSnapshot;
  isLoading: boolean;
  error: string | null;
}

export type ProgressAction =
  | { type: 'ADD_ATTEMPT'; trackId: string; answer: string }
  | { type: 'MARK_SOLVED'; trackId: string }
  | { type: 'REVEAL_SERBIAN'; trackId: string }
  | { type: 'APPLY_HINT'; trackId: string }
  | { type: 'GIVE_UP'; trackId: string }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_FROM_STORAGE'; payload: StorageSchema }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

const createEmptyState = (): ProgressState => ({
  tracks: {},
  stats: {},
  isLoading: false,
  error: null,
});

const createDefaultTrackProgress = (trackId: string): TrackProgress => ({
  trackId,
  status: 'not_started',
  attemptsCount: 0,
  attemptsHistory: [],
  hintsUsedCount: 0,
  revealedSerbianTitle: false,
  revealedByGiveUp: false,
});

const normalizeStatus = (progress: TrackProgress): TrackProgressStatus => {
  if (progress.revealedByGiveUp) {
    return 'revealed';
  }

  if (progress.status === 'solved') {
    return 'solved';
  }

  if (progress.attemptsCount > 0) {
    return 'in_progress';
  }

  return 'not_started';
};

const sanitizeTrackProgress = (trackId: string, input: unknown): TrackProgress => {
  const base = createDefaultTrackProgress(trackId);

  if (!input || typeof input !== 'object') {
    return base;
  }

  const raw = input as Partial<TrackProgress>;

  const attemptsHistory = Array.isArray(raw.attemptsHistory)
    ? raw.attemptsHistory.filter((item): item is string => typeof item === 'string').slice(-20)
    : [];

  const hintsUsedCount = Number.isFinite(raw.hintsUsedCount)
    ? Math.max(0, Number(raw.hintsUsedCount))
    : 0;

  const progress: TrackProgress = {
    ...base,
    attemptsCount: Number.isFinite(raw.attemptsCount) ? Math.max(0, Number(raw.attemptsCount)) : 0,
    attemptsHistory,
    hintsUsedCount,
    revealedSerbianTitle: Boolean(raw.revealedSerbianTitle),
    revealedByGiveUp: Boolean(raw.revealedByGiveUp),
    solvedAt: typeof raw.solvedAt === 'string' ? raw.solvedAt : undefined,
    status: raw.status ?? 'not_started',
  };

  progress.status = normalizeStatus(progress);

  return progress;
};

export const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case 'ADD_ATTEMPT': {
      const { trackId, answer } = action;
      const current = state.tracks[trackId] ?? createDefaultTrackProgress(trackId);
      
      if (current.status === 'solved' || current.status === 'revealed') {
        return state; // Don't add attempts to completed tracks
      }

      const attemptsHistory = [...current.attemptsHistory, answer].slice(-20);
      const updated: TrackProgress = {
        ...current,
        status: 'in_progress',
        attemptsCount: current.attemptsCount + 1,
        attemptsHistory,
      };

      return {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: updated,
        },
      };
    }

    case 'MARK_SOLVED': {
      const { trackId } = action;
      const current = state.tracks[trackId] ?? createDefaultTrackProgress(trackId);
      
      const updated: TrackProgress = {
        ...current,
        status: 'solved',
        solvedAt: new Date().toISOString(),
        revealedByGiveUp: false,
      };

      return {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: updated,
        },
      };
    }

    case 'REVEAL_SERBIAN': {
      const { trackId } = action;
      const current = state.tracks[trackId] ?? createDefaultTrackProgress(trackId);
      
      const updated: TrackProgress = {
        ...current,
        revealedSerbianTitle: true,
      };

      return {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: updated,
        },
      };
    }

    case 'APPLY_HINT': {
      const { trackId } = action;
      const current = state.tracks[trackId] ?? createDefaultTrackProgress(trackId);
      
      const updated: TrackProgress = {
        ...current,
        hintsUsedCount: current.hintsUsedCount + 1,
      };

      return {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: updated,
        },
      };
    }

    case 'GIVE_UP': {
      const { trackId } = action;
      const current = state.tracks[trackId] ?? createDefaultTrackProgress(trackId);
      
      const updated: TrackProgress = {
        ...current,
        status: 'revealed',
        revealedByGiveUp: true,
      };

      return {
        ...state,
        tracks: {
          ...state.tracks,
          [trackId]: updated,
        },
      };
    }

    case 'RESET_PROGRESS': {
      return {
        ...createEmptyState(),
        stats: {
          resetAt: new Date().toISOString(),
        },
      };
    }

    case 'LOAD_FROM_STORAGE': {
      const { payload } = action;
      const tracks: Record<string, TrackProgress> = {};

      if (payload.tracks && typeof payload.tracks === 'object') {
        Object.entries(payload.tracks).forEach(([trackId, progress]) => {
          tracks[trackId] = sanitizeTrackProgress(trackId, progress);
        });
      }

      return {
        ...createEmptyState(),
        tracks,
        stats: payload.stats && typeof payload.stats === 'object' ? payload.stats : {},
        isLoading: false,
        error: null,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.loading,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
    }

    default:
      return state;
  }
};
