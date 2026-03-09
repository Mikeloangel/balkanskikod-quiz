import { Button } from '@mui/material';

type StartGuessingCtaProps = {
  onStart: () => void;
};

export const StartGuessingCta = ({ onStart }: StartGuessingCtaProps) => (
  <Button
    variant="contained"
    onClick={onStart}
  >
    Начать угадывать
  </Button>
);

