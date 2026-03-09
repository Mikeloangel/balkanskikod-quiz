export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error: string;
  inputValue: string;
}

export interface AudioActions {
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setError: (error: string) => void;
  setInputValue: (value: string) => void;
  reset: () => void;
}

export interface AudioContextType {
  state: AudioState;
  actions: AudioActions;
}
