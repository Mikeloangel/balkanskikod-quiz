import { Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Track } from '@/shared/models';
import { checkAnswer, getPartialMatches } from '@/shared/lib/text';

type AttemptsHistoryBlockProps = {
  attemptsForView: string[];
  attemptsCount: number;
  track: Track;
};

export const AttemptsHistoryBlock = ({
  attemptsForView,
  attemptsCount,
  track,
}: AttemptsHistoryBlockProps) => {
  const { t } = useTranslation('tracks');

  if (attemptsForView.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.75}>
      {attemptsForView.map((attempt, index) => {
        const attemptResult = checkAnswer(attempt, track);
        const partial = getPartialMatches(attempt, track);
        const attemptNumber = attemptsCount - index;

        return (
          <Stack
            key={`${attempt}-${attemptNumber}`}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                #{attemptNumber}
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, minWidth: 0 }} noWrap>
                {attempt}
              </Typography>

              {attemptResult.isCorrect ? (
                <Chip color="success" label={t('guessed')} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
              ) : partial.hasPartialMatch ? (
                <Chip
                  color="info"
                  label={`${Math.round(partial.ratio * 100)}%`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              ) : (
                <Chip
                  color="default"
                  label={`${Math.round(attemptResult.similarity * 100)}%`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              )}
            </Stack>

            {!attemptResult.isCorrect && partial.hasPartialMatch && (
              <Typography variant="caption" color="info.main" sx={{ mt: 0.25, pl: 3.5 }}>
                {t('matchedWords')} {partial.matchedWords.join(', ')}
              </Typography>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};
