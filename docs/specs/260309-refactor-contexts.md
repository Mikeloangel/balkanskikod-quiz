# Техническое задание: TrackPage Contexts Refactoring
## Проект: Balkanski kod — угадай мелодию

## 1. Назначение документа
Этот документ описывает план рефакторинга компонента TrackPage с использованием React Contexts для устранения проблемы множественных useState и сложных условий.

---

## 2. Текущая проблема в TrackPage

### 2.1. Симптомы
- **9 useState в одном компоненте** - избыточное локальное состояние
- **Сложные вычисляемые условия** - много boolean логики
- **Смешанная ответственость** - audio, UI, game logic в одном месте
- **Трудно тестировать** - все зависимости в одном компоненте

### 2.2. Текущие useState
```typescript
const [startedProgressSignature, setStartedProgressSignature] = useState<string | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [inputValue, setInputValue] = useState(progress.attemptsHistory.at(-1) ?? '');
const [audioError, setAudioError] = useState('');
const [audioDuration, setAudioDuration] = useState(0);
const [audioCurrentTime, setAudioCurrentTime] = useState(0);
const [isShareOpen, setIsShareOpen] = useState(false);
const [isGiveUpOpen, setIsGiveUpOpen] = useState(false);
const [shareFeedback, setShareFeedback] = useState<string | null>(null);
```

### 2.3. Сложные условия
```typescript
const shouldShowStartCta =
  !isFinished &&
  progress.attemptsCount === 0 &&
  progress.hintsUsedCount === 0 &&
  !progress.revealedSerbianTitle &&
  !hasStartedInCurrentProgress;

const canShowHintButton = canUseHint || !progress.revealedSerbianTitle;
```

---

## 3. Целевая архитектура

### 3.1. Разделение на контексты
Используем **множественные специализированные контексты** вместо одного монолитного:

```typescript
// 1. Audio Context - управление аудио плеером
interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error: string;
  inputValue: string;
}

interface AudioActions {
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setError: (error: string) => void;
  setInputValue: (value: string) => void;
}

// 2. UI Dialogs Context - управление диалогами
interface UIDialogsState {
  isShareOpen: boolean;
  isGiveUpOpen: boolean;
  shareFeedback: string | null;
}

interface UIDialogsActions {
  openShare: () => void;
  closeShare: () => void;
  openGiveUp: () => void;
  closeGiveUp: () => void;
  setShareFeedback: (feedback: string | null) => void;
}

// 3. Track Navigation Context - навигация между треками
interface TrackNavigationState {
  currentTrack: Track;
  previousTrack: Track | null;
  nextTrack: Track | null;
  currentTrackIndex: number;
}

// 4. Track Game UI Context - UI логика игры
interface TrackGameUIState {
  shouldShowStartCta: boolean;
  canUseHint: boolean;
  canShowHintButton: boolean;
  shouldShowTrackNavigation: boolean;
  openedHints: string[];
  attemptsForView: string[];
  pageTitle: string;
  difficultyStars: string;
  startedProgressSignature: string | null;
}
```

### 3.2. Структура файлов
```
src/
├── shared/contexts/
│   ├── AudioContext.tsx
│   ├── UIDialogsContext.tsx
│   ├── TrackNavigationContext.tsx
│   └── TrackGameUIContext.tsx
├── pages/track/ui/
│   ├── TrackPage.tsx (упрощенный)
│   ├── elements/
│   │   ├── AudioPlayerBlock.tsx (использует AudioContext)
│   │   ├── ShareDialog.tsx (использует UIDialogsContext)
│   │   ├── GiveUpDialog.tsx (использует UIDialogsContext)
│   │   └── TrackNavigation.tsx (использует TrackNavigationContext)
```

---

## 4. План рефакторинга

### Phase 1: Audio Context (Приоритет: HIGH)
**Цель**: Выделить аудио логику в отдельный контекст

**Задачи**:
- [ ] Создать `src/shared/contexts/AudioContext.tsx`
- [ ] Реализовать `useAudioState` хук
- [ ] Мигрировать audio состояния из TrackPage
- [ ] Обновить `AudioPlayerBlock` для использования контекста
- [ ] Тесты для AudioContext

**Состояния для миграции**:
```typescript
isPlaying, currentTime, duration, audioError, inputValue
```

### Phase 2: UI Dialogs Context (Приоритет: HIGH)
**Цель**: Выделить управление диалогами

**Задачи**:
- [ ] Создать `src/shared/contexts/UIDialogsContext.tsx`
- [ ] Реализовать `useUIDialogsState` хук
- [ ] Мигрировать диалоговые состояния
- [ ] Обновить `ShareDialog` и `GiveUpDialog`
- [ ] Тесты для UIDialogsContext

**Состояния для миграции**:
```typescript
isShareOpen, isGiveUpOpen, shareFeedback
```

### Phase 3: Track Navigation Context (Приоритет: MEDIUM)
**Цель**: Выделить логику навигации

