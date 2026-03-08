import { Chip, Paper, Stack, Typography } from '@mui/material';
import type { Track } from '../../../../shared/types/track';
import { checkAnswer, getPartialMatches } from '../../../../shared/lib/text';

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
  if (attemptsForView.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      {attemptsForView.map((attempt, index) => {
        const attemptResult = checkAnswer(attempt, track);
        const partial = getPartialMatches(attempt, track);
        const attemptNumber = attemptsCount - index;

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
  );
};

