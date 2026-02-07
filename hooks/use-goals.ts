
import { useGoals as useGoalsQueryHook } from '@/hooks/use-goals-query'

/**
 * Hook de compatibilidade
 * Redireciona para a implementação baseada em React Query
 * Mantém a interface original para não quebrar componentes antigos
 */
export function useGoals() {
  const queryHook = useGoalsQueryHook()

  return {
    ...queryHook,
    // Aliases para manter compatibilidade com código antigo
    refreshGoals: queryHook.refetchGoals,
    // refreshCategories já existe no hook novo
  }
}