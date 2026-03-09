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
import { useAudioState } from '@/shared/contexts';

type AudioPlayerBlockProps = {
  isFinished: boolean;
  formatAudioTime: (value: number) => string;
};

export const AudioPlayerBlock = ({
  isFinished,
  formatAudioTime,
}: AudioPlayerBlockProps) => {
  const { state, actions } = useAudioState();

  const handleTogglePlayback = () => {
    if (state.isPlaying) {
      actions.pause();
    } else {
      actions.play();
    }
  };

  const handleRestart = () => {
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
          <ButtonGroup fullWidth variant="contained" aria-label="Управление плеером">
            <Button onClick={handleTogglePlayback}>
              {state.isPlaying ? 'Пауза' : 'Старт'}
            </Button>
            <Button color="secondary" onClick={handleRestart}>
              С начала
            </Button>
          </ButtonGroup>

          {isFinished ? (
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
          ) : null}
        </Stack>
      </Paper>
    </>
  );
};
