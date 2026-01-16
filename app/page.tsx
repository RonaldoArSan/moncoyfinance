"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NewTransactionModal } from "@/components/modals/new-transaction-modal"
import { FinancialSummary } from "@/components/financial-summary"
import { EmailConfirmationBanner } from "@/components/email-confirmation-banner"
import {
  Target,
  CreditCard,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Lightbulb,
  Zap,
} from "lucide-react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useBudget } from "@/hooks/use-budget"
import { useInsights } from "@/hooks/use-insights"

export default function Dashboard() {
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  
  // Hook consolidado busca todos os dados em paralelo
  const { transactions, summary, loading: dashboardLoading } = useDashboardData()
  const { budgetItems, loading: budgetLoading } = useBudget()
  const { insights, loading: insightsLoading } = useInsights()
  
  // Pegar as 4 transações mais recentes
  const recentTransactions = transactions.slice(0, 4)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Email Confirmation Warning Banner */}
      <EmailConfirmationBanner />
      {/* Header com gradiente */}
      <div className="gradient-hero rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white text-shadow-md">Bem-vindo!</h1>
            <p className="text-white/80 mt-2 text-base">Resumo das suas finanças hoje</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70 font-medium">Saldo Total</p>
            <p className="text-3xl font-bold text-white text-shadow-md">
              {dashboardLoading ? "Carregando..." : new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(summary.totalBalance)}
            </p>

          </div>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <FinancialSummary />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transações Recentes */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <CreditCard className="h-5 w-5 text-primary" />
              Transações Recentes
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Suas últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação encontrada</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => {
                const transactionDate = new Date(transaction.date)
                const today = new Date()
                const diffTime = Math.abs(today.getTime() - transactionDate.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                
                let dateText = ''
                if (diffDays === 1) {
                  dateText = 'Hoje'
                } else if (diffDays === 2) {
                  dateText = 'Ontem'
                } else {
                  dateText = `${diffDays - 1} dias atrás`
                }
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "income"
                            ? "bg-success-100 dark:bg-success-900"
                            : "bg-danger-100 dark:bg-danger-900"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 text-success-600 dark:text-success-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground font-medium">{dateText}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-base ${
                        transaction.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Math.abs(transaction.amount))}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Orçamento Mensal */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <Target className="h-5 w-5 text-primary" />
              Orçamento Mensal
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Acompanhe seus gastos por categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-2 w-full bg-muted animate-pulse rounded" />
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : budgetItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum dado de orçamento disponível</p>
              </div>
            ) : (
              budgetItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">{item.categoria}</span>
                    <span className="text-muted-foreground font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.gasto)} / {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.limite)}
                    </span>
                  </div>
                  <Progress value={(item.gasto / item.limite) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round((item.gasto / item.limite) * 100)}% usado</span>
                    <span>{new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(item.limite - item.gasto)} restante</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights de IA */}
      <Card className="border-secondary-200 dark:border-secondary-800 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Insights Personalizados
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Recomendações baseadas em IA para otimizar suas finanças</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insightsLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted animate-pulse rounded" />
                    <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : insights.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <p>Nenhum insight disponível</p>
              </div>
            ) : (
              insights.map((insight, index) => {
                const getInsightStyles = (type: string) => {
                  switch (type) {
                    case 'success':
                      return {
                        bg: 'bg-green-50 dark:bg-green-950',
                        border: 'border-green-200 dark:border-green-800',
                        iconColor: 'text-green-600 dark:text-green-400',
                        textColor: 'text-green-700 dark:text-green-300'
                      }
                    case 'warning':
                      return {
                        bg: 'bg-amber-50 dark:bg-amber-950',
                        border: 'border-amber-200 dark:border-amber-800',
                        iconColor: 'text-amber-600 dark:text-amber-400',
                        textColor: 'text-amber-700 dark:text-amber-300'
                      }
                    default:
                      return {
                        bg: 'bg-blue-50 dark:bg-blue-950',
                        border: 'border-blue-200 dark:border-blue-800',
                        iconColor: 'text-blue-600 dark:text-blue-400',
                        textColor: 'text-blue-700 dark:text-blue-300'
                      }
                  }
                }
                
                const styles = getInsightStyles(insight.type)
                const IconComponent = insight.icon === 'CheckCircle' ? CheckCircle : 
                                   insight.icon === 'Lightbulb' ? Lightbulb : Zap
                
                return (
                  <div key={index} className={`p-4 rounded-lg ${styles.bg} border ${styles.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
                      <span className={`font-semibold ${styles.textColor}`}>{insight.title}</span>
                    </div>
                    <p className={`text-sm ${styles.textColor} font-medium`}>
                      {insight.message}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <NewTransactionModal open={showNewTransaction} onOpenChange={setShowNewTransaction} />
    </div>
  )
}
