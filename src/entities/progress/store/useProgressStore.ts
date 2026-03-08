import { useContext } from 'react';
import { ProgressContext } from './ProgressContext';
import type { ProgressStore } from './ProgressContext';

export const useProgressStore = (): ProgressStore => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressStore must be used within ProgressProvider');
  }
  return context;
};
