import { useContext } from 'react';
import { AudioControlContext } from './AudioControlContextBase';

export const useAudioControl = () => {
  const context = useContext(AudioControlContext);
  if (!context) {
    throw new Error('useAudioControl must be used within AudioControlProvider');
  }
  return context;
};
