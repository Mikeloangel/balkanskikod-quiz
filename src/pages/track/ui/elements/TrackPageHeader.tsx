import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';

type TrackPageHeaderProps = {
  pageTitle: string;
};

export const TrackPageHeader = ({ pageTitle }: TrackPageHeaderProps) => (
  <Stack spacing={1}>
    <Typography variant="h4" fontWeight={700}>
      Balkanski kod
    </Typography>
    <Typography>
      <Link component={RouterLink} to="/" underline="hover">
        На главную
      </Link>{' '}
      / {pageTitle}
    </Typography>
  </Stack>
);

