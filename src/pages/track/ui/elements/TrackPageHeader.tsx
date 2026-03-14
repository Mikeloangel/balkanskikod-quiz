import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { LanguageSelector } from '@/shared/i18n';

type TrackPageHeaderProps = {
  pageTitle: string;
};

export const TrackPageHeader = ({ pageTitle }: TrackPageHeaderProps) => (
  <Stack spacing={1}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h4" fontWeight={700}>
        Balkanski kod
      </Typography>
      <LanguageSelector />
    </Stack>
    <Typography>
      <Link component={RouterLink} to="/" underline="hover">
        На главную
      </Link>{' '}
      / {pageTitle}
    </Typography>
  </Stack>
);

