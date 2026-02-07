"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Upload, Camera, FileText, Loader2, Crown, X, Settings } from "lucide-react"
import { ManageCategoriesModal } from "./manage-categories-modal"
import { useUserPlan, useFeatureAccess } from "@/contexts/user-plan-context"
import { useTransactions } from "@/hooks/use-transactions-query"
import { Checkbox } from "@/components/ui/checkbox"

interface NewTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewTransactionModal({ open, onOpenChange }: NewTransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<"monthly" | "weekly" | "yearly">("monthly")
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [dayOfWeek, setDayOfWeek] = useState(0)
  const [endDate, setEndDate] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [status, setStatus] = useState<"pending" | "completed" | "overdue" | "due_soon">("completed")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  const { currentPlan } = useUserPlan()
  const hasReceiptAnalysis = false // Feature not available yet
  const { categories, createTransaction, refreshCategories, createRecurringTransaction } = useTransactions()

  const filteredCategories = categories.filter(c => c.type === type)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsProcessing(true)

    // Simulate AI processing delay
    setTimeout(() => {
      // Mock extracted data from AI
      const mockExtractedData = {
        description: file.name.includes("supermercado") ? "Compras Supermercado" : "Pagamento Restaurante",
        amount: Math.random() * 100 + 20,
        category: type === "expense" ? "alimentação" : "outros",
        date: new Date().toISOString().split("T")[0],
        merchant: file.name.includes("supermercado") ? "Supermercado ABC" : "Restaurante XYZ",
      }
      setExtractedData(mockExtractedData)
      setIsProcessing(false)
    }, 2000)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setExtractedData(null)
    setIsProcessing(false)
  }

  const applyExtractedData = () => {
    if (extractedData) {
      setDescription(extractedData.description)
      setAmount(extractedData.amount.toString())
      setDate(extractedData.date)
    }
  }

  const handleSubmit = async () => {
    if (!description || !amount || !date) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)
    try {
      if (isRecurring) {
        // Criar a recorrência
        await createRecurringTransaction({
          description,
          amount: parseFloat(amount),
          type,
          category_id: categoryId || '',
          frequency,
          start_date: date,
          end_date: endDate || undefined,
          day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
          day_of_week: frequency === 'weekly' ? dayOfWeek : undefined,
          is_active: true,
          notes: notes || undefined
        })

        // Criar também a primeira transação
        const newTransaction = await createTransaction({
          description,
          amount: parseFloat(amount),
          type,
          category_id: categoryId || '',
          date,
          status: type === 'expense' ? status : 'completed',
          priority,
          payment_method: '',
          is_recurring: true,
          notes: `Transação recorrente: ${notes || ''}`.trim()
        })
      } else {
        const newTransaction = await createTransaction({
          description,
          amount: parseFloat(amount),
          type,
          category_id: categoryId || '',
          date,
          status: type === 'expense' ? status : 'completed',
          priority,
          payment_method: '',
          is_recurring: false,
          notes: notes || undefined
        })
      }

      // Reset form
      setDescription('')
      setAmount('')
      setCategoryId('')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setIsRecurring(false)
      setFrequency('monthly')
      setDayOfMonth(1)
      setDayOfWeek(0)
      setEndDate('')
      setUploadedFile(null)
      setExtractedData(null)

      onOpenChange(false)
    } catch (error) {
      alert('Erro ao criar transação')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setDescription('')
      setAmount('')
      setCategoryId('')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setIsRecurring(false)
      setFrequency('monthly')
      setDayOfMonth(1)
      setDayOfWeek(0)
      setEndDate('')
      setUploadedFile(null)
      setExtractedData(null)
      setType('expense')
      setStatus('completed')
      setPriority('medium')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Adicione uma nova receita ou despesa à sua conta.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={type === "income" ? "default" : "outline"}
              onClick={() => setType("income")}
              className={type === "income" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Receita
            </Button>
            <Button
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => setType("expense")}
              className={type === "expense" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Despesa
            </Button>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label>Comprovante</Label>
              {hasReceiptAnalysis && (
                <Badge variant="secondary" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
            </div>

            {hasReceiptAnalysis ? (
              <div className="space-y-3">
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Faça upload de uma foto ou arquivo do comprovante</p>
                      <p className="text-xs text-muted-foreground">
                        A IA extrairá automaticamente os dados da transação
                      </p>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <Label htmlFor="receipt-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>Selecionar Arquivo</span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isProcessing && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando com IA...
                      </div>
                    )}

                    {extractedData && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Dados Extraídos:</h4>
                          <Button variant="outline" size="sm" onClick={applyExtractedData}>
                            Aplicar Dados
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Descrição:</span>
                            <p className="font-medium">{extractedData.description}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor:</span>
                            <p className="font-medium">R$ {extractedData.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Categoria:</span>
                            <p className="font-medium capitalize">{extractedData.category}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estabelecimento:</span>
                            <p className="font-medium">{extractedData.merchant}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Crown className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload de comprovantes disponível no plano Profissional
                  </p>
                  <Button variant="outline" size="sm">
                    Fazer Upgrade
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0,00"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Categoria</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCategoryModalOpen(true)}
                className="h-6 px-2 text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Gerenciar
              </Button>
            </div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {type === "expense" && (
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="due_soon">A Vencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring">Transação recorrente</Label>
            </div>
          </div>

          {isRecurring && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h4 className="font-medium">Configurações de Recorrência</h4>

              <div className="grid gap-2">
                <Label>Frequência</Label>
                <Select value={frequency} onValueChange={(value: "monthly" | "weekly" | "yearly") => setFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {frequency === 'monthly' && (
                <div className="grid gap-2">
                  <Label>Dia do mês</Label>
                  <Select value={dayOfMonth.toString()} onValueChange={(value) => setDayOfMonth(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>Dia {day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === 'weekly' && (
                <div className="grid gap-2">
                  <Label>Dia da semana</Label>
                  <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Domingo</SelectItem>
                      <SelectItem value="1">Segunda</SelectItem>
                      <SelectItem value="2">Terça</SelectItem>
                      <SelectItem value="3">Quarta</SelectItem>
                      <SelectItem value="4">Quinta</SelectItem>
                      <SelectItem value="5">Sexta</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="end-date">Data de término (opcional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione detalhes sobre esta transação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className={type === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              `Adicionar ${isRecurring ? 'Recorrência' : (type === "income" ? "Receita" : "Despesa")}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      <ManageCategoriesModal
        open={isCategoryModalOpen}
        onOpenChange={(open) => {
          setIsCategoryModalOpen(open)
          if (!open) {
            // Recarregar categorias quando o modal for fechado
            refreshCategories()
          }
        }}
        type={type}
      />
    </Dialog>
  )
}
