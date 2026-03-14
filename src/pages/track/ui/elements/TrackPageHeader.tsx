import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/shared/i18n';

type TrackPageHeaderProps = {
  pageTitle: string;
};

export const TrackPageHeader = ({ pageTitle }: TrackPageHeaderProps) => {
  const { t } = useTranslation('tracks');
  
  return (
  <Stack spacing={1}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h4" fontWeight={700}>
        Balkanski kod
      </Typography>
      <LanguageSelector />
    </Stack>
    <Typography>
      <Link component={RouterLink} to="/" underline="hover">
        {t('breadcrumbsHome')}
      </Link>{' '}
      / {pageTitle}
    </Typography>
  </Stack>
);
};

