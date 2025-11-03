import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { SettingsProvider } from '@/contexts/settings-context'
import { UserPlanProvider } from '@/contexts/user-plan-context'

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  plan: 'basic' as const,
  registration_date: new Date('2025-01-01').toISOString(),
  stripe_customer_id: null,
  created_at: new Date('2025-01-01').toISOString(),
  updated_at: new Date('2025-01-01').toISOString(),
}

export const mockAdminUser = {
  ...mockUser,
  email: 'admin@moncoyfinance.com',
  id: 'admin-user-id',
}

export const mockProUser = {
  ...mockUser,
  plan: 'professional' as const,
}

export const mockPremiumUser = {
  ...mockUser,
  plan: 'premium' as const,
}

// Mock transaction data
export const mockTransaction = {
  id: 'txn-1',
  user_id: mockUser.id,
  type: 'expense' as const,
  amount: 100,
  description: 'Test expense',
  category_id: 'cat-1',
  date: new Date('2025-10-01').toISOString(),
  status: 'completed' as const,
  payment_method: 'credit_card',
  is_recurring: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock goal data
export const mockGoal = {
  id: 'goal-1',
  user_id: mockUser.id,
  name: 'Emergency Fund',
  target_amount: 10000,
  current_amount: 5000,
  deadline: new Date('2026-12-31').toISOString(),
  priority: 'high' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock investment data
export const mockInvestment = {
  id: 'inv-1',
  user_id: mockUser.id,
  name: 'ITUB4',
  type: 'stocks' as const,
  quantity: 100,
  average_price: 25.50,
  current_price: 30.00,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Custom render with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: typeof mockUser | null
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialUser = mockUser, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <SettingsProvider>
            <UserPlanProvider>
              {children}
            </UserPlanProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
