import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Paper,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import { tracksSortedByAddedDate } from '../../../shared/config/tracks';
import {
  readStorage,
  resetProgress,
} from '../../../entities/progress/model/storage';
import {
  getGlobalStats,
  getLastSolvedTracks,
  getTrackProgressSafe,
  isTrackNew,
} from '../../../entities/progress/model/stats';
import { shareLink } from '../../../shared/lib/share';

const statusLabelMap = {
  not_started: 'Не начат',
  in_progress: 'В процессе',
  solved: 'Угадан',
  revealed: 'Раскрыт',
} as const;

const getDifficultyStars = (difficulty: number): string =>
  '★'.repeat(difficulty).padEnd(5, '☆');

type HomePageProps = {
  onStorageUpdated: () => void;
};

export const HomePage = ({ onStorageUpdated }: HomePageProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const storage = readStorage();
  const stats = getGlobalStats(tracksSortedByAddedDate, storage);
  const lastSolved = getLastSolvedTracks(tracksSortedByAddedDate, storage, 5);
  const sharePayload = useMemo(
    () => ({
      url: window.location.origin,
      title: 'Balkanski kod',
      text: 'Попробуй угадать треки в Balkanski kod',
    }),
    [],
  );
  const hasWebShare = Boolean(navigator.share);

  const handleShare = async () => {
    const success = await shareLink(
      sharePayload.url,
      sharePayload.title,
      sharePayload.text,
    );
    if (success) {
      setShareFeedback('Ссылка отправлена или скопирована в буфер.');
    } else {
      setShareFeedback('Не удалось поделиться ссылкой.');
    }
  };

  const handleManualCopy = async () => {
    try {
      await navigator.clipboard.writeText(sharePayload.url);
      setShareFeedback('Ссылка скопирована в буфер.');
    } catch {
      setShareFeedback('Не удалось скопировать ссылку.');
    }
  };

  const handleReset = () => {
    resetProgress();
    onStorageUpdated();
    setIsResetOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h3" fontWeight={700}>
              Balkanski kod
            </Typography>
            <Typography color="text.secondary">
              Угадай мелодию по фрагменту и проверь, насколько ты в теме.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ShareRoundedIcon />}
              size="large"
              onClick={() => {
                setShareFeedback(null);
                setIsShareOpen(true);
              }}
              sx={{
                fontWeight: 700,
                background:
                  'linear-gradient(90deg, rgba(110,155,255,1) 0%, rgba(255,124,200,1) 100%)',
                color: '#0f1115',
              }}
            >
              Поделиться
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Статистика
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Всего треков: ${stats.totalTracks}`} />
            <Chip color="success" label={`Угадано: ${stats.solvedTracks}`} />
            <Chip color="warning" label={`Не угадано: ${stats.revealedTracks}`} />
            <Chip color="info" label={`В процессе: ${stats.inProgressTracks}`} />
            <Chip label={`Точность: ${stats.solveRatePercent}%`} />
            <Chip label={`Ср. попыток: ${stats.averageAttempts}`} />
            <Chip label={`Без подсказок: ${stats.solvedWithoutHints}`} />
            <Chip label={`С явной подсказкой: ${stats.solvedWithSerbianHint}`} />
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Последние угаданные
          </Typography>
          {lastSolved.length === 0 ? (
            <Alert severity="info">Пока пусто. Угадай хотя бы один трек.</Alert>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {lastSolved.map((track) => (
                <Chip
                  key={track.id}
                  label={track.names.serbian}
                  color="success"
                  variant="outlined"
                  component={RouterLink}
                  to={`/track/${track.id}`}
                  clickable
                />
              ))}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Треки
          </Typography>

          <Stack spacing={1.5}>
            {tracksSortedByAddedDate.map((track) => {
              const progress = getTrackProgressSafe(storage, track.id);
              const status = progress?.status ?? 'not_started';
              const attempts = progress?.attemptsCount ?? 0;
              const showNew = isTrackNew(track, progress);
              const hasUserProgress =
                status !== 'not_started' ||
                attempts > 0 ||
                (progress?.hintsUsedCount ?? 0) > 0 ||
                Boolean(progress?.revealedSerbianTitle) ||
                Boolean(progress?.revealedByGiveUp);

              return (
                <Paper key={track.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Typography variant="h6">{track.names.safe}</Typography>
                        {showNew ? (
                          <Chip size="small" color="primary" label="Новое" />
                        ) : null}
                        {hasUserProgress ? (
                          <Chip
                            size="small"
                            label={statusLabelMap[status]}
                            color={
                              status === 'solved'
                                ? 'success'
                                : status === 'revealed'
                                  ? 'warning'
                                  : status === 'in_progress'
                                    ? 'info'
                                    : 'default'
                            }
                          />
                        ) : null}
                      </Stack>
                      <Typography color="text.secondary">
                        {!hasUserProgress ? `Статус: ${statusLabelMap[status]} | ` : ''}
                        Сложность:{' '}
                        {getDifficultyStars(track.difficulty)} | Попыток:{' '}
                        {attempts}
                      </Typography>
                    </Box>

                    <Button component={RouterLink} to={`/track/${track.id}`}>
                      Открыть
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary">
            <Link component={RouterLink} to="/about" underline="hover">
              О проекте
            </Link>
          </Typography>
          <Button
            size="small"
            color="secondary"
            variant="outlined"
            onClick={() => setIsResetOpen(true)}
          >
            Сбросить прогресс
          </Button>
        </Stack>
      </Stack>

      <Dialog
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Поделиться проектом</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              Ниже превью того, что пойдет в системный диалог шаринга.
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Title: {sharePayload.title}</Typography>
                <Typography variant="subtitle2">Text: {sharePayload.text}</Typography>
                <Typography variant="subtitle2">URL: {sharePayload.url}</Typography>
                <Typography color="text.secondary">
                  Web Share API: {hasWebShare ? 'доступен' : 'недоступен, будет копирование'}
                </Typography>
              </Stack>
            </Paper>

            <TextField
              label="Ссылка для ручного копирования"
              value={sharePayload.url}
              fullWidth
              inputProps={{ readOnly: true }}
            />

            {shareFeedback ? <Alert severity="info">{shareFeedback}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShareOpen(false)} color="inherit">
            Закрыть
          </Button>
          <Button onClick={handleManualCopy} color="secondary">
            Скопировать ссылку
          </Button>
          <Button onClick={handleShare}>Поделиться</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Сбросить прогресс</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Typography>
              Будет удален весь локальный игровой прогресс:
            </Typography>
            <Typography color="text.secondary">
              - статусы треков (`not_started / in_progress / solved / revealed`)
            </Typography>
            <Typography color="text.secondary">- история попыток и их количество</Typography>
            <Typography color="text.secondary">- использование подсказок и явных подсказок</Typography>
            <Typography color="warning.main" fontWeight={600}>
              Это действие нельзя отменить.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResetOpen(false)} color="inherit">
            Отмена
          </Button>
          <Button color="error" onClick={handleReset}>
            Да, удалить прогресс
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
