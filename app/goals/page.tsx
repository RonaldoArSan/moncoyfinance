"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { NewGoalModal } from "@/components/modals/new-goal-modal"
import { Target, PlusCircle, Calendar, DollarSign, TrendingUp, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import { useGoals } from "@/hooks/use-goals-query"

export default function GoalsPage() {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [addValueGoalId, setAddValueGoalId] = useState<string | null>(null)
  const [addValueAmount, setAddValueAmount] = useState('')

  const { goals, loading, updateGoal, deleteGoal } = useGoals()

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      case "low":
        return "Baixa"
      default:
        return "Normal"
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await deleteGoal(id)
      } catch (error) {
        alert('Erro ao excluir meta')
      }
    }
  }

  const handleAddValue = async (goalId: string) => {
    if (!addValueAmount || parseFloat(addValueAmount) <= 0) {
      alert('Digite um valor válido')
      return
    }

    try {
      const goal = goals.find(g => g.id === goalId)
      if (goal) {
        await updateGoal(goalId, {
          current_amount: goal.current_amount + parseFloat(addValueAmount)
        })
        setAddValueGoalId(null)
        setAddValueAmount('')
      }
    } catch (error) {
      alert('Erro ao adicionar valor')
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center ml-12 md:ml-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Metas Financeiras</h1>
            <p className="text-muted-foreground font-medium">Acompanhe o progresso dos seus objetivos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              onClick={() => setIsGoalModalOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </div>

        {/* Resumo das Metas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Total de Metas</CardTitle>
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{goals.length}</div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {goals.filter((g) => (g.current_amount / g.target_amount) * 100 >= 100).length} concluídas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    R${" "}
                    {goals
                      .reduce((sum, goal) => sum + goal.target_amount, 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    R${" "}
                    {goals
                      .reduce((sum, goal) => sum + goal.current_amount, 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}{" "}
                    economizados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Progresso Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {goals.length > 0 ? (
                      goals.reduce((sum, goal) => sum + (goal.current_amount / goal.target_amount) * 100, 0) / goals.length
                    ).toFixed(1) : '0.0'}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Média de todas as metas</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Lista de Metas */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-2 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma meta encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100
              const remaining = goal.target_amount - goal.current_amount
              const daysUntilDeadline = goal.deadline ? Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              ) : null

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">{goal.title}</CardTitle>
                        <CardDescription className="font-medium">{goal.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getPriorityColor(goal.priority)} text-white font-medium`}>
                          {getPriorityText(goal.priority)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-foreground">Progresso: {progress.toFixed(1)}%</span>
                        <span className="font-medium text-muted-foreground">
                          R$ {goal.current_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R${" "}
                          {goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground font-medium">Faltam</p>
                        <p className="font-bold text-red-600 dark:text-red-400">
                          R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Prazo</p>
                        {daysUntilDeadline !== null ? (
                          <p className={`font-bold flex items-center ${daysUntilDeadline > 30
                            ? "text-green-600 dark:text-green-400"
                            : daysUntilDeadline > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                            }`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {daysUntilDeadline > 0 ? `${daysUntilDeadline} dias` : "Vencido"}
                          </p>
                        ) : (
                          <p className="font-bold text-muted-foreground">Sem prazo</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="secondary" className="font-medium">{goal.category?.name || 'Sem categoria'}</Badge>
                      {addValueGoalId === goal.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Valor"
                            value={addValueAmount}
                            onChange={(e) => setAddValueAmount(e.target.value)}
                            className="w-20 px-2 py-1 text-sm border rounded"
                          />
                          <Button size="sm" onClick={() => handleAddValue(goal.id)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setAddValueGoalId(null)}>
                            ×
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="font-medium" onClick={() => setAddValueGoalId(goal.id)}>
                          Adicionar Valor
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <NewGoalModal
        open={isGoalModalOpen}
        onOpenChange={setIsGoalModalOpen}
      />
    </div>
  )
}
