interface GameAudioRef {
  pause: () => void;
  setVolume: (volume: number) => void;
}

interface ExtendedWindow extends Window {
  __gameAudioRef?: GameAudioRef;
}

// Экспортируем ref для регистрации игрового аудио
export const registerGameAudio = (audioElement: GameAudioRef) => {
  // Это будет импортировано и использовано в AudioProvider
  if (typeof window !== 'undefined') {
    (window as ExtendedWindow).__gameAudioRef = audioElement;
  }
};

export const getGameAudioRef = (): GameAudioRef | null => {
  if (typeof window !== 'undefined') {
    return (window as ExtendedWindow).__gameAudioRef || null;
  }
  return null;
};
