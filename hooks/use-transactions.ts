
import { useTransactions as useTransactionsQueryHook } from '@/hooks/use-transactions-query'

/**
 * Hook de compatibilidade
 * Redireciona para a implementação baseada em React Query
 * Mantém a interface original para não quebrar componentes antigos
 */
export function useTransactions() {
  const queryHook = useTransactionsQueryHook()

  return {
    ...queryHook,
    // Aliases para manter compatibilidade com código antigo
    refreshTransactions: queryHook.refetchTransactions,
    // refreshCategories já existe no hook novo (adicionei no passo anterior)
    refreshRecurringTransactions: () => {}, // No-op ou implementar refetch específico se necessário
  }
}