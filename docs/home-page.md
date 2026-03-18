# Главная страница

## Обзор

Главная страница (`src/pages/home/ui/HomePage.tsx`) — это основной экран приложения, который отображает статистику игрока, список треков и предоставляет доступ к ключевым функциям приложения.

## Архитектура

### Структура компонента

```tsx
export const HomePage = () => {
  // State для управления диалогами
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Данные из progress store
  const { state, actions } = useProgressStore();
  const stats = selectGlobalStats(state, tracksSortedByAddedDate);
  const lastSolved = selectLastSolved(state, tracksSortedByAddedDate, 5);
```

### Ключевые элементы

#### 1. **HeaderBlock**
- Заголовок приложения "Balkanski kod"
- Кнопка поделиться прогрессом
- Переключатель языка (LanguageSelector)

#### 2. **StatsBlock**
- Сетка плиточек (4 колонки на десктопе, 3 на мобильном)
- Каждая плитка: MUI-иконка + крупная цифра + подпись
- 8 показателей: всего треков, угадано, раскрыто, в процессе, % точности, среднее попыток, без подсказок, с сербской подсказкой
- Цветовые акценты: solved (зелёный), revealed (оранжевый), in_progress (голубой)
- Использует `selectGlobalStats` из progress store
- Компактный вид на мобильном (меньшие отступы, шрифты, иконки)

#### 3. **LastSolvedBlock**
- Горизонтальная лента с мини-карточками (обложка + название на сербском)
- Обложки загружаются из статических файлов `public/covers/{track-id}.jpg`
- Горизонтальный scroll-snap, скрытый scrollbar
- На мобильном: карточки 72px, на десктопе: 100px
- Hover-эффект scale
- Пустое состояние: иконка кубка + текст
- Использует `selectLastSolved` для получения данных

#### 4. **TracksListBlock**
- CSS Grid сетка карточек: 2 колонки (мобильный), 3 (планшет), 4 (десктоп)
- Фильтр-переключатель рядом с заголовком: Все / Отгаданные / Не отгаданные
- Фильтрация через `useMemo` по статусу прогресса в storage

#### 5. **TrackCard**
- Обложка 1:1 из `public/covers/{track-id}.jpg` с градиентным fallback
- Бейджи поверх обложки: NEW (новый трек), статус (solved/revealed/in_progress)
- Звёздочки сложности в правом нижнем углу обложки
- Название трека (safe или original+serbian если solved/revealed)
- Количество попыток
- Hover-эффект: подъём + тень
- Вся карточка кликабельная → `/track/:id`

#### 6. **DonateBanner** (между StatsBlock и LastSolvedBlock)
- Компактный однострочный баннер: текст слева + кнопка "Поддержать ⭐" справа
- Рендерится только если `VITE_TELEGRAM_DONATE_URL` задана (feature toggle)
- Deep link открывает Telegram-бота для Stars-платежей

#### 7. **FooterBlock**
- Ссылка на страницу "О проекте"
- Кнопка DonateButton (Telegram Stars) — между ссылкой и кнопкой сброса
- Кнопка сброса прогресса

## Управление состоянием

### Progress Store (React Context + useReducer)
Главная страница использует `useProgressStore` для управления прогрессом:

```tsx
const { state, actions } = useProgressStore();
```

- `state` — текущее состояние прогресса по всем трекам
- `actions` — методы для изменения прогресса

### Локальное состояние
- Управление диалогами (share, reset)
- Обратная связь от операций шаринга
- Фильтр треков (all / solved / unsolved) в TracksListBlock

## Функциональность

### Шаринг приложения
```tsx
const handleShare = async () => {
  const success = await shareLink(
    sharePayload.url,
    sharePayload.title,
    sharePayload.text,
  );
  // Обработка результата
};
```

- Поддержка Web Share API для мобильных устройств
- Fallback на копирование в буфер обмена
- Формирование URL с учетом `VITE_APP_BASE_URL`

### Сброс прогресса
```tsx
const handleReset = () => {
  actions.resetProgress();
  setIsResetOpen(false);
};
```

- Полная очистка прогресса через store actions
- Подтверждение через модальный диалог

## Обложки треков

Обложки загружаются как статические файлы:
- Путь: `public/covers/{track-id}.jpg`
- Генерация: `npm run extract-covers` (извлечение из MP3 ID3 тегов)
- URL формируется через `resolveLocalTrackUrl` (учитывает BASE_URL)
- При ошибке загрузки (404 или отсутствие обложки в MP3) — градиентный placeholder с иконкой ноты

## Интеграция с радио

На странице всегда отображается виджет радио:
```tsx
<RadioWidget />
```

Радио работает независимо от основного функционала и автоматически ставится на паузу при запуске игрового трека.

## Адаптивность

- Использует MUI Container с `maxWidth="lg"`
- Отступы: `py: 4, pb: 10` (место для фиксированного радио виджета)
- Stack spacing={3} для равномерных отступов между блоками
- StatsBlock: 3 колонки на мобильном, 4 на десктопе
- TracksListBlock: 2/3/4 колонки
- LastSolvedBlock: карточки 72px на мобильном, 100px на десктопе

## Конфигурация

### Переменные окружения
- `VITE_APP_NAME` — название приложения
- `VITE_APP_BASE_URL` — базовый URL для шаринга

### Зависимости
```tsx
import { tracksSortedByAddedDate } from '@/shared/config';
import { useProgressStore, selectGlobalStats, selectLastSolved } from '@/entities/progress';
import { shareLink } from '@/shared/lib/share';
import { RadioWidget } from '@/widgets/radioPlayer';
```

## Особенности реализации

1. **Совместимость с legacy кодом** — конвертация ProgressState в StorageSchema
2. **Мемоизация** — `useMemo` для sharePayload и фильтрации треков
3. **Обработка ошибок** — graceful fallback при ошибках шаринга и загрузки обложек
4. **Адаптивный дизайн** — компактные плитки и карточки на мобильных устройствах
5. **Статические обложки** — извлекаются при билде, не парсятся в runtime
