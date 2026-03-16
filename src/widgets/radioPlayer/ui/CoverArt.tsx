import { Box, useMediaQuery } from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import { useRadio } from '@/shared/contexts';
import { useCoverArt } from '@/shared/lib/useCoverArt';

interface CoverArtProps {
  size?: number;
}

export const CoverArt: React.FC<CoverArtProps> = ({ size = 48 }) => {
  const isNarrow = useMediaQuery('(max-width:440px)');
  const { currentTrack } = useRadio();
  const coverUrl = useCoverArt(currentTrack?.links.local ?? null);

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
        <Box
          component="img"
          src={coverUrl}
          alt="Cover"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <MusicNote sx={{ color: 'text.secondary', fontSize: size * 0.5 }} />
      )}
    </Box>
  );
};
