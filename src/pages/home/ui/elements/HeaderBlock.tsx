import { Stack, IconButton, Box, Typography } from '@mui/material';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { LanguageSelector } from '@/shared/i18n';
import { useTranslation } from 'react-i18next';

type HeaderBlockProps = {
  title: string;
  onShareClick: () => void;
};

export const HeaderBlock = ({ title, onShareClick }: HeaderBlockProps) => {
  const { t } = useTranslation('pages');

  return (
    <Stack
      // direction={{ xs: 'column', md: 'row' }}
      direction="row"
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
    >
      <Box>
        <Typography variant="h3" fontWeight={700}>
          {title}
        </Typography>
        <Typography color="text.secondary">
          {t('home.subtitle')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onShareClick}
          sx={{
            borderRadius: 1,
            background:
              'linear-gradient(90deg, rgba(110,155,255,1) 0%, rgba(255,124,200,1) 100%)',
            color: '#0f1115',
            '&:hover': {
              background:
                'linear-gradient(90deg, rgba(110,155,255,0.8) 0%, rgba(255,124,200,0.8) 100%)',
            },
          }}
        >
          <ShareRoundedIcon />
        </IconButton>
        
        {/* Переключатель языка */}
        <LanguageSelector />
      </Box>
    </Stack>
  );
};