import { Link as RouterLink } from 'react-router-dom';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Box, Button, Stack, Typography } from '@mui/material';

type TrackNavTarget = {
  id: string;
} | null;

type TrackMetaBlockProps = {
  pageTitle: string;
  showSolvedIcon: boolean;
  difficultyStars: string;
  showNavigation: boolean;
  previousTrack: TrackNavTarget;
  nextTrack: TrackNavTarget;
  openedHints: string[];
  revealedSerbianTitle: boolean;
  serbianTitle: string;
};

export const TrackMetaBlock = ({
  pageTitle,
  showSolvedIcon,
  difficultyStars,
  showNavigation,
  previousTrack,
  nextTrack,
  openedHints,
  revealedSerbianTitle,
  serbianTitle,
}: TrackMetaBlockProps) => (
  <>
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="h5">{pageTitle}</Typography>
      {showSolvedIcon ? (
        <CheckCircleRoundedIcon color="success" fontSize="small" />
      ) : null}
    </Stack>

    <Typography color="text.secondary">Сложность: {difficultyStars}</Typography>

    {showNavigation ? (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          component={RouterLink}
          to={previousTrack ? `/track/${previousTrack.id}` : '#'}
          disabled={!previousTrack}
          variant="outlined"
          color="inherit"
          startIcon={<NavigateBeforeRoundedIcon />}
        >
          Предыдущий трек
        </Button>
        <Button
          component={RouterLink}
          to={nextTrack ? `/track/${nextTrack.id}` : '#'}
          disabled={!nextTrack}
          variant="outlined"
          color="inherit"
          endIcon={<NavigateNextRoundedIcon />}
        >
          Следующий трек
        </Button>
      </Stack>
    ) : null}

    {openedHints.length > 0 ? (
      <Box>
        <Typography color="text.secondary" mb={0.5}>
          Открытые подсказки:
        </Typography>
        <Stack spacing={0.5}>
          {openedHints.map((hint) => (
            <Typography key={hint}>- {hint}</Typography>
          ))}
        </Stack>
      </Box>
    ) : null}

    {revealedSerbianTitle ? (
      <Typography color="text.secondary">Явная подсказка: {serbianTitle}</Typography>
    ) : null}
  </>
);

