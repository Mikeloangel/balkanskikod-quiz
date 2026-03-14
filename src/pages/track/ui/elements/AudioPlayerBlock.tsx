import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAudioState } from '@/shared/contexts';

type AudioPlayerBlockProps = {
  formatAudioTime: (value: number) => string;
  onPlay?: () => void;
};

export const AudioPlayerBlock = ({
  formatAudioTime,
  onPlay,
}: AudioPlayerBlockProps) => {
  const { t } = useTranslation('tracks');
  const { state, actions } = useAudioState();

  const handleTogglePlayback = () => {
    if (state.isPlaying) {
      actions.pause();
    } else {
      onPlay?.();
      actions.play();
    }
  };

  const handleRestart = () => {
    onPlay?.();
    actions.setCurrentTime(0);
    actions.play();
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    const seekTime = Array.isArray(value) ? value[0] : value;
    actions.setCurrentTime(seekTime);
  };

  return (
    <>
      {state.error ? <Alert severity="error">{state.error}</Alert> : null}
      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack spacing={1}>
          <ButtonGroup fullWidth variant="contained" aria-label={t('playerControls')}>
            <Button onClick={handleTogglePlayback}>
              {state.isPlaying ? t('pause') : t('start')}
            </Button>
            <Button color="secondary" onClick={handleRestart}>
              {t('fromBeginning')}
            </Button>
          </ButtonGroup>

          <Box>
            <Slider
              size="small"
              min={0}
              max={state.duration || 1}
              step={0.1}
              value={Math.min(state.currentTime, state.duration || 1)}
              onChange={handleSeek}
              disabled={state.duration <= 0}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                {formatAudioTime(state.currentTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatAudioTime(state.duration)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </>
  );
};
