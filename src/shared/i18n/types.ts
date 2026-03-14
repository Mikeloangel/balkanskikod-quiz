export type Language = 'ru' | 'en' | 'sr' | 'sr_cyrl';

export interface AvailableLanguage {
  code: Language;
  name: string;
  nativeName: string;
}

export interface TranslationResources {
  common: CommonTranslations;
  pages: PagesTranslations;
  tracks: TracksTranslations;
  meta: MetaTranslations;
}

export interface CommonTranslations {
  // Buttons
  play: string;
  pause: string;
  stop: string;
  next: string;
  previous: string;
  share: string;
  copy: string;
  hint: string;
  giveUp: string;
  reset: string;
  close: string;
  save: string;
  cancel: string;
  confirm: string;
  back: string;
  forward: string;
  
  // Actions
  loading: string;
  error: string;
  success: string;
  copied: string;
  
  // Language
  language: string;
  
  // Common UI
  volume: string;
  mute: string;
  unmute: string;
  progress: string;
  time: string;
  duration: string;
}

export interface PagesTranslations {
  // HomePage
  home: {
    title: string;
    subtitle: string;
    description: string;
    startPlaying: string;
    statistics: {
      title: string;
      totalTracks: string;
      solvedTracks: string;
      newTracks: string;
    };
  };
  
  // TrackPage
  track: {
    title: string;
    inputPlaceholder: string;
    submitButton: string;
    hintButton: string;
    revealSerbianName: string;
    giveUpButton: string;
    nextTrackButton: string;
    shareButton: string;
    success: {
      title: string;
      message: string;
      continue: string;
    };
    error: {
      wrongAnswer: string;
      tryAgain: string;
    };
  };
  
  // AboutPage
  about: {
    title: string;
    description: string;
    experimental: string;
    technologies: string;
    sourceCode: string;
  };
}

export interface TracksTranslations {
  // Track related texts
  loading: string;
  error: string;
  notFound: string;
  noHints: string;
  hints: {
    hint1: string;
    hint2: string;
    hint3: string;
  };
  difficulty: {
    easy: string;
    medium: string;
    hard: string;
    expert: string;
  };
}

export interface MetaTranslations {
  // SEO meta tags
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

// Type-safe translation keys
export type TranslationKey = 
  | keyof CommonTranslations
  | `pages.${keyof PagesTranslations}`
  | `tracks.${keyof TracksTranslations}`
  | `meta.${keyof MetaTranslations}`
  | `pages.home.${keyof PagesTranslations['home']}`
  | `pages.track.${keyof PagesTranslations['track']}`
  | `pages.about.${keyof PagesTranslations['about']}`
  | `tracks.hints.${keyof TracksTranslations['hints']}`
  | `tracks.difficulty.${keyof TracksTranslations['difficulty']}`;
