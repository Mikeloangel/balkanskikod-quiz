# Техническое задание: React Store Integration
## Проект: Balkanski kod — угадай мелодию

## 1. Назначение документа
Этот документ описывает план миграции с текущей callback-based системы управления состоянием на нативный React Store (Context + useReducer) для улучшения архитектуры и developer experience.

---

## 2. Текущая архитектура состояния

### 2.1. Проблемы текущего подхода
- **Callback prop drilling**: `onStorageUpdated` передается через все компоненты
- **Ручные ре-рендеры**: useState tick pattern для обновления UI
- **Прямые вызовы storage**: Компоненты напрямую вызывают `readStorage()`
- **Отсутствие реактивности**: Изменения в localStorage не триггерят обновления автоматически

### 2.2. Текущие сущности состояния
```typescript
// src/entities/progress/model/types.ts
TrackProgressStatus: 'not_started' | 'in_progress' | 'solved' | 'revealed'
TrackProgress: { trackId, status, attemptsCount, attemptsHistory, hintsUsedCount, revealedSerbianTitle, revealedByGiveUp, solvedAt? }
StorageSchema: { version, tracks: Record<string, TrackProgress>, stats }
```

---

## 3. Целевая архитектура

### 3.1. React Store Design
Используем **Context + useReducer + localStorage persistence**:

```typescript
// src/app/store/ProgressStoreContext.tsx
interface ProgressState {
  tracks: Record<string, TrackProgress>;
  stats: AppStatsSnapshot;
  isLoading: boolean;
  error: string | null;
}

interface ProgressActions {
  // Track operations
  addAttempt: (trackId: string, answer: string) => void;
  markTrackSolved: (trackId: string) => void;
  revealSerbianTitle: (trackId: string) => void;
  applyHint: (trackId: string) => void;
  giveUpTrack: (trackId: string) => void;
  
  // Global operations
  resetProgress: () => void;
  loadFromStorage: () => Promise<void>;
  
  // Computed selectors
  getTrackProgress: (trackId: string) => TrackProgress;
  getGlobalStats: (tracks: Track[]) => GlobalStats;
  getLastSolvedTracks: (tracks: Track[], limit: number) => Track[];
  isTrackNew: (trackId: string, addedDate: string) => boolean;
}
```

### 3.2. Структура файлов
```
src/app/store/
├── ProgressStoreContext.tsx    # Context и Provider
├── progressReducer.ts          # Reducer логика
├── progressActions.ts          # Action creators
├── progressSelectors.ts       # Computed selectors
├── localStorageMiddleware.ts   # Persistence layer
└── index.ts                   # Public API
```

---

## 4. План миграции

### Phase 1: Store Setup (2-3 часа)
- [ ] Создать структуру директории `src/app/store/`
- [ ] Реализовать `progressReducer.ts` с основными actions
- [ ] Создать `ProgressStoreContext.tsx` с Provider
- [ ] Реализовать `localStorageMiddleware.ts` для персистентности
- [ ] Добавить Provider в `App.tsx`
- [ ] Базовые тесты для reducer

### Phase 2: Component Migration (4-5 часов)
- [ ] Обновить `App.tsx` - убрать `onStorageUpdated` callback
- [ ] Мигрировать `HomePage.tsx`:
  - [ ] Заменить `readStorage()` на `useProgressStore()`
  - [ ] Убрать `onStorageUpdated` prop
  - [ ] Использовать селекторы для stats и lastSolved
- [ ] Мигрировать `TrackPage.tsx`:
  - [ ] Заменить прямые вызовы storage на store actions
  - [ ] Обновить все game logic компоненты
  - [ ] Убрать `onStorageUpdated` prop
- [ ] Обновить все дочерние компоненты:
  - [ ] `StatsBlock`
  - [ ] `TracksListBlock`
  - [ ] `GuessFormBlock`
  - [ ] `AttemptsHistoryBlock`
  - [ ] `ResultCardBlock`

### Phase 3: Advanced Features (2-3 часа)
- [ ] Оптимизировать производительность:
  - [ ] Добавить `useMemo` для селекторов
  - [ ] Реализовать shallow compare для complex objects
  - [ ] Оптимизировать Context splitting
- [ ] Добавить computed selectors:
  - [ ] `getGlobalStats` - вычисление статистики
  - [ ] `isTrackNew` - проверка новых треков
  - [ ] `getCompletionPercentage` - процент прохождения
- [ ] Добавить error handling:
  - [ ] Обработка ошибок localStorage
  - [ ] Graceful fallback при corrupted data
- [ ] Улучшить TypeScript типы:
  - [ ] Строгая типизация actions
  - [ ] Generic selectors
  - [ ] Error types

### Phase 4: Testing & Cleanup (1-2 часа)
- [ ] Unit тесты для reducer
- [ ] Integration тесты для store
- [ ] Component тесты с mock store
- [ ] Удалить unused code:
  - [ ] Убрать `onStorageUpdated` из всех interfaces
  - [ ] Удалить callback logic из `App.tsx`
  - [ ] Очистить imports
- [ ] Обновить документацию:
  - [ ] Обновить `AGENTS.md`
  - [ ] Обновить `docs/260308-updates.md`

---

## 5. Детальная реализация

### 5.1. Store Structure
```typescript
// State shape
interface ProgressState {
  tracks: Record<string, TrackProgress>;
  stats: AppStatsSnapshot;
  loading: boolean;
  error: string | null;
}

// Actions
type ProgressAction = 
  | { type: 'ADD_ATTEMPT'; trackId: string; answer: string }
  | { type: 'MARK_SOLVED'; trackId: string }
  | { type: 'REVEAL_SERBIAN'; trackId: string }
  | { type: 'APPLY_HINT'; trackId: string }
  | { type: 'GIVE_UP'; trackId: string }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_FROM_STORAGE'; payload: StorageSchema }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };
```

### 5.2. Selectors
```typescript
// Computed selectors (memoized)
export const selectTrackProgress = (state: ProgressState, trackId: string) => 
  state.tracks[trackId] ?? createDefaultTrackProgress(trackId);

export const selectGlobalStats = (state: ProgressState, tracks: Track[]) => 
  computeGlobalStats(tracks, state.tracks);

export const selectLastSolved = (state: ProgressState, tracks: Track[], limit: number) =>
  computeLastSolved(tracks, state.tracks, limit);
```

### 5.3. Persistence Strategy
```typescript
// localStorage middleware
const persistMiddleware = (store: ProgressStore) => {
  // Subscribe to store changes
  // Debounce writes to localStorage
  // Handle migration between versions
  // Validate data on load
};
```

---

## 6. Что должно попасть в Store

### 6.1. Core State (YES)
- ✅ **Track Progress**: Вся информация о прогрессе пользователя
- ✅ **Global Stats**: Вычисляемая статистика
- ✅ **UI State**: Loading, error states
- ✅ **App Settings**: Если появятся настройки

### 6.2. Derived State (NO - computed selectors)
- ❌ **Track Lists**: Вычисляются из tracks + progress
- ❌ **Filter Results**: Композируются в компонентах
- ❌ **Form State**: Локальное состояние компонентов
- ❌ **Audio Player State**: Временное состояние UI

### 6.3. External State (NO)
- ❌ **Track Metadata**: Статические данные из `tracks.ts`
- ❌ **Navigation**: React Router responsibility
- ❌ **Theme**: MUI ThemeProvider responsibility

---

## 7. Migration Checklists

### 7.1. Pre-Migration Checklist
- [ ] Backup current working version
- [ ] Run full test suite (`npm test`)
- [ ] Check build (`npm run build`)
- [ ] Document current behavior with screenshots
- [ ] Create feature branch for migration

### 7.2. Migration Validation Checklist
- [ ] All existing functionality works identically
- [ ] localStorage persistence works correctly
- [ ] No memory leaks or performance regressions
- [ ] TypeScript compilation without errors
- [ ] ESLint passes without warnings
- [ ] FSD architecture compliance (`npm run lint:fsd`)

### 7.3. Post-Migration Checklist
- [ ] Remove all `onStorageUpdated` references
- [ ] Update component interfaces
- [ ] Add store documentation
- [ ] Performance testing (React DevTools Profiler)
- [ ] Cross-browser testing
- [ ] Mobile testing

---

## 8. Risk Assessment

### 8.1. High Risk Areas
- **localStorage Migration**: Потеря пользовательского прогресса
- **Performance**: Ненужные ре-рендеры компонентов
- **Type Safety**: Сложные типы для actions и selectors

### 8.2. Mitigation Strategies
- **Backup Strategy**: Сохранять текущую localStorage схему
- **Gradual Migration**: Поэтапная замена компонентов
- **Extensive Testing**: Unit + integration тесты
- **Rollback Plan**: Быстрый откат к текущей версии

---

## 9. Success Criteria

### 9.1. Functional Requirements
- [ ] Все текущие функции работают без изменений
- [ ] localStorage персистентность сохраняется
- [ ] UI реактивность улучшается
- [ ] Код становится проще для поддержки

### 9.2. Technical Requirements
- [ ] Нулевые breaking changes для пользователей
- [ ] Улучшенная TypeScript поддержка
- [ ] Соответствие FSD архитектуре
- [ ] Bundle size не увеличивается значительно

### 9.3. Developer Experience
- [ ] Упрощенное API для работы с состоянием
- [ ] Лучшие debugging возможности
- [ ] Чистая архитектура без prop drilling
- [ ] Легкость добавления новых фич

---

## 10. Implementation Timeline

| Phase | Duration | Dependencies | Deliverables |
|-------|----------|---------------|--------------|
| Phase 1: Store Setup | 2-3 часа | None | Working store with persistence |
| Phase 2: Component Migration | 4-5 часов | Phase 1 complete | All components using store |
| Phase 3: Advanced Features | 2-3 часа | Phase 2 complete | Optimized selectors |
| Phase 4: Testing & Cleanup | 1-2 часа | Phase 3 complete | Production-ready implementation |

**Total Estimated Time**: 9-13 часов для AI-assisted разработки

---

## 11. Критерии приемки

Migration считается успешной когда:
1. ✅ Все существующие функции работают идентично текущей версии
2. ✅ localStorage данные мигрируются без потерь
3. ✅ Удалены все callback patterns (`onStorageUpdated`)
4. ✅ Проект собирается и проходит все тесты
5. ✅ Производительность не ухудшилась
6. ✅ Код соответствует FSD архитектуре
7. ✅ Документация обновлена

---

## 12. Следующие шаги после миграции

1. **Добавить DevTools integration** для debugging
2. **Реализовать undo/redo** для пользовательских действий
3. **Добавить analytics** для отслеживания пользовательского поведения
4. **Оптимизировать bundle splitting** с использованием store
5. **Рассмотреть добавление WebSocket** для real-time фич (если понадобится)