# Модуль радио

## Обзор

Модуль радио — это независимый аудиоплеер, который работает в фоне и позволяет слушать балканскую музыку. Радио автоматически управляет воспроизведением, случайным порядком треков и интегрировано с игровым плеером.

## Архитектура

### Core компоненты

#### 1. **RadioProvider** (`src/shared/contexts/RadioProvider.tsx`)
Главный контекст, управляющий состоянием радио:

```tsx
interface RadioContextType {
  state: RadioState;
  currentTrack: RadioTrack | null;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  openTrackInSuno: () => void;
  resetError: () => void;
}
```

#### 2. **RadioWidget** (`src/widgets/radioPlayer/ui/RadioWidget.tsx`)
Фиксированный виджет внизу экрана с адаптивной версткой.

#### 3. **Storage layer** (`src/shared/radio/`)
- `types/radioTrack.ts` — типы RadioTrack, RadioState
- `types/storage.ts` — localStorage функции

## Состояние радио

### RadioState структура
```tsx
interface RadioState {
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackStartTime: number | null;
  totalPlayedTime: number;
  error: string | null;
}
```

### Ограничения
- **Максимальное время прослушивания**: 30 минут (настраивается через `VITE_RADIO_MAX_PLAY_TIME_MINUTES`)
- **Случайный порядок треков**: исключает повторение текущего трека
- **Автопереход**: следующий трек начинается автоматически после окончания текущего

## Управление воспроизведением

### Play/Pause логика
```tsx
const play = useCallback(() => {
  if (!audioRef.current || !currentTrack) return;

  const playPromise = audioRef.current.play();
  playPromise
    .then(() => {
      const now = Date.now();
      setState(prev => ({
        ...prev,
        isPlaying: true,
        playbackStartTime: now,
        error: null,
      }));
      
      // Сохранение в localStorage
      setRadioStorage({
        currentTrackId: currentTrack.id,
        playbackStartTime: now,
        totalPlayedTime: state.totalPlayedTime,
      });
      
      startProgressTracking();
      setupMaxPlayTimeout();
      
      // Пауза игрового плеера
      const gameAudio = getGameAudioRef();
      if (gameAudio) {
        gameAudio.pause();
      }
      
      onPlay?.(); // Callback для паузы игрового плеера
    })
    .catch(() => {
      setState(prev => ({
        ...prev,
        error: 'Не удалось воспроизвести трек',
      }));
    });
}, [currentTrack, /* ... */]);
```

### Отслеживание прогресса
```tsx
const updateProgress = useCallback(() => {
  if (audioRef.current && state.isPlaying) {
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 0;
    
    setState(prev => ({
      ...prev,
      currentTime,
      duration,
    }));

    // Проверка лимита времени
    setState(prev => {
      const currentTotalPlayedTime = prev.totalPlayedTime;
      if (currentTotalPlayedTime >= MAX_PLAY_TIME_MS) {
        return {
          ...prev,
          isPlaying: false,
          error: 'Максимальное время прослушивания достигнуто (30 минут)',
        };
      }
      return prev;
    });
  }
}, [state.isPlaying]);
```

## Случайный порядок треков

### Алгоритм выбора следующего трека
```tsx
const nextTrack = useCallback(() => {
  // Исключаем текущий трек из выбора
  const availableTracks = radioTracks.filter(track => track.id !== state.currentTrackId);
  const randomIndex = Math.floor(Math.random() * availableTracks.length);
  const nextTrack = availableTracks[randomIndex];
  
  if (!nextTrack) return;

  setState(prev => ({
    ...prev,
    currentTrackId: nextTrack.id,
    currentTime: 0,
    duration: 0,
  }));

  setRadioStorage({
    currentTrackId: nextTrack.id,
    playbackStartTime: null,
    totalPlayedTime: state.totalPlayedTime,
  });
}, [state.currentTrackId, state.totalPlayedTime]);
```

### Автоматический переход
```tsx
const handleEnded = () => {
  nextTrackAndPlay();
};

// В useEffect
audio.addEventListener('ended', handleEnded);
```

## Интеграция с игровым плеером

### Автоматическая пауза
При запуске радио игровой плеер автоматически ставится на паузу:

```tsx
// Через глобальный ref
const gameAudio = getGameAudioRef();
if (gameAudio) {
  gameAudio.pause();
}

// Через callback
onPlay?.();
```

