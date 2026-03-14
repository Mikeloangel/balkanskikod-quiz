import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type ResultCardBlockProps = {
  isSolved: boolean;
  serbianTitle: string;
  russianTitle: string;
  originalTitle: string;
  attemptsCount: number;
  hintsUsedCount: number;
  revealedSerbianTitle: boolean;
  sunoUrl: string;
  onOpenShare: () => void;
};

export const ResultCardBlock = ({
  isSolved,
  serbianTitle,
  russianTitle,
  originalTitle,
  attemptsCount,
  hintsUsedCount,
  revealedSerbianTitle,
  sunoUrl,
  onOpenShare,
}: ResultCardBlockProps) => {
  const { t } = useTranslation('tracks');
  
  return (
  <>
    <Divider />

    <Stack spacing={1}>
      {isSolved ? (
        <Chip color="success" label={t('solvedFairly')} />
      ) : (
        <Chip color="warning" label={t('revealedByGiveUp')} />
      )}

      <Typography>{t('serbian')}: {serbianTitle}</Typography>
      <Typography>{t('russian')}: {russianTitle}</Typography>
      <Typography>{t('original')}: {originalTitle}</Typography>

      <Typography>
        {t('attempts')}: {attemptsCount} | {t('hintsUsed')}: {hintsUsedCount} | {t('explicitHint')}:{' '}
        {revealedSerbianTitle ? t('yes') : t('no')}
      </Typography>

      {sunoUrl ? (
        <Button
          component="a"
          href={sunoUrl}
          target="_blank"
          rel="noreferrer"
          variant="outlined"
          color="secondary"
          startIcon={<AutoAwesomeRoundedIcon />}
          endIcon={<OpenInNewRoundedIcon />}
          fullWidth
          sx={{ fontWeight: 700 }}
        >
          {t('openInSuno')}
        </Button>
      ) : (
        <Typography color="text.secondary">{t('sunoLinkUnavailable')}</Typography>
      )}

      <Button
        startIcon={<ShareRoundedIcon />}
        size="large"
        onClick={onOpenShare}
        sx={{
          mt: 1,
          fontWeight: 700,
          background:
            'linear-gradient(90deg, rgba(110,155,255,1) 0%, rgba(255,124,200,1) 100%)',
          color: '#0f1115',
        }}
      >
        {t('sharePuzzle')}
      </Button>
    </Stack>
  </>
);
};

