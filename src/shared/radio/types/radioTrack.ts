export type RadioTrack = {
  id: string;
  links: {
    local: string;
    suno: string;
  };
  names: {
    serbian: string;
    russian: string;
    original: string;
  };
  dates: {
    added: string;
  };
};

export type RadioState = {
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackStartTime: number | null;
  totalPlayedTime: number;
  error: string | null;
};

export type RadioStorage = {
  currentTrackId: string | null;
  playbackStartTime: number | null;
  totalPlayedTime: number;
  volume?: number;
};
