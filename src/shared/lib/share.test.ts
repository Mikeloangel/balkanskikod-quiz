 import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shareLink } from './share'

describe('shareLink', () => {
  const mockUrl = 'https://example.com'
  const mockTitle = 'Test Title'
  const mockText = 'Test text'

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any global state
    vi.restoreAllMocks()
  })

  describe('when Web Share API is available', () => {
    beforeEach(() => {
      // Mock navigator.share
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
      })
    })

    it('should use Web Share API successfully', async () => {
      const result = await shareLink(mockUrl, mockTitle, mockText)
      
      expect(result).toBe(true)
      expect(navigator.share).toHaveBeenCalledWith({
        url: mockUrl,
        title: mockTitle,
        text: `${mockText}\n${mockUrl}`,
      })
    })

    it('should handle Web Share API errors and fallback to clipboard', async () => {
      // Mock Web Share API to throw an error
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockRejectedValue(new Error('Share failed')),
        writable: true,
      })

      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
      })

      const result = await shareLink(mockUrl, mockTitle, mockText)
      
      expect(result).toBe(true)
      expect(navigator.share).toHaveBeenCalled()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl)
    })

    it('should handle empty text gracefully', async () => {
      const result = await shareLink(mockUrl, mockTitle, '')
      
      expect(result).toBe(true)
      expect(navigator.share).toHaveBeenCalledWith({
        url: mockUrl,
        title: mockTitle,
        text: `\n${mockUrl}`,
      })
    })

    it('should not duplicate URL in text if already present', async () => {
      const textWithUrl = `${mockText}\n${mockUrl}`
      const result = await shareLink(mockUrl, mockTitle, textWithUrl)
      
      expect(result).toBe(true)
      expect(navigator.share).toHaveBeenCalledWith({
        url: mockUrl,
        title: mockTitle,
        text: textWithUrl,
      })
    })
  })

  describe('when Web Share API is not available', () => {
    beforeEach(() => {
      // Remove navigator.share to simulate it not being available
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      })
    })

    it('should fallback to clipboard API', async () => {
      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
      })

      const result = await shareLink(mockUrl, mockTitle, mockText)
      
      expect(result).toBe(true)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl)
    })

    it('should return false when clipboard API fails', async () => {
      // Mock clipboard API to throw an error
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')),
        },
        writable: true,
      })

      const result = await shareLink(mockUrl, mockTitle, mockText)
      
      expect(result).toBe(false)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl)
    })
  })

  describe('URL and text normalization', () => {
    beforeEach(() => {
      // Mock navigator.share for these tests
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
      })
    })

    it('should trim URL and text', async () => {
      const result = await shareLink(` ${mockUrl} `, mockTitle, ` ${mockText} `)
      
      expect(result).toBe(true)
      expect(navigator.share).toHaveBeenCalledWith({
        url: mockUrl,
        title: mockTitle,
        text: `${mockText}\n${mockUrl}`,
      })
    })

    it('should handle URLs with trailing slashes', async () => {
      const urlWithSlash = `${mockUrl}/`
      const result = await shareLink(urlWithSlash, mockTitle, mockText)

      expect(result).toBe(true)
      expect(navigator.share).toHaveBeenCalledWith({
        url: urlWithSlash,
        title: mockTitle,
        text: `${mockText}\n${urlWithSlash}`,
      })
    })
  })

  describe('error handling', () => {
    it('should handle Web Share API rejection', async () => {
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockRejectedValue(new Error('Share rejected')),
        writable: true,
      })

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
      })

      const result = await shareLink(mockUrl, mockTitle, mockText)
      
      expect(result).toBe(true)
      expect(navigator.share).toHaveBeenCalled()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl)
    })

    it('should handle clipboard API rejection', async () => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      })

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard rejected')),
        },
        writable: true,
      })

      const result = await shareLink(mockUrl, mockTitle, mockText)
      
      expect(result).toBe(false)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl)
    })
  })
})