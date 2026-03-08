import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { Button, Chip, Divider, Stack, Typography } from '@mui/material';

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
}: ResultCardBlockProps) => (
  <>
    <Divider />

    <Stack spacing={1}>
      {isSolved ? (
        <Chip color="success" label="Угадан честно" />
      ) : (
        <Chip color="warning" label="Раскрыт через сдачу" />
      )}

      <Typography>Сербское: {serbianTitle}</Typography>
      <Typography>Русское: {russianTitle}</Typography>
      <Typography>Оригинал: {originalTitle}</Typography>

      <Typography>
        Попытки: {attemptsCount} | Подсказок: {hintsUsedCount} | Явная подсказка:{' '}
        {revealedSerbianTitle ? 'да' : 'нет'}
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
          Открыть в SUNO
        </Button>
      ) : (
        <Typography color="text.secondary">Ссылка SUNO недоступна.</Typography>
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
        Поделиться загадкой
      </Button>
    </Stack>
  </>
);

