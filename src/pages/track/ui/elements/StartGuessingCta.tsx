import { Button } from '@mui/material';

type StartGuessingCtaProps = {
  onStart: () => void;
};

export const StartGuessingCta = ({ onStart }: StartGuessingCtaProps) => (
  <Button onClick={onStart}>Начать угадывать</Button>
);

