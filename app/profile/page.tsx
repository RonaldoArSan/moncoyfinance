"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Calendar, CreditCard } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSettingsContext } from "@/contexts/settings-context"
import { useUserPlan } from "@/contexts/user-plan-context"

export default function ProfilePage() {
  const { user, loading, updateUser } = useSettingsContext()
  const { currentPlan, upgradeToProfessional, downgradeToBasic } = useUserPlan()
  const [form, setForm] = useState({ name: "", email: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "" })
  }, [user])

  const planLabel = useMemo(() => {
    if (!user) return "—"
    if (user.plan === "professional") return "Profissional"
    if (user.plan === "premium") return "Premium"
    return "Básico"
  }, [user])

  const joinDate = useMemo(() => {
    if (!user?.registration_date) return "—"
    try {
      return new Date(user.registration_date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    } catch {
      return "—"
    }
  }, [user?.registration_date])

  const initials = (user?.name || "Usuário").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
  const [photoUploading, setPhotoUploading] = useState(false)
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Validações no frontend
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo: 5MB')
      return
    }

    setPhotoUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)
    
    try {
      const res = await fetch('/api/user/upload-photo', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao enviar foto')
      }
      
      // Atualizar o estado local imediatamente
      await updateUser?.({ photo_url: data.photoUrl })
      alert('Foto atualizada com sucesso!')
      
      // Forçar reload para garantir que a imagem seja atualizada
      window.location.reload()
    } catch (e: any) {
      alert(e.message || 'Erro ao enviar foto')
      console.error('Erro no upload:', e)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateUser?.({ name: form.name, email: form.email })
      alert("Perfil atualizado!")
    } catch (e: any) {
      alert(e.message || "Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  const openBillingPortal = async () => {
    try {
      if (!user?.stripe_customer_id) {
        alert("Assinatura não encontrada. Finalize uma compra primeiro.")
        return
      }
      const res = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.stripe_customer_id })
      })
      if (!res.ok) throw new Error('Falha ao abrir Portal de Cobrança')
      const { url } = await res.json()
      window.location.href = url
    } catch (e: any) {
      alert(e.message || 'Erro ao abrir Portal de Cobrança')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Gerencie suas informações pessoais e dados de contato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.photo_url || "/diverse-user-avatars.png"} alt={user?.name || "Usuário"} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <label htmlFor="avatar-upload">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={photoUploading}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    type="button"
                  >
                    {photoUploading ? 'Enviando...' : 'Alterar Foto'}
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photoUploading && (
                  <span className="text-xs text-muted-foreground">Fazendo upload...</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))} />
            </div>

            <Button className="w-full" disabled={loading || saving} onClick={handleSave}>
              {saving ? 'Salvando…' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>

        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informações da Conta
            </CardTitle>
            <CardDescription>Detalhes da sua conta e plano atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Membro desde</span>
              </div>
              <span className="font-medium">{joinDate}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Plano Atual</span>
              </div>
              <Badge variant="default">{planLabel}</Badge>
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full bg-transparent" onClick={openBillingPortal} disabled={!user?.stripe_customer_id}>
                Gerenciar Plano (Stripe)
              </Button>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Histórico de Pagamentos
              </Button>
              {/* Gerenciamento de plano direto */}
              {currentPlan === 'basic' && (
                <Button className="w-full mt-2" onClick={upgradeToProfessional}>
                  Upgrade para Profissional
                </Button>
              )}
              {currentPlan === 'pro' && (
                <Button className="w-full mt-2" onClick={downgradeToBasic} variant="outline">
                  Voltar para Básico
                </Button>
              )}
              {currentPlan === 'premium' && (
                <Button className="w-full mt-2" disabled>
                  Plano Premium Ativo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
