import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type ResetDialogProps = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
};

export const ResetDialog = ({ open, onClose, onReset }: ResetDialogProps) => {
  const { t } = useTranslation('common');
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('resetDialog.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ pt: 1 }}>
          <Typography>
            {t('resetDialog.description')}
          </Typography>
          <Typography color="text.secondary">
            {t('resetDialog.itemStatuses')}
          </Typography>
          <Typography color="text.secondary">{t('resetDialog.itemAttempts')}</Typography>
          <Typography color="text.secondary">{t('resetDialog.itemHints')}</Typography>
          <Typography color="warning.main" fontWeight={600}>
            {t('resetDialog.warning')}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('resetDialog.cancel')}
        </Button>
        <Button color="error" onClick={onReset}>
          {t('resetDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};