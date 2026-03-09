import { Box, IconButton, Tooltip } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useRadio } from '@/shared/contexts';

export const PlayControls: React.FC = () => {
  const { state, play, pause } = useRadio();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={state.isPlaying ? 'Пауза' : 'Играть'}>
        <IconButton
          onClick={state.isPlaying ? pause : play}
          sx={{
            color: 'primary.main',
            backgroundColor: 'rgba(144, 202, 249, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.2)',
            },
            width: 40,
            height: 40,
          }}
        >
          {state.isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
