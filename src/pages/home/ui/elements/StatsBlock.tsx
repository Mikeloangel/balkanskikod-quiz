import type { GlobalStats } from '@/entities/progress';
import { Paper, Typography, Stack, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

type StatsBlockProps = {
  stats: GlobalStats;
};

export const StatsBlock = ({ stats }: StatsBlockProps) => {
  const { t } = useTranslation('pages');
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        {t('home.statistics.title')}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={`${t('home.statistics.totalTracks')}: ${stats.totalTracks}`} />
        <Chip color="success" label={`${t('home.statistics.solvedTracks')}: ${stats.solvedTracks}`} />
        <Chip color="warning" label={`${t('home.statistics.revealedTracks')}: ${stats.revealedTracks}`} />
        <Chip color="info" label={`${t('home.statistics.inProgressTracks')}: ${stats.inProgressTracks}`} />
        <Chip label={`${t('home.statistics.solveRatePercent')}: ${stats.solveRatePercent}%`} />
        <Chip label={`${t('home.statistics.averageAttempts')}: ${stats.averageAttempts}`} />
        <Chip label={`${t('home.statistics.solvedWithoutHints')}: ${stats.solvedWithoutHints}`} />
        <Chip label={`${t('home.statistics.solvedWithSerbianHint')}: ${stats.solvedWithSerbianHint}`} />
      </Stack>
    </Paper>
  );
};