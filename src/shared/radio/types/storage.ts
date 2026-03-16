import type { RadioStorage } from './radioTrack';

const RADIO_STORAGE_KEY = 'balkanski-kod-radio-state';

const DEFAULT_VOLUME = 0.7;

const getDefaultStorage = (): RadioStorage => ({
  currentTrackId: null,
  playbackStartTime: null,
  totalPlayedTime: 0,
  volume: DEFAULT_VOLUME,
});

export const getRadioStorage = (): RadioStorage => {
  try {
    const stored = localStorage.getItem(RADIO_STORAGE_KEY);
    if (!stored) {
      return getDefaultStorage();
    }

    const parsed = JSON.parse(stored);
    return {
      ...getDefaultStorage(),
      ...parsed,
    };
  } catch (error) {
    console.warn('Error reading radio storage:', error);
    return getDefaultStorage();
  }
};

export const setRadioStorage = (state: Partial<RadioStorage>): void => {
  try {
    const current = getRadioStorage();
    const updated = { ...current, ...state };
    localStorage.setItem(RADIO_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Error writing radio storage:', error);
  }
};

export const clearRadioStorage = (): void => {
  try {
    localStorage.removeItem(RADIO_STORAGE_KEY);
  } catch (error) {
    console.warn('Error clearing radio storage:', error);
  }
};
