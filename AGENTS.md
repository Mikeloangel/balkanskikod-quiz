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

## 3. Ключевые файлы проекта

*Организованы согласно FSD: каждый слой/срез экспортирует API через `index.ts`.*

- `src/shared/config/tracks.ts` — каталог треков.
- `src/shared/lib/text.ts` — нормализация, checkAnswer, partial match.
- `src/entities/progress/model/storage.ts` — работа с localStorage.
- `src/entities/progress/model/stats.ts` — вычисление статистики и "нового".
- `src/pages/home/ui/HomePage.tsx` — главная.
- `src/pages/track/ui/TrackPage.tsx` — игра/трек.
- `src/pages/about/ui/AboutPage.tsx` — о проекте.
- `docs/260307-balkanski-kod-tz-mvp.md` — базовое ТЗ.
- `docs/260308-updates.md` — фактические изменения поверх ТЗ.

## 4. Правила добавления треков

При добавлении нового трека в `src/shared/config/tracks.ts`:

- строго соблюдать контракт `Track`;
- `id` в формате `track-XXX` и уникален;
- `links.local` должен соответствовать фактическому файлу в `public/tracks/`;
- `names.safe` не должен прямо палить разгадку;
- `hints` — от менее явной к более явной;
- `difficulty` — целое 1..5;
- `dates.added` — `YYYY-MM-DD`.

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

## 7. Перед завершением любой задачи

- Запустить `npm run lint`.
- Запустить `npm run build`.
- Для архитектурных проверок выполняйте `npm run lint:fsd` (steig­er) и исправляйте запрещённые sidestep-импорты.
- Если логика менялась — обновить `docs/260308-updates.md`.

## 8. Что нельзя делать без явного запроса

- Не менять тональность проекта (dark-only) на светлую.
- Не удалять существующие поля из `Track`/`TrackProgress`.
- Не переводить роутинг обратно на `BrowserRouter` для GitHub Pages.
- Не добавлять backend/авторизацию в рамках текущего MVP-репозитория.

