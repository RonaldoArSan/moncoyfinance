import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi, categoriesApi, recurringTransactionsApi } from '@/lib/api'
import { logger } from '@/lib/logger'
import { useAuth } from '@/components/auth-provider'
import type { Transaction, Category, RecurringTransaction } from '@/lib/supabase'

/**
 * Query keys para React Query
 * Centralizados para fácil manutenção e invalidação de cache
 */
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (userId: string | undefined) => [...transactionKeys.lists(), userId] as const,
  categories: () => ['categories'] as const,
  categoryList: (type: string | undefined, userId: string | undefined) => 
    [...transactionKeys.categories(), type, userId] as const,
  recurring: () => ['recurring-transactions'] as const,
  recurringList: (userId: string | undefined) => [...transactionKeys.recurring(), userId] as const,
}

/**
 * Hook otimizado com React Query para transações
 * 
 * Benefícios:
 * - Cache automático (5 minutos)
 * - Revalidação inteligente
 * - Mutations otimísticas
 * - Estado de loading/error gerenciado automaticamente
 */
export function useTransactions() {
  const { userProfile } = useAuth()
  const queryClient = useQueryClient()
  const userId = userProfile?.id

  // Query para transações com cache de 5 minutos
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: transactionKeys.list(userId),
    queryFn: () => transactionsApi.getTransactions(undefined, userId),
    enabled: !!userId, // Só executa se tiver userId
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Query para categorias com cache de 10 minutos (mudam menos)
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: transactionKeys.categoryList(undefined, userId),
    queryFn: () => categoriesApi.getCategories(undefined, userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutos - categorias mudam menos
  })

  // Query para transações recorrentes
  const {
    data: recurringTransactions = [],
    isLoading: isLoadingRecurring,
    error: recurringError
  } = useQuery({
    queryKey: transactionKeys.recurringList(userId),
    queryFn: () => recurringTransactionsApi.getRecurringTransactions(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  // Mutation para criar transação
  const createTransactionMutation = useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      transactionsApi.createTransaction(transaction, userId),
    
    onSuccess: (newTransaction) => {
      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      logger.dev('✅ Transaction created:', newTransaction.id)
    },
    
    onError: (error) => {
      logger.error('Erro ao criar transação:', error)
    },
  })

  // Mutation para atualizar transação
  const updateTransactionMutation = useMutation({
    mutationFn: ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category'>>
    }) => transactionsApi.updateTransaction(id, updates),
    
    onSuccess: (updatedTransaction) => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      logger.dev('✅ Transaction updated:', updatedTransaction.id)
    },
    
    onError: (error) => {
      logger.error('Erro ao atualizar transação:', error)
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : 'Erro desconhecido'
      alert(`Erro ao atualizar transação: ${errorMessage}`)
    },
  })

  // Mutation para deletar transação
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.deleteTransaction(id),
    
    onSuccess: () => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      logger.dev('✅ Transaction deleted')
    },
    
    onError: (error) => {
      logger.error('Erro ao deletar transação:', error)
    },
  })

  // Mutation para criar transação recorrente
  const createRecurringMutation = useMutation({
    mutationFn: (transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      recurringTransactionsApi.createRecurringTransaction(transaction, userId),
    
    onSuccess: () => {
      // Invalidar cache de recorrentes
      queryClient.invalidateQueries({ queryKey: transactionKeys.recurring() })
      logger.dev('✅ Recurring transaction created')
    },
    
    onError: (error) => {
      logger.error('Erro ao criar transação recorrente:', error)
    },
  })

  // Mutation para gerar transações recorrentes
  const generateRecurringMutation = useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      recurringTransactionsApi.generateRecurringTransactions(month, year, userId),
    
    onSuccess: (generated) => {
      // Invalidar cache de transações para mostrar as novas
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      logger.dev('✅ Generated recurring transactions:', generated.length)
    },
    
    onError: (error) => {
      logger.error('Erro ao gerar transações recorrentes:', error)
    },
  })

  // Loading consolidado
  const loading = isLoadingTransactions || isLoadingCategories || isLoadingRecurring

  // Errors consolidados
  const error = transactionsError || categoriesError || recurringError

  return {
    // Dados
    transactions,
    categories,
    recurringTransactions,
    
    // Estados
    loading,
    error,
    isLoadingTransactions,
    isLoadingCategories,
    isLoadingRecurring,
    
    // Ações (métodos simplificados para manter compatibilidade)
    createTransaction: createTransactionMutation.mutateAsync,
    updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category'>>) =>
      updateTransactionMutation.mutateAsync({ id, updates }),
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    createRecurringTransaction: createRecurringMutation.mutateAsync,
    generateRecurringTransactions: (month: number, year: number) =>
      generateRecurringMutation.mutateAsync({ month, year }),
    
    // Controle manual
    refetchTransactions,
    
    // Estados de mutation
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  }
}
