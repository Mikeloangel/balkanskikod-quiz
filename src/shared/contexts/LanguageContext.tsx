import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language, AvailableLanguage } from '@/shared/i18n/types';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lng: Language) => void;
  availableLanguages: AvailableLanguage[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages: AvailableLanguage[] = [
  { code: 'ru', name: 'Russian', nativeName: 'РУС' },
  { code: 'en', name: 'English', nativeName: 'ENG' },
  { code: 'sr', name: 'Serbian (Latin)', nativeName: 'SRB' },
  { code: 'sr-cyrl', name: 'Serbian (Cyrillic)', nativeName: 'СРП' },
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ru');

  useEffect(() => {
    // Load language from localStorage or use default
    const savedLanguage = localStorage.getItem('balkanski-kod-language') as Language;
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
    } else {
      i18n.changeLanguage('ru');
      setCurrentLanguage('ru');
    }
  }, [i18n]);

  const changeLanguage = (lng: Language) => {
    if (availableLanguages.some(lang => lang.code === lng)) {
      i18n.changeLanguage(lng);
      setCurrentLanguage(lng);
      localStorage.setItem('balkanski-kod-language', lng);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
