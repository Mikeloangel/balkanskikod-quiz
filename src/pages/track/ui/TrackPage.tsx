import { useParams } from 'react-router-dom';
import { Container, Stack } from '@mui/material';
import { tracks } from '@/shared/config';
import type { Track } from '@/shared/models';
import { checkAnswer, normalizeAnswer } from '../../../shared/lib/text';
import { useProgressStore, selectTrackProgress } from '@/entities/progress';
import { useAudioState, useAudioActions, useUIDialogs, useTrackNavigation, useTrackGameUI, TrackNavigationProvider, TrackGameUIProvider, AudioProvider, useRadio } from '@/shared/contexts';
import { MetaTags } from '@/shared/ui/MetaTags';
import { RadioWidget } from '@/widgets/radioPlayer';
import { AttemptsHistoryBlock } from './elements/AttemptsHistoryBlock';
import { AudioPlayerBlock } from './elements/AudioPlayerBlock';
import { GiveUpDialog } from './elements/GiveUpDialog';
import { GuessFormBlock } from './elements/GuessFormBlock';
import { ResultCardBlock } from './elements/ResultCardBlock';
import { StartGuessingCta } from './elements/StartGuessingCta';
import { ShareDialog } from './elements/ShareDialog';
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
  const { state } = useProgressStore();
  const progress = selectTrackProgress(state, track.id);
  const { state: dialogsState } = useUIDialogs();
  
  return (
    <AudioProvider src={resolveLocalTrackUrl(track.links.local)}>
      <TrackNavigationProvider currentTrack={track}>
        <TrackGameUIProvider 
          track={track} 
          progress={progress} 
          startedProgressSignature={dialogsState.startedProgressSignature}
        >
          <TrackPageContentInner track={track} />
        </TrackGameUIProvider>
      </TrackNavigationProvider>
    </AudioProvider>
  );
};

