import { Box, Slider, IconButton } from '@mui/material';
import { VolumeDown, VolumeUp, VolumeOff } from '@mui/icons-material';
import { useRadio } from '@/shared/contexts';
import { useState } from 'react';

export const VolumeControl: React.FC = () => {
  const { state, setVolume } = useRadio();
  const [previousVolume, setPreviousVolume] = useState(0.7);

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const handleVolumeDownClick = () => {
    if (state.volume > 0) {
      setPreviousVolume(state.volume);
      setVolume(0);
    }
  };

  const handleVolumeUpClick = () => {
    if (state.volume === 0) {
      setVolume(previousVolume);
    } else {
      setVolume(1);
    }
  };

  const getVolumeIcon = () => {
    if (state.volume === 0) return <VolumeOff />;
    return <VolumeDown />;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
      <IconButton
        size="small"
        onClick={handleVolumeDownClick}
        sx={{
          color: 'text.secondary',
          padding: 0.5,
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        {getVolumeIcon()}
      </IconButton>
      
      <Slider
        value={state.volume}
        onChange={handleVolumeChange}
        min={0}
        max={1}
        step={0.1}
        size="small"
        sx={{
          color: 'text.secondary',
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
          },
          flex: 1,
        }}
      />
      
      <IconButton
        size="small"
        onClick={handleVolumeUpClick}
        sx={{
          color: 'text.secondary',
          padding: 0.5,
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        <VolumeUp />
      </IconButton>
    </Box>
  );
};
