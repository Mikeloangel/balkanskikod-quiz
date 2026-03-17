import { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import { useRadio } from '@/shared/contexts';
import { resolveLocalTrackUrl } from '@/shared/lib/url';

interface CoverArtProps {
  size?: number;
}

const CoverImage = ({ src, size }: { src: string; size: number }) => {
  const [error, setError] = useState(false);

  if (error) {
    return <MusicNote sx={{ color: 'text.secondary', fontSize: size * 0.5 }} />;
  }

  return (
    <Box
      component="img"
      src={src}
      alt="Cover"
      onError={() => setError(true)}
      sx={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
};

export const CoverArt: React.FC<CoverArtProps> = ({ size = 48 }) => {
  const isNarrow = useMediaQuery('(max-width:440px)');
  const { currentTrack } = useRadio();
  const coverUrl = currentTrack
    ? resolveLocalTrackUrl(`/covers/${currentTrack.id}.jpg`)
    : null;

  if (isNarrow) return null;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {coverUrl ? (
        <CoverImage key={coverUrl} src={coverUrl} size={size} />
      ) : (
        <MusicNote sx={{ color: 'text.secondary', fontSize: size * 0.5 }} />
      )}
    </Box>
  );
};
