import { Box, Paper, useTheme, useMediaQuery, Alert } from '@mui/material';
import { useRadio } from '@/shared/contexts';
import { TrackInfo } from './TrackInfo';
import { PlayControls } from './PlayControls';
import { VolumeControl } from './VolumeControl';
import { ProgressBar } from './ProgressBar';

export const RadioWidget: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        height: isMobile ? 120 : 80,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: 'rgba(25, 25, 25, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: isMobile ? 1 : 2,
        gap: 2,
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

      {isMobile ? (
        // Мобильная верстка - две строки
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
          {/* Первая строка: Play/Pause, название трека, кнопка SUNO */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <PlayControls />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TrackInfo />
            </Box>
          </Box>
          
          {/* Вторая строка: громкость и прогресс */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 2,
            width: '100%',
          }}>
            <VolumeControl />
            <ProgressBar />
          </Box>
        </Box>
      ) : (
        // Десктопная верстка - одна строка
        <>
          <PlayControls />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TrackInfo />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: isMobile ? 'space-between' : 'center', 
            gap: 2,
            minWidth: isMobile ? 200 : 300,
          }}>
            <VolumeControl />
            <ProgressBar />
          </Box>
        </>
      )}
    </Paper>
  );
};
