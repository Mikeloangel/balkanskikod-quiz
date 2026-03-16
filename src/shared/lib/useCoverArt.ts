import { useState, useEffect, useMemo } from 'react';
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { resolveLocalTrackUrl } from './url';

/**
 * Extracts embedded cover art from an MP3 file via ID3 tags.
 * Returns a blob URL for the image, or null if no artwork found.
 */
export const useCoverArt = (localPath: string | null): string | null => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const resolvedUrl = useMemo(
    () => (localPath ? resolveLocalTrackUrl(localPath) : null),
    [localPath],
  );

  useEffect(() => {
    if (!resolvedUrl) return;

    let revoked = false;
    let blobUrl: string | null = null;

    fetch(resolvedUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (revoked) return;

        jsmediatags.read(blob, {
          onSuccess: (tag) => {
            if (revoked) return;
            const picture = tag.tags.picture;
            if (picture) {
              const byteArray = new Uint8Array(picture.data);
              const imageBlob = new Blob([byteArray], { type: picture.format });
              blobUrl = URL.createObjectURL(imageBlob);
              setCoverUrl(blobUrl);
            } else {
              setCoverUrl(null);
            }
          },
          onError: () => {
            if (!revoked) setCoverUrl(null);
          },
        });
      })
      .catch(() => {
        if (!revoked) setCoverUrl(null);
      });

    return () => {
      revoked = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [resolvedUrl]);

  // Reset when path changes to null
  const result = resolvedUrl ? coverUrl : null;
  return result;
};
