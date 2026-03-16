import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { Language } from './types';

// Import translation resources
import ruCommon from './locales/ru/common';
import ruPages from './locales/ru/pages';
import ruTracks from './locales/ru/tracks';
import ruMeta from './locales/ru/meta';
import ruRadio from './locales/ru/radio';
import ruHome from './locales/ru/home';

import enCommon from './locales/en/common';
import enPages from './locales/en/pages';
import enTracks from './locales/en/tracks';
import enMeta from './locales/en/meta';
import enRadio from './locales/en/radio';
import enHome from './locales/en/home';

import srCommon from './locales/sr/common';
import srPages from './locales/sr/pages';
import srTracks from './locales/sr/tracks';
import srMeta from './locales/sr/meta';
import srRadio from './locales/sr/radio';
import srHome from './locales/sr/home';

import srCyrlCommon from './locales/sr_cyrl/common';
import srCyrlPages from './locales/sr_cyrl/pages';
import srCyrlTracks from './locales/sr_cyrl/tracks';
import srCyrlMeta from './locales/sr_cyrl/meta';
import srCyrlRadio from './locales/sr_cyrl/radio';
import srCyrlHome from './locales/sr_cyrl/home';

export const resources = {
  ru: {
    common: ruCommon,
    pages: ruPages,
    tracks: ruTracks,
    meta: ruMeta,
    radio: ruRadio,
    home: ruHome,
  },
  en: {
    common: enCommon,
    pages: enPages,
    tracks: enTracks,
    meta: enMeta,
    radio: enRadio,
    home: enHome,
  },
  sr: {
    common: srCommon,
    pages: srPages,
    tracks: srTracks,
    meta: srMeta,
    radio: srRadio,
    home: srHome,
  },
  'sr_cyrl': {
    common: srCyrlCommon,
    pages: srCyrlPages,
    tracks: srCyrlTracks,
    meta: srCyrlMeta,
    radio: srCyrlRadio,
    home: srCyrlHome,
  },
} as const;

export const defaultLanguage: Language = 'ru';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    debug: import.meta.env.DEV,
    
    // Explicitly set supported languages
    supportedLngs: ['ru', 'en', 'sr', 'sr_cyrl'],
    
    // Disable language conversion
    load: 'all',
    preload: ['ru', 'en', 'sr', 'sr_cyrl'],
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'balkanski-kod-language',
    },
    
    react: {
      useSuspense: false,
    },
    
    // Ensure fallback language works correctly
    fallbackNS: ['common', 'pages', 'tracks', 'meta', 'radio', 'home'],
  });

export default i18n;

// Re-export UI components
export { LanguageSelector } from './LanguageSelector';
