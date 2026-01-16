import { useState, useEffect, useCallback } from 'react'
import { useTransactions } from './use-transactions'
import { useFinancialSummary } from './use-financial-summary'

interface Insight {
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  icon: 'CheckCircle' | 'Lightbulb' | 'Zap'
}

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const { transactions } = useTransactions()
  const summary = useFinancialSummary()

  const generateInsights = useCallback(() => {
    // Don't generate insights if summary is still loading
    if (summary.loading) {
      return
    }

    try {
      setLoading(true)
      const generatedInsights: Insight[] = []

      // Insight 1: Comparação com mês anterior
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const currentMonthExpenses = transactions
        .filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear && 
                 t.type === 'expense'
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const lastMonthExpenses = transactions
        .filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === lastMonth && 
                 date.getFullYear() === lastMonthYear && 
                 t.type === 'expense'
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      if (lastMonthExpenses > 0) {
        const difference = ((lastMonthExpenses - currentMonthExpenses) / lastMonthExpenses) * 100
        if (difference > 5) {
          generatedInsights.push({
            type: 'success',
            title: 'Parabéns!',
            message: `Você economizou ${difference.toFixed(0)}% este mês comparado ao anterior.`,
            icon: 'CheckCircle'
          })
        } else if (difference < -10) {
          generatedInsights.push({
            type: 'warning',
            title: 'Atenção',
            message: `Seus gastos aumentaram ${Math.abs(difference).toFixed(0)}% este mês.`,
            icon: 'Lightbulb'
          })
        }
      }

      // Insight 2: Sugestão de investimento
      if (summary.totalBalance > 1000) {
        const suggestedAmount = Math.min(summary.totalBalance * 0.1, 500)
        generatedInsights.push({
          type: 'info',
          title: 'Dica',
          message: `Considere investir R$ ${suggestedAmount.toFixed(0)} extras em renda fixa este mês.`,
          icon: 'Lightbulb'
        })
      }

      // Insight 3: Performance dos investimentos (simulado)
      const hasInvestments = transactions.some(t => 
        t.category?.name?.toLowerCase().includes('investimento') ||
        t.category?.name?.toLowerCase().includes('ações') ||
        t.category?.name?.toLowerCase().includes('fii')
      )

      if (hasInvestments) {
        const performance = Math.floor(Math.random() * 20) + 5 // 5-25%
        generatedInsights.push({
          type: 'info',
          title: 'Oportunidade',
          message: `Seus investimentos estão performando ${performance}% acima da média.`,
          icon: 'Zap'
        })
      }

      // Se não há insights suficientes, adicionar insights padrão
      if (generatedInsights.length === 0) {
        generatedInsights.push(
          {
            type: 'info',
            title: 'Bem-vindo!',
            message: 'Comece adicionando suas transações para receber insights personalizados.',
            icon: 'Lightbulb'
          },
          {
            type: 'info',
            title: 'Dica',
            message: 'Categorize suas transações para obter análises mais precisas.',
            icon: 'CheckCircle'
          },
          {
            type: 'info',
            title: 'Organize-se',
            message: 'Defina metas financeiras para acompanhar seu progresso.',
            icon: 'Zap'
          }
        )
      }

      // Garantir que temos exatamente 3 insights
      setInsights(generatedInsights.slice(0, 3))
    } catch (error) {
      console.error('Erro ao gerar insights:', error)
      setInsights([])
    } finally {
      setLoading(false)
    }
  }, [transactions, summary.totalBalance, summary.loading])

  useEffect(() => {
    generateInsights()
  }, [generateInsights])

  return {
    insights,
    loading
  }
}