import type { Track } from '@/shared/models';
import { Paper, Typography, Stack, Chip, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';


type LastSolvedBlockProps = {
  lastSolved: Track[];
};

export const LastSolvedBlock = ({ lastSolved }: LastSolvedBlockProps) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={1}>
        Последние угаданные
      </Typography>
      {lastSolved.length === 0 ? (
        <Alert severity="info">Пока пусто. Угадай хотя бы один трек.</Alert>
      ) : (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {lastSolved.map((track) => (
            <Chip
              key={track.id}
              label={track.names.serbian}
              color="success"
              variant="outlined"
              component={RouterLink}
              to={`/track/${track.id}`}
              clickable
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
};