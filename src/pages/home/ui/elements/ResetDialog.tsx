import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
} from '@mui/material';

type ResetDialogProps = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
};

export const ResetDialog = ({ open, onClose, onReset }: ResetDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Сбросить прогресс</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ pt: 1 }}>
          <Typography>
            Будет удален весь локальный игровой прогресс:
          </Typography>
          <Typography color="text.secondary">
            - статусы треков (`not_started / in_progress / solved / revealed`)
          </Typography>
          <Typography color="text.secondary">- история попыток и их количество</Typography>
          <Typography color="text.secondary">- использование подсказок и явных подсказок</Typography>
          <Typography color="warning.main" fontWeight={600}>
            Это действие нельзя отменить.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button color="error" onClick={onReset}>
          Да, удалить прогресс
        </Button>
      </DialogActions>
    </Dialog>
  );
};