import type { StorageSchema, TrackProgress } from '@/entities/progress';
import { STORAGE_KEY, STORAGE_VERSION } from '@/entities/progress';

const debounce = <T extends (data: StorageSchema) => void>(func: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((data: StorageSchema) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(data), delay);
  }) as T;
};

export const loadFromStorage = async (): Promise<StorageSchema> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        version: STORAGE_VERSION,
        tracks: {},
        stats: {},
      };
    }

    const parsed = JSON.parse(raw) as Partial<StorageSchema>;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid storage data');
    }

    // Handle version migrations if needed
    if (parsed.version && parsed.version !== STORAGE_VERSION) {
      console.warn(`Storage version mismatch: expected ${STORAGE_VERSION}, got ${parsed.version}`);
      // Migration logic can be added here
    }

    const tracks: Record<string, unknown> = {};
    if (parsed.tracks && typeof parsed.tracks === 'object') {
      Object.entries(parsed.tracks).forEach(([trackId, progress]) => {
        tracks[trackId] = progress;
      });
    }

    return {
      version: STORAGE_VERSION,
      tracks: tracks as Record<string, TrackProgress>,
      stats: parsed.stats && typeof parsed.stats === 'object' ? parsed.stats : {},
    };
  } catch (error) {
    console.error('Error loading from storage:', error);
    // Return empty storage on error
    return {
      version: STORAGE_VERSION,
      tracks: {},
      stats: {},
    };
  }
};

export const saveToStorage = debounce((data: StorageSchema): void => {
  try {
    const payload = {
      ...data,
      version: STORAGE_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Error saving to storage:', error);
    // Could implement fallback storage strategy here
  }
}, 300); // Debounce writes to avoid excessive localStorage operations

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
