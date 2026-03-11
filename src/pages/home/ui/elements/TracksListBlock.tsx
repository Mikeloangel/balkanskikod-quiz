import { getTrackProgressSafe, isTrackNew } from '@/entities/progress';
import type { StorageSchema, TrackProgressStatus } from '@/entities/progress';
import type { Track } from '@/shared/models';
import { Paper, Typography, Stack, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import NotStartedRoundedIcon from '@mui/icons-material/NotStartedRounded';


const statusLabelMap = {
  not_started: 'Не начат',
  in_progress: 'В процессе',
  solved: 'Угадан',
  revealed: 'Раскрыт',
} as const;

const getDifficultyStars = (difficulty: number): string =>
  '★'.repeat(difficulty).padEnd(5, '☆');

type TracksListBlockProps = {
  tracks: Track[];
  storage: StorageSchema;
};

export const TracksListBlock = ({ tracks, storage }: TracksListBlockProps) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Треки
      </Typography>

      <Stack spacing={1.5}>
        {tracks.map((track) => {
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

          return (
            <Paper key={track.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={1}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {showNew ? (
                      <Tooltip title="Новое">
                        <Chip size="small" color="primary" icon={<NewReleasesRoundedIcon sx={{ fontSize: 16 }} />} />
                      </Tooltip>
                    ) : null}
                    {hasUserProgress ? (
                      <Tooltip title={statusLabelMap[status]}>
                        <Chip
                          size="small"
                          icon={
                            status === 'solved'
                              ? <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                              : status === 'revealed'
                                ? <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                : status === 'in_progress'
                                  ? <PendingRoundedIcon sx={{ fontSize: 16 }} />
                                  : <NotStartedRoundedIcon sx={{ fontSize: 16 }} />
                          }
                          color={
                            status === 'solved'
                              ? 'success'
                              : status === 'revealed'
                                ? 'warning'
                                : status === 'in_progress'
                                  ? 'info'
                                  : 'default'
                          }
                        />
                      </Tooltip>
                    ) : null}
                    <Typography
                      variant="h6"
                      component={RouterLink}
                      to={`/track/${track.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: 'primary.main'
                        }
                      }}
                    >
                      {status === 'solved' || status === 'revealed' ? (
                        <>
                          {track.names.original} <span style={{ fontSize: '12px', fontWeight: 300 }}>{track.names.serbian}</span>
                        </>
                      ) : (
                        track.names.safe
                      )}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary">
                    {!hasUserProgress ? `Статус: ${statusLabelMap[status]} | ` : ''}
                    Сложность:{' '}
                    {getDifficultyStars(track.difficulty)}
                    {attempts > 0 ? ` | Попыток: ${attempts}` : ''}
                  </Typography>
                </Box>

                <IconButton component={RouterLink} to={`/track/${track.id}`}>
                  <ArrowForwardRoundedIcon />
                </IconButton>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
};