/**
 * Resolves a local asset path (e.g. `/tracks/track-001.mp3`) to a full URL
 * taking into account Vite's BASE_URL for GitHub Pages deployment.
 */
export const resolveLocalTrackUrl = (localPath: string): string => {
  if (/^https?:\/\//i.test(localPath)) {
    return localPath;
  }

  const normalizedPath = localPath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};
