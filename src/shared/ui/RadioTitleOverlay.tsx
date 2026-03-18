import { useEffect, useRef } from 'react';
import { useRadio } from '@/shared/contexts';
import { useTranslation } from 'react-i18next';

function getRadioTrackDisplayName(
  track: { names: { russian: string; serbian: string; original: string } },
  lang: string,
): string {
  if (lang === 'ru') return track.names.russian;
  if (lang === 'sr' || lang === 'sr_cyrl') return track.names.serbian;
  return track.names.original;
}

export const RadioTitleOverlay = () => {
  const { state, currentTrack } = useRadio();
  const { i18n } = useTranslation();
  const savedTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.isPlaying && currentTrack) {
      if (savedTitleRef.current === null) {
        savedTitleRef.current = document.title;
      }
      const trackName = getRadioTrackDisplayName(currentTrack, i18n.language);
      document.title = `♫ ${trackName} | Balkanski kod`;
    } else if (savedTitleRef.current !== null) {
      document.title = savedTitleRef.current;
      savedTitleRef.current = null;
    }
  }, [state.isPlaying, currentTrack, i18n.language]);

  // When page title changes via Helmet while radio is playing, update saved ref
  useEffect(() => {
    if (!state.isPlaying) return;

    const titleEl = document.querySelector('title');
    if (!titleEl) return;

    const observer = new MutationObserver(() => {
      const newTitle = document.title;
      // Ignore our own radio title changes
      if (!newTitle.startsWith('♫')) {
        savedTitleRef.current = newTitle;
        // Re-apply radio title
        if (currentTrack) {
          const trackName = getRadioTrackDisplayName(currentTrack, i18n.language);
          document.title = `♫ ${trackName} | Balkanski kod`;
        }
      }
    });

    observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [state.isPlaying, currentTrack, i18n.language]);

  return null;
};
