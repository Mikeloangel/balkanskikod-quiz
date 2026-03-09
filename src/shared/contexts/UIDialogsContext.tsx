import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UIDialogsState {
  isShareOpen: boolean;
  isGiveUpOpen: boolean;
  shareFeedback: string | null;
  startedProgressSignature: string | null;
}

export interface UIDialogsActions {
  openShareDialog: () => void;
  closeShareDialog: () => void;
  openGiveUpDialog: () => void;
  closeGiveUpDialog: () => void;
  setShareFeedback: (feedback: string | null) => void;
  setStartedProgressSignature: (signature: string | null) => void;
  resetDialogs: () => void;
}

export interface UIDialogsContextType {
  state: UIDialogsState;
  actions: UIDialogsActions;
}

const UIDialogsContext = createContext<UIDialogsContextType | null>(null);

/* eslint-disable react-refresh/only-export-components */
export const useUIDialogs = (): UIDialogsContextType => {
  const context = useContext(UIDialogsContext);
  if (!context) {
    throw new Error('useUIDialogs must be used within UIDialogsProvider');
  }
  return context;
};

export interface UIDialogsProviderProps {
  children: ReactNode;
  initialShareFeedback?: string | null;
  initialStartedProgressSignature?: string | null;
}

export const UIDialogsProvider: React.FC<UIDialogsProviderProps> = ({ 
  children, 
  initialShareFeedback = null,
  initialStartedProgressSignature = null
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGiveUpOpen, setIsGiveUpOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(initialShareFeedback);
  const [startedProgressSignature, setStartedProgressSignature] = useState<string | null>(initialStartedProgressSignature);

  const actions: UIDialogsActions = {
    openShareDialog: () => setIsShareOpen(true),
    closeShareDialog: () => setIsShareOpen(false),
    openGiveUpDialog: () => setIsGiveUpOpen(true),
    closeGiveUpDialog: () => setIsGiveUpOpen(false),
    setShareFeedback: (feedback: string | null) => setShareFeedback(feedback),
    setStartedProgressSignature: (signature: string | null) => setStartedProgressSignature(signature),
    resetDialogs: () => {
      setIsShareOpen(false);
      setIsGiveUpOpen(false);
      setShareFeedback(null);
      setStartedProgressSignature(null);
    },
  };

  const value: UIDialogsContextType = {
    state: {
      isShareOpen,
      isGiveUpOpen,
      shareFeedback,
      startedProgressSignature,
    },
    actions,
  };

  return (
    <UIDialogsContext.Provider value={value}>
      {children}
    </UIDialogsContext.Provider>
  );
};
