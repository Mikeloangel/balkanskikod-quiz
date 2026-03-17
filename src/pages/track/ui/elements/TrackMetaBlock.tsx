import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import IconButton from '@mui/material/IconButton';
import { Box, Stack, Typography } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { resolveLocalTrackUrl } from '@/shared/lib/url';
import { useTranslation } from 'react-i18next';

type TrackNavTarget = {
  id: string;
} | null;

type TrackMetaBlockProps = {
  trackId: string;
  pageTitle: string;
  showSolvedIcon: boolean;
  isSolved: boolean;
  isRevealed: boolean;
  difficultyStars: string;
  previousTrack: TrackNavTarget;
  nextTrack: TrackNavTarget;
  openedHints: string[];
  revealedSerbianTitle: boolean;
  serbianTitle: string;
  originalTitle: string;
};

export const TrackMetaBlock = ({
  trackId,
  pageTitle,
  showSolvedIcon,
  isSolved,
  isRevealed,
  difficultyStars,
  previousTrack,
  nextTrack,
  openedHints,
  revealedSerbianTitle,
  serbianTitle,
  originalTitle,
}: TrackMetaBlockProps) => {
  const { t } = useTranslation('tracks');
  const [imgError, setImgError] = useState(false);
  const coverUrl = resolveLocalTrackUrl(`/covers/${trackId}.jpg`);

  return (
    <Stack spacing={1.5} alignItems="center">
      {/* Cover + nav arrows */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          component={RouterLink}
          to={previousTrack ? `/track/${previousTrack.id}` : '#'}
          disabled={!previousTrack}
          color="inherit"
          size="small"
        >
          <NavigateBeforeRoundedIcon />
        </IconButton>

        <Box
          sx={{
            position: 'relative',
            width: { xs: 140, sm: 180 },
            height: { xs: 140, sm: 180 },
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            flexShrink: 0,
          }}
        >
          {!imgError ? (
            <Box
              component="img"
              src={coverUrl}
              alt={pageTitle}
              onError={() => setImgError(true)}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(110, 155, 255, 0.15), rgba(255, 124, 200, 0.15))',
              }}
            >
              <MusicNoteRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
            </Box>
          )}

          {/* Status bar overlay */}
          {(isSolved || isRevealed) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                px: 1,
                pt: 3,
                pb: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
              }}
            >
              {isSolved ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
              ) : (
                <VisibilityRoundedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  color: isSolved ? 'success.main' : 'warning.main',
                }}
              >
                {isSolved ? t('solvedFairly') : t('revealedByGiveUp')}
              </Typography>
            </Box>
          )}
        </Box>

        <IconButton
          component={RouterLink}
          to={nextTrack ? `/track/${nextTrack.id}` : '#'}
          disabled={!nextTrack}
          color="inherit"
          size="small"
        >
          <NavigateNextRoundedIcon />
        </IconButton>
      </Stack>

      {/* Title + difficulty */}
      <Stack alignItems="center" sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {pageTitle}
          </Typography>
          {showSolvedIcon && (
            <CheckCircleRoundedIcon color="success" sx={{ fontSize: 20 }} />
          )}
        </Stack>
        {(isSolved || isRevealed) && originalTitle !== serbianTitle && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {originalTitle}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{ color: 'warning.main', letterSpacing: 1 }}
        >
          {difficultyStars}
        </Typography>
      </Stack>

      {/* Hints */}
      {openedHints.length > 0 && (
        <Stack spacing={0.75} sx={{ width: '100%' }}>
          {openedHints.map((hint, i) => (
            <Stack
              key={i}
              direction="row"
              spacing={1}
              sx={{
                px: 1,
                py: 0.75,
              }}
            >
              <LightbulbRoundedIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.25, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {hint}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Revealed serbian title */}
      {revealedSerbianTitle && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ px: 1, py: 0.75, width: '100%' }}
        >
          <TranslateRoundedIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.25, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: 'warning.main', lineHeight: 1.4 }}>
            {serbianTitle}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
