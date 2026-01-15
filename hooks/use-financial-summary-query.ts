import { useQuery } from '@tanstack/react-query'
import { transactionsApi, investmentsApi, goalsApi } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { logger } from '@/lib/logger'

interface FinancialSummary {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  totalInvestments: number
  totalSavings: number
  loading: boolean
}

/**
 * Query keys para resumo financeiro
 */
export const financialSummaryKeys = {
  all: ['financial-summary'] as const,
  summary: (userId: string | undefined) => [...financialSummaryKeys.all, userId] as const,
}

/**
 * Hook otimizado com React Query para resumo financeiro
 * Busca dados de múltiplas fontes e calcula o resumo
 */
export function useFinancialSummaryQuery(): FinancialSummary {
  const { userProfile } = useAuth()
  const userId = userProfile?.id

  const {
    data: summary,
    isLoading
  } = useQuery({
    queryKey: financialSummaryKeys.summary(userId),
    queryFn: async () => {
      try {
        // Buscar todos os dados em paralelo
        const [transactions, investments, goals] = await Promise.all([
          transactionsApi.getTransactions(userId),
          investmentsApi.getInvestments(userId),
          goalsApi.getGoals(userId)
        ])
        
        // Calcular receitas e despesas
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        // Calcular total de investimentos
        const totalInvestments = investments
          .reduce((sum, inv) => sum + (inv.quantity * (inv.current_price || inv.avg_price)), 0)
        
        // Calcular total de economia (metas)
        const totalSavings = goals
          .reduce((sum, goal) => sum + goal.current_amount, 0)
        
        // Calcular saldo total
        const totalBalance = income - expenses + totalInvestments + totalSavings
        
        logger.dev('📊 Financial summary calculated:', {
          totalBalance,
          totalIncome: income,
          totalExpenses: expenses,
          totalInvestments,
          totalSavings
        })
        
        return {
          totalBalance,
          totalIncome: income,
          totalExpenses: expenses,
          totalInvestments,
          totalSavings
        }
        
      } catch (error) {
        logger.error('Erro ao calcular resumo financeiro:', error)
        
        // Retornar valores padrão em caso de erro
        return {
          totalBalance: 0,
          totalIncome: 0,
          totalExpenses: 0,
          totalInvestments: 0,
          totalSavings: 0
        }
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos - resumo pode ficar em cache
    gcTime: 10 * 60 * 1000, // 10 minutos de cache
  })

  return {
    totalBalance: summary?.totalBalance || 0,
    totalIncome: summary?.totalIncome || 0,
    totalExpenses: summary?.totalExpenses || 0,
    totalInvestments: summary?.totalInvestments || 0,
    totalSavings: summary?.totalSavings || 0,
    loading: isLoading
  }
}