const TrackPageContentInner = ({ track }: TrackPageContentProps) => {
  const { state, actions } = useProgressStore();
  const progress = selectTrackProgress(state, track.id);
  const { state: audioState } = useAudioState();
  const audioActions = useAudioActions();
  const { state: dialogsState, actions: dialogsActions } = useUIDialogs();
  const { state: navigationState } = useTrackNavigation();
  const { state: gameUIState } = useTrackGameUI();
  const { pause: pauseRadio } = useRadio();

  // Пауза радио при запуске игрового трека
  const handlePlayGameTrack = () => {
    pauseRadio();
    
    // Устанавливаем startedProgressSignature чтобы скрыть Start CTA
    const progressSignature = [
      progress.status,
      progress.attemptsCount,
      progress.hintsUsedCount,
      progress.revealedSerbianTitle,
      progress.revealedByGiveUp,
    ].join('|');
    
    dialogsActions.setStartedProgressSignature(progressSignature);
  };

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
  const shellVariant = gameUIState.isSolved
    ? 'solved'
    : gameUIState.isRevealed
      ? 'revealed'
      : audioState.isPlaying
        ? 'playing'
        : 'default';

  const formatAudioTime = (value: number): string => {
    const totalSeconds = Math.max(0, Math.floor(value));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    const value = audioState.inputValue.trim();
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
    dialogsActions.setStartedProgressSignature(null);

    const result = checkAnswer(value, track);
    if (result.isCorrect) {
      actions.markTrackSolved(track.id);
      return;
    }
  };

  const handleHint = () => {
    if (gameUIState.canUseHint) {
      actions.applyHint(track.id);
      dialogsActions.setStartedProgressSignature(null);
      return;
    }

    actions.revealSerbianTitle(track.id);
    dialogsActions.setStartedProgressSignature(null);
  };

  const handleGiveUp = () => {
    actions.giveUpTrack(track.id);
    dialogsActions.setStartedProgressSignature(null);
    dialogsActions.closeGiveUpDialog();
  };

  const handleManualCopy = async () => {
    await navigator.clipboard.writeText(sharePayload.url);
    dialogsActions.setShareFeedback('Ссылка скопирована!');
  };

  const handleOpenShare = () => {
    dialogsActions.setShareFeedback(null);
    dialogsActions.openShareDialog();
  };

  const handleCloseShare = () => {
    dialogsActions.closeShareDialog();
  };

  const handleOpenGiveUp = () => {
    dialogsActions.openGiveUpDialog();
  };

  const handleCloseGiveUp = () => {
    dialogsActions.closeGiveUpDialog();
  };

  return (
    <>
      <MetaTags 
        title={gameUIState.isSolved || gameUIState.isRevealed ? track.names.original : track.names.safe}
        description={`Угадай мелодию: ${track.names.safe}. Сложность: ${'★'.repeat(track.difficulty).padEnd(5, '☆')}`}
        type="music.song"
      />
      <Container maxWidth="md" sx={{ py: 4, pb: 18 }}>
            <Stack spacing={2.5}>
              <TrackPageHeader pageTitle={gameUIState.pageTitle} />

              <TrackResultShell variant={shellVariant} animate={audioState.isPlaying}>
                <Stack spacing={2}>
                  <TrackMetaBlock
                    pageTitle={gameUIState.pageTitle}
                    showSolvedIcon={gameUIState.isSolved}
                    difficultyStars={gameUIState.difficultyStars}
                    previousTrack={navigationState.previousTrack ? { id: navigationState.previousTrack.id } : null}
                    nextTrack={navigationState.nextTrack ? { id: navigationState.nextTrack.id } : null}
                    openedHints={gameUIState.openedHints}
                    revealedSerbianTitle={progress.revealedSerbianTitle}
                    serbianTitle={track.names.serbian}
                  />

                  <AudioPlayerBlock
                    formatAudioTime={formatAudioTime}
                    onPlay={handlePlayGameTrack}
                  />

                  {!gameUIState.isFinished && gameUIState.shouldShowStartCta ? (
                    <StartGuessingCta onStart={handlePlayGameTrack} />
                  ) : null}

                  {!gameUIState.isFinished && !gameUIState.shouldShowStartCta ? (
                    <GuessFormBlock
                      attemptNumber={progress.attemptsCount + 1}
                      value={audioState.inputValue}
                      onChange={audioActions.setInputValue}
                      onSubmit={handleSubmit}
                      showHintButton={gameUIState.canShowHintButton}
                      hintButtonLabel={gameUIState.canUseHint ? 'Подсказка' : 'Показать сербское название'}
                      onHint={handleHint}
                      onGiveUp={handleOpenGiveUp}
                    />
                  ) : null}

                  {gameUIState.isFinished ? (
                    <ResultCardBlock
                      isSolved={gameUIState.isSolved}
                      serbianTitle={track.names.serbian}
                      russianTitle={track.names.russian}
                      originalTitle={track.names.original}
                      attemptsCount={progress.attemptsCount}
                      hintsUsedCount={progress.hintsUsedCount}
                      revealedSerbianTitle={progress.revealedSerbianTitle}
                      sunoUrl={sharePayload.url}
                      onOpenShare={handleOpenShare}
                    />
                  ) : null}

                  <AttemptsHistoryBlock
                    attemptsForView={gameUIState.attemptsForView}
                    attemptsCount={progress.attemptsCount}
                    track={track}
                  />
                </Stack>
              </TrackResultShell>
            </Stack>

            <ShareDialog
              open={dialogsState.isShareOpen}
              onClose={handleCloseShare}
              payload={sharePayload}
              hasWebShare={hasWebShare}
              feedback={dialogsState.shareFeedback}
              onCopy={handleManualCopy}
            />

            <GiveUpDialog
              open={dialogsState.isGiveUpOpen}
              onClose={handleCloseGiveUp}
              onConfirm={handleGiveUp}
            />
          </Container>
          
          <RadioWidget />
        </>
  );
};
