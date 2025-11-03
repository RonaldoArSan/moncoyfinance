import { renderHook, waitFor, act } from '@testing-library/react'
import { UserPlanProvider, useUserPlan } from '@/contexts/user-plan-context'
import { mockUser, mockProUser, mockPremiumUser } from '../../__tests-helpers__'
import React from 'react'

// Mock AuthProvider component to pass user from test
const MockAuthProvider = ({ children, user }: { children: React.ReactNode; user: any }) => {
  const { useAuth } = require('@/components/auth-provider')
  useAuth.mockReturnValue({ user, loading: false })
  return <>{children}</>
}

// Mock dependencies
jest.mock('@/components/auth-provider', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}))

// Wrapper with UserPlanProvider that accepts user as prop
const createWrapper = (user: any) => {
  return ({ children }: { children: React.ReactNode }) => {
    const { useAuth } = require('@/components/auth-provider')
    useAuth.mockReturnValue({ user, loading: false })
    
    // Mock Supabase auth.getUser
    const { supabase } = require('@/lib/supabase/client')
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: user.id, email: user.email } },
      error: null
    })
    
    // Mock Supabase from('users').select()
    const selectMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: user,
          error: null
        })
      })
    })
    
    supabase.from.mockReturnValue({
      select: selectMock
    })
    
    return <UserPlanProvider>{children}</UserPlanProvider>
  }
}

describe('UserPlanContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('Plan Features', () => {
    it('should return correct features for basic plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockUser) })

      await waitFor(() => {
        expect(result.current.currentPlan).toBe('basic')
      })
      
      expect(result.current.features).toMatchObject({
        aiModel: 'gpt-4o-mini',
        aiQuestionsLimit: 5,
        pdfReports: false,
        supportLevel: 'email'
      })
    })

    it('should return correct features for professional plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockProUser) })

      await waitFor(() => {
        expect(result.current.currentPlan).toBe('pro')
      })
      
      expect(result.current.features).toMatchObject({
        aiModel: 'gpt-4o-mini',
        aiQuestionsLimit: 7,
        pdfReports: true,
        supportLevel: 'email_whatsapp'
      })
    })

    it('should return correct features for premium plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockPremiumUser) })

      await waitFor(() => {
        expect(result.current.currentPlan).toBe('premium')
      })
      
      expect(result.current.features).toMatchObject({
        aiModel: 'gpt-4o',
        aiQuestionsLimit: 50,
        pdfReports: true,
        supportLevel: 'priority'
      })
    })
  })

  describe('Plan Features Availability', () => {
    it('should have correct features for basic plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockUser) })

      await waitFor(() => {
        expect(result.current.features.aiQuestionsLimit).toBe(5)
      })
      
      expect(result.current.features.pdfReports).toBe(false)
      expect(result.current.features.supportLevel).toBe('email')
      expect(result.current.isFeatureAvailable('pdfReports')).toBe(false)
    })

    it('should have correct features for professional plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockProUser) })

      await waitFor(() => {
        expect(result.current.features.aiQuestionsLimit).toBe(7)
      })
      
      expect(result.current.features.pdfReports).toBe(true)
      expect(result.current.features.supportLevel).toBe('email_whatsapp')
      expect(result.current.isFeatureAvailable('pdfReports')).toBe(true)
    })

    it('should have correct features for premium plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockPremiumUser) })

      await waitFor(() => {
        expect(result.current.features.aiQuestionsLimit).toBe(50)
      })
      
      expect(result.current.features.pdfReports).toBe(true)
      expect(result.current.features.supportLevel).toBe('priority')
      expect(result.current.features.advancedAnalysis).toBeGreaterThan(0)
      expect(result.current.isFeatureAvailable('advancedAnalysis')).toBe(true)
    })
  })

  describe('Plan Upgrade', () => {
    it.skip('should handle plan upgrade successfully', async () => {
      // TODO: Fix async upgrade test
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/test' })
      })

      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockUser) })

      await act(async () => {
        await result.current.upgradeToProfessional()
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'professional' })
      })
    })

    it.skip('should handle upgrade failure', async () => {
      // TODO: Fix async upgrade test
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Payment failed' })
      })

      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockUser) })

      await act(async () => {
        await result.current.upgradeToProfessional()
      })

      expect(result.current.currentPlan).toBe('basic')
    })
  })

  describe('Plan Comparison', () => {
    it('should have gpt-4o-mini model for basic plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockUser) })

      await waitFor(() => {
        expect(result.current.features.aiModel).toBe('gpt-4o-mini')
      })
    })

    it('should have gpt-4o model for premium plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockPremiumUser) })

      await waitFor(() => {
        expect(result.current.features.aiModel).toBe('gpt-4o')
      })
    })

    it('should have 5 AI questions limit for basic plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockUser) })
      
      await waitFor(() => {
        expect(result.current.features.aiQuestionsLimit).toBe(5)
      })
    })

    it('should have 7 AI questions limit for pro plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockProUser) })
      
      await waitFor(() => {
        expect(result.current.features.aiQuestionsLimit).toBe(7)
      })
    })

    it('should have 50 AI questions limit for premium plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockPremiumUser) })
      
      await waitFor(() => {
        expect(result.current.features.aiQuestionsLimit).toBe(50)
      })
    })

    it('should have email support for basic plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockUser) })
      
      await waitFor(() => {
        expect(result.current.features.supportLevel).toBe('email')
      })
    })

    it('should have email_whatsapp support for pro plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockProUser) })
      
      await waitFor(() => {
        expect(result.current.features.supportLevel).toBe('email_whatsapp')
      })
    })

    it('should have priority support for premium plan', async () => {
      const { result } = renderHook(() => useUserPlan(), { wrapper: createWrapper(mockPremiumUser) })
      
      await waitFor(() => {
        expect(result.current.features.supportLevel).toBe('priority')
      })
    })
  })
})
