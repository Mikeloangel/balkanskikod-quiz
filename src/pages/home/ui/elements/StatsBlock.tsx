import type { GlobalStats } from '@/entities/progress/model/stats';
import { Paper, Typography, Stack, Chip } from '@mui/material';

type StatsBlockProps = {
  stats: GlobalStats;
};

export const StatsBlock = ({ stats }: StatsBlockProps) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Статистика
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={`Всего треков: ${stats.totalTracks}`} />
        <Chip color="success" label={`Угадано: ${stats.solvedTracks}`} />
        <Chip color="warning" label={`Не угадано: ${stats.revealedTracks}`} />
        <Chip color="info" label={`В процессе: ${stats.inProgressTracks}`} />
        <Chip label={`Точность: ${stats.solveRatePercent}%`} />
        <Chip label={`Ср. попыток: ${stats.averageAttempts}`} />
        <Chip label={`Без подсказок: ${stats.solvedWithoutHints}`} />
        <Chip label={`С явной подсказкой: ${stats.solvedWithSerbianHint}`} />
      </Stack>
    </Paper>
  );
};