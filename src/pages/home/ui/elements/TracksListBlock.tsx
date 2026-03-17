import { useState, useMemo } from 'react';
import { getTrackProgressSafe } from '@/entities/progress';
import type { StorageSchema } from '@/entities/progress';
import type { Track } from '@/shared/models';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TrackCard } from './TrackCard';

type TrackFilter = 'all' | 'solved' | 'unsolved';

type TracksListBlockProps = {
  tracks: Track[];
  storage: StorageSchema;
};

export const TracksListBlock = ({ tracks, storage }: TracksListBlockProps) => {
  const { t: tPages } = useTranslation('pages');
  const [filter, setFilter] = useState<TrackFilter>('all');

  const filteredTracks = useMemo(() => {
    if (filter === 'all') return tracks;

    return tracks.filter((track) => {
      const progress = getTrackProgressSafe(storage, track.id);
      const status = progress?.status ?? 'not_started';
      const isSolved = status === 'solved' || status === 'revealed';
      return filter === 'solved' ? isSolved : !isSolved;
    });
  }, [tracks, storage, filter]);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
        mb={2}
      >
        <Typography variant="h6">
          {tPages('home.tracks.title')}
        </Typography>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, value: TrackFilter | null) => {
            if (value) setFilter(value);
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              fontSize: { xs: '0.7rem', sm: '0.8rem' },
              textTransform: 'none',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="all">
            {tPages('home.tracks.filterAll')}
          </ToggleButton>
          <ToggleButton value="solved">
            {tPages('home.tracks.filterSolved')}
          </ToggleButton>
          <ToggleButton value="unsolved">
            {tPages('home.tracks.filterUnsolved')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {filteredTracks.map((track) => (
          <TrackCard key={track.id} track={track} storage={storage} />
        ))}
      </Box>

      {filteredTracks.length === 0 && (
        <Typography
          color="text.secondary"
          sx={{ textAlign: 'center', py: 4 }}
        >
          {filter === 'solved'
            ? tPages('home.lastSolved.empty')
            : '—'}
        </Typography>
      )}
    </Box>
  );
};
