import { useQuery } from '@tanstack/react-query'
import { transactionsApi, investmentsApi, goalsApi, categoriesApi } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { logger } from '@/lib/logger'
import type { Transaction, Investment, Goal, Category } from '@/lib/supabase'

interface DashboardData {
  // Dados
  transactions: Transaction[]
  investments: Investment[]
  goals: Goal[]
  transactionCategories: Category[]
  goalCategories: Category[]
  
  // Resumo financeiro
  summary: {
    totalBalance: number
    totalIncome: number
    totalExpenses: number
    totalInvestments: number
    totalSavings: number
  }
  
  // Estados
  loading: boolean
  error: Error | null
  
  // Controle
  refetch: () => void
}

/**
 * Query keys para dados consolidados do dashboard
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (userId: string | undefined) => [...dashboardKeys.all, 'data', userId] as const,
}

/**
 * Hook consolidado que busca TODOS os dados do dashboard em uma única query
 * Otimizado com Promise.all para buscar dados em paralelo
 * 
 * Benefícios:
 * - 1 única query React Query (ao invés de 5+ separadas)
 * - Busca paralela (Promise.all) = mais rápido
 * - Cache unificado = menos requests ao Supabase
 * - Loading state unificado = UX mais limpa
 */
export function useDashboardData(): DashboardData {
  const { userProfile } = useAuth()
  const userId = userProfile?.id

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: dashboardKeys.data(userId),
    queryFn: async () => {
      logger.dev('🚀 Fetching dashboard data...')
      const startTime = Date.now()
      
      try {
        // Buscar TODOS os dados em paralelo
        const [
          transactions,
          investments,
          goals,
          transactionCategories,
          goalCategories
        ] = await Promise.all([
          transactionsApi.getTransactions(userId),
          investmentsApi.getInvestments(userId),
          goalsApi.getGoals(userId),
          categoriesApi.getCategories('transaction', userId),
          categoriesApi.getCategories('goal', userId),
        ])
        
        // Calcular resumo financeiro
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        const totalInvestments = investments
          .reduce((sum, inv) => sum + (inv.quantity * (inv.current_price || inv.avg_price)), 0)
        
        const totalSavings = goals
          .reduce((sum, goal) => sum + goal.current_amount, 0)
        
        const totalBalance = totalIncome - totalExpenses + totalInvestments + totalSavings
        
        const elapsedTime = Date.now() - startTime
        logger.dev(`✅ Dashboard data fetched in ${elapsedTime}ms`, {
          transactions: transactions.length,
          investments: investments.length,
          goals: goals.length,
          categories: transactionCategories.length + goalCategories.length
        })
        
        return {
          transactions,
          investments,
          goals,
          transactionCategories,
          goalCategories,
          summary: {
            totalBalance,
            totalIncome,
            totalExpenses,
            totalInvestments,
            totalSavings
          }
        }
        
      } catch (error) {
        logger.error('❌ Error fetching dashboard data:', error)
        throw error
      }
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutos - dashboard precisa estar razoavelmente atualizado
    gcTime: 10 * 60 * 1000, // 10 minutos de cache
    retry: 2, // Tentar novamente se falhar
  })

  return {
    // Dados com fallbacks
    transactions: data?.transactions || [],
    investments: data?.investments || [],
    goals: data?.goals || [],
    transactionCategories: data?.transactionCategories || [],
    goalCategories: data?.goalCategories || [],
    
    // Resumo com fallbacks
    summary: data?.summary || {
      totalBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalInvestments: 0,
      totalSavings: 0
    },
    
    // Estados
    loading: isLoading,
    error: error as Error | null,
    
    // Controle
    refetch
  }
}
