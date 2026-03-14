import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type GiveUpDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const GiveUpDialog = ({ open, onClose, onConfirm }: GiveUpDialogProps) => {
  const { t } = useTranslation('tracks');
  
  return (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>{t('giveUpTitle')}</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" sx={{ pt: 1 }}>
        {t('giveUpDescription')}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">
        {t('notNow')}
      </Button>
      <Button onClick={onConfirm}>{t('showAnswer')}</Button>
    </DialogActions>
  </Dialog>
);
};

