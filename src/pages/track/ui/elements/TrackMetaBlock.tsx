import { Link as RouterLink } from 'react-router-dom';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import IconButton from '@mui/material/IconButton';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type TrackNavTarget = {
  id: string;
} | null;

type TrackMetaBlockProps = {
  pageTitle: string;
  showSolvedIcon: boolean;
  difficultyStars: string;
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
  previousTrack,
  nextTrack,
  openedHints,
  revealedSerbianTitle,
  serbianTitle,
}: TrackMetaBlockProps) => {
  const { t } = useTranslation('tracks');
  
  return (
  <>
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h5">{pageTitle}</Typography>
        {showSolvedIcon ? (
          <CheckCircleRoundedIcon color="success" fontSize="small" />
        ) : null}
      </Stack>
      
      <Stack direction="row" spacing={1}>
        <IconButton
          component={RouterLink}
          to={previousTrack ? `/track/${previousTrack.id}` : '#'}
          disabled={!previousTrack}
          color="inherit"
          size="small"
        >
          <NavigateBeforeRoundedIcon />
        </IconButton>
        <IconButton
          component={RouterLink}
          to={nextTrack ? `/track/${nextTrack.id}` : '#'}
          disabled={!nextTrack}
          color="inherit"
          size="small"
        >
          <NavigateNextRoundedIcon />
        </IconButton>
      </Stack>
    </Stack>

    <Typography color="text.secondary">{t('difficulty')}: {difficultyStars}</Typography>

    {openedHints.length > 0 ? (
      <Box>
        <Typography color="text.secondary" mb={0.5}>
          {t('openedHints')}
        </Typography>
        <Stack spacing={0.5}>
          {openedHints.map((hint) => (
            <Typography key={hint}>- {hint}</Typography>
          ))}
        </Stack>
      </Box>
    ) : null}

    {revealedSerbianTitle ? (
      <Typography color="text.secondary">{t('explicitHintRevealed')} {serbianTitle}</Typography>
    ) : null}
  </>
);
};

