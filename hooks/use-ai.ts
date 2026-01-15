import { useState, useEffect } from 'react'
import { useUserPlan } from '@/contexts/user-plan-context'
import { useSettingsContext } from '@/contexts/settings-context'
import { checkAILimit, incrementAIUsage, type AIUsageResponse } from '@/lib/ai-limits'
import { toast } from '@/hooks/use-toast'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState<AIUsageResponse | null>(null)
  const [usageLoading, setUsageLoading] = useState(true)
  const { currentPlan } = useUserPlan()
  const { user } = useSettingsContext()

  // Load usage on mount (only if user is authenticated)
  useEffect(() => {
    if (user?.id) {
      loadUsage()
    } else {
      setUsageLoading(false)
    }
  }, [user?.id])

  const loadUsage = async () => {
    try {
      setUsageLoading(true)
      const usageData = await checkAILimit()
      setUsage(usageData)
    } catch (error) {
      logger.error('Error loading AI usage:', error)
      // Don't block the app if AI usage API fails
      // Set default values to prevent breaking
      setUsage({
        allowed: true,
        remaining: 5,
        limit: 5,
        used: 0,
        resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        plan: currentPlan
      })
    } finally {
      setUsageLoading(false)
    }
  }

  const analyzeTransactions = async (transactions: any[], type: string) => {
    // Verificação de tempo de uso para plano básico (22 dias)
    if (currentPlan === 'basic' && user?.registration_date) {
      const registrationDate = new Date(user.registration_date)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 22) {
        const daysRemaining = 22 - diffDays
        throw new Error(
          `As análises de IA estarão disponíveis após 22 dias de uso. ` +
          `Faltam ${daysRemaining} dias. Continue utilizando para desbloquear esta funcionalidade!`
        )
      }
    }

    // Verificar limite de perguntas antes de fazer a análise (se disponível)
    let shouldCheckLimit = true
    try {
      const currentUsage = await checkAILimit()
      
      if (!currentUsage.allowed) {
        const resetDate = new Date(currentUsage.resetDate)
        throw new Error(
          `Limite de perguntas atingido (${currentUsage.used}/${currentUsage.limit}). ` +
          `O contador será resetado em ${resetDate.toLocaleDateString('pt-BR')}.`
        )
      }

      // Atualizar estado local
      setUsage(currentUsage)

    } catch (error: any) {
      // Se a API de limites não está disponível (migração não aplicada),
      // permitir continuar mas avisar no console
      if (error.message?.includes('404') || error.message?.includes('pending')) {
        logger.warn('AI usage API not available yet. Continuing without limit checks.')
        shouldCheckLimit = false
      } else {
        toast({
          title: 'Limite atingido',
          description: error.message,
          variant: 'destructive'
        })
        throw error
      }
    }

    setLoading(true)
    try {
      // Fazer a análise de IA
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          type,
          userPlan: currentPlan,
          userId: user?.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro na análise de IA')
      }

      const result = await response.json()

      // Incrementar contador após sucesso (se sistema de limites estiver ativo)
      if (shouldCheckLimit) {
        try {
          const updatedUsage = await incrementAIUsage()
          
          // Atualizar estado local com novos valores
          if (usage) {
            setUsage({
              ...usage,
              remaining: updatedUsage.remaining,
              used: updatedUsage.used,
              allowed: updatedUsage.remaining > 0
            })
          }

          // Mostrar alerta se estiver perto do limite
          if (updatedUsage.remaining <= 2 && updatedUsage.remaining > 0) {
            toast({
              title: 'Atenção',
              description: `Você tem apenas ${updatedUsage.remaining} pergunta(s) restante(s) neste período.`,
              variant: 'default'
            })
          }
        } catch (incrementError) {
          logger.error('Error incrementing usage:', incrementError)
          // Não falhar a análise se o incremento falhar
        }
      }

      return result.analysis
    } catch (error) {
      logger.error('AI Analysis Error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    analyzeTransactions,
    loading,
    usage,
    usageLoading,
    refreshUsage: loadUsage,
    isAvailable: ['basic', 'pro', 'professional', 'premium'].includes(currentPlan)
  }
}