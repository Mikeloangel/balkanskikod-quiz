import { Button, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
}: GuessFormBlockProps) => {
  const { t } = useTranslation('tracks');
  
  return (
  <Stack spacing={1.5}>
    <TextField
      fullWidth
      label={`${t('attempt')} #${attemptNumber}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onSubmit();
        }
      }}
    />

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Button onClick={onSubmit}>{t('submit')}</Button>
      {showHintButton ? (
        <Button color="secondary" onClick={onHint}>
          {hintButtonLabel}
        </Button>
      ) : null}
      <Button color="error" onClick={onGiveUp}>
        {t('giveUp')}
      </Button>
    </Stack>
  </Stack>
);
};

