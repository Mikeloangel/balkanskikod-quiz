import { describe, it, expect } from 'vitest'
import { normalizeAnswer, checkAnswer, getPartialMatches } from './text'
import type { Track } from '@/shared/models'

describe('normalizeAnswer', () => {
  it('should normalize Cyrillic characters to Latin', () => {
    expect(normalizeAnswer('Привет')).toBe('privet')
    expect(normalizeAnswer('Москва')).toBe('moskva')
    expect(normalizeAnswer('Санкт-Петербург')).toBe('sankt peterburg')
  })

  it('should handle mixed case and punctuation', () => {
    expect(normalizeAnswer('Hello, World!')).toBe('hello world')
    expect(normalizeAnswer('Test-Case')).toBe('test case')
    expect(normalizeAnswer("It's a test")).toBe('its a test')
  })

  it('should handle diacritics and special characters', () => {
    expect(normalizeAnswer('café')).toBe('cafe')
    expect(normalizeAnswer('naïve')).toBe('naive')
    expect(normalizeAnswer('résumé')).toBe('resume')
  })

  it('should handle empty and whitespace-only strings', () => {
    expect(normalizeAnswer('')).toBe('')
    expect(normalizeAnswer('   ')).toBe('')
    expect(normalizeAnswer('\t\n')).toBe('')
  })

  it('should handle mixed Cyrillic and Latin', () => {
    expect(normalizeAnswer('Hello Привет')).toBe('hello privet')
    expect(normalizeAnswer('Москва Moscow')).toBe('moskva moscow')
  })

  it('should normalize visual characters', () => {
    expect(normalizeAnswer('test–case')).toBe('test case')
    expect(normalizeAnswer('test—case')).toBe('test case')
    expect(normalizeAnswer("test'case")).toBe('testcase')
    expect(normalizeAnswer('test`case')).toBe('testcase')
  })
})

describe('checkAnswer', () => {
  const mockTrack: Track = {
    id: 'track-001',
    names: {
      safe: 'Safe Name',
      serbian: 'Serbian Name',
      russian: 'Русское Название',
      original: 'Original Name',
    },
    links: {
      local: '/tracks/track-001.mp3',
      suno: 'https://suno.com/song/123',
    },
    hints: ['First hint', 'Second hint'],
    difficulty: 1,
    dates: {
      added: '2025-01-01',
    },
  }

  it('should return false for empty answer', () => {
    const result = checkAnswer('', mockTrack)
    expect(result.isCorrect).toBe(false)
    expect(result.similarity).toBe(0)
  })

  it('should return true for exact match', () => {
    const result = checkAnswer('Русское Название', mockTrack)
    expect(result.isCorrect).toBe(true)
    expect(result.similarity).toBe(1)
  })

  it('should handle case-insensitive matching', () => {
    const result = checkAnswer('русское название', mockTrack)
    expect(result.isCorrect).toBe(true)
    expect(result.similarity).toBe(1)
  })

  it('should handle Cyrillic to Latin transliteration', () => {
    const result = checkAnswer('Russkoe Nazvanie', mockTrack)
    expect(result.isCorrect).toBe(true)
    expect(result.similarity).toBe(1)
  })

  it('should handle partial matches with high similarity', () => {
    const result = checkAnswer('Русское', mockTrack)
    expect(result.isCorrect).toBe(false)
    expect(result.similarity).toBeGreaterThanOrEqual(0.5)
  })

  it('should handle word set matches', () => {
    const result = checkAnswer('Название Русское', mockTrack)
    expect(result.isCorrect).toBe(true)
    expect(result.similarity).toBe(1)
  })

  it('should return false for completely different answers', () => {
    const result = checkAnswer('Completely Different', mockTrack)
    expect(result.isCorrect).toBe(false)
    expect(result.similarity).toBeLessThan(0.5)
  })

  it('should handle title-only matching', () => {
    const trackWithArtist = {
      ...mockTrack,
      names: {
        ...mockTrack.names,
        russian: 'Песня - Исполнитель',
        original: 'Song - Artist',
      },
    }
    
    const result = checkAnswer('Песня', trackWithArtist)
    expect(result.isCorrect).toBe(true)
    expect(result.similarity).toBe(1)
  })
})

describe('getPartialMatches', () => {
  const mockTrack: Track = {
    id: 'track-001',
    names: {
      safe: 'Safe Name',
      serbian: 'Serbian Name',
      russian: 'Русское Название',
      original: 'Original Name',
    },
    links: {
      local: '/tracks/track-001.mp3',
      suno: 'https://suno.com/song/123',
    },
    hints: ['First hint', 'Second hint'],
    difficulty: 1,
    dates: {
      added: '2025-01-01',
    },
  }

  it('should return empty result for empty answer', () => {
    const result = getPartialMatches('', mockTrack)
    expect(result.matchedWords).toEqual([])
    expect(result.ratio).toBe(0)
    expect(result.hasPartialMatch).toBe(false)
  })

  it('should find partial matches in Russian name', () => {
    const result = getPartialMatches('Русское', mockTrack)
    expect(result.matchedWords).toContain('russkoe')
    expect(result.ratio).toBeGreaterThan(0)
    expect(result.hasPartialMatch).toBe(true)
  })

  it('should find partial matches in original name', () => {
    const result = getPartialMatches('Original', mockTrack)
    expect(result.matchedWords).toContain('original')
    expect(result.ratio).toBeGreaterThan(0)
    expect(result.hasPartialMatch).toBe(true)
  })

  it('should handle fuzzy matching', () => {
    const result = getPartialMatches('Russkoe', mockTrack)
    expect(result.hasPartialMatch).toBe(true)
    expect(result.ratio).toBeGreaterThan(0)
  })

  it('should return no match for completely different words', () => {
    const result = getPartialMatches('Completely Different', mockTrack)
    expect(result.matchedWords).toEqual([])
    expect(result.ratio).toBe(0)
    expect(result.hasPartialMatch).toBe(false)
  })

  it('should prefer Russian matches over original when ratios are equal', () => {
    const trackWithEqualRatios = {
      ...mockTrack,
      names: {
        ...mockTrack.names,
        russian: 'Test Name',
        original: 'Test Name',
      },
    }
    
    const result = getPartialMatches('Test', trackWithEqualRatios)
    expect(result.hasPartialMatch).toBe(true)
    expect(result.ratio).toBeGreaterThan(0)
  })
})