import { Box, Paper, Alert } from '@mui/material';
import { useRadio } from '@/shared/contexts';
import { PlayControls } from './PlayControls';
import { TrackInfo } from './TrackInfo';
import { VolumeControl } from './VolumeControl';
import { SunoButton } from './SunoButton';
import { CoverArt } from './CoverArt';
import { ProgressBar } from './ProgressBar';

const WIDGET_HEIGHT = 56;

export const RadioWidget: React.FC = () => {
  const { state, currentTrack, resetError } = useRadio();

  if (!currentTrack) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: 'rgba(25, 25, 25, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        transform: 'translateZ(0)', // Force GPU layer to prevent iOS scroll gap
      }}
    >
      {state.error && (
        <Alert
          severity="error"
          onClose={resetError}
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            borderRadius: 0,
          }}
        >
          {state.error}
        </Alert>
      )}

      {/* Основной ряд: Play | TrackInfo | Volume | SUNO | Artwork */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          height: WIDGET_HEIGHT,
          px: 1.5,
        }}
      >
        <PlayControls />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TrackInfo />
        </Box>

        <VolumeControl />
        <SunoButton />
        <CoverArt size={40} />
      </Box>

      {/* Прогресс-полоска внизу */}
      <ProgressBar />
    </Paper>
  );
};
