import { useTranslation } from 'react-i18next';
import { ru, en, sr, srCyrl } from '@/content/about';
import type { AboutContent } from '@/content/about/types';

const contentMap: Record<string, AboutContent> = {
  ru,
  en,
  sr,
  sr_cyrl: srCyrl,
};

export const useAboutContent = (): AboutContent => {
  const { i18n } = useTranslation();
  return contentMap[i18n.language] || contentMap.ru;
};
