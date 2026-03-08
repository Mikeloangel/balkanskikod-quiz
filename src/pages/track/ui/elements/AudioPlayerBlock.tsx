import type { RefObject } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material';

type AudioPlayerBlockProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  src: string;
  audioError: string;
  onAudioError: (message: string) => void;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onRestart: () => void;
  isFinished: boolean;
  canSeek: boolean;
  audioDuration: number;
  audioCurrentTime: number;
  onSeek: (_: Event, value: number | number[]) => void;
  formatAudioTime: (value: number) => string;
};

export const AudioPlayerBlock = ({
  audioRef,
  src,
  audioError,
  onAudioError,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  isPlaying,
  onTogglePlayback,
  onRestart,
  isFinished,
  canSeek,
  audioDuration,
  audioCurrentTime,
  onSeek,
  formatAudioTime,
}: AudioPlayerBlockProps) => (
  <>
    {audioError ? <Alert severity="error">{audioError}</Alert> : null}
    <audio
      ref={audioRef}
      src={src}
      preload="none"
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      onError={() => onAudioError('MP3 не загрузился. Проверь путь к файлу в public/tracks.')}
    />

    <Paper variant="outlined" sx={{ p: 1 }}>
      <Stack spacing={1}>
        <ButtonGroup fullWidth variant="contained" aria-label="Управление плеером">
          <Button onClick={onTogglePlayback}>{isPlaying ? 'Пауза' : 'Старт'}</Button>
          <Button color="secondary" onClick={onRestart}>
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
              onChange={onSeek}
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
  </>
);

