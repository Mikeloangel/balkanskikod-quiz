import type { Track } from '@/shared/models';
import { Paper, Typography, Stack, Chip, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


type LastSolvedBlockProps = {
  lastSolved: Track[];
};

export const LastSolvedBlock = ({ lastSolved }: LastSolvedBlockProps) => {
  const { t } = useTranslation('pages');
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={1}>
        {t('home.lastSolved.title')}
      </Typography>
      {lastSolved.length === 0 ? (
        <Alert severity="info">{t('home.lastSolved.empty')}</Alert>
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