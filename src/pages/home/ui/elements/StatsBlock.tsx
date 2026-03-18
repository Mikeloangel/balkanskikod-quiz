import type { GlobalStats } from '@/entities/progress';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LibraryMusicRoundedIcon from '@mui/icons-material/LibraryMusicRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

type StatTile = {
  icon: React.ReactElement;
  value: number | string;
  label: string;
  color?: string;
};

type StatsBlockProps = {
  stats: GlobalStats;
};

export const StatsBlock = ({ stats }: StatsBlockProps) => {
  const { t } = useTranslation('pages');

  const tiles: StatTile[] = [
    {
      icon: <CheckCircleRoundedIcon />,
      value: stats.solvedTracks,
      label: t('home.statistics.solvedTracks'),
      color: 'success.main',
    },
    {
      icon: <VisibilityRoundedIcon />,
      value: stats.revealedTracks,
      label: t('home.statistics.revealedTracks'),
      color: 'warning.main',
    },
    {
      icon: <PendingRoundedIcon />,
      value: stats.inProgressTracks,
      label: t('home.statistics.inProgressTracks'),
      color: 'info.main',
    },
    {
      icon: <LibraryMusicRoundedIcon />,
      value: stats.totalTracks,
      label: t('home.statistics.totalTracks'),
    },
    {
      icon: <PercentRoundedIcon />,
      value: `${stats.solveRatePercent}%`,
      label: t('home.statistics.solveRatePercent'),
    },
    {
      icon: <TrackChangesRoundedIcon />,
      value: stats.averageAttempts,
      label: t('home.statistics.averageAttempts'),
    },
    {
      icon: <BoltRoundedIcon />,
      value: stats.solvedWithoutHints,
      label: t('home.statistics.solvedWithoutHints'),
    },
    {
      icon: <TranslateRoundedIcon />,
      value: stats.solvedWithSerbianHint,
      label: t('home.statistics.solvedWithSerbianHint'),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: { xs: 0.75, sm: 1.5 },
      }}
    >
      {tiles.map((tile) => (
        <Box
          key={tile.label}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 0.25, sm: 0.5 },
            py: { xs: 1, sm: 2 },
            px: { xs: 0.5, sm: 1 },
            borderRadius: { xs: 1.5, sm: 2 },
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              color: tile.color ?? 'text.secondary',
              display: 'flex',
              '& .MuiSvgIcon-root': { fontSize: { xs: 18, sm: 24 } },
            }}
          >
            {tile.icon}
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              fontSize: { xs: '1rem', sm: '1.5rem' },
              color: tile.color ?? 'text.primary',
            }}
          >
            {tile.value}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              lineHeight: 1.2,
              fontSize: { xs: '0.6rem', sm: '0.75rem' },
            }}
          >
            {tile.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
