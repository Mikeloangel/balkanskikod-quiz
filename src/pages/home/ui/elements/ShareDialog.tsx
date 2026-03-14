import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
  Paper,
  TextField,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type ShareDialogProps = {
  open: boolean;
  onClose: () => void;
  sharePayload: { url: string; title: string; text: string };
  hasWebShare: boolean;
  onShare: () => void;
  onManualCopy: () => void;
  feedback: string | null;
};

export const ShareDialog = ({
  open,
  onClose,
  sharePayload,
  hasWebShare,
  onShare,
  onManualCopy,
  feedback,
}: ShareDialogProps) => {
  const { t } = useTranslation('home');
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('shareProject')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            {t('sharePreview')}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('title')}: {sharePayload.title}</Typography>
              <Typography variant="subtitle2">{t('text')}: {sharePayload.text}</Typography>
              <Typography variant="subtitle2">{t('url')}: {sharePayload.url}</Typography>
              <Typography color="text.secondary">
                Web Share API: {hasWebShare ? t('webShareAvailable') : t('webShareNotAvailable')}
              </Typography>
            </Stack>
          </Paper>

          <TextField
            label={t('linkForManualCopy')}
            value={sharePayload.url}
            fullWidth
            inputProps={{ readOnly: true }}
          />

          {feedback ? <Alert severity="info">{feedback}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('close')}
        </Button>
        <Button onClick={onManualCopy} color="secondary">
          {t('copyLink')}
        </Button>
        <Button onClick={onShare}>{t('share')}</Button>
      </DialogActions>
    </Dialog>
  );
};