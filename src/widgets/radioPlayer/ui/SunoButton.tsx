import { Tooltip, Button } from '@mui/material';
import { AutoAwesomeRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRadio } from '@/shared/contexts';

export const SunoButton: React.FC = () => {
  const { t } = useTranslation('radio');
  const { openTrackInSuno } = useRadio();

  return (
    <Tooltip title={t('openInSuno')}>
      <Button
        size="small"
        onClick={openTrackInSuno}
        variant="outlined"
        color="secondary"
        startIcon={<AutoAwesomeRounded />}
        sx={{
          fontWeight: 700,
          minWidth: 'auto',
          padding: '4px 8px',
          flexShrink: 0,
        }}
      >
        SUNO
      </Button>
    </Tooltip>
  );
};
