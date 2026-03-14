import {
  STORAGE_KEY,
  STORAGE_VERSION,
  type StorageSchema,
  type TrackProgress,
  type TrackProgressStatus,
} from './types';

const createEmptyStorage = (): StorageSchema => ({
  version: STORAGE_VERSION,
  tracks: {},
  stats: {},
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

export const readStorage = (): StorageSchema => {
  const fallback = createEmptyStorage();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<StorageSchema>;
    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }

    const tracks: Record<string, TrackProgress> = {};
    if (parsed.tracks && typeof parsed.tracks === 'object') {
      Object.entries(parsed.tracks).forEach(([trackId, progress]) => {
        tracks[trackId] = sanitizeTrackProgress(trackId, progress);
      });
    }

    return {
      version: STORAGE_VERSION,
      tracks,
      stats: parsed.stats && typeof parsed.stats === 'object' ? parsed.stats : {},
    };
  } catch {
    return fallback;
  }
};

export const writeStorage = (storage: StorageSchema): void => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...storage,
      version: STORAGE_VERSION,
    }),
  );
};

export const getTrackProgress = (trackId: string): TrackProgress => {
  const storage = readStorage();
  return storage.tracks[trackId] ?? createDefaultTrackProgress(trackId);
};

export const patchTrackProgress = (
  trackId: string,
  updater: (current: TrackProgress) => TrackProgress,
): TrackProgress => {
  const storage = readStorage();
  const current = storage.tracks[trackId] ?? createDefaultTrackProgress(trackId);
  const updatedRaw = updater(current);

  const updated = sanitizeTrackProgress(trackId, updatedRaw);

  storage.tracks[trackId] = updated;
  writeStorage(storage);

  return updated;
};

export const addAttempt = (trackId: string, answer: string): TrackProgress =>
  patchTrackProgress(trackId, (current) => {
    const attemptsHistory = [...current.attemptsHistory, answer].slice(-20);

    return {
      ...current,
      status: current.status === 'solved' || current.status === 'revealed' ? current.status : 'in_progress',
      attemptsCount: current.attemptsCount + 1,
      attemptsHistory,
    };
  });

export const markTrackSolved = (trackId: string): TrackProgress =>
  patchTrackProgress(trackId, (current) => ({
    ...current,
    status: 'solved',
    solvedAt: current.status === 'solved' ? current.solvedAt : new Date().toISOString(),
    revealedByGiveUp: false,
  }));

export const revealSerbianTitle = (trackId: string): TrackProgress =>
  patchTrackProgress(trackId, (current) => ({
    ...current,
    revealedSerbianTitle: true,
  }));

export const applyHint = (trackId: string): TrackProgress =>
  patchTrackProgress(trackId, (current) => ({
    ...current,
    hintsUsedCount: current.hintsUsedCount + 1,
  }));

export const giveUpTrack = (trackId: string): TrackProgress =>
  patchTrackProgress(trackId, (current) => ({
    ...current,
    status: 'revealed',
    revealedByGiveUp: true,
  }));

export const resetProgress = (): void => {
  writeStorage({
    version: STORAGE_VERSION,
    tracks: {},
    stats: {
      resetAt: new Date().toISOString(),
    },
  });
};
