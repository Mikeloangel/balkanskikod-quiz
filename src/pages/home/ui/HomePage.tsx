import { useMemo, useState } from 'react';
import { Container, Stack } from '@mui/material';
import { tracksSortedByAddedDate } from '@/shared/config';
import { useProgressStore, selectGlobalStats, selectLastSolved } from '@/entities/progress';
import type { StorageSchema } from '@/entities/progress';
import { shareLink } from '@/shared/lib/share';
import { MetaTags } from '@/shared/ui/MetaTags';
import { RadioWidget } from '@/widgets/radioPlayer';
import { useTranslation } from 'react-i18next';
import { HeaderBlock } from './elements/HeaderBlock';
import { StatsBlock } from './elements/StatsBlock';
import { LastSolvedBlock } from './elements/LastSolvedBlock';
import { TracksListBlock } from './elements/TracksListBlock';
import { FooterBlock } from './elements/FooterBlock';
import { DonateBanner } from '@/shared/ui/DonateBanner';
import { ShareDialog } from './elements/ShareDialog';
import { ResetDialog } from './elements/ResetDialog';

export const HomePage = () => {
  const { t: tPages } = useTranslation('pages');
  const { t: tMeta } = useTranslation('meta');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Balkanski kod';

  const { state, actions } = useProgressStore();
  const stats = selectGlobalStats(state, tracksSortedByAddedDate);
  const lastSolved = selectLastSolved(state, tracksSortedByAddedDate, 5);
  
  // Convert ProgressState to StorageSchema for compatibility
  const storageSchema: StorageSchema = {
    version: 1,
    tracks: state.tracks,
    stats: state.stats,
  };
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
        text: tPages('home.shareText', { appName }),
      };
    },
    [appName, tPages],
  );
  const hasWebShare = Boolean(navigator.share);

  const handleShare = async () => {
    const success = await shareLink(
      sharePayload.url,
      sharePayload.title,
      sharePayload.text,
    );
    if (success) {
      setShareFeedback(tPages('home.shareSuccess'));
    } else {
      setShareFeedback(tPages('home.shareError'));
    }
  };

  const handleManualCopy = async () => {
    try {
      await navigator.clipboard.writeText(sharePayload.url);
      setShareFeedback(tPages('home.copySuccess'));
    } catch {
      setShareFeedback(tPages('home.copyError'));
    }
  };

  const handleReset = () => {
    actions.resetProgress();
    setIsResetOpen(false);
  };

  return (
    <>
      <MetaTags 
        title={tMeta('title')}
        description={tMeta('description')}
      />
      <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
        <Stack spacing={3}>
          <HeaderBlock
            title={appName}
            onShareClick={() => {
              setShareFeedback(null);
              setIsShareOpen(true);
            }}
          />

          <StatsBlock stats={stats} />

          <DonateBanner />

          <LastSolvedBlock lastSolved={lastSolved} />

          <TracksListBlock tracks={tracksSortedByAddedDate} storage={storageSchema} />

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
      
      <RadioWidget />
    </>
  );
};
