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
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            '@media (max-width:423px)': {
              fontSize: '2.2rem',
            },
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
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

      <Typography
        color="text.secondary"
        sx={{
          mt: 1,
          '@media (max-width:423px)': {
            fontSize: '0.8rem',
          },
        }}
      >
        {t('home.subtitle')}
      </Typography>
    </Box>
  );
};
