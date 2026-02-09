import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { getAuthUserId, ensureUserId } from '@/lib/auth-helper'
import type { Transaction, Goal, Investment, InvestmentTransaction, Category, User, RecurringTransaction, Commitment } from '@/lib/supabase/types'

// User API functions
export const userApi = {
  async getCurrentUser(): Promise<User | null> {
    logger.dev('🔍 [API] Getting current user...')

    const { data: { user } } = await supabase.auth.getUser()
    logger.dev('🔍 [API] Auth user:', { id: user?.id, email: user?.email, hasUser: !!user })

    if (!user) {
      logger.dev('❌ [API] No auth user found')
      return null
    }

    logger.dev('📡 [API] Fetching user profile from database...')
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      logger.error('❌ [API] Error fetching user profile:', error)
      throw error
    }

    if (!data) {
      logger.dev('⚠️ [API] User profile not found, creating...')
      // If user doesn't exist in public.users, create profile
      return await userApi.createUserProfile(user)
    }

    logger.dev('✅ [API] User profile found:', { id: data.id, email: data.email, plan: data.plan })
    return data
  },

  async createUserProfile(authUser: any): Promise<User> {
    logger.dev('🆕 [API] Creating user profile...', { id: authUser.id, email: authUser.email })

    const userData = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
      email: authUser.email,
      plan: authUser.user_metadata?.plan || 'basic' as const,
      registration_date: authUser.created_at,
      photo_url: authUser.user_metadata?.avatar_url || null // Foto do Google
    }

    logger.dev('📝 [API] User data to insert:', userData)

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      logger.error('❌ [API] Error creating user profile:', error)
      throw error
    }

    logger.dev('✅ [API] User profile created successfully:', data.id)

    // Create default categories and settings (only if they don't exist)
    try {
      await userApi.createDefaultData(authUser.id)
    } catch (err) {
      // Ignore conflicts - data might already exist
      logger.dev('ℹ️ [API] Default data already exists or error creating:', err)
    }

    return data
  },

  async createDefaultData(userId: string): Promise<void> {
    // Create default categories for all types
    const defaultCategories = [
      // Income categories
      { name: 'Salário', type: 'income', color: 'green' },
      { name: 'Freelance', type: 'income', color: 'blue' },
      { name: 'Investimentos', type: 'income', color: 'indigo' },
      { name: 'Vendas', type: 'income', color: 'purple' },
      { name: 'Aluguel Recebido', type: 'income', color: 'orange' },
      { name: 'Bônus', type: 'income', color: 'yellow' },
      { name: 'Outros (Receita)', type: 'income', color: 'gray' },

      // Expense categories
      { name: 'Alimentação', type: 'expense', color: 'orange' },
      { name: 'Transporte', type: 'expense', color: 'blue' },
      { name: 'Moradia', type: 'expense', color: 'indigo' },
      { name: 'Saúde', type: 'expense', color: 'red' },
      { name: 'Educação', type: 'expense', color: 'purple' },
      { name: 'Lazer', type: 'expense', color: 'pink' },
      { name: 'Compras', type: 'expense', color: 'yellow' },
      { name: 'Contas e Serviços', type: 'expense', color: 'gray' },
      { name: 'Assinaturas', type: 'expense', color: 'green' },
      { name: 'Outros (Despesa)', type: 'expense', color: 'gray' },

      // Goal categories
      { name: 'Reserva de Emergência', type: 'goal', color: 'green' },
      { name: 'Viagem', type: 'goal', color: 'blue' },
      { name: 'Carro', type: 'goal', color: 'indigo' },
      { name: 'Casa Própria', type: 'goal', color: 'purple' },
      { name: 'Aposentadoria', type: 'goal', color: 'orange' },
      { name: 'Estudos', type: 'goal', color: 'yellow' },
      { name: 'Outros (Meta)', type: 'goal', color: 'gray' },

      // Investment categories
      { name: 'Renda Fixa', type: 'investment', color: 'green' },
      { name: 'Ações', type: 'investment', color: 'blue' },
      { name: 'Fundos Imobiliários', type: 'investment', color: 'indigo' },
      { name: 'Criptomoedas', type: 'investment', color: 'purple' },
      { name: 'Tesouro Direto', type: 'investment', color: 'orange' },
      { name: 'ETFs', type: 'investment', color: 'yellow' },
      { name: 'Fundos de Investimento', type: 'investment', color: 'pink' },
      { name: 'Outros (Investimento)', type: 'investment', color: 'gray' },
    ]

    // Use upsert to avoid conflicts
    await supabase
      .from('categories')
      .upsert(defaultCategories.map(cat => ({ ...cat, user_id: userId })), { onConflict: 'user_id,name' })

    // Create default user settings with upsert
    await supabase
      .from('user_settings')
      .upsert({ user_id: userId }, { onConflict: 'user_id' })
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Categories API functions
export const categoriesApi = {
  async getCategories(type?: string, userId?: string): Promise<Category[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) return []

    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', uid)
      .order('name')

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId?: string): Promise<Category> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: uid })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Já existe uma categoria com este nome')
      }
      throw new Error(error.message || 'Erro ao criar categoria')
    }
    return data
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Já existe uma categoria com este nome')
      }
      throw new Error(error.message || 'Erro ao atualizar categoria')
    }
    return data
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message || 'Erro ao excluir categoria')
    }
  }
}

