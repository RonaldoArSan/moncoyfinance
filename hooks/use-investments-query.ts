import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investmentsApi, categoriesApi } from '@/lib/api'
import { logger } from '@/lib/logger'
import { useAuth } from '@/components/auth-provider'
import type { Investment, Category } from '@/lib/supabase/types'

/**
 * Query keys para investimentos
 */
export const investmentKeys = {
  all: ['investments'] as const,
  lists: () => [...investmentKeys.all, 'list'] as const,
  list: (userId: string | undefined) => [...investmentKeys.lists(), userId] as const,
  categories: () => ['investment-categories'] as const,
  categoryList: (userId: string | undefined) => [...investmentKeys.categories(), userId] as const,
}

/**
 * Hook otimizado com React Query para investimentos
 */
export function useInvestmentsQuery() {
  const { userProfile } = useAuth()
  const queryClient = useQueryClient()
  const userId = userProfile?.id

  // Query para investimentos
  const {
    data: investments = [],
    isLoading: isLoadingInvestments,
    error: investmentsError,
    refetch: refetchInvestments
  } = useQuery({
    queryKey: investmentKeys.list(userId),
    queryFn: () => investmentsApi.getInvestments(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Query para categorias de investimentos
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: investmentKeys.categoryList(userId),
    queryFn: () => categoriesApi.getCategories('investment', userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })

  // Mutation para criar investimento
  const createInvestmentMutation = useMutation({
    mutationFn: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      investmentsApi.createInvestment(investment, userId),
    
    onSuccess: (newInvestment) => {
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() })
      logger.dev('✅ Investment created:', newInvestment.id)
    },
    
    onError: (error) => {
      logger.error('Erro ao criar investimento:', error)
    },
  })

  // Mutation para deletar investimento
  const deleteInvestmentMutation = useMutation({
    mutationFn: (id: string) => investmentsApi.deleteInvestment(id),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() })
      logger.dev('✅ Investment deleted')
    },
    
    onError: (error) => {
      logger.error('Erro ao deletar investimento:', error)
    },
  })

  // Cálculo do resumo do portfólio
  const calculatePortfolioSummary = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + ((inv.quantity ?? 0) * inv.avg_price), 0)
    const totalValue = investments.reduce((sum, inv) => sum + ((inv.quantity ?? 0) * (inv.current_price || inv.avg_price)), 0)
    const totalGain = totalValue - totalInvested
    const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

    return {
      totalInvested,
      totalValue,
      totalGain,
      gainPercentage
    }
  }

  // Distribuição por tipo de ativo
  const getAssetTypeDistribution = () => {
    const distribution = investments.reduce((acc, inv) => {
      const value = (inv.quantity ?? 0) * (inv.current_price || inv.avg_price)
      if (!acc[inv.asset_type]) {
        acc[inv.asset_type] = { value: 0, count: 0 }
      }
      acc[inv.asset_type].value += value
      acc[inv.asset_type].count += 1
      return acc
    }, {} as Record<string, { value: number; count: number }>)

    const totalValue = Object.values(distribution).reduce((sum, item) => sum + item.value, 0)
    
    return Object.entries(distribution).map(([type, data]) => ({
      type,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count
    }))
  }

  const loading = isLoadingInvestments || isLoadingCategories
  const error = investmentsError || categoriesError

  return {
    // Dados
    investments,
    categories,
    
    // Estados
    loading,
    error,
    isLoadingInvestments,
    isLoadingCategories,
    
    // Ações
    createInvestment: createInvestmentMutation.mutateAsync,
    deleteInvestment: deleteInvestmentMutation.mutateAsync,
    
    // Cálculos
    calculatePortfolioSummary,
    getAssetTypeDistribution,
    
    // Controle manual
    refreshInvestments: refetchInvestments,
    
    // Estados de mutation
    isCreating: createInvestmentMutation.isPending,
    isDeleting: deleteInvestmentMutation.isPending,
  }
}