### Разрешение конфликтов
- Радио имеет приоритет при запуске
- Игровой плеер автоматически ставит радио на паузу
- Используется глобальный ref для кросс-контекстного взаимодействия

## Работа с URL треков

### resolveLocalTrackUrl
```tsx
const resolveLocalTrackUrl = (localPath: string): string => {
  if (/^https?:\/\//i.test(localPath)) {
    return localPath; // Уже абсолютный URL
  }

  const normalizedPath = localPath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};
```

- Поддержка как локальных путей, так и внешних URL
- Автоматическая подстановка `BASE_URL` для GitHub Pages
- Нормализация путей

## localStorage интеграция

### Структура хранения
```tsx
interface RadioStorage {
  currentTrackId: string | null;
  playbackStartTime: number | null;
  totalPlayedTime: number;
}
```

Ключ: `balkanski-kod-radio-state`

### Операции
```tsx
// Чтение при инициализации
useEffect(() => {
  const storage = getRadioStorage();
  
  let trackId = storage.currentTrackId;
  if (!trackId || !radioTracks.find(track => track.id === trackId)) {
    // Случайный трек если нет сохраненного
    const randomIndex = Math.floor(Math.random() * radioTracks.length);
    trackId = radioTracks[randomIndex]?.id || null;
  }

  setState(prev => ({
    ...prev,
    currentTrackId: trackId,
    totalPlayedTime: storage.totalPlayedTime,
  }));
}, []);
```

## UI компоненты

### RadioWidget структура
```tsx
<RadioWidget>
  <PlayControls />      // Play/Pause кнопка
  <TrackInfo />         // Название трека (оригинал + перевод)
  <VolumeControl />     // Регулятор громкости (скрыт на iOS)
  <SunoButton />        // Ссылка на оригинал в Suno
  <CoverArt />          // Обложка трека
  <ProgressBar />       // Визуальный прогресс без перемотки
</RadioWidget>
```

### CoverArt
- Обложка из статического файла `public/covers/{track-id}.jpg`
- URL формируется через `resolveLocalTrackUrl`
- Fallback: иконка ноты при ошибке загрузки
- Скрывается на узких экранах (< 440px)
- При смене трека используется `key={coverUrl}` для сброса состояния ошибки

### Адаптивность
- **Десктоп**: 1 строка, все элементы горизонтально
- **Мобильные (< 440px)**: обложка скрыта

### VolumeControl особенности
- Одна кнопка-иконка (VolumeOff / VolumeDown / VolumeUp по уровню)
- Клик открывает вертикальный Slider в Popover
- Двойной клик — toggle mute (запоминает предыдущую громкость)
- **iOS**: компонент полностью скрыт (`return null`), т.к. iOS Safari игнорирует `HTMLAudioElement.volume`
- Определение iOS: `userAgent` + `maxTouchPoints > 1` (ловит iPad на iPadOS)

## Обработка ошибок

### Типы ошибок
1. **Ошибка загрузки трека** — автоматический переход к следующему через 2 секунды
2. **Ошибка воспроизведения** — отображение пользователю
3. **Превышение лимита времени** — автоматическая остановка

### Обработка ошибок загрузки
```tsx
const handleError = () => {
  setState(prev => ({
    ...prev,
    error: 'Ошибка загрузки трека',
  }));
  setTimeout(nextTrack, 2000); // Автопереход
};
```

## Конфигурация

### Переменные окружения
- `VITE_RADIO_MAX_PLAY_TIME_MINUTES` — максимальное время прослушивания (по умолчанию 30)
- `BASE_URL` — для корректных путей к аудиофайлам

### Конфигурация треков
```tsx
// src/shared/config/radioTracks.ts
export const radioTracks: RadioTrack[] = [
  {
    id: 'track-XXX',
    names: {
      serbian: '...',
      russian: '...',
      original: '...',
    },
    links: {
      local: 'tracks/xxx.mp3',
      suno: 'https://suno.com/...',
    },
    dates: {
      added: '2024-XX-XX',
    },
  },
];
```

## Особенности реализации

1. **Независимость** — радио работает независимо от игрового процесса
2. **Автоматизация** — минимальное вмешательство пользователя
3. **Интеграция** — бесшовная работа с игровым плеером
4. **Отказоустойчивость** — автоматическое восстановление после ошибок
5. **Адаптивность** — корректная работа на всех устройствах
6. **Персистентность** — сохранение состояния между сессиями
