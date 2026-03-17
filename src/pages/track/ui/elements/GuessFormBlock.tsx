import { IconButton, InputAdornment, Stack, TextField, Tooltip, Button } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
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
    <Stack spacing={1}>
      <TextField
        fullWidth
        size="small"
        placeholder={`${t('attempt')} #${attemptNumber}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSubmit();
          }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={onSubmit}
                  color="primary"
                  edge="end"
                  disabled={!value.trim()}
                >
                  <SendRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack direction="row" spacing={1} justifyContent="center">
        {showHintButton && (
          <Tooltip title={hintButtonLabel}>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={onHint}
              startIcon={<LightbulbRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {hintButtonLabel}
            </Button>
          </Tooltip>
        )}
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onGiveUp}
          startIcon={<FlagRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('giveUp')}
        </Button>
      </Stack>
    </Stack>
  );
};
