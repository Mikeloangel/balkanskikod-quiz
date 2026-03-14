import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

type StartGuessingCtaProps = {
  onStart: () => void;
};

export const StartGuessingCta = ({ onStart }: StartGuessingCtaProps) => {
  const { t } = useTranslation('tracks');
  
  return (
  <Button
    variant="contained"
    onClick={onStart}
  >
    {t('startGuessing')}
  </Button>
);
};

