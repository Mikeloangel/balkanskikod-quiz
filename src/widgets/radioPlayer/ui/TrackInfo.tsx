import { Box, Typography } from '@mui/material';
import { useRadio } from '@/shared/contexts';

export const TrackInfo: React.FC = () => {
  const { currentTrack } = useRadio();

  if (!currentTrack) {
    return null;
  }

  return (
    <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
      <Typography
        variant="body2"
        sx={{
          color: 'text.primary',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
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
          display: 'block',
        }}
      >
        {currentTrack.names.serbian}
      </Typography>
    </Box>
  );
};
