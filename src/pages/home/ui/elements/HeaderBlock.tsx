import { Stack, Typography, Button, Box } from '@mui/material';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';

type HeaderBlockProps = {
  title: string;
  onShareClick: () => void;
};

export const HeaderBlock = ({ title, onShareClick }: HeaderBlockProps) => {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
    >
      <Box>
        <Typography variant="h3" fontWeight={700}>
          {title}
        </Typography>
        <Typography color="text.secondary">
          Угадай мелодию по фрагменту и проверь, насколько ты в теме.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1}>
        <Button
          startIcon={<ShareRoundedIcon />}
          size="large"
          onClick={onShareClick}
          sx={{
            fontWeight: 700,
            background:
              'linear-gradient(90deg, rgba(110,155,255,1) 0%, rgba(255,124,200,1) 100%)',
            color: '#0f1115',
          }}
        >
          Поделиться
        </Button>
      </Stack>
    </Stack>
  );
};