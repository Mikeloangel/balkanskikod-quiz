import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Paper, Stack, Typography } from '@mui/material';

export const TrackNotFound = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Трек не найден</Typography>
        <Typography color="text.secondary">
          Проверь ссылку или вернись на главную.
        </Typography>
        <Button component={RouterLink} to="/">
          На главную
        </Button>
      </Stack>
    </Paper>
  </Container>
);

