import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Stack } from '@mui/material';
import { tracks } from '@/shared/config';
import type { Track } from '@/shared/models';
import { checkAnswer, normalizeAnswer } from '../../../shared/lib/text';
import { useProgressStore, selectTrackProgress } from '@/entities/progress';
import { AttemptsHistoryBlock } from './elements/AttemptsHistoryBlock';
import { AudioPlayerBlock } from './elements/AudioPlayerBlock';
import { GiveUpDialog } from './elements/GiveUpDialog';
import { GuessFormBlock } from './elements/GuessFormBlock';
import { ResultCardBlock } from './elements/ResultCardBlock';
import { ShareDialog } from './elements/ShareDialog';
import { StartGuessingCta } from './elements/StartGuessingCta';
import { TrackMetaBlock } from './elements/TrackMetaBlock';
import { TrackNotFound } from './elements/TrackNotFound';
import { TrackPageHeader } from './elements/TrackPageHeader';
import { TrackResultShell } from './elements/TrackResultShell';

export const TrackPage = () => {
  const { id } = useParams<{ id: string }>();
  const track = tracks.find((item) => item.id === id);

  if (!track) {
    return <TrackNotFound />;
  }

  return <TrackPageContent key={track.id} track={track} />;
};

type TrackPageContentProps = {
  track: Track;
};

const resolveLocalTrackUrl = (localPath: string): string => {
  if (/^https?:\/\//i.test(localPath)) {
    return localPath;
  }

  const normalizedPath = localPath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const TrackPageContent = ({ track }: TrackPageContentProps) => {
  const { state, actions } = useProgressStore();
  const progress = selectTrackProgress(state, track.id);
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
  const audioRef = useRef<HTMLAudioElement>(null);

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
  const shellVariant = isSolved
    ? 'solved'
    : isRevealed
      ? 'revealed'
      : isPlaying
        ? 'playing'
        : 'default';

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

    actions.addAttempt(track.id, value);
    setStartedProgressSignature(null);

    const result = checkAnswer(value, track);
    if (result.isCorrect) {
      actions.markTrackSolved(track.id);
      return;
    }
  };

  const handleHint = () => {
    if (canUseHint) {
      actions.applyHint(track.id);
      setStartedProgressSignature(null);
      return;
    }

    actions.revealSerbianTitle(track.id);
    setStartedProgressSignature(null);
  };

  const handleGiveUp = () => {
    actions.giveUpTrack(track.id);
    setStartedProgressSignature(null);
    setIsGiveUpOpen(false);
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
        <TrackPageHeader pageTitle={pageTitle} />

        <TrackResultShell variant={shellVariant} animate={isPlaying}>
          <Stack spacing={2}>
            <TrackMetaBlock
              pageTitle={pageTitle}
              showSolvedIcon={isSolved}
              difficultyStars={difficultyStars}
              showNavigation={shouldShowTrackNavigation}
              previousTrack={previousTrack ? { id: previousTrack.id } : null}
              nextTrack={nextTrack ? { id: nextTrack.id } : null}
              openedHints={openedHints}
              revealedSerbianTitle={progress.revealedSerbianTitle}
              serbianTitle={track.names.serbian}
            />

            <AudioPlayerBlock
              audioRef={audioRef}
              src={resolveLocalTrackUrl(track.links.local)}
              audioError={audioError}
              onAudioError={setAudioError}
              onLoadedMetadata={() => {
                const duration = audioRef.current?.duration ?? 0;
                setAudioDuration(Number.isFinite(duration) ? duration : 0);
              }}
              onTimeUpdate={() => setAudioCurrentTime(audioRef.current?.currentTime ?? 0)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              isPlaying={isPlaying}
              onTogglePlayback={handleTogglePlayback}
              onRestart={handleRestart}
              isFinished={isFinished}
              canSeek={canSeek}
              audioDuration={audioDuration}
              audioCurrentTime={audioCurrentTime}
              onSeek={handleSeek}
              formatAudioTime={formatAudioTime}
            />

            {!isFinished && shouldShowStartCta ? (
              <StartGuessingCta onStart={handleStart} />
            ) : null}

            {isFinished ? (
              <ResultCardBlock
                isSolved={isSolved}
                serbianTitle={track.names.serbian}
                russianTitle={track.names.russian}
                originalTitle={track.names.original}
                attemptsCount={progress.attemptsCount}
                hintsUsedCount={progress.hintsUsedCount}
                revealedSerbianTitle={progress.revealedSerbianTitle}
                sunoUrl={track.links.suno}
                onOpenShare={() => {
                  setShareFeedback(null);
                  setIsShareOpen(true);
                }}
              />
            ) : null}

            {!isFinished && !shouldShowStartCta ? (
              <GuessFormBlock
                attemptNumber={progress.attemptsCount + 1}
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                showHintButton={canShowHintButton}
                hintButtonLabel={canUseHint ? 'Подсказка' : 'Показать сербское название'}
                onHint={handleHint}
                onGiveUp={() => setIsGiveUpOpen(true)}
              />
            ) : null}

            <AttemptsHistoryBlock
              attemptsForView={attemptsForView}
              attemptsCount={progress.attemptsCount}
              track={track}
            />
          </Stack>
        </TrackResultShell>
      </Stack>

      <GiveUpDialog
        open={isGiveUpOpen}
        onClose={() => setIsGiveUpOpen(false)}
        onConfirm={handleGiveUp}
      />

      <ShareDialog
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        payload={sharePayload}
        hasWebShare={hasWebShare}
        feedback={shareFeedback}
        onCopy={handleManualCopy}
      />
    </Container>
  );
};
