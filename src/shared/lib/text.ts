import type { Track } from '../types/track';

const STOP_WORDS = new Set([
  'и',
  'в',
  'во',
  'на',
  'к',
  'по',
  'за',
  'из',
  'для',
  'с',
  'со',
  'а',
  'но',
  'или',
  'the',
  'a',
  'an',
  'to',
  'of',
  'in',
  'on',
  'and',
  'at',
  'u',
  'uz',
  'na',
  'za',
  'sa',
  'od',
  'do',
  'i',
]);

const CYR_TO_LAT_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const replaceCyrillicWithLatin = (text: string): string =>
  text
    .split('')
    .map((char) => CYR_TO_LAT_MAP[char] ?? char)
    .join('');

const normalizeVisualChars = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ё/g, 'е')
    .replace(/[’'`]/g, '')
    .replace(/[-–—_]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeAnswer = (value: string): string => {
  const base = normalizeVisualChars(value.toLowerCase());
  return replaceCyrillicWithLatin(base).replace(/\s+/g, ' ').trim();
};

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
};

const similarityScore = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) {
    return 1;
  }

  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
};

const wordSetSimilarityScore = (a: string, b: string): number => {
  const wordsA = new Set(extractSignificantWords(a));
  const wordsB = new Set(extractSignificantWords(b));

  if (wordsA.size === 0 && wordsB.size === 0) {
    return 1;
  }

  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }

  let intersectionCount = 0;
  wordsA.forEach((word) => {
    if (wordsB.has(word)) {
      intersectionCount += 1;
    }
  });

  return intersectionCount / Math.max(wordsA.size, wordsB.size);
};

const fuzzyWordSetSimilarityScore = (a: string, b: string): number => {
  const wordsA = extractSignificantWords(a);
  const wordsB = extractSignificantWords(b);

  if (wordsA.length === 0 && wordsB.length === 0) {
    return 1;
  }

  if (wordsA.length === 0 || wordsB.length === 0) {
    return 0;
  }

  const usedA = new Set<number>();
  let matches = 0;

  wordsB.forEach((targetWord) => {
    const matchIndex = wordsA.findIndex(
      (answerWord, index) =>
        !usedA.has(index) &&
        (answerWord === targetWord || isFuzzyWordMatch(answerWord, targetWord)),
    );

    if (matchIndex >= 0) {
      usedA.add(matchIndex);
      matches += 1;
    }
  });

  return matches / Math.max(wordsA.length, wordsB.length);
};

const exactWordSetMatch = (a: string, b: string): boolean => {
  const wordsA = new Set(extractSignificantWords(a));
  const wordsB = new Set(extractSignificantWords(b));

  if (wordsA.size === 0 || wordsB.size === 0) {
    return false;
  }

  if (wordsA.size !== wordsB.size) {
    return false;
  }

  for (const word of wordsA) {
    if (!wordsB.has(word)) {
      return false;
    }
  }

  return true;
};

export type AnswerCheckResult = {
  isCorrect: boolean;
  similarity: number;
};

export const checkAnswer = (answer: string, track: Track): AnswerCheckResult => {
  const normalizedInput = normalizeAnswer(answer);
  const normalizedRussian = normalizeAnswer(track.names.russian);
  const normalizedOriginal = normalizeAnswer(track.names.original);

  if (!normalizedInput) {
    return { isCorrect: false, similarity: 0 };
  }

  const directMatch =
    normalizedInput === normalizedRussian || normalizedInput === normalizedOriginal;
  if (directMatch) {
    return { isCorrect: true, similarity: 1 };
  }

  const directWordSetMatch =
    exactWordSetMatch(normalizedInput, normalizedRussian) ||
    exactWordSetMatch(normalizedInput, normalizedOriginal);
  if (directWordSetMatch) {
    return { isCorrect: true, similarity: 1 };
  }

  const russianSimilarity = similarityScore(normalizedInput, normalizedRussian);
  const originalSimilarity = similarityScore(normalizedInput, normalizedOriginal);
  const russianWordSimilarity = wordSetSimilarityScore(normalizedInput, normalizedRussian);
  const originalWordSimilarity = wordSetSimilarityScore(normalizedInput, normalizedOriginal);
  const russianFuzzyWordSimilarity = fuzzyWordSetSimilarityScore(
    normalizedInput,
    normalizedRussian,
  );
  const originalFuzzyWordSimilarity = fuzzyWordSetSimilarityScore(
    normalizedInput,
    normalizedOriginal,
  );
  const similarity = Math.max(
    russianSimilarity,
    originalSimilarity,
    russianWordSimilarity,
    originalWordSimilarity,
    russianFuzzyWordSimilarity,
    originalFuzzyWordSimilarity,
  );

  return {
    isCorrect: similarity > 0.9,
    similarity,
  };
};

const extractSignificantWords = (text: string): string[] =>
  normalizeAnswer(text)
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => Boolean(word) && !STOP_WORDS.has(word));

export type PartialMatchResult = {
  matchedWords: string[];
  ratio: number;
  hasPartialMatch: boolean;
};

const isFuzzyWordMatch = (answerWord: string, targetWord: string): boolean => {
  if (answerWord === targetWord) {
    return true;
  }

  if (!answerWord || !targetWord) {
    return false;
  }

  const minLength = Math.min(answerWord.length, targetWord.length);
  const maxLength = Math.max(answerWord.length, targetWord.length);

  // Very short tokens are too noisy for fuzzy matching.
  if (minLength < 3) {
    return false;
  }

  // Prefix overlap catches stem-like variants: "fantazer" ~ "fantazeru".
  const hasPrefixOverlap =
    minLength >= 4 &&
    (answerWord.startsWith(targetWord) || targetWord.startsWith(answerWord));
  if (hasPrefixOverlap) {
    return true;
  }

  // Allow minor typos/transliteration differences at word level.
  const wordSimilarity = similarityScore(answerWord, targetWord);
  if (wordSimilarity >= 0.8) {
    return true;
  }

  // Length guard to reduce accidental matches on very different words.
  return Math.abs(answerWord.length - targetWord.length) <= Math.ceil(maxLength * 0.2) && wordSimilarity >= 0.75;
};

const getMatchAgainstTarget = (
  answerWords: string[],
  targetWords: string[],
): PartialMatchResult => {
  if (targetWords.length === 0) {
    return {
      matchedWords: [],
      ratio: 0,
      hasPartialMatch: false,
    };
  }

  const usedAnswerIndices = new Set<number>();
  const matchedWords: string[] = [];

  targetWords.forEach((targetWord) => {
    const answerIndex = answerWords.findIndex(
      (answerWord, index) =>
        !usedAnswerIndices.has(index) &&
        isFuzzyWordMatch(answerWord, targetWord),
    );

    if (answerIndex >= 0) {
      usedAnswerIndices.add(answerIndex);
      matchedWords.push(targetWord);
    }
  });

  const ratio = matchedWords.length / targetWords.length;

  return {
    matchedWords,
    ratio,
    hasPartialMatch: ratio >= 0.2,
  };
};

export const getPartialMatches = (answer: string, track: Track): PartialMatchResult => {
  const answerWords = extractSignificantWords(answer);
  const russianWords = extractSignificantWords(track.names.russian);
  const originalWords = extractSignificantWords(track.names.original);

  const russianMatch = getMatchAgainstTarget(answerWords, russianWords);
  const originalMatch = getMatchAgainstTarget(answerWords, originalWords);

  return russianMatch.ratio >= originalMatch.ratio ? russianMatch : originalMatch;
};
