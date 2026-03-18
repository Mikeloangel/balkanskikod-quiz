# CLAUDE.md

Проект: **Balkanski kod — угадай мелодию**
Интерактивная музыкальная викторина для изучения сербского языка через знакомые мелодии.

## Стек

React 18 + TypeScript 5.9 + MUI 7 + React Router 6 (HashRouter) + Vite 5 + React Context + i18next + localStorage

## Архитектура

Feature-Sliced Design (FSD): `shared → entities → widgets → pages → app`
- Импорт между слоями — только через `index.ts`
- Алиас `@/` → `src/`
- Проверка архитектуры: `npm run lint:fsd` (steiger)

## Ключевые команды

```bash
npm run dev            # Dev server :5173
npm run build          # Production build (tests + lint + extract-covers + tsc + vite)
npm run lint           # ESLint
npm run lint:fsd       # FSD architecture check
npm run extract-covers # Извлечь обложки из MP3 ID3 тегов → public/covers/
npm test               # Vitest
npm run test:coverage
npm run deploy         # GitHub Pages (gh-pages)
npm run bot:dev        # Локальный dev-сервер бота (Cloudflare Worker)
npm run bot:deploy     # Деплой бота на Cloudflare Workers
npm run bot:logs       # Живые логи бота
npm run bot:install    # Установить зависимости бота
```

## Перед завершением задачи

1. `npm run lint` — без ошибок
2. `npm run build` — собирается
3. `npm run lint:fsd` — FSD compliant
4. Тесты проходят если менялась логика
5. Обновить docs/ если менялась документация модулей

## Структура проекта

### Конфигурация
- `src/shared/config/tracks.ts` — каталог игровых треков (Track[])
- `src/shared/config/radioTracks.ts` — каталог радио треков (RadioTrack[])
- `src/shared/config/donate.ts` — конфиг донатов (feature toggle через env)

### Контексты (React Context)
- `AudioProvider` — аудио плеер игры
- `RadioProvider` — радио плеер (случайный порядок, лимит 30 мин, пауза при игре)
- `UIDialogsContext` — модальные диалоги (share, give up, reset)
- `TrackNavigationContext` — навигация prev/next между треками
- `TrackGameUIContext` — UI логика игры (solved, hints, attempts)
- `LanguageContext` — переключение языков

### State management
- React Context store для прогресса (`src/entities/progress/store/`)
- localStorage для персистенции прогресса, радио, языка
- Ключи localStorage: `balkanski-kod-progress`, `balkanski-kod-radio-state`, `balkanski-kod-language`, `balkanski-kod-donate-dismissed`

### Ключевая логика
- `src/shared/lib/text.ts` — нормализация ответов, checkAnswer (Levenshtein, fuzzy, transliteration)
- `src/shared/lib/share.ts` — Web Share API + fallback clipboard

### i18n (4 языка)
- Языки: `ru`, `en`, `sr`, `sr_cyrl`
- Namespaces: `common`, `pages`, `tracks`, `meta`, `radio`, `home`
- Файлы: `src/shared/i18n/locales/{lang}/{namespace}.ts`
- Fallback: русский

### Страницы
- `/` — HomePage (сетка карточек треков с обложками, плитки статистики, лента недавно угаданных, фильтр треков)
- `/track/:id` — TrackPage (игра: аудио, ввод ответа, подсказки)
- `/about` — AboutPage (о проекте, динамический контент по языку)

### Обложки треков
- `public/covers/` — статические обложки (извлекаются из MP3 ID3 тегов)
- `cli/extract-covers.mjs` — Node.js скрипт извлечения (встроен в `npm run build`)
- Формат: `public/covers/{track-id}.jpg`
- Fallback: градиентный placeholder если обложки нет

### Донаты (Telegram Stars)
- `src/shared/config/donate.ts` — конфиг + `isDonateEnabled()` feature toggle
- `src/shared/ui/DonateButton.tsx` — компактная кнопка (аналог SunoButton)
- `src/shared/ui/DonateBanner.tsx` — баннер на HomePage
- `src/shared/ui/icons/TelegramIcon.tsx` — SVG иконка Telegram
- `bot/` — Cloudflare Worker бот для приёма Stars-платежей (grammy)
- Deep link: `VITE_TELEGRAM_DONATE_URL` → Telegram бот → Invoice Stars
- Если env пустая — UI донатов не рендерится

### Контент
- `src/content/about/` — контент страницы "О проекте" на 4 языках
- `cli/wizard.php` — CLI для генерации треков через OpenAI
- `cli/extract-covers.mjs` — CLI для извлечения обложек из MP3

## Документация

- `docs/` — документация по модулям (quiz-system, home-page, radio-module)
- `docs/specs/` — история ТЗ (MVP, рефакторинг, радио, i18n, донаты)
- `AGENTS.md` — подробные правила разработки

## Правила

- Dark mode only — без светлой темы
- HashRouter — для GitHub Pages
- Не добавлять backend/авторизацию
- Не ломать контекстную архитектуру
- Изменения правил угадывания — только в `text.ts`
- Изменения localStorage — обратно-совместимые
- Новые состояния TrackPage — через контексты, не напрямую
- Радио: без перемотки, случайный порядок
- Треки: id формат `track-XXX`, `names.safe` не палит ответ

## Env переменные

- `VITE_APP_NAME` — название приложения
- `VITE_APP_BASE_URL` — базовый URL для шаринга
- `VITE_RADIO_MAX_PLAY_TIME_MINUTES` — лимит радио (default: 30)
- `VITE_TELEGRAM_DONATE_URL` — deep link на бота донатов (пустая = донаты скрыты)

## Деплой

**Веб-приложение:** GitHub Pages — `https://mikeloangel.github.io/balkanskikod-quiz/`
Base URL в Vite: `/balkanskikod-quiz/`

**Бот донатов:** Cloudflare Workers — `npm run bot:deploy`
Секреты бота: `cd bot && npx wrangler secret put BOT_TOKEN`
