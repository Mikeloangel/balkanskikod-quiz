import { Stack, Typography, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

type FooterBlockProps = {
  onResetClick: () => void;
};

export const FooterBlock = ({ onResetClick }: FooterBlockProps) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary">
        <Link component={RouterLink} to="/about" underline="hover">
          О проекте
        </Link>
      </Typography>
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={onResetClick}
      >
        Сбросить прогресс
      </Button>
    </Stack>
  );
};