
import { useInvestments as useInvestmentsQueryHook } from '@/hooks/use-investments-query'

/**
 * Hook de compatibilidade
 * Redireciona para a implementação baseada em React Query
 * Mantém a interface original para não quebrar componentes antigos
 */
export function useInvestments() {
  const queryHook = useInvestmentsQueryHook()

  return {
    ...queryHook,
    // Aliases se necessário, mas ambos já exportam refreshInvestments
  }
}