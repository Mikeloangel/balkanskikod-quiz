import { Box, Slider, IconButton, Popover } from '@mui/material';
import { VolumeDown, VolumeUp, VolumeOff } from '@mui/icons-material';
import { useRadio } from '@/shared/contexts';
import { useState, useRef } from 'react';

export const VolumeControl: React.FC = () => {
  const { state, setVolume } = useRadio();
  const [previousVolume, setPreviousVolume] = useState(state.volume || 0.7);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const handleToggleMute = () => {
    if (state.volume > 0) {
      setPreviousVolume(state.volume);
      setVolume(0);
    } else {
      setVolume(previousVolume);
    }
  };

  const getVolumeIcon = () => {
    if (state.volume === 0) return <VolumeOff />;
    if (state.volume < 0.5) return <VolumeDown />;
    return <VolumeUp />;
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        size="small"
        onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
        onDoubleClick={handleToggleMute}
        sx={{
          color: 'text.secondary',
          padding: 0.5,
          '&:hover': { color: 'text.primary' },
        }}
      >
        {getVolumeIcon()}
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 1.5,
              pb: 1,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Slider
            value={state.volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.05}
            orientation="vertical"
            size="small"
            sx={{
              color: 'text.secondary',
              '& .MuiSlider-thumb': { width: 12, height: 12 },
            }}
          />
        </Box>
      </Popover>
    </>
  );
};
