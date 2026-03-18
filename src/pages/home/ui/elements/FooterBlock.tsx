import { Stack, Typography, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DonateButton } from '@/shared/ui/DonateButton';

type FooterBlockProps = {
  onResetClick: () => void;
};

export const FooterBlock = ({ onResetClick }: FooterBlockProps) => {
  const { t } = useTranslation('pages');
  
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary">
        <Link component={RouterLink} to="/about" underline="hover">
          {t('home.footer.aboutProject')}
        </Link>
      </Typography>
      <DonateButton />
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={onResetClick}
      >
        {t('home.footer.resetProgress')}
      </Button>
    </Stack>
  );
};