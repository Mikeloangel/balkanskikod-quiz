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
  
  // Данные из Zustand store
  const { state, actions } = useProgressStore();
  const stats = selectGlobalStats(state, tracksSortedByAddedDate);
  const lastSolved = selectLastSolved(state, tracksSortedByAddedDate, 5);
```

### Ключевые элементы

#### 1. **HeaderBlock**
- Заголовок приложения "Balkanski kod"
- Кнопка поделиться прогрессом

#### 2. **StatsBlock**
- Глобальная статистика: решено треков, всего треков, процент решения
- Использует `selectGlobalStats` из progress store

#### 3. **LastSolvedBlock**
- Показывает последние 5 решенных треков
- Использует `selectLastSolved` для получения данных

#### 4. **TracksListBlock**
- Полный список всех треков с их статусами
- Принимает `storageSchema` для совместимости с legacy кодом

#### 5. **FooterBlock**
- Кнопка сброса прогресса
- Информация о проекте

## Управление состоянием

### Zustand Store
Главная страница использует `useProgressStore` для управления прогрессом:

```tsx
const { state, actions } = useProgressStore();
```

- `state` — текущее состояние прогресса по всем трекам
- `actions` — методы для изменения прогресса

### Локальное состояние
- Управление диалогами (share, reset)
- Обратная связь от операций шаринга

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

## Интеграция с радио

На странице всегда отображается виджет радио:
```tsx
<RadioWidget />
```

Радио работает независимо от основного функционала и автоматически ставится на паузу при запуске игрового трека.

## Адаптивность

- Использует MUI Container с `maxWidth="lg"`
- Отступы: `py: 4, pb: 18` (место для фиксированного радио виджета)
- Stack spacing={3} для равномерных отступов между блоками

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
2. **Мемоизация** — `useMemo` для sharePayload во избежание перерасчетов
3. **Обработка ошибок** — graceful fallback при ошибках шаринга
4. **Адаптивный дизайн** — корректная работа на мобильных и десктоп устройствах
