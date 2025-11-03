import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AIStatusCard } from '@/components/ai-status-card'
import { mockUser, mockProUser, mockPremiumUser } from '../../__tests-helpers__'

// Mock auth provider
jest.mock('@/components/auth-provider', () => ({
  useAuth: jest.fn(() => ({
    user: mockUser,
    userProfile: mockUser,
    loading: false,
    isAdmin: false
  }))
}))

// Mock dependencies
jest.mock('@/contexts/user-plan-context', () => ({
  useUserPlan: jest.fn(() => ({
    currentPlan: 'basic',
    features: {
      aiQuestionsPerWeek: 5,
      aiEnabled: true
    }
  }))
}))

jest.mock('@/contexts/settings-context', () => ({
  useSettingsContext: jest.fn(() => ({
    user: mockUser
  }))
}))

jest.mock('@/hooks/use-ai', () => ({
  useAI: jest.fn(() => ({
    usage: {
      allowed: true,
      remaining: 5,
      limit: 5,
      used: 0,
      resetDate: '2025-10-31T00:00:00Z',
      plan: 'basic'
    },
    usageLoading: false,
    isAvailable: true
  }))
}))

describe('AIStatusCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Plan - Learning Period', () => {
    it('should show countdown for users within 22-day period', () => {
      const recentUser = {
        ...mockUser,
        registration_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      }

      jest.spyOn(require('@/contexts/settings-context'), 'useSettingsContext').mockReturnValue({
        user: recentUser
      })

      render(<AIStatusCard />)

      expect(screen.getByText(/12 dias/i)).toBeInTheDocument() // 22 - 10 = 12 days remaining
      expect(screen.getByText(/aprende seus hábitos/i)).toBeInTheDocument()
    })

    it('should show AI available after 22 days', () => {
      const oldUser = {
        ...mockUser,
        registration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      }

      jest.spyOn(require('@/contexts/settings-context'), 'useSettingsContext').mockReturnValue({
        user: oldUser
      })

      render(<AIStatusCard />)

      expect(screen.queryByText(/dias/i)).not.toBeInTheDocument()
      expect(screen.getByText(/5\/5/i)).toBeInTheDocument() // Remaining questions
    })
  })

  describe('Professional Plan', () => {
    it('should not show learning period', () => {
      jest.spyOn(require('@/contexts/user-plan-context'), 'useUserPlan').mockReturnValue({
        currentPlan: 'professional',
        features: {
          aiQuestionsPerWeek: 7,
          aiEnabled: true
        }
      })

      jest.spyOn(require('@/contexts/settings-context'), 'useSettingsContext').mockReturnValue({
        user: mockProUser
      })

      jest.spyOn(require('@/hooks/use-ai'), 'useAI').mockReturnValue({
        usage: {
          allowed: true,
          remaining: 7,
          limit: 7,
          used: 0,
          resetDate: '2025-10-31T00:00:00Z',
          plan: 'professional'
        },
        usageLoading: false,
        isAvailable: true
      })

      render(<AIStatusCard />)

      expect(screen.getByText(/7\/7/i)).toBeInTheDocument()
      expect(screen.queryByText(/aprende seus hábitos/i)).not.toBeInTheDocument()
    })
  })

  describe('Premium Plan', () => {
    it('should show monthly limit instead of weekly', () => {
      jest.spyOn(require('@/contexts/user-plan-context'), 'useUserPlan').mockReturnValue({
        currentPlan: 'premium',
        features: {
          aiQuestionsPerMonth: 50,
          aiEnabled: true
        }
      })

      jest.spyOn(require('@/contexts/settings-context'), 'useSettingsContext').mockReturnValue({
        user: mockPremiumUser
      })

      jest.spyOn(require('@/hooks/use-ai'), 'useAI').mockReturnValue({
        usage: {
          allowed: true,
          remaining: 50,
          limit: 50,
          used: 0,
          resetDate: '2025-11-24T00:00:00Z',
          plan: 'premium'
        },
        usageLoading: false,
        isAvailable: true
      })

      render(<AIStatusCard />)

      expect(screen.getByText(/50\/50/i)).toBeInTheDocument()
    })
  })

  describe('Usage Display', () => {
    it('should show correct remaining questions', () => {
      jest.spyOn(require('@/hooks/use-ai'), 'useAI').mockReturnValue({
        usage: {
          allowed: true,
          remaining: 3,
          limit: 5,
          used: 2,
          resetDate: '2025-10-31T00:00:00Z',
          plan: 'basic'
        },
        usageLoading: false,
        isAvailable: true
      })

      render(<AIStatusCard />)

      expect(screen.getByText(/3\/5/i)).toBeInTheDocument()
    })

    it('should show warning when limit is reached', () => {
      jest.spyOn(require('@/hooks/use-ai'), 'useAI').mockReturnValue({
        usage: {
          allowed: false,
          remaining: 0,
          limit: 5,
          used: 5,
          resetDate: '2025-10-31T00:00:00Z',
          plan: 'basic'
        },
        usageLoading: false,
        isAvailable: true
      })

      render(<AIStatusCard />)

      expect(screen.getByText(/0\/5/i)).toBeInTheDocument()
      expect(screen.getByText(/limite atingido/i)).toBeInTheDocument()
    })

    it('should display reset date', () => {
      jest.spyOn(require('@/hooks/use-ai'), 'useAI').mockReturnValue({
        usage: {
          allowed: true,
          remaining: 5,
          limit: 5,
          used: 0,
          resetDate: '2025-10-31T00:00:00Z',
          plan: 'basic'
        },
        usageLoading: false,
        isAvailable: true
      })

      render(<AIStatusCard />)

      expect(screen.getByText(/31\/10\/2025/i)).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator while fetching usage', () => {
      jest.spyOn(require('@/hooks/use-ai'), 'useAI').mockReturnValue({
        usage: null,
        usageLoading: true,
        isAvailable: true
      })

      render(<AIStatusCard />)

      expect(screen.getByText(/carregando/i)).toBeInTheDocument()
    })
  })
})
