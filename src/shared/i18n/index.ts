import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { Language } from './types';

// Import translation resources
import ruCommon from './locales/ru/common';
import ruPages from './locales/ru/pages';
import ruTracks from './locales/ru/tracks';
import ruMeta from './locales/ru/meta';

import enCommon from './locales/en/common';
import enPages from './locales/en/pages';
import enTracks from './locales/en/tracks';
import enMeta from './locales/en/meta';

import srCommon from './locales/sr/common';
import srPages from './locales/sr/pages';
import srTracks from './locales/sr/tracks';
import srMeta from './locales/sr/meta';

import srCyrlCommon from './locales/sr-cyrl/common';
import srCyrlPages from './locales/sr-cyrl/pages';
import srCyrlTracks from './locales/sr-cyrl/tracks';
import srCyrlMeta from './locales/sr-cyrl/meta';

export const resources = {
  ru: {
    common: ruCommon,
    pages: ruPages,
    tracks: ruTracks,
    meta: ruMeta,
  },
  en: {
    common: enCommon,
    pages: enPages,
    tracks: enTracks,
    meta: enMeta,
  },
  sr: {
    common: srCommon,
    pages: srPages,
    tracks: srTracks,
    meta: srMeta,
  },
  'sr-cyrl': {
    common: srCyrlCommon,
    pages: srCyrlPages,
    tracks: srCyrlTracks,
    meta: srCyrlMeta,
  },
} as const;

export const defaultLanguage: Language = 'ru';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'balkanski-kod-language',
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Re-export UI components
export { LanguageSelector } from './LanguageSelector';
