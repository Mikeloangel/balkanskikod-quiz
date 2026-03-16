import { Box, Typography } from '@mui/material';
import { useRadio } from '@/shared/contexts';

const PROGRESS_HEIGHT = 5;
const PROGRESS_COLOR = '#7c4dff'; // фиолетово-синий

const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ProgressBar: React.FC = () => {
  const { state } = useRadio();
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: PROGRESS_HEIGHT,
        backgroundColor: 'rgba(124, 77, 255, 0.15)',
      }}
    >
      {/* Заполненная полоска */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${progress}%`,
          backgroundColor: PROGRESS_COLOR,
          transition: 'width 0.3s linear',
        }}
      />

      {/* Время — справа над полоской */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          right: 8,
          bottom: '100%',
          mb: '2px',
          color: 'text.secondary',
          fontSize: '0.65rem',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {formatTime(state.currentTime)}/{formatTime(state.duration)}
      </Typography>
    </Box>
  );
};
