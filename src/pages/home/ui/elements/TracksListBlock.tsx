import { getTrackProgressSafe, isTrackNew } from '../../../../entities/progress/model/stats';
import type { StorageSchema, TrackProgressStatus } from '../../../../entities/progress/model/types';
import type { Track } from '@/shared/types/track';
import { Paper, Typography, Stack, Box, Button, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';


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
                    <Typography variant="h6">{track.names.safe}</Typography>
                    {showNew ? (
                      <Chip size="small" color="primary" label="Новое" />
                    ) : null}
                    {hasUserProgress ? (
                      <Chip
                        size="small"
                        label={statusLabelMap[status]}
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
                    ) : null}
                  </Stack>
                  <Typography color="text.secondary">
                    {!hasUserProgress ? `Статус: ${statusLabelMap[status]} | ` : ''}
                    Сложность:{' '}
                    {getDifficultyStars(track.difficulty)} | Попыток:{' '}
                    {attempts}
                  </Typography>
                </Box>

                <Button component={RouterLink} to={`/track/${track.id}`}>
                  Открыть
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
};