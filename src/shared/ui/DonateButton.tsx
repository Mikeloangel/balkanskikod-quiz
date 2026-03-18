import { Tooltip, Button } from '@mui/material';
import { TelegramIcon } from './icons/TelegramIcon';
import { useTranslation } from 'react-i18next';
import { DONATE_URL, isDonateEnabled } from '@/shared/config/donate';

export const DonateButton: React.FC = () => {
  const { t } = useTranslation('common');

  if (!isDonateEnabled()) return null;

  return (
    <Tooltip title={t('donate.tooltip')}>
      <Button
        component="a"
        href={DONATE_URL}
        target="_blank"
        rel="noreferrer"
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={<TelegramIcon sx={{ fontSize: 16 }} />}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        {t('donate.button')}
      </Button>
    </Tooltip>
  );
};
