"use client"

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
import { Calendar, Target, Settings, Loader2 } from "lucide-react"
import { ManageCategoriesModal } from "./manage-categories-modal"
import { useGoalsQuery } from "@/hooks/use-goals-query"

interface NewGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewGoalModal({ open, onOpenChange }: NewGoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const { categories, createGoal, refreshCategories } = useGoals()

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "bg-red-600 hover:bg-red-700"
      case "medium":
        return "bg-yellow-600 hover:bg-yellow-700"
      case "low":
        return "bg-green-600 hover:bg-green-700"
      default:
        return "bg-blue-600 hover:bg-blue-700"
    }
  }

  const handleSubmit = async () => {
    if (!title || !targetAmount) {
      alert('Preencha os campos obrigatórios')
      return
    }

    setIsSubmitting(true)
    try {
      await createGoal({
        title,
        description: description || undefined,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        target_date: deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deadline: deadline || undefined,
        category_id: categoryId || undefined,
        status: 'active',
        priority
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setTargetAmount('')
      setCurrentAmount('')
      setDeadline('')
      setCategoryId('')
      setPriority('medium')
      
      onOpenChange(false)
    } catch (error) {
      alert('Erro ao criar meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setTitle('')
      setDescription('')
      setTargetAmount('')
      setCurrentAmount('')
      setDeadline('')
      setCategoryId('')
      setPriority('medium')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Nova Meta Financeira
          </DialogTitle>
          <DialogDescription>Defina um objetivo financeiro e acompanhe seu progresso.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título da Meta</Label>
            <Input 
              id="title" 
              placeholder="Ex: Reserva de emergência, Viagem..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              placeholder="Descreva sua meta em detalhes..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="target-amount">Valor Alvo</Label>
              <Input 
                id="target-amount" 
                type="number" 
                placeholder="0,00" 
                step="0.01" 
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current-amount">Valor Atual</Label>
              <Input 
                id="current-amount" 
                type="number" 
                placeholder="0,00" 
                step="0.01" 
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Data Limite</Label>
            <div className="relative">
              <Input 
                id="deadline" 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Prioridade</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={priority === "high" ? "default" : "outline"}
                onClick={() => setPriority("high")}
                className={priority === "high" ? "bg-red-600 hover:bg-red-700" : ""}
                size="sm"
              >
                Alta
              </Button>
              <Button
                variant={priority === "medium" ? "default" : "outline"}
                onClick={() => setPriority("medium")}
                className={priority === "medium" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                size="sm"
              >
                Média
              </Button>
              <Button
                variant={priority === "low" ? "default" : "outline"}
                onClick={() => setPriority("low")}
                className={priority === "low" ? "bg-green-600 hover:bg-green-700" : ""}
                size="sm"
              >
                Baixa
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            className={getPriorityColor(priority)} 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Criar Meta'
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
        type="goal" 
      />
    </Dialog>
  )
}
