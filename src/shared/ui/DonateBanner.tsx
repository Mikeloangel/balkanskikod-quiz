import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DONATE_URL, isDonateEnabled } from '@/shared/config/donate';
import { TelegramIcon } from './icons/TelegramIcon';

export const DonateBanner: React.FC = () => {
  const { t } = useTranslation('common');

  if (!isDonateEnabled()) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {t('donate.bannerText')}
        </Typography>
        <Button
          component="a"
          href={DONATE_URL}
          target="_blank"
          rel="noreferrer"
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<TelegramIcon sx={{ fontSize: 14 }} />}
          sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
        >
          {t('donate.button')}
        </Button>
      </Stack>
    </Box>
  );
};
