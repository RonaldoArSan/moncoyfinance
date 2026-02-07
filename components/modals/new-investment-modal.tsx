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
import { Calendar, TrendingUp, Settings, Loader2 } from "lucide-react"
import { ManageCategoriesModal } from "./manage-categories-modal"
import { useInvestments } from "@/hooks/use-investments-query"

interface NewInvestmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewInvestmentModal({ open, onOpenChange }: NewInvestmentModalProps) {
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [broker, setBroker] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const { categories, createInvestment } = useInvestments()

  const assetTypes = [
    { value: 'stocks', label: 'Ações' },
    { value: 'fii', label: 'FII' },
    { value: 'etf', label: 'ETF' },
    { value: 'fixed_income', label: 'Renda Fixa' },
    { value: 'crypto', label: 'Criptomoedas' },
    { value: 'funds', label: 'Fundos' },
    { value: 'others', label: 'Outros' }
  ]

  const handleSubmit = async () => {
    if (!assetName || !assetType || !quantity || !price) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)
    try {
      await createInvestment({
        asset_name: assetName,
        asset_type: assetType as any,
        quantity: parseInt(quantity),
        avg_price: parseFloat(price),
        current_price: parseFloat(price),
        broker: broker || undefined,
        category_id: categoryId || undefined
      })

      // Reset form
      setAssetName('')
      setAssetType('')
      setQuantity('')
      setPrice('')
      setBroker('')
      setCategoryId('')

      onOpenChange(false)
    } catch (error) {
      alert('Erro ao criar investimento')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setAssetName('')
      setAssetType('')
      setQuantity('')
      setPrice('')
      setBroker('')
      setCategoryId('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Novo Investimento
          </DialogTitle>
          <DialogDescription>Registre uma nova operação de compra ou venda.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-4 py-4">

            <div className="grid gap-2">
              <Label htmlFor="asset-name">Nome do Ativo</Label>
              <Input
                id="asset-name"
                placeholder="Ex: PETR4, HASH11, IVVB11..."
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="asset-type">Tipo</Label>
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
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Preço Unitário</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="total-value">Valor Total</Label>
              <Input
                id="total-value"
                type="number"
                placeholder="0,00"
                step="0.01"
                value={quantity && price ? (parseFloat(quantity) * parseFloat(price)).toFixed(2) : ''}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="broker">Corretora</Label>
              <Input
                id="broker"
                placeholder="Ex: XP, Rico, Clear..."
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar Investimento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      <ManageCategoriesModal open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen} type="investment" />
    </Dialog>
  )
}
