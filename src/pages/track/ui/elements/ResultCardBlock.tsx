import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type ResultCardBlockProps = {
  attemptsCount: number;
  hintsUsedCount: number;
  revealedSerbianTitle: boolean;
  sunoUrl: string;
  onOpenShare: () => void;
};

export const ResultCardBlock = ({
  attemptsCount,
  hintsUsedCount,
  revealedSerbianTitle,
  sunoUrl,
  onOpenShare,
}: ResultCardBlockProps) => {
  const { t } = useTranslation('tracks');

  return (
    <Stack spacing={1.5}>
      {/* Stats mini-tiles */}
      <Stack direction="row" spacing={1} justifyContent="center">
        <StatTile label={t('attempts')} value={attemptsCount} />
        <StatTile label={t('hintsUsed')} value={hintsUsedCount} />
        <StatTile
          label={t('explicitHint')}
          value={revealedSerbianTitle ? t('yes') : t('no')}
        />
      </Stack>

      {/* Action buttons — compact row */}
      <Stack direction="row" spacing={1} justifyContent="center">
        {sunoUrl && (
          <Button
            component="a"
            href={sunoUrl}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Suno
          </Button>
        )}
        <IconButton
          onClick={onOpenShare}
          sx={{
            background: 'linear-gradient(135deg, rgba(110,155,255,0.9), rgba(255,124,200,0.9))',
            color: '#0f1115',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(110,155,255,1), rgba(255,124,200,1))',
            },
          }}
        >
          <ShareRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      px: 1.5,
      py: 1,
      borderRadius: 1.5,
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid',
      borderColor: 'divider',
      minWidth: 70,
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, textAlign: 'center' }}>
      {label}
    </Typography>
  </Box>
);
