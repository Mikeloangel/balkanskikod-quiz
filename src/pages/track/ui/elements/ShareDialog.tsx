import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

type ShareDialogProps = {
  open: boolean;
  onClose: () => void;
  payload: SharePayload;
  hasWebShare: boolean;
  feedback: string | null;
  onCopy: () => void;
};

export const ShareDialog = ({
  open,
  onClose,
  payload,
  hasWebShare,
  feedback,
  onCopy,
}: ShareDialogProps) => {
  const { t } = useTranslation('tracks');
  
  return (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{t('shareTitle')}</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            background:
              'linear-gradient(145deg, rgba(110,155,255,0.08) 0%, rgba(255,124,200,0.08) 100%)',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              {t('sharePreview')}
            </Typography>
            <Typography variant="h6">{payload.title}</Typography>
            <Typography>{payload.text}</Typography>
            <Typography variant="body2" color="text.secondary">
              {payload.url}
            </Typography>
            <Typography color="text.secondary">
              Web Share API: {hasWebShare ? t('webShareAvailable') : t('webShareNotAvailable')}
            </Typography>
          </Stack>
        </Paper>

        <TextField
          label={t('shareLinkCopy')}
          value={payload.url}
          fullWidth
          inputProps={{ readOnly: true }}
          onClick={onCopy}
        />

        {feedback ? <Alert severity="info">{feedback}</Alert> : null}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">
        {t('close')}
      </Button>
      <Button onClick={onCopy} color="secondary">
        {t('copyLink')}
      </Button>
    </DialogActions>
  </Dialog>
);
};

