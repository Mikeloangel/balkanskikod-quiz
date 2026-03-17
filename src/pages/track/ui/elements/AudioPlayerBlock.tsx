import {
  Alert,
  IconButton,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { useAudioState } from '@/shared/contexts';

type AudioPlayerBlockProps = {
  formatAudioTime: (value: number) => string;
  onPlay?: () => void;
};

export const AudioPlayerBlock = ({
  formatAudioTime,
  onPlay,
}: AudioPlayerBlockProps) => {
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
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton
          onClick={handleTogglePlayback}
          color="primary"
          size="small"
        >
          {state.isPlaying ? (
            <PauseRoundedIcon sx={{ fontSize: 28 }} />
          ) : (
            <PlayArrowRoundedIcon sx={{ fontSize: 28 }} />
          )}
        </IconButton>

        <Slider
          size="small"
          min={0}
          max={state.duration || 1}
          step={0.1}
          value={Math.min(state.currentTime, state.duration || 1)}
          onChange={handleSeek}
          disabled={state.duration <= 0}
          sx={{ flex: 1 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', minWidth: 72, textAlign: 'right' }}>
          {formatAudioTime(state.currentTime)} / {formatAudioTime(state.duration)}
        </Typography>

        <IconButton
          onClick={handleRestart}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <ReplayRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>
    </>
  );
};
