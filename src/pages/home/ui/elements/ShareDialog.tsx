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
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Поделиться проектом</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Ниже превью того, что пойдет в системный диалог шаринга.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Title: {sharePayload.title}</Typography>
              <Typography variant="subtitle2">Text: {sharePayload.text}</Typography>
              <Typography variant="subtitle2">URL: {sharePayload.url}</Typography>
              <Typography color="text.secondary">
                Web Share API: {hasWebShare ? 'доступен' : 'недоступен, будет копирование'}
              </Typography>
            </Stack>
          </Paper>

          <TextField
            label="Ссылка для ручного копирования"
            value={sharePayload.url}
            fullWidth
            inputProps={{ readOnly: true }}
          />

          {feedback ? <Alert severity="info">{feedback}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Закрыть
        </Button>
        <Button onClick={onManualCopy} color="secondary">
          Скопировать ссылку
        </Button>
        <Button onClick={onShare}>Поделиться</Button>
      </DialogActions>
    </Dialog>
  );
};