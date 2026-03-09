import { useAudioState } from './provider';

export const useAudioActions = () => {
  const { actions } = useAudioState();
  return actions;
};

export const useAudioStateOnly = () => {
  const { state } = useAudioState();
  return state;
};
