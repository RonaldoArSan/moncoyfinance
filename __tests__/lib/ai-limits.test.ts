import { checkAILimitLocal, incrementAIUsageLocal, AIUsage } from '@/lib/ai-limits'

describe('AI Limits (Legacy Local)', () => {
  const mockDate = new Date('2025-10-24T10:00:00Z')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('checkAILimitLocal', () => {
    it('should allow basic plan user with usage under limit', () => {
      const usage: AIUsage = {
        count: 3,
        lastReset: mockDate.toISOString(),
        plan: 'basic'
      }

      const result = checkAILimitLocal('basic', usage)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2) // 5 - 3
    })

    it('should deny basic plan user when limit reached', () => {
      const usage: AIUsage = {
        count: 5,
        lastReset: mockDate.toISOString(),
        plan: 'basic'
      }

      const result = checkAILimitLocal('basic', usage)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset counter for basic plan after 7 days', () => {
      const lastReset = new Date('2025-10-17T10:00:00Z') // 7 days ago
      const usage: AIUsage = {
        count: 5,
        lastReset: lastReset.toISOString(),
        plan: 'basic'
      }

      const result = checkAILimitLocal('basic', usage)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(5) // Reset to full limit
    })

    it('should handle professional plan with 7 questions/week', () => {
      const usage: AIUsage = {
        count: 4,
        lastReset: mockDate.toISOString(),
        plan: 'professional'
      }

      const result = checkAILimitLocal('professional', usage)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(3) // 7 - 4
    })

    it('should handle premium plan with 50 questions/month', () => {
      const usage: AIUsage = {
        count: 25,
        lastReset: mockDate.toISOString(),
        plan: 'premium'
      }

      const result = checkAILimitLocal('premium', usage)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(25) // 50 - 25
    })

    it('should reset premium plan counter after 30 days', () => {
      const lastReset = new Date('2025-09-24T10:00:00Z') // 30 days ago
      const usage: AIUsage = {
        count: 50,
        lastReset: lastReset.toISOString(),
        plan: 'premium'
      }

      const result = checkAILimitLocal('premium', usage)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(50) // Reset to full limit
    })

    it('should return correct reset date for weekly plans', () => {
      const usage: AIUsage = {
        count: 2,
        lastReset: mockDate.toISOString(),
        plan: 'basic'
      }

      const result = checkAILimitLocal('basic', usage)
      const expectedResetDate = new Date('2025-10-31T10:00:00Z') // 7 days later

      expect(result.resetDate.getTime()).toBe(expectedResetDate.getTime())
    })

    it('should return correct reset date for monthly plans', () => {
      const usage: AIUsage = {
        count: 10,
        lastReset: mockDate.toISOString(),
        plan: 'premium'
      }

      const result = checkAILimitLocal('premium', usage)
      const expectedResetDate = new Date('2025-11-24T10:00:00Z') // 1 month later

      expect(result.resetDate.getTime()).toBe(expectedResetDate.getTime())
    })
  })

  describe('incrementAIUsageLocal', () => {
    it('should increment usage count by 1', () => {
      const usage: AIUsage = {
        count: 3,
        lastReset: mockDate.toISOString(),
        plan: 'basic'
      }

      const result = incrementAIUsageLocal(usage)

      expect(result.count).toBe(4)
      expect(result.lastReset).toBe(usage.lastReset)
      expect(result.plan).toBe(usage.plan)
    })

    it('should not modify original usage object', () => {
      const usage: AIUsage = {
        count: 3,
        lastReset: mockDate.toISOString(),
        plan: 'basic'
      }

      const originalCount = usage.count
      incrementAIUsageLocal(usage)

      expect(usage.count).toBe(originalCount)
    })
  })
})

describe('AI Limits API Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('checkAILimit API', () => {
    it('should call /api/ai/usage endpoint', async () => {
      const mockResponse = {
        allowed: true,
        remaining: 5,
        limit: 5,
        used: 0,
        resetDate: '2025-10-31T00:00:00Z',
        plan: 'basic'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const { checkAILimit } = await import('@/lib/ai-limits')
      const result = await checkAILimit()

      expect(global.fetch).toHaveBeenCalledWith('/api/ai/usage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when API call fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const { checkAILimit } = await import('@/lib/ai-limits')
      
      await expect(checkAILimit()).rejects.toThrow()
    })
  })

  describe('incrementAIUsage API', () => {
    it('should call POST /api/ai/usage endpoint', async () => {
      const mockResponse = {
        success: true,
        remaining: 4,
        used: 1,
        limit: 5
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const { incrementAIUsage } = await import('@/lib/ai-limits')
      const result = await incrementAIUsage()

      expect(global.fetch).toHaveBeenCalledWith('/api/ai/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when limit is reached', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Limite de perguntas atingido' })
      })

      const { incrementAIUsage } = await import('@/lib/ai-limits')
      
      await expect(incrementAIUsage()).rejects.toThrow()
    })
  })
})
