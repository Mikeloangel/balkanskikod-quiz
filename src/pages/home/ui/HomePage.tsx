import { useMemo, useState } from 'react';
import { Container, Stack } from '@mui/material';
import { tracksSortedByAddedDate } from '@/shared/config';
import {
  readStorage,
  resetProgress,
} from '@/entities/progress';
import {
  getGlobalStats,
  getLastSolvedTracks,
} from '@/entities/progress';
import { shareLink } from '@/shared/lib/share';
import { HeaderBlock } from './elements/HeaderBlock';
import { StatsBlock } from './elements/StatsBlock';
import { LastSolvedBlock } from './elements/LastSolvedBlock';
import { TracksListBlock } from './elements/TracksListBlock';
import { FooterBlock } from './elements/FooterBlock';
import { ShareDialog } from './elements/ShareDialog';
import { ResetDialog } from './elements/ResetDialog';

type HomePageProps = {
  onStorageUpdated: () => void;
};

export const HomePage = ({ onStorageUpdated }: HomePageProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Balkanski kod';

  const storage = readStorage();
  const stats = getGlobalStats(tracksSortedByAddedDate, storage);
  const lastSolved = getLastSolvedTracks(tracksSortedByAddedDate, storage, 5);
  const sharePayload = useMemo(
    () => {
      const configuredBaseUrl = import.meta.env.VITE_APP_BASE_URL?.trim();
      const appBaseUrl = configuredBaseUrl
        ? configuredBaseUrl.replace(/\/$/, '')
        : new URL(import.meta.env.BASE_URL, window.location.origin)
            .toString()
            .replace(/\/$/, '');

      return {
        url: `${appBaseUrl}/#/`,
        title: appName,
        text: `Попробуй угадать треки в ${appName}`,
      };
    },
    [appName],
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
        <HeaderBlock
          title="Balkanski kod"
          onShareClick={() => {
            setShareFeedback(null);
            setIsShareOpen(true);
          }}
        />

        <StatsBlock stats={stats} />

        <LastSolvedBlock lastSolved={lastSolved} />

        <TracksListBlock tracks={tracksSortedByAddedDate} storage={storage} />

        <FooterBlock onResetClick={() => setIsResetOpen(true)} />

        <ShareDialog
          open={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          sharePayload={sharePayload}
          hasWebShare={hasWebShare}
          onShare={handleShare}
          onManualCopy={handleManualCopy}
          feedback={shareFeedback}
        />

        <ResetDialog
          open={isResetOpen}
          onClose={() => setIsResetOpen(false)}
          onReset={handleReset}
        />
      </Stack>
    </Container>
  );
};
