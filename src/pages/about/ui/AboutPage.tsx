import { Link as RouterLink } from 'react-router-dom';
import { Container, Link, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MetaTags } from '@/shared/ui/MetaTags';
import { RadioWidget } from '@/widgets/radioPlayer';
import { LanguageSelector } from '@/shared/i18n';
import { useAboutContent } from '@/hooks/useAboutContent';

export const AboutPage = () => {
  const { t } = useTranslation('pages');
  const content = useAboutContent();

  return (
    <>
      <MetaTags
        title={content?.title || t('about.title')}
      />
      <Container maxWidth="md" sx={{ py: 4, pb: 18 }}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" fontWeight={700}>
                {content?.title || t('about.title')}
              </Typography>
              <LanguageSelector />
            </Stack>
            {content?.story?.map((paragraph, index) => (
              <Typography key={index}>
                {paragraph}
              </Typography>
            ))}

            <Typography>
              <strong>{content?.technologies || t('about.technologies')}:</strong> React, TypeScript, MUI, Vite, i18next
            </Typography>

            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {content?.contacts.title || t('about.contacts')}
              </Typography>
              <Typography>
                GitHub:{' '}
                <Link
                  href={`https://${content?.contacts.github || "github.com/mikeloangel"}`}
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  {content?.contacts.github || "github.com/mikeloangel"}
                </Link>
              </Typography>
              <Typography>
                Telegram:{' '}
                <Link
                  href={`https://t.me/${content?.contacts.telegram || "mikeloangel"}`}
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  {content?.contacts.telegram || "@mikeloangel"}
                </Link>
              </Typography>
            </Stack>

            <Typography>
              <Link component={RouterLink} to="/" underline="hover">
                {content?.backToHome || t('about.backToHome')}
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>

      <RadioWidget />
    </>
  );
};