// Transactions API functions
export const transactionsApi = {
  async getTransactions(limit?: number, userId?: string): Promise<Transaction[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) return []

    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', uid)
      .order('date', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId?: string): Promise<Transaction> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: uid })
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category'>>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) {
      logger.error('Supabase error:', error)
      throw new Error(error.message || 'Erro ao atualizar transação')
    }
    return data
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Goals API functions
export const goalsApi = {
  async getGoals(userId?: string): Promise<Goal[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) return []

    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId?: string): Promise<Goal> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: uid })
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Investments API functions
export const investmentsApi = {
  async getInvestments(userId?: string): Promise<Investment[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) return []

    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createInvestment(investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId?: string): Promise<Investment> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('investments')
      .insert({ ...investment, user_id: uid })
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async deleteInvestment(id: string): Promise<void> {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getInvestmentTransactions(userId?: string): Promise<InvestmentTransaction[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('investment_transactions')
      .select(`
        *,
        investment:investments(*)
      `)
      .eq('user_id', uid)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createInvestmentTransaction(transaction: Omit<InvestmentTransaction, 'id' | 'user_id' | 'created_at'>, userId?: string): Promise<InvestmentTransaction> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('investment_transactions')
      .insert({ ...transaction, user_id: uid })
      .select(`
        *,
        investment:investments(*)
      `)
      .single()

    if (error) throw error
    return data
  }
}

// Recurring Transactions API functions
export const recurringTransactionsApi = {
  async getRecurringTransactions(userId?: string): Promise<RecurringTransaction[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) return []

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', uid)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createRecurringTransaction(transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId?: string): Promise<RecurringTransaction> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({ ...transaction, user_id: uid })
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async updateRecurringTransaction(id: string, updates: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  async deleteRecurringTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  },

  async generateRecurringTransactions(month: number, year: number, userId?: string): Promise<Transaction[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) return []

    // Get active recurring transactions
    const { data: recurring, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', uid)
      .eq('is_active', true)

    if (error) throw error
    if (!recurring) return []

    const generatedTransactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = []
    const currentDate = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0)

    for (const rec of recurring) {
      const startDate = new Date(rec.start_date)
      const endDate = rec.end_date ? new Date(rec.end_date) : null

      // Skip if recurring transaction hasn't started yet or has ended
      if (startDate > endOfMonth || (endDate && endDate < currentDate)) {
        continue
      }

      let transactionDate: Date | null = null

      if (rec.frequency === 'monthly' && rec.day_of_month) {
        const day = Math.min(rec.day_of_month, endOfMonth.getDate())
        transactionDate = new Date(year, month - 1, day)
      } else if (rec.frequency === 'weekly' && rec.day_of_week !== null) {
        // Find all occurrences of the day in the month
        const firstDay = new Date(year, month - 1, 1)
        const firstDayOfWeek = firstDay.getDay()
        const targetDay = rec.day_of_week

        let dayDiff = targetDay - firstDayOfWeek
        if (dayDiff < 0) dayDiff += 7

        const firstOccurrence = new Date(year, month - 1, 1 + dayDiff)
        if (firstOccurrence <= endOfMonth) {
          transactionDate = firstOccurrence
        }
      } else if (rec.frequency === 'yearly') {
        const recurringMonth = startDate.getMonth()
        const recurringDay = startDate.getDate()

        if (recurringMonth === month - 1) {
          transactionDate = new Date(year, month - 1, recurringDay)
        }
      }

      if (transactionDate && transactionDate >= startDate && (!endDate || transactionDate <= endDate)) {
        generatedTransactions.push({
          description: rec.description,
          amount: rec.amount,
          type: rec.type,
          category_id: rec.category_id,
          date: transactionDate.toISOString().split('T')[0],
          status: 'pending',
          priority: rec.priority || 'medium',
          notes: `Transação recorrente: ${rec.notes || ''}`.trim(),
          payment_method: 'automatic',
          is_recurring: true
        })
      }
    }

    // Create the transactions
    const createdTransactions: Transaction[] = []
    for (const transaction of generatedTransactions) {
      try {
        const created = await transactionsApi.createTransaction(transaction)
        createdTransactions.push(created)
      } catch (error) {
        logger.error('Erro ao criar transação recorrente:', error)
      }
    }

    return createdTransactions
  }
}

// Dashboard API functions
export const dashboardApi = {
  async getFinancialSummary(userId?: string) {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_financial_summary')
      .select('*')
      .eq('user_id', uid)
      .single()

    if (error) throw error
    return data
  }
}

// Commitments API functions
export const commitmentsApi = {
  async getCommitments(userId?: string): Promise<Commitment[]> {
    const uid = userId || await getAuthUserId()
    if (!uid) return []

    const { data, error } = await supabase
      .from('commitments')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: true })

    if (error) {
      logger.error('Erro ao buscar compromissos:', error)
      return []
    }
    return data || []
  },

  async createCommitment(commitment: Omit<Commitment, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId?: string): Promise<Commitment> {
    const uid = userId || await getAuthUserId()
    if (!uid) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('commitments')
      .insert({ ...commitment, user_id: uid })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCommitment(id: string, updates: Partial<Omit<Commitment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Commitment> {
    const { data, error } = await supabase
      .from('commitments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCommitment(id: string): Promise<void> {
    const { error } = await supabase
      .from('commitments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}