# Система квиза и проверки ответов

## Обзор

Система квиза отвечает за проверку ответов пользователя, сравнение с эталонными названиями треков и хранение прогресса. Основная логика находится в `src/shared/lib/text.ts`.

## Архитектура проверки ответов

### Основной алгоритм

Проверка ответа происходит через функцию `checkAnswer()`:

```tsx
export const checkAnswer = (answer: string, track: Track): AnswerCheckResult => {
  const normalizedInput = normalizeAnswer(answer);
  const normalizedTargets = getNormalizedTrackNameCandidates(track);
  const normalizedTitleTargets = getNormalizedTrackTitleCandidates(track);
  
  // Последовательная проверка с разной строгостью
  const directMatch = normalizedTargets.includes(normalizedInput);
  // ... другие проверки
}
```

### Этапы проверки

#### 1. **Нормализация ответа**
```tsx
export const normalizeAnswer = (value: string): string => {
  const base = normalizeVisualChars(value.toLowerCase());
  return replaceCyrillicWithLatin(base).replace(/\s+/g, ' ').trim();
};
```

- Приведение к нижнему регистру
- Удаление диакритических знаков
- Транслитерация кириллицы в латиницу
- Удаление спецсимволов и лишних пробелов

#### 2. **Генерация кандидатов для сравнения**
```tsx
const getNormalizedTrackNameCandidates = (track: Track): string[] => {
  const sourceNames = [track.names.russian, track.names.original];
  const normalizedCandidates = sourceNames.flatMap((name) => {
    const { full, titleOnly } = splitTitleAndArtist(name);
    return [normalizeAnswer(full), normalizeAnswer(titleOnly)].filter(Boolean);
  });
  return Array.from(new Set(normalizedCandidates));
};
```

- Использует оба названия: русское и оригинальное
- Создает варианты: полное название и только название трека (без исполнителя)
- Удаляет дубликаты

#### 3. **Последовательная проверка**

**Прямое совпадение** (самая строгая):
```tsx
const directMatch = normalizedTargets.includes(normalizedInput);
```

**Совпадение набора слов**:
```tsx
const directWordSetMatch = normalizedTargets.some((target) =>
  exactWordSetMatch(normalizedInput, target),
);
```

**Совпадение слов из названия**:
```tsx
const containsTitleMatch = normalizedTitleTargets.some((titleTarget) =>
  containsTitleWordsMatch(normalizedInput, titleTarget),
);
```

**Нечеткое сравнение** (самое мягкое):
```tsx
const similarity = normalizedTargets.reduce((best, target) => {
  const charSimilarity = similarityScore(normalizedInput, target);
  const wordSimilarity = wordSetSimilarityScore(normalizedInput, target);
  const fuzzyWordSimilarity = fuzzyWordSetSimilarityScore(normalizedInput, target);
  
  return Math.max(best, charSimilarity, wordSimilarity, fuzzyWordSimilarity);
}, 0);

return {
  isCorrect: similarity > 0.9,
  similarity,
};
```

## Алгоритмы сравнения

### 1. **Расстояние Левенштейна**
```tsx
const levenshteinDistance = (a: string, b: string): number => {
  // Классическая реализация с матрицей
  // Возвращает минимальное количество операций для преобразования
};
```

Используется для посимвольного сравнения с учетом опечаток.

### 2. **Сходство наборов слов**
```tsx
const wordSetSimilarityScore = (a: string, b: string): number => {
  const wordsA = new Set(extractSignificantWords(a));
  const wordsB = new Set(extractSignificantWords(b));
  
  // Вычисление пересечения множеств
  const intersectionCount = /* ... */;
  return intersectionCount / Math.max(wordsA.size, wordsB.size);
};
```

Сравнивает наборы значимых слов, игнорируя порядок и стоп-слова.

### 3. **Нечеткое сравнение слов**
```tsx
const isFuzzyWordMatch = (answerWord: string, targetWord: string): boolean => {
  // Префиксное совпадение для словоформ
  const hasPrefixOverlap = /* ... */;
  
  // Сходство на основе Левенштейна
  const wordSimilarity = similarityScore(answerWord, targetWord);
  
  return wordSimilarity >= 0.8 || hasPrefixOverlap;
};
```

Учитывает опечатки и разные словоформы.

### 4. **Извлечение значимых слов**
```tsx
const extractSignificantWords = (text: string): string[] =>
  normalizeAnswer(text)
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => Boolean(word) && !STOP_WORDS.has(word));
```

Удаляет стоп-слова ('и', 'в', 'на', 'the', 'a', etc.) и короткие токены.

## Система прогресса

### Структура хранения
```tsx
interface TrackProgress {
  trackId: string;
  status: TrackProgressStatus; // 'not_started' | 'in_progress' | 'solved' | 'revealed'
  attemptsCount: number;
  attemptsHistory: string[];
  hintsUsedCount: number;
  revealedSerbianTitle: boolean;
  revealedByGiveUp: boolean;
  solvedAt?: string;
}
```

### Операции с прогрессом

**Добавление попытки**:
```tsx
export const addAttempt = (trackId: string, answer: string): TrackProgress =>
  patchTrackProgress(trackId, (current) => {
    const attemptsHistory = [...current.attemptsHistory, answer].slice(-20);
    return {
      ...current,
      status: current.status === 'solved' ? 'solved' : 'in_progress',
      attemptsCount: current.attemptsCount + 1,
      attemptsHistory,
    };
  });
```

**Отметка о решении**:
```tsx
export const markTrackSolved = (trackId: string): TrackProgress =>
  patchTrackProgress(trackId, (current) => ({
    ...current,
    status: 'solved',
    solvedAt: new Date().toISOString(),
    revealedByGiveUp: false,
  }));
```

### localStorage интеграция

```tsx
export const readStorage = (): StorageSchema => {
  // Безопасное чтение с fallback
  // Санитизация данных при загрузке
};

export const writeStorage = (storage: StorageSchema): void => {
  // Атомарная запись с версией
};
```

## Частичные совпадения

Для UI обратной связи вычисляются частичные совпадения:

```tsx
export const getPartialMatches = (answer: string, track: Track): PartialMatchResult => {
  const answerWords = extractSignificantWords(answer);
  const russianWords = extractSignificantWords(track.names.russian);
  const originalWords = extractSignificantWords(track.names.original);
  
  const russianMatch = getMatchAgainstTarget(answerWords, russianWords);
  const originalMatch = getMatchAgainstTarget(answerWords, originalWords);
  
  return russianMatch.ratio >= originalMatch.ratio ? russianMatch : originalMatch;
};
```

Возвращает:
- `matchedWords` — массив совпавших слов
- `ratio` — доля совпадения (0-1)
- `hasPartialMatch` — есть ли частичное совпадение (>= 0.2)

## Конфигурация

### Стоп-слова
Предопределенный набор слов, которые игнорируются при сравнении:
- Русские: 'и', 'в', 'во', 'на', 'к', 'по', 'за', 'из', 'для', 'с', 'со', 'а', 'но', 'или'
- Английские: 'the', 'a', 'an', 'to', 'of', 'in', 'on', 'and', 'at'

### Пороги совпадения
- Прямое совпадение: 100%
- Нечеткое совпадение: > 90%
- Частичное совпадение для UI: >= 20%
- Словоуровневое нечеткое совпадение: >= 80%

## Особенности реализации

1. **Многоязычность** — поддержка русских и оригинальных названий
2. **Транслитерация** — автоматическая конвертация кириллицы в латиницу
3. **Отказоустойчивость** — graceful fallback при некорректных данных
4. **Производительность** — мемоизация и кэширование нормализованных значений
5. **Обратная совместимость** — поддержка старых форматов localStorage
