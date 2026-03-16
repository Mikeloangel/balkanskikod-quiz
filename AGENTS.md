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
- **Интернационализация реализована** — поддержка 4 языков (ru, en, sr, sr_cyrl) с динамической загрузкой контента. Все тексты интерфейса должны проходить через i18n.

## 3. Архитектура проекта

### 3.1. Ключевые файлы проекта

*Организованы согласно FSD: каждый слой/срез экспортирует API через `index.ts`.*

- `src/shared/config/tracks.ts` — каталог треков для игры.
- `src/shared/config/radioTracks.ts` — каталог треков для радио.
- `src/shared/lib/text.ts` — нормализация, checkAnswer, partial match.
- `src/shared/contexts/` — React Contexts для управления состоянием:
  - `provider.tsx` — AudioProvider (аудио плеер игры)
  - `RadioProvider.tsx` — RadioProvider (аудио плеер радио)
  - `UIDialogsContext.tsx` — управление диалогами (share, give up)
  - `TrackNavigationContext.tsx` — навигация между треками
  - `TrackGameUIContext.tsx` — сложная UI логика игры
- `src/shared/i18n/` — интернационализация (4 языка + динамическая загрузка контента)
- `src/shared/radio/` — shared типы и storage для радио:
  - `types/radioTrack.ts` — RadioTrack, RadioState, RadioStorage типы
  - `types/storage.ts` — localStorage функции для радио
- `src/shared/models/` — shared типы для соблюдения FSD:
  - `progress.ts` — TrackProgress типы
  - `track.ts` — Track типы
- `src/entities/progress/` — управление прогрессом:
  - `model/storage.ts` — работа с localStorage.
  - `model/stats.ts` — вычисление статистики и "нового".
  - `store/` — Zustand store для прогресса.
- `src/widgets/radioPlayer/` — виджет радио:
  - `ui/RadioWidget.tsx` — основной виджет с адаптивной версткой
  - `ui/TrackInfo.tsx` — информация о треке и кнопка SUNO
  - `ui/PlayControls.tsx` — кнопка Play/Pause
  - `ui/VolumeControl.tsx` — регулятор громкости с умными кнопками
  - `ui/ProgressBar.tsx` — визуальный прогресс-бар без перемотки
- `src/content/about/` — контент страниц с динамической загрузкой:
  - `types.ts` — TypeScript типы контента
  - `index.ts` — экспорт всех языков
  - `ru.ts`, `en.ts`, `sr.ts`, `sr-cyrl.ts` — контент на 4 языках
- `src/pages/home/ui/HomePage.tsx` — главная.
- `src/pages/track/ui/TrackPage.tsx` — игра/трек.
- `src/pages/about/ui/AboutPage.tsx` — о проекте.
- `cli/wizard.php` — CLI wizard для генерации треков с помощью OpenAI.
- `docs/specs/` — история изменений и выполненные задачи:
  - `260307-balkanski-kod-tz-mvp.md` — исходное ТЗ MVP.
  - `260309-refactor-contexts.md` — рефакторинг контекстов.
  - `260308-updates.md` — фактические изменения поверх ТЗ.
  - `260310-radio-balkan.md` — ТЗ для радио виджета.
  - *Внимание: файлы в specs отражают историю разработки и могут устаревать. Актуальная документация в корне `docs/`*

### 3.2. Контекстная архитектура

Проект использует современную архитектуру React Contexts для разделения состояния:

**AudioContext** — управление аудио плеером игры:
- `isPlaying`, `currentTime`, `duration`, `error`, `inputValue`
- `play()`, `pause()`, `setCurrentTime()`, `setError()`, `setInputValue()`

**RadioProvider** — управление радио плеером:
- `isPlaying`, `currentTime`, `duration`, `volume`, `error`
- `play()`, `pause()`, `setVolume()`, `nextTrack()`, `openTrackInSuno()`
- Случайный порядок треков с сохранением в localStorage
- Автоматическая пауза при запуске игрового трека
- Ограничение 30 минут прослушивания

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

### 3.3. Радио архитектура

**RadioProvider** — контекст для управления радио:
- Использует `resolveLocalTrackUrl()` для корректных путей с `BASE_URL`
- Сохраняет состояние в `localStorage` с ключом `balkanski-kod-radio-state`
- Поддерживает случайный порядок треков
- Автоматически переключает треки по окончании
- Интегрирован с игровым плеером (пауза радио при запуске игры)

