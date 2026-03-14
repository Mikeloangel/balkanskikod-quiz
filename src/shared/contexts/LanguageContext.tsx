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
  { code: 'sr_cyrl', name: 'Serbian (Cyrillic)', nativeName: 'СРП' },
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ru');

  useEffect(() => {
    // Load language from localStorage or use default
    const savedLanguage = localStorage.getItem('balkanski-kod-language') as Language;
    console.log('Loading language from storage:', savedLanguage);
    
    // Convert old sr-cyrl to new sr_cyrl
    const normalizedLanguage = (savedLanguage as string) === 'sr-cyrl' ? 'sr_cyrl' : savedLanguage;
    
    if (normalizedLanguage && availableLanguages.some(lang => lang.code === normalizedLanguage)) {
      console.log('Setting language to saved:', normalizedLanguage);
      i18n.changeLanguage(normalizedLanguage);
      setCurrentLanguage(normalizedLanguage);
    } else {
      console.log('Setting default language: ru');
      i18n.changeLanguage('ru');
      setCurrentLanguage('ru');
    }
    
    // Update state when i18n language changes
    const handleLanguageChanged = (lng: string) => {
      console.log('i18n language changed to:', lng);
      setCurrentLanguage(lng as Language);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const changeLanguage = (lng: Language) => {
    if (availableLanguages.some(lang => lang.code === lng)) {
      console.log(`Changing language to: ${lng}`);
      console.log(`Available resources for ${lng}:`, i18n.getResourceBundle(lng, 'common'));
      console.log(`Available resources for ${lng} (pages):`, i18n.getResourceBundle(lng, 'pages'));
      console.log(`Available resources for sr (fallback):`, i18n.getResourceBundle('sr', 'common'));
      
      // Force change language
      i18n.changeLanguage(lng);
      setCurrentLanguage(lng);
      localStorage.setItem('balkanski-kod-language', lng);
      
      // Verify after change
      setTimeout(() => {
        console.log(`Language changed to: ${i18n.language}`);
        console.log(`Current common resource:`, i18n.t('trackStatus.notStarted', { ns: 'common' }));
        console.log(`Current pages resource:`, i18n.t('home.statistics.title', { ns: 'pages' }));
      }, 100);
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
