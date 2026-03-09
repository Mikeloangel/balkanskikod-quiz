import { useUIDialogs } from './UIDialogsContext';

export const useUIDialogsActions = () => {
  const { actions } = useUIDialogs();
  return actions;
};

export const useUIDialogsState = () => {
  const { state } = useUIDialogs();
  return state;
};
