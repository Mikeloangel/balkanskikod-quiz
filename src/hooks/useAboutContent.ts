import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ru, en, sr, srCyrl } from '@/content/about';
import type { AboutContent } from '@/content/about/types';

const contentMap = {
  ru,
  en,
  sr,
  'sr-cyrl': srCyrl,
} as const;

const languageToImportMap = {
  ru: 'ru',
  en: 'en', 
  sr: 'sr',
  'sr_cyrl': 'sr-cyrl',
} as const;

export const useAboutContent = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<AboutContent | null>(null);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const importPath = languageToImportMap[i18n.language as keyof typeof languageToImportMap] || 'ru';
        const module = await import(`@/content/about/${importPath}.ts`);
        setContent(module.default);
      } catch {
        // Fallback на русский
        setContent(contentMap.ru);
      }
    };
    
    loadContent();
  }, [i18n.language]);
  
  return content;
};
