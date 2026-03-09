import { Box, Typography, Tooltip, Button } from '@mui/material';
import { AutoAwesomeRounded } from '@mui/icons-material';
import { useRadio } from '@/shared/contexts';

export const TrackInfo: React.FC = () => {
  const { currentTrack, openTrackInSuno } = useRadio();

  if (!currentTrack) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentTrack.names.original}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentTrack.names.serbian}
        </Typography>
      </Box>
      
      <Tooltip title="Открыть в Suno">
        <Button
          size="small"
          onClick={openTrackInSuno}
          variant="outlined"
          color="secondary"
          startIcon={<AutoAwesomeRounded />}
          sx={{
            fontWeight: 700,
            minWidth: 'auto',
            padding: '4px 8px',
          }}
        >
          SUNO
        </Button>
      </Tooltip>
    </Box>
  );
};
