import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

type GiveUpDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const GiveUpDialog = ({ open, onClose, onConfirm }: GiveUpDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Сдаться и показать ответ?</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" sx={{ pt: 1 }}>
        Можно продолжать попытки, а можно открыть ответ прямо сейчас.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">
        Не сейчас
      </Button>
      <Button onClick={onConfirm}>Ок, показать ответ</Button>
    </DialogActions>
  </Dialog>
);

