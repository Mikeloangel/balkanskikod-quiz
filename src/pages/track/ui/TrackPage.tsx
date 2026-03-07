import { useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { keyframes } from '@mui/system';
import {
  Alert,
  Box,
  ButtonGroup,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { tracks } from '../../../shared/config/tracks';
import type { Track } from '../../../shared/types/track';
import { checkAnswer, getPartialMatches, normalizeAnswer } from '../../../shared/lib/text';
import {
  addAttempt,
  applyHint,
  getTrackProgress,
  giveUpTrack,
  markTrackSolved,
  revealSerbianTitle,
} from '../../../entities/progress/model/storage';

type TrackPageProps = {
  onStorageUpdated: () => void;
};

export const TrackPage = ({ onStorageUpdated }: TrackPageProps) => {
  const { id } = useParams<{ id: string }>();
  const track = tracks.find((item) => item.id === id);

  if (!track) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5">Трек не найден</Typography>
            <Typography color="text.secondary">
              Проверь ссылку или вернись на главную.
            </Typography>
            <Button component={RouterLink} to="/">
              На главную
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return <TrackPageContent key={track.id} track={track} onStorageUpdated={onStorageUpdated} />;
};

type TrackPageContentProps = {
  track: Track;
  onStorageUpdated: () => void;
};

const resolveLocalTrackUrl = (localPath: string): string => {
  if (/^https?:\/\//i.test(localPath)) {
    return localPath;
  }

  const normalizedPath = localPath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const glowAppear = keyframes`
  0% {
    opacity: 0.92;
    box-shadow: 0 0 0 0 rgba(var(--glow-rgb), 0);
  }
  100% {
    opacity: 1;
  }
`;

const glowWave = keyframes`
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(var(--glow-rgb), 0.42),
      0 0 22px rgba(var(--glow-rgb), 0.25),
      0 10px 26px rgba(var(--glow-rgb), 0.16);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(var(--glow-rgb), 0.5),
      0 0 30px rgba(var(--glow-rgb), 0.34),
      0 14px 32px rgba(var(--glow-rgb), 0.2);
  }
`;

const TrackPageContent = ({ track, onStorageUpdated }: TrackPageContentProps) => {
  const progress = getTrackProgress(track.id);
  const [startedProgressSignature, setStartedProgressSignature] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState(
    progress.attemptsHistory.at(-1) ?? '',
  );
  const [audioError, setAudioError] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGiveUpOpen, setIsGiveUpOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSolved = progress.status === 'solved';
  const isRevealed = progress.status === 'revealed';
  const isFinished = isSolved || isRevealed;
  const isTrackInProgress = progress.status === 'in_progress';
  const shouldShowTrackNavigation = isTrackInProgress || isFinished;
  const progressSignature = [
    progress.status,
    progress.attemptsCount,
    progress.hintsUsedCount,
    progress.revealedSerbianTitle,
    progress.revealedByGiveUp,
  ].join('|');
  const hasStartedInCurrentProgress = startedProgressSignature === progressSignature;
  const shouldShowStartCta =
    !isFinished &&
    progress.attemptsCount === 0 &&
    progress.hintsUsedCount === 0 &&
    !progress.revealedSerbianTitle &&
    !hasStartedInCurrentProgress;

  const openedHints = track.hints.slice(0, progress.hintsUsedCount);
  const canUseHint = progress.hintsUsedCount < track.hints.length;
  const canShowHintButton = canUseHint || !progress.revealedSerbianTitle;

  const pageTitle = isFinished ? track.names.serbian : track.names.safe;
  const currentTrackIndex = tracks.findIndex((item) => item.id === track.id);
  const previousTrack = currentTrackIndex > 0 ? tracks[currentTrackIndex - 1] : null;
  const nextTrack =
    currentTrackIndex >= 0 && currentTrackIndex < tracks.length - 1
      ? tracks[currentTrackIndex + 1]
      : null;
  const attemptsForView = [...progress.attemptsHistory].reverse();
  const difficultyStars = '★'.repeat(track.difficulty).padEnd(5, '☆');
  const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Balkanski kod';
  const configuredBaseUrl = import.meta.env.VITE_APP_BASE_URL?.trim();
  const appBaseUrl = configuredBaseUrl
    ? configuredBaseUrl.replace(/\/$/, '')
    : new URL(import.meta.env.BASE_URL, window.location.origin)
        .toString()
        .replace(/\/$/, '');
  const sharePayload = {
    url: `${appBaseUrl}/#/track/${track.id}`,
    title: appName,
    text: `Попробуй угадать загадку: ${track.names.safe}`,
  };
  const hasWebShare = Boolean(navigator.share);
  const canSeek = audioDuration > 0;  
  const shouldShowGlow = isSolved || isRevealed || isPlaying;
  const glowAnimation = isPlaying
    ? `${glowAppear} 380ms ease-out, ${glowWave} 2600ms ease-in-out infinite`
    : `${glowAppear} 380ms ease-out`;
  const resultPaperSx = isSolved
    ? {
        '--glow-rgb': '255,124,200',
        boxShadow:
          '0 0 0 1px rgba(255,124,200,0.45), 0 0 24px rgba(255,124,200,0.28), 0 12px 28px rgba(255,124,200,0.2)',
        background:
          'linear-gradient(145deg, rgba(255,124,200,0.10) 0%, rgba(110,155,255,0.06) 100%)',
        animation: glowAnimation,
      }
    : isRevealed
      ? {
          '--glow-rgb': '255,167,38',
          boxShadow:
            '0 0 0 1px rgba(255,167,38,0.45), 0 0 24px rgba(255,167,38,0.28), 0 12px 28px rgba(255,167,38,0.2)',
          background:
            'linear-gradient(145deg, rgba(255,167,38,0.10) 0%, rgba(255,124,200,0.04) 100%)',
          animation: glowAnimation,
        }
      : shouldShowGlow
        ? {
            '--glow-rgb': '198,203,213',
            boxShadow:
              '0 0 0 1px rgba(198,203,213,0.38), 0 0 18px rgba(198,203,213,0.22), 0 10px 24px rgba(198,203,213,0.14)',
            background:
              'linear-gradient(145deg, rgba(198,203,213,0.08) 0%, rgba(120,128,145,0.06) 100%)',
            animation: glowAnimation,
          }
        : {};

  const formatAudioTime = (value: number): string => {
    const totalSeconds = Math.max(0, Math.floor(value));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStartedProgressSignature(progressSignature);
  };

  const handleTogglePlayback = async () => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setAudioError('');
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setAudioError('Не удалось запустить воспроизведение.');
    }
  };

  const handleRestart = async () => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = 0;
    setAudioCurrentTime(0);
    setAudioError('');
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setAudioError('Не удалось запустить воспроизведение.');
    }
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    if (!audioRef.current || Array.isArray(value)) {
      return;
    }

    audioRef.current.currentTime = value;
    setAudioCurrentTime(value);
  };

  const handleSubmit = () => {
    const value = inputValue.trim();
    if (!value) {
      return;
    }

    const lastAttempt = progress.attemptsHistory.at(-1);
    if (
      lastAttempt &&
      normalizeAnswer(lastAttempt) === normalizeAnswer(value)
    ) {
      return;
    }

    addAttempt(track.id, value);
    setStartedProgressSignature(null);

    const result = checkAnswer(value, track);
    if (result.isCorrect) {
      markTrackSolved(track.id);
      onStorageUpdated();
      return;
    }

    onStorageUpdated();
  };

  const handleHint = () => {
    if (canUseHint) {
      applyHint(track.id);
      setStartedProgressSignature(null);
      onStorageUpdated();
      return;
    }

    revealSerbianTitle(track.id);
    setStartedProgressSignature(null);
    onStorageUpdated();
  };

  const handleGiveUp = () => {
    giveUpTrack(track.id);
    setStartedProgressSignature(null);
    setIsGiveUpOpen(false);
    onStorageUpdated();
  };

  const handleManualCopy = async () => {
    try {
      await navigator.clipboard.writeText(sharePayload.url);
      setShareFeedback('Ссылка скопирована в буфер.');
    } catch {
      setShareFeedback('Не удалось скопировать ссылку.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            Balkanski kod
          </Typography>
          <Typography>
            <Link component={RouterLink} to="/" underline="hover">
              На главную
            </Link>{' '}
            / {pageTitle}
          </Typography>
        </Stack>

        <Paper sx={{ p: 2.5, ...resultPaperSx }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5">{pageTitle}</Typography>
              {isSolved ? (
                <CheckCircleRoundedIcon color="success" fontSize="small" />
              ) : null}
            </Stack>
            <Typography color="text.secondary">
              Сложность: {difficultyStars}
            </Typography>
            {shouldShowTrackNavigation ? (
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
            {progress.revealedSerbianTitle ? (
              <Typography color="text.secondary">
                Явная подсказка: {track.names.serbian}
              </Typography>
            ) : null}

            {audioError ? <Alert severity="error">{audioError}</Alert> : null}
            <audio
              ref={audioRef}
              src={resolveLocalTrackUrl(track.links.local)}
              preload="none"
              onLoadedMetadata={() => {
                const duration = audioRef.current?.duration ?? 0;
                setAudioDuration(Number.isFinite(duration) ? duration : 0);
              }}
              onTimeUpdate={() =>
                setAudioCurrentTime(audioRef.current?.currentTime ?? 0)
              }
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() =>
                setAudioError(
                  'MP3 не загрузился. Проверь путь к файлу в public/tracks.',
                )
              }
            />

            <Paper variant="outlined" sx={{ p: 1 }}>
              <Stack spacing={1}>
                <ButtonGroup fullWidth variant="contained" aria-label="Управление плеером">
                  <Button onClick={handleTogglePlayback}>
                    {isPlaying ? 'Пауза' : 'Старт'}
                  </Button>
                  <Button color="secondary" onClick={handleRestart}>
                    С начала
                  </Button>
                </ButtonGroup>
                {isFinished ? (
                  <Box>
                    <Slider
                      size="small"
                      min={0}
                      max={audioDuration || 1}
                      step={0.1}
                      value={Math.min(audioCurrentTime, audioDuration || 1)}
                      onChange={handleSeek}
                      disabled={!canSeek}
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {formatAudioTime(audioCurrentTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatAudioTime(audioDuration)}
                      </Typography>
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            </Paper>

            {!isFinished && shouldShowStartCta ? (
              <Button onClick={handleStart}>Начать угадывать</Button>
            ) : null}

            {isFinished ? (
              <>
                <Divider />

                <Stack spacing={1}>
                  {isSolved ? (
                    <Chip color="success" label="Угадан честно" />
                  ) : (
                    <Chip color="warning" label="Раскрыт через сдачу" />
                  )}

                  <Typography>Сербское: {track.names.serbian}</Typography>
                  <Typography>Русское: {track.names.russian}</Typography>
                  <Typography>Оригинал: {track.names.original}</Typography>

                  <Typography>
                    Попытки: {progress.attemptsCount} | Подсказок: {progress.hintsUsedCount} |
                    Явная подсказка: {progress.revealedSerbianTitle ? 'да' : 'нет'}
                  </Typography>

                  {track.links.suno ? (
                    <Button
                      component="a"
                      href={track.links.suno}
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
                    onClick={() => {
                      setShareFeedback(null);
                      setIsShareOpen(true);
                    }}
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
            ) : null}

            {!isFinished ? (
              <Stack spacing={1.5}>
                {!shouldShowStartCta ? (
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      label={`Попытка #${progress.attemptsCount + 1}`}
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleSubmit();
                        }
                      }}
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button onClick={handleSubmit}>Отправить</Button>
                      {canShowHintButton ? (
                        <Button color="secondary" onClick={handleHint}>
                          {canUseHint ? 'Подсказка' : 'Показать сербское название'}
                        </Button>
                      ) : null}
                      <Button color="error" onClick={() => setIsGiveUpOpen(true)}>
                        Сдаться
                      </Button>
                    </Stack>
                  </Stack>
                ) : null}
              </Stack>
            ) : null}

            {attemptsForView.length > 0 ? (
              <Stack spacing={1}>
                {attemptsForView.map((attempt, index) => {
                  const attemptResult = checkAnswer(attempt, track);
                  const partial = getPartialMatches(attempt, track);
                  const attemptNumber = progress.attemptsCount - index;

                  return (
                    <Paper
                      key={`${attempt}-${attemptNumber}`}
                      variant="outlined"
                      sx={{ p: 1.5 }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Попытка #{attemptNumber}
                          </Typography>
                          <Typography fontWeight={600}>{attempt}</Typography>
                        </Stack>
                        {attemptResult.isCorrect ? (
                          <Chip color="success" label="Угадано" size="small" />
                        ) : partial.hasPartialMatch ? (
                          <Chip
                            color="info"
                            label={`Частично: ${Math.round(partial.ratio * 100)}%`}
                            size="small"
                          />
                        ) : (
                          <Chip
                            color="default"
                            label={`Мимо: ${Math.round(attemptResult.similarity * 100)}%`}
                            size="small"
                          />
                        )}
                      </Stack>
                      {!attemptResult.isCorrect && partial.hasPartialMatch ? (
                        <Typography mt={1} variant="body2" color="text.secondary">
                          Совпавшие слова: {partial.matchedWords.join(', ')}
                        </Typography>
                      ) : null}
                    </Paper>
                  );
                })}
              </Stack>
            ) : null}
          </Stack>
        </Paper>
      </Stack>

      <Dialog
        open={isGiveUpOpen}
        onClose={() => setIsGiveUpOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Сдаться и показать ответ?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ pt: 1 }}>
            Можно продолжать попытки, а можно открыть ответ прямо сейчас.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGiveUpOpen(false)} color="inherit">
            Не сейчас
          </Button>
          <Button onClick={handleGiveUp}>
            Ок, показать ответ
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Поделиться загадкой</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                background:
                  'linear-gradient(145deg, rgba(110,155,255,0.08) 0%, rgba(255,124,200,0.08) 100%)',
              }}
            >
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  Предпросмотр шаринга
                </Typography>
                <Typography variant="h6">{sharePayload.title}</Typography>
                <Typography>{sharePayload.text}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {sharePayload.url}
                </Typography>
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
              onClick={handleManualCopy}
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
        </DialogActions>
      </Dialog>
    </Container>
  );
};
