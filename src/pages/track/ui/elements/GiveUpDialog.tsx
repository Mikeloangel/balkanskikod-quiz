import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { useTranslation } from 'react-i18next';

type GiveUpDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const GiveUpDialog = ({ open, onClose, onConfirm }: GiveUpDialogProps) => {
  const { t } = useTranslation('tracks');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            backgroundImage: 'none',
          },
        },
      }}
    >
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ py: 1 }}>
          <FlagRoundedIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.8 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {t('giveUpTitle')}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {t('giveUpDescription')}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ width: '100%', pt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('notNow')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={onConfirm}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('showAnswer')}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
