import { Link as RouterLink } from 'react-router-dom';
import { Container, Link, Paper, Stack, Typography } from '@mui/material';
import { MetaTags } from '@/shared/ui/MetaTags';
import { RadioWidget } from '@/widgets/radioPlayer';

export const AboutPage = () => (
  <>
    <MetaTags 
      title="О проекте"
      description="Balkanski kod — это музыкальная игра, где нужно слушать трек и угадывать название на русском или на языке оригинала."
    />
    <Container maxWidth="md" sx={{ py: 4, pb: 18 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="h4" fontWeight={700}>
            О проекте
          </Typography>
          <Typography>
            Balkanski kod — это музыкальная игра, где нужно слушать трек и угадывать
            название на русском или на языке оригинала.
          </Typography>
          <Typography>
            Идея проекта выросла из моего личного процесса изучения сербского языка через
            музыку. Я беру знакомые песни, адаптирую или перевожу их на сербский,
            экспериментирую со стилями и звучанием, а потом превращаю результат в небольшую
            игру на угадывание. Для меня это одновременно способ учить язык, развлекаться и
            делиться этим процессом с друзьями.
          </Typography>
          <Typography>
            Треки в проекте — это в основном кавер-версии и музыкальные эксперименты,
            созданные с помощью AI-инструментов и собранные в формат мини-викторины. Здесь
            можно слушать треки, угадывать названия, использовать подсказки, следить за
            прогрессом и делиться ссылками на игру или конкретные карточки.
          </Typography>
          <Typography>
            Важно: проект экспериментальный и создается как pet project в формате MVP. В
            сербских названиях, формулировках или текстах подсказок местами могут
            встречаться неточности, спорные адаптации или неидеальные грамматические
            решения. Это часть живого творческого и учебного процесса, а не академически
            выверенная языковая база.
          </Typography>
          <Typography color="text.secondary">
            Если тебе близка музыка, языки и такие странные, теплые, немного балканские
            эксперименты — добро пожаловать.
          </Typography>

          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              Контакты
            </Typography>
            <Typography>
              GitHub:{' '}
              <Link
                href="https://github.com/mikeloangel"
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                github.com/mikeloangel
              </Link>
            </Typography>
            <Typography>
              Telegram:{' '}
              <Link
                href="https://t.me/mikeloangel"
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                @mikeloangel
              </Link>
            </Typography>
          </Stack>

          <Typography>
            <Link component={RouterLink} to="/" underline="hover">
              На главную
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
    
    <RadioWidget />
  </>
);
