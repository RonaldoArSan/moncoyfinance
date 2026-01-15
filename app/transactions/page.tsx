"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { NewTransactionModal } from "@/components/modals/new-transaction-modal"
import { EditTransactionModal } from "@/components/modals/edit-transaction-modal"
import { ExportModal } from "@/components/modals/export-modal"
import { Search, Download, PlusCircle, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTransactions } from "@/hooks/use-transactions-query"
import { useUserPlan } from "@/contexts/user-plan-context"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  
  const { transactions, categories, loading, deleteTransaction, refetchTransactions } = useTransactions()
  const { currentPlan } = useUserPlan()
  const isProfessional = ['pro', 'premium'].includes(currentPlan)
  
  const categoryOptions = ["all", ...categories.map(c => c.name)]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || transaction.category?.name === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id)
      } catch (error) {
        alert('Erro ao excluir transação')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transações</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gerencie todas as suas movimentações financeiras</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 w-full sm:w-auto"
            onClick={() => setIsTransactionModalOpen(true)}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            <span className="sm:inline">Nova Transação</span>
          </Button>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Encontre transações específicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "Todas as categorias" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => isProfessional ? setIsExportModalOpen(true) : alert('Funcionalidade disponível nos Planos Pro e Premium')} 
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="sm:inline">Exportar</span>
                  {!isProfessional && <span className="ml-1 text-xs">PRO</span>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>{filteredTransactions.length} transação(ões) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer gap-3"
                    onClick={() => {
                      setSelectedTransaction(transaction)
                      setIsEditModalOpen(true)
                    }}
                  >
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 sm:mt-0 ${transaction.type === "income" ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{transaction.description}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                          <span className="hidden sm:inline">•</span>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category?.name || 'Sem categoria'}
                          </Badge>
                          <span className="hidden sm:inline">•</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              transaction.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                              transaction.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {transaction.priority === 'high' ? 'Alta' :
                             transaction.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <div className="text-left sm:text-right">
                        <div
                          className={`font-bold text-base sm:text-lg ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}R${" "}
                          {Math.abs(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            transaction.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                            transaction.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            transaction.status === "overdue" ? "bg-red-50 text-red-700 border-red-200" :
                            transaction.status === "due_soon" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            ""
                          }`}
                        >
                          {transaction.status === "completed" ? "Pago" :
                           transaction.status === "pending" ? "Pendente" :
                           transaction.status === "overdue" ? "Vencido" :
                           transaction.status === "due_soon" ? "A Vencer" :
                           "Pendente"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTransaction(transaction.id)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <NewTransactionModal 
        open={isTransactionModalOpen} 
        onOpenChange={(open) => {
          setIsTransactionModalOpen(open)
          if (!open) {
            // Recarregar transações quando o modal for fechado
            refreshTransactions()
          }
        }}
      />
      <EditTransactionModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) {
            setSelectedTransaction(null)
            refreshTransactions()
          }
        }}
        transaction={selectedTransaction}
      />
      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Exportar Transações"
        description="Exporte suas transações em diferentes formatos."
        transactions={transactions}
      />
    </div>
  )
}