**Задачи**:
- [ ] Создать `src/shared/contexts/TrackNavigationContext.tsx`
- [ ] Реализовать `useTrackNavigation` хук
- [ ] Мигрировать навигационную логику
- [ ] Обновить компоненты навигации
- [ ] Тесты для TrackNavigationContext

**Состояния для миграции**:
```typescript
currentTrackIndex, previousTrack, nextTrack
```

### Phase 4: Track Game UI Context (Приоритет: MEDIUM)
**Цель**: Выделить сложную UI логику

**Задачи**:
- [ ] Создать `src/shared/contexts/TrackGameUIContext.tsx`
- [ ] Реализовать `useTrackGameUIState` хук
- [ ] Мигрировать все сложные условия
- [ ] Обновить дочерние компоненты
- [ ] Тесты для TrackGameUIContext

**Состояния для миграции**:
```typescript
shouldShowStartCta, canUseHint, openedHints, attemptsForView, etc.
```

### Phase 5: TrackPage Refactoring (Приоритет: HIGH)
**Цель**: Упростить основной компонент

**Задачи**:
- [ ] Обновить `TrackPage.tsx` с использованием контекстов
- [ ] Удалить неиспользуемые useState
- [ ] Упростить render логику
- [ ] Интеграционные тесты

---

## 5. Детальная реализация

### 5.1. Audio Context
```typescript
// src/shared/contexts/AudioContext.tsx
interface AudioContextType {
  state: AudioState;
  actions: AudioActions;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const actions = {
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    // ...
  };

  return (
    <AudioContext.Provider value={{ state: { isPlaying, currentTime, duration, error, inputValue }, actions }}>
      {children}
    </AudioContext.Provider>
  );
};
```

### 5.2. Композиция контекстов
```typescript
// TrackPage.tsx
const TrackPageContent = ({ track }: TrackPageContentProps) => {
  const { state, actions } = useProgressStore();
  const progress = selectTrackProgress(state, track.id);

  return (
    <AudioProvider>
      <UIDialogsProvider>
        <TrackNavigationProvider track={track}>
          <TrackGameUIProvider track={track} progress={progress}>
            <TrackPageContentInner />
          </TrackGameUIProvider>
        </TrackNavigationProvider>
      </UIDialogsProvider>
    </AudioProvider>
  );
};
```

---

## 6. Преимущества рефакторинга

### 6.1. Упрощение компонента
- **До**: 9 useState, 15+ вычисляемых переменных
- **После**: 1-2 useState, готовые хуки

### 6.2. Разделение ответственностей
- **Audio**: Аудио плеер и управление
- **UI**: Диалоги и пользовательский фидбэк
- **Navigation**: Перемещение между треками
- **Game Logic**: Правила отображения UI элементов

### 6.3. Переиспользование
```typescript
// AudioContext можно использовать в других местах:
<AudioProvider>
  <SomeOtherComponentWithAudio />
</AudioProvider>
```

### 6.4. Тестирование
- Изолированные тесты для каждого контекста
- Мокирование зависимостей
- Упрощенные unit тесты

---

## 7. Риски и митигация

### 7.1. Потенциальные риски
- **Performance**: Множественные контексты могут влиять на рендер
- **Complexity**: Сложность композиции контекстов
- **Debugging**: Труднее отлаживать несколько контекстов

### 7.2. Митигация
- **useMemo** для вычисляемых значений
- **Разделение** по ответственностям
- **DevTools** для отладки контекстов
- **Постепенная миграция** по phase

---

## 8. Критерии приемки

### 8.1. Функциональные требования
- [ ] Все текущие функции работают без изменений
- [ ] Аудио плеер работает корректно
- [ ] Диалоги открываются/закрываются
- [ ] Навигация между треками работает
- [ ] UI логика отображается правильно

### 8.2. Технические требования
- [ ] Количество useState в TrackPage ≤ 3
- [ ] Каждый контекст имеет свои тесты
- [ ] TypeScript типизация строгая
- [ ] ESLint без ошибок
- [ ] FSD архитектура соблюдена

### 8.3. Качество кода
- [ ] Компоненты стали проще для понимания
- [ ] Логика разделена по областям
- [ ] Переиспользование контекстов
- [ ] Покрытие тестами не ниже 80%

---

## 9. Estimated Timeline

| Phase | Duration | Dependencies | Deliverables |
|-------|----------|---------------|--------------|
| Phase 1: Audio Context | 2-3 часа | None | Working AudioContext with tests |
| Phase 2: UI Dialogs Context | 1-2 часа | Phase 1 complete | Working UIDialogsContext |
| Phase 3: Track Navigation | 1-2 часа | Phase 1 complete | Navigation context |
| Phase 4: Track Game UI | 2-3 часа | Phase 1-3 complete | Game UI context |
| Phase 5: TrackPage Refactor | 1-2 часа | All phases | Simplified TrackPage |

**Total Estimated Time**: 7-12 часов

---

## 10. Следующие шаги после рефакторинга

1. **Оптимизация производительности** контекстов
2. **Добавление новых фич** с использованием контекстов
3. **Создание библиотеки** переиспользуемых контекстов
4. **Интеграция с аналитикой** через контексты
5. **Документирование best practices** для контекстов в проекте