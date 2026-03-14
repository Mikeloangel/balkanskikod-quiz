import * as React from 'react';
import { createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language, AvailableLanguage } from '@/shared/i18n/types';

export type { Language } from './LanguageContextExports';

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
  { code: 'sr_cyrl', name: 'Serbian (Cyrillic)', nativeName: 'СРП' },
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ru');

  useEffect(() => {
    // Load language from localStorage or use default
    const savedLanguage = localStorage.getItem('balkanski-kod-language') as Language;
    
    // Convert old sr-cyrl to new sr_cyrl
    const normalizedLanguage = (savedLanguage as string) === 'sr-cyrl' ? 'sr_cyrl' : savedLanguage;
    
    if (normalizedLanguage && availableLanguages.some(lang => lang.code === normalizedLanguage)) {
      i18n.changeLanguage(normalizedLanguage);
    } else {
      i18n.changeLanguage('ru');
    }
    
    // Set state after i18n change with setTimeout to avoid cascading renders
    setTimeout(() => {
      setCurrentLanguage(normalizedLanguage && availableLanguages.some(lang => lang.code === normalizedLanguage) ? normalizedLanguage : 'ru');
    }, 0);
    
    // Update state when i18n language changes
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng as Language);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const changeLanguage = (lng: Language) => {
    if (availableLanguages.some(lang => lang.code === lng)) {      
      // Force change language
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

export { LanguageContext };
