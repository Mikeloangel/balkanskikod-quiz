import { useState } from 'react';
import type { Track } from '@/shared/models';
import { resolveLocalTrackUrl } from '@/shared/lib/url';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

type LastSolvedBlockProps = {
  lastSolved: Track[];
};

const MiniCover = ({ trackId, name }: { trackId: string; name: string }) => {
  const [imgError, setImgError] = useState(false);
  const coverUrl = resolveLocalTrackUrl(`/covers/${trackId}.jpg`);

  return (
    <Box
      sx={{
        width: '100%',
        paddingTop: '100%',
        position: 'relative',
        borderRadius: 1.5,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {!imgError ? (
        <Box
          component="img"
          src={coverUrl}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, rgba(110, 155, 255, 0.15), rgba(255, 124, 200, 0.15))',
          }}
        >
          <MusicNoteRoundedIcon
            sx={{ fontSize: { xs: 24, sm: 32 }, color: 'text.secondary', opacity: 0.5 }}
          />
        </Box>
      )}
    </Box>
  );
};

export const LastSolvedBlock = ({ lastSolved }: LastSolvedBlockProps) => {
  const { t } = useTranslation('pages');

  if (lastSolved.length === 0) {
    return (
      <Box
        sx={{
          py: 3,
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <EmojiEventsRoundedIcon
          sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          {t('home.lastSolved.empty')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: { xs: 1, sm: 1.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        {t('home.lastSolved.title')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1, sm: 1.5 },
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 1,
          mx: -0.5,
          px: 0.5,
          /* Hide scrollbar but keep scroll */
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {lastSolved.map((track) => (
          <Box
            key={track.id}
            component={RouterLink}
            to={`/track/${track.id}`}
            sx={{
              scrollSnapAlign: 'start',
              flexShrink: 0,
              width: { xs: 72, sm: 100 },
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <MiniCover trackId={track.id} name={track.names.serbian} />
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.5,
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              {track.names.serbian}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
