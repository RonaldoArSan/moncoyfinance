import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi, categoriesApi } from '@/lib/api'
import { logger } from '@/lib/logger'
import { useAuth } from '@/components/auth-provider'
import type { Goal, Category } from '@/lib/supabase'

/**
 * Query keys para metas
 */
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (userId: string | undefined) => [...goalKeys.lists(), userId] as const,
  categories: () => ['goal-categories'] as const,
  categoryList: (userId: string | undefined) => [...goalKeys.categories(), userId] as const,
}

/**
 * Hook otimizado com React Query para metas
 */
export function useGoalsQuery() {
  const { userProfile } = useAuth()
  const queryClient = useQueryClient()
  const userId = userProfile?.id

  // Query para metas
  const {
    data: goals = [],
    isLoading: isLoadingGoals,
    error: goalsError,
    refetch: refetchGoals
  } = useQuery({
    queryKey: goalKeys.list(userId),
    queryFn: () => goalsApi.getGoals(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Query para categorias de metas
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: goalKeys.categoryList(userId),
    queryFn: () => categoriesApi.getCategories('goal', userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })

  // Mutation para criar meta
  const createGoalMutation = useMutation({
    mutationFn: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      goalsApi.createGoal(goal, userId),
    
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      logger.dev('✅ Goal created:', newGoal.id)
    },
    
    onError: (error) => {
      logger.error('Erro ao criar meta:', error)
    },
  })

  // Mutation para atualizar meta
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      goalsApi.updateGoal(id, updates),
    
    onSuccess: (updatedGoal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      logger.dev('✅ Goal updated:', updatedGoal.id)
    },
    
    onError: (error) => {
      logger.error('Erro ao atualizar meta:', error)
    },
  })

  // Mutation para deletar meta
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalsApi.deleteGoal(id),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      logger.dev('✅ Goal deleted')
    },
    
    onError: (error) => {
      logger.error('Erro ao deletar meta:', error)
    },
  })

  const loading = isLoadingGoals || isLoadingCategories
  const error = goalsError || categoriesError

  return {
    // Dados
    goals,
    categories,
    
    // Estados
    loading,
    error,
    isLoadingGoals,
    isLoadingCategories,
    
    // Ações
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: (id: string, updates: Partial<Goal>) =>
      updateGoalMutation.mutateAsync({ id, updates }),
    deleteGoal: deleteGoalMutation.mutateAsync,
    
    // Controle manual
    refetchGoals,
    
    // Estados de mutation
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  }
}
