"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { logger } from '@/lib/logger'

/**
 * React Query Provider com configurações otimizadas para MoncoyFinance
 * 
 * Configurações:
 * - staleTime: 5min (dados considerados frescos por 5 minutos)
 * - cacheTime: 10min (dados mantidos em cache por 10 minutos)
 * - retry: 1 (tenta novamente 1 vez em caso de erro)
 * - refetchOnWindowFocus: false (não revalida ao focar janela - economiza requests)
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo que os dados são considerados "frescos" (não revalida)
            staleTime: 5 * 60 * 1000, // 5 minutos
            
            // Tempo que dados inativos permanecem em cache
            gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
            
            // Número de tentativas em caso de erro
            retry: 1,
            
            // Não refetch automático ao focar janela (economiza requests)
            refetchOnWindowFocus: false,
            
            // Não refetch automático ao reconectar internet
            refetchOnReconnect: true,
            
            // Não refetch automático ao montar componente se dados estão frescos
            refetchOnMount: true,
            
            // Log de erros
            onError: (error) => {
              logger.error('[React Query] Query error:', error)
            },
          },
          mutations: {
            // Log de erros em mutations
            onError: (error) => {
              logger.error('[React Query] Mutation error:', error)
            },
            
            // Retry automático desabilitado para mutations (criar/atualizar/deletar)
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
