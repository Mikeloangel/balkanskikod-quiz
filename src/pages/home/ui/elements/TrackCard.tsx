import { useState } from 'react';
import { getTrackProgressSafe, isTrackNew } from '@/entities/progress';
import type { StorageSchema, TrackProgressStatus } from '@/entities/progress';
import type { Track } from '@/shared/models';
import { resolveLocalTrackUrl } from '@/shared/lib/url';
import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';

const getDifficultyStars = (difficulty: number): string =>
  '★'.repeat(difficulty).padEnd(5, '☆');

const statusColorMap: Record<TrackProgressStatus, 'success' | 'warning' | 'info' | 'default'> = {
  solved: 'success',
  revealed: 'warning',
  in_progress: 'info',
  not_started: 'default',
};

const statusIconMap: Record<TrackProgressStatus, React.ReactElement | null> = {
  solved: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
  revealed: <VisibilityRoundedIcon sx={{ fontSize: 14 }} />,
  in_progress: <PendingRoundedIcon sx={{ fontSize: 14 }} />,
  not_started: null,
};

type TrackCardProps = {
  track: Track;
  storage: StorageSchema;
};

export const TrackCard = ({ track, storage }: TrackCardProps) => {
  const { t: tPages } = useTranslation('pages');
  const { t: tCommon } = useTranslation('common');
  const [imgError, setImgError] = useState(false);
  const coverUrl = resolveLocalTrackUrl(`/covers/${track.id}.jpg`);

  const progress = getTrackProgressSafe(storage, track.id);
  const status: TrackProgressStatus = progress?.status ?? 'not_started';
  const attempts = progress?.attemptsCount ?? 0;
  const showNew = isTrackNew(track, progress);
  const hasUserProgress =
    status !== 'not_started' ||
    attempts > 0 ||
    (progress?.hintsUsedCount ?? 0) > 0 ||
    Boolean(progress?.revealedSerbianTitle) ||
    Boolean(progress?.revealedByGiveUp);

  const statusI18nKey: Record<string, string> = {
    not_started: 'notStarted',
    in_progress: 'inProgress',
    solved: 'solved',
    revealed: 'revealed',
  };
  const statusLabel = tCommon(`trackStatus.${statusI18nKey[status] ?? status}`);

  const trackName =
    status === 'solved' || status === 'revealed'
      ? track.names.original
      : track.names.safe;

  const serbianName =
    status === 'solved' || status === 'revealed' ? track.names.serbian : null;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/track/${track.id}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
        }}
      >
        {/* Cover */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '100%', // 1:1 aspect ratio
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
          }}
        >
          {!imgError ? (
            <Box
              component="img"
              src={coverUrl}
              alt={trackName}
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
                background: 'linear-gradient(135deg, rgba(110, 155, 255, 0.15), rgba(255, 124, 200, 0.15))',
              }}
            >
              <MusicNoteRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
            </Box>
          )}

          {/* Badges overlay */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            {showNew && (
              <Chip
                size="small"
                color="primary"
                icon={<NewReleasesRoundedIcon sx={{ fontSize: 14 }} />}
                label={tPages('home.tracks.new')}
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            )}
            {hasUserProgress && (
              <Chip
                size="small"
                color={statusColorMap[status]}
                icon={statusIconMap[status] ?? undefined}
                label={statusLabel}
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            )}
          </Stack>

          {/* Difficulty overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 1,
              px: 1,
              py: 0.25,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'warning.main', letterSpacing: 1 }}
            >
              {getDifficultyStars(track.difficulty)}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {trackName}
          </Typography>

          {serbianName && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.25,
              }}
            >
              {serbianName}
            </Typography>
          )}

          {attempts > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {tPages('home.tracks.attempts')}: {attempts}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
