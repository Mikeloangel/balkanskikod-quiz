import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const TrackNotFound = () => {
  const { t } = useTranslation('tracks');
  
  return (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">{t('trackNotFound')}</Typography>
        <Typography color="text.secondary">
          {t('trackNotFoundDescription')}
        </Typography>
        <Button component={RouterLink} to="/">
          {t('backToHome')}
        </Button>
      </Stack>
    </Paper>
  </Container>
);
};

