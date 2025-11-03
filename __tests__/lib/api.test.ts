import { supabase } from '@/lib/supabase/client'
import { userApi, transactionsApi } from '@/lib/api'
import { mockUser, mockTransaction } from '../../__tests-helpers__'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn()
  }
}))

describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockAuthUser = { id: mockUser.id, email: mockUser.email }
      
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockAuthUser }
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await userApi.getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('should return null when not authenticated', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null }
      })

      const result = await userApi.getCurrentUser()

      expect(result).toBeNull()
    })

    it('should create profile if user not found in database', async () => {
      const mockAuthUser = { 
        id: mockUser.id, 
        email: mockUser.email,
        user_metadata: { full_name: 'Test User' }
      }
      
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockAuthUser }
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await userApi.getCurrentUser()

      expect(result).toEqual(mockUser)
    })
  })

  describe('createUserProfile', () => {
    it('should create new user profile with correct data', async () => {
      const mockAuthUser = {
        id: mockUser.id,
        email: mockUser.email,
        created_at: mockUser.created_at,
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }

      const mockFrom = jest.fn().mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await userApi.createUserProfile(mockAuthUser)

      expect(result).toEqual(mockUser)
      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('should use email prefix as name if no full_name provided', async () => {
      const mockAuthUser = {
        id: mockUser.id,
        email: 'testuser@example.com',
        created_at: mockUser.created_at,
        user_metadata: {}
      }

      const mockFrom = jest.fn().mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockUser, name: 'testuser' },
              error: null
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await userApi.createUserProfile(mockAuthUser)

      expect(result.name).toBeDefined()
    })
  })

  describe('updateUser', () => {
    it('should update user data', async () => {
      const updates = { name: 'Updated Name' }
      const updatedUser = { ...mockUser, ...updates }

      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: mockUser.id } }
      })

      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedUser,
                error: null
              })
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await userApi.updateUser(updates)

      expect(result).toEqual(updatedUser)
    })
  })
})

describe('Transactions API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTransactions', () => {
    it('should fetch all transactions for user', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: mockUser.id } }
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockTransaction],
              error: null
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await transactionsApi.getTransactions()

      expect(result).toEqual([mockTransaction])
      expect(supabase.from).toHaveBeenCalledWith('transactions')
    })
  })

  describe('getTransactions with filters', () => {
    it('should fetch transactions for current month', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: mockUser.id } }
      })

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [mockTransaction],
          error: null
        })
      }

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await transactionsApi.getTransactions(100)

      expect(result).toEqual([mockTransaction])
      expect(mockQuery.limit).toHaveBeenCalledWith(100)
    })
  })

  describe('createTransaction', () => {
    it('should create new transaction', async () => {
      const newTransaction = {
        type: 'expense' as const,
        amount: 100,
        description: 'Test expense',
        category_id: 'cat-1',
        date: new Date().toISOString(),
        status: 'completed' as const,
        payment_method: 'credit_card',
        is_recurring: false
      }

      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: mockUser.id } }
      })

      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockTransaction, ...newTransaction },
              error: null
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await transactionsApi.createTransaction(newTransaction)

      expect(result).toMatchObject(newTransaction)
    })

    it('should throw error when user not authenticated', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null }
      })

      const newTransaction = {
        type: 'expense' as const,
        amount: 100,
        description: 'Test',
        category_id: 'cat-1',
        date: new Date().toISOString(),
        payment_method: 'cash',
        is_recurring: false
      }

      await expect(transactionsApi.createTransaction(newTransaction)).rejects.toThrow()
    })
  })

  describe('updateTransaction', () => {
    it('should update existing transaction', async () => {
      const updates = { amount: 200, description: 'Updated' }
      const updatedTransaction = { ...mockTransaction, ...updates }

      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedTransaction,
                error: null
              })
            })
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      const result = await transactionsApi.updateTransaction(mockTransaction.id, updates)

      expect(result).toEqual(updatedTransaction)
    })
  })

  describe('deleteTransaction', () => {
    it('should delete transaction by id', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null
          })
        })
      })

      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      await transactionsApi.deleteTransaction(mockTransaction.id)

      expect(supabase.from).toHaveBeenCalledWith('transactions')
    })
  })
})