**Виджет радио** — фиксированный виджет внизу экрана:
- Адаптивная верстка: 1 строка на десктопе, 2 строки на мобильных
- Play/Pause, информация о треке, кнопка SUNO
- Регулятор громкости с умными кнопками (mute/unmute)
- Визуальный прогресс-бар без возможности перемотки
- Стилизован в едином дизайне с остальным интерфейсом

## 4. Правила добавления треков

### 4.1. Игровые треки

При добавлении нового трека в `src/shared/config/tracks.ts`:

- строго соблюдать контракт `Track`;
- `id` в формате `track-XXX` и уникален;
- `links.local` должен соответствовать фактическому файлу в `public/tracks/`;
- `names.safe` не должен прямо палить разгадку;
- `hints` — от менее явной к более явной;
- `difficulty` — целое 1..5;
- `dates.added` — `YYYY-MM-DD`.

### 4.2. Радио треки

При добавлении нового трека в `src/shared/config/radioTracks.ts`:

- строго соблюдать контракт `RadioTrack`;
- `id` в формате `track-XXX` и уникален;
- `links.local` должен соответствовать фактическому файлу в `public/tracks/`;
- `links.suno` — ссылка на трек в Suno;
- `names.serbian`, `names.russian`, `names.original` — названия на разных языках;
- `dates.added` — `YYYY-MM-DD`.

Для генерации контента можно использовать `cli/wizard.php` с OpenAI API.

**Wizard функциональность:**
- Интерактивный ввод данных о треке
- Генерация `names.safe` и подсказок через OpenAI
- Выбор куда добавить трек: quiz, радио или оба
- Автоматическое обновление конфигурационных файлов
- Поддержка разных форматов ввода (текст, файл, пропустить)

Подсказочный шаблон для генерации контента: `docs/specs/hints.md`.

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
- `VITE_RADIO_MAX_PLAY_TIME_MINUTES` (по умолчанию 30)

Скрипты деплоя:

- `npm run build`
- `npm run deploy`

## 7. Тестирование

### 7.1. Запуск тестов
- `npm test` — все тесты (122 теста)
- `npm run test:ui` — UI режим Vitest
- `npm run test:coverage` — покрытие кода

### 7.2. Структура тестов
- Unit тесты для всех контекстов в `src/shared/contexts/*.test.tsx`
- Unit тесты для доменной логики в `src/shared/lib/*.test.ts`
- Unit тесты для storage в `src/shared/radio/types/*.test.ts`
- Unit тесты для storage в `src/entities/progress/model/*.test.ts`
- Unit тесты для store в `src/entities/progress/store/*.test.ts`
- Unit тесты для LanguageContext в `src/shared/contexts/LanguageContext.test.tsx`

### 7.3. Покрытие
- AudioContext: 7 тестов
- RadioProvider: 8 тестов
- UIDialogsContext: 7 тестов  
- TrackNavigationContext: 5 тестов
- TrackGameUIContext: 7 тестов
- LanguageContext: 7 тестов
- Доменная логика: 30 тестов
- Radio storage: 7 тестов
- Storage/Store: 51 тестов
- **Общее: 122 теста** с полным покрытием функционала интернационализации

## 8. Перед завершением любой задачи

- Запустить `npm run lint`.
- Запустить `npm run build`.
- Для архитектурных проверок выполняйте `npm run lint:fsd` (steig­er) и исправляйте запрещённые sidestep-импорты.
- Если логика менялась — обновить соответствующую документацию в `docs/`:
  - `docs/quiz-system.md` — для изменений в логике проверки ответов
  - `docs/home-page.md` — для изменений в работе главной страницы
  - `docs/radio-module.md` — для изменений в модуле радио

## 9. Что нельзя делать без явного запроса

- Не менять тональность проекта (dark-only) на светлую.
- Не удалять существующие поля из `Track`/`TrackProgress`/`TrackProgressStatus`.
- Не переводить роутинг обратно на `BrowserRouter` для GitHub Pages.
- Не добавлять backend/авторизацию в рамках текущего MVP-репозитория.
- Не ломать контекстную архитектуру без необходимости.
- Не добавлять новые состояния в TrackPage напрямую — используйте контексты.
- Не добавлять возможность перемотки в радио (это радио, не плеер).
- Не менять случайный порядок треков на последовательный без запроса.

