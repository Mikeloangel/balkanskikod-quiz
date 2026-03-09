import { Box, Typography } from '@mui/material';
import { useRadio } from '@/shared/contexts';

export const ProgressBar: React.FC = () => {
  const { state } = useRadio();

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', minWidth: 35, textAlign: 'right' }}
      >
        {formatTime(state.currentTime)}
      </Typography>
      
      <Box
        sx={{
          flex: 1,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'text.secondary',
            transition: 'width 0.1s ease',
          }}
        />
      </Box>
      
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', minWidth: 35 }}
      >
        {formatTime(state.duration)}
      </Typography>
    </Box>
  );
};
