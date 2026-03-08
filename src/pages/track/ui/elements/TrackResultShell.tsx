import type { PropsWithChildren } from 'react';
import { Paper } from '@mui/material';
import { keyframes } from '@mui/system';

type TrackResultShellVariant = 'default' | 'playing' | 'solved' | 'revealed';

type TrackResultShellProps = PropsWithChildren<{
  variant: TrackResultShellVariant;
  animate: boolean;
}>;

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

export const TrackResultShell = ({ variant, animate, children }: TrackResultShellProps) => {
  const hasGlow = variant !== 'default';

  const glowAnimation = animate
    ? `${glowAppear} 380ms ease-out, ${glowWave} 2600ms ease-in-out infinite`
    : `${glowAppear} 380ms ease-out`;

  const sx =
    variant === 'solved'
      ? {
          '--glow-rgb': '255,124,200',
          boxShadow:
            '0 0 0 1px rgba(255,124,200,0.45), 0 0 24px rgba(255,124,200,0.28), 0 12px 28px rgba(255,124,200,0.2)',
          background:
            'linear-gradient(145deg, rgba(255,124,200,0.10) 0%, rgba(110,155,255,0.06) 100%)',
          animation: hasGlow ? glowAnimation : undefined,
        }
      : variant === 'revealed'
        ? {
            '--glow-rgb': '255,167,38',
            boxShadow:
              '0 0 0 1px rgba(255,167,38,0.45), 0 0 24px rgba(255,167,38,0.28), 0 12px 28px rgba(255,167,38,0.2)',
            background:
              'linear-gradient(145deg, rgba(255,167,38,0.10) 0%, rgba(255,124,200,0.04) 100%)',
            animation: hasGlow ? glowAnimation : undefined,
          }
        : variant === 'playing'
          ? {
              '--glow-rgb': '198,203,213',
              boxShadow:
                '0 0 0 1px rgba(198,203,213,0.38), 0 0 18px rgba(198,203,213,0.22), 0 10px 24px rgba(198,203,213,0.14)',
              background:
                'linear-gradient(145deg, rgba(198,203,213,0.08) 0%, rgba(120,128,145,0.06) 100%)',
              animation: hasGlow ? glowAnimation : undefined,
            }
          : {};

  return (
    <Paper sx={{ p: 2.5, ...sx }}>
      {children}
    </Paper>
  );
};

