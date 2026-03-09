# AGENTS.md

Проект: **Balkanski kod — угадай мелодию**  
Стек: React + TypeScript + MUI + React Router + localStorage + Vite

## 1. Цель файла

Этот документ задает практические правила для AI/агентов и разработчиков, чтобы изменения в проекте оставались совместимыми с текущей архитектурой и UX.

## 2. Базовые принципы разработки

- Не ломать существующую игровую механику без явного запроса.
- Любые изменения в правилах угадывания вносить только в `src/shared/lib/text.ts`.
- Код организован по FSD (Feature-Sliced Design): импортируйте другие срезы через их публичные `index.ts` и избегайте прямого обращения в `model`/`ui` подпапки.
- Используйте алиас `@` для доступа к `src` (config настроен в Vite/tsconfig/vitest).
- Любые изменения localStorage-структуры проводить аккуратно и обратно-совместимо.
- UI должен оставаться в dark mode.
- Все тексты интерфейса — на русском.

## 3. Архитектура проекта

### 3.1. Ключевые файлы проекта

*Организованы согласно FSD: каждый слой/срез экспортирует API через `index.ts`.*

- `src/shared/config/tracks.ts` — каталог треков.
- `src/shared/lib/text.ts` — нормализация, checkAnswer, partial match.
- `src/shared/contexts/` — React Contexts для управления состоянием:
  - `provider.tsx` — AudioProvider (аудио плеер)
  - `UIDialogsContext.tsx` — управление диалогами (share, give up)
  - `TrackNavigationContext.tsx` — навигация между треками
  - `TrackGameUIContext.tsx` — сложная UI логика игры
- `src/shared/models/` — shared типы для соблюдения FSD:
  - `progress.ts` — TrackProgress типы
  - `track.ts` — Track типы
- `src/entities/progress/` — управление прогрессом:
  - `model/storage.ts` — работа с localStorage.
  - `model/stats.ts` — вычисление статистики и "нового".
  - `store/` — Zustand store для прогресса.
- `src/pages/home/ui/HomePage.tsx` — главная.
- `src/pages/track/ui/TrackPage.tsx` — игра/трек.
- `src/pages/about/ui/AboutPage.tsx` — о проекте.
- `cli/wizard.php` — CLI wizard для генерации треков с помощью OpenAI.
- `docs/260307-balkanski-kod-tz-mvp.md` — базовое ТЗ.
- `docs/260309-refactor-contexts.md` — рефакторинг контекстов.
- `docs/260308-updates.md` — фактические изменения поверх ТЗ.

### 3.2. Контекстная архитектура

Проект использует современную архитектуру React Contexts для разделения состояния:

**AudioContext** — управление аудио плеером:
- `isPlaying`, `currentTime`, `duration`, `error`, `inputValue`
- `play()`, `pause()`, `setCurrentTime()`, `setError()`, `setInputValue()`

**UIDialogsContext** — управление модальными окнами:
- `isShareOpen`, `isGiveUpOpen`, `shareFeedback`, `startedProgressSignature`
- `openShareDialog()`, `closeShareDialog()`, `setShareFeedback()`, `resetDialogs()`

**TrackNavigationContext** — навигация между треками:
- `currentTrack`, `currentTrackIndex`, `previousTrack`, `nextTrack`
- `goToPreviousTrack()`, `goToNextTrack()`, `canGoToPrevious`, `canGoToNext`

**TrackGameUIContext** — сложная UI логика игры:
- `isSolved`, `isFinished`, `isRevealed`, `shouldShowStartCta`
- `canUseHint`, `openedHints`, `attemptsForView`, `difficultyStars`
- `pageTitle`, `shouldShowTrackNavigation`

## 4. Правила добавления треков

При добавлении нового трека в `src/shared/config/tracks.ts`:

- строго соблюдать контракт `Track`;
- `id` в формате `track-XXX` и уникален;
- `links.local` должен соответствовать фактическому файлу в `public/tracks/`;
- `names.safe` не должен прямо палить разгадку;
- `hints` — от менее явной к более явной;
- `difficulty` — целое 1..5;
- `dates.added` — `YYYY-MM-DD`.

Для генерации контента можно использовать `cli/wizard.php` с OpenAI API.

Подсказочный шаблон для генерации контента: `docs/hints.md`.

## 5. Правила для шаринга и URL

- Проект использует `HashRouter`.
- Для share-ссылок использовать `VITE_APP_BASE_URL` с fallback на `import.meta.env.BASE_URL`.
- На GitHub Pages ожидаемый формат:
  - главная: `.../balkanskikod-quiz/#/`
  - трек: `.../balkanskikod-quiz/#/track/:id`
- В Web Share сохранять URL также в `text`, чтобы Telegram не терял ссылку.

## 6. GitHub Pages / Env

Обязательные переменные:

- `VITE_APP_NAME`
- `VITE_APP_BASE_URL`

Скрипты деплоя:

- `npm run build`
- `npm run deploy`

## 7. Тестирование

### 7.1. Запуск тестов
- `npm test` — все тесты (107 тестов)
- `npm run test:ui` — UI режим Vitest
- `npm run test:coverage` — покрытие кода

### 7.2. Структура тестов
- Unit тесты для всех контекстов в `src/shared/contexts/*.test.tsx`
- Unit тесты для доменной логики в `src/shared/lib/*.test.ts`
- Unit тесты для storage в `src/entities/progress/model/*.test.ts`
- Тесты для store в `src/entities/progress/store/*.test.ts`

### 7.3. Покрытие
- AudioContext: 7 тестов
- UIDialogsContext: 7 тестов  
- TrackNavigationContext: 5 тестов
- TrackGameUIContext: 7 тестов
- Доменная логика: 30 тестов
- Storage/Store: 51 тест

## 8. Перед завершением любой задачи

- Запустить `npm run lint`.
- Запустить `npm run build`.
- Для архитектурных проверок выполняйте `npm run lint:fsd` (steig­er) и исправляйте запрещённые sidestep-импорты.
- Если логика менялась — обновить `docs/260308-updates.md`.

## 9. Что нельзя делать без явного запроса

- Не менять тональность проекта (dark-only) на светлую.
- Не удалять существующие поля из `Track`/`TrackProgress`/`TrackProgressStatus`.
- Не переводить роутинг обратно на `BrowserRouter` для GitHub Pages.
- Не добавлять backend/авторизацию в рамках текущего MVP-репозитория.
- Не ломать контекстную архитектуру без необходимости.
- Не добавлять новые состояния в TrackPage напрямую — используйте контексты.

