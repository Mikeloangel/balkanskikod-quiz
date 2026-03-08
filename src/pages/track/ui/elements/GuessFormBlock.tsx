import { Button, Stack, TextField } from '@mui/material';

type GuessFormBlockProps = {
  attemptNumber: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  showHintButton: boolean;
  hintButtonLabel: string;
  onHint: () => void;
  onGiveUp: () => void;
};

export const GuessFormBlock = ({
  attemptNumber,
  value,
  onChange,
  onSubmit,
  showHintButton,
  hintButtonLabel,
  onHint,
  onGiveUp,
}: GuessFormBlockProps) => (
  <Stack spacing={1.5}>
    <TextField
      fullWidth
      label={`Попытка #${attemptNumber}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onSubmit();
        }
      }}
    />

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Button onClick={onSubmit}>Отправить</Button>
      {showHintButton ? (
        <Button color="secondary" onClick={onHint}>
          {hintButtonLabel}
        </Button>
      ) : null}
      <Button color="error" onClick={onGiveUp}>
        Сдаться
      </Button>
    </Stack>
  </Stack>
);

