"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Book,
  Video,
  FileText,
} from "lucide-react"
import supabase from "@/lib/supabase"
import type { SupportSettings, SupportTicket } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function SupportPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SupportSettings | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  // form state
  const [subject, setSubject] = useState("")
  const [priority, setPriority] = useState<SupportTicket["priority"]>("Média")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await fetch("/api/support/settings", { cache: "no-store" })
        if (settingsRes.ok) {
          const settingsJson = await settingsRes.json()
          setSettings(settingsJson)
        } else {
          console.error("Failed to fetch support settings:", settingsRes.status)
          setSettings(null)
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from("support_tickets")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          setTickets(data || [])
        } else {
          setTickets([])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const phoneList = useMemo(() => {
    return Array.isArray(settings?.phones) ? settings!.phones : []
  }, [settings])

  const onSubmit = async () => {
    try {
      setSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "Você precisa estar logado", variant: "destructive" })
        return
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject,
          description,
          priority,
        })
        .select("*")
        .single()

      if (error) throw error
      setTickets((prev) => [data as any, ...prev])
      setSubject("")
      setDescription("")
      setPriority("Média")
      toast({ title: "Ticket enviado", description: "Nossa equipe entrará em contato." })
    } catch (error: any) {
      toast({ title: "Erro ao enviar", description: error.message || "Tente novamente", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Central de Suporte</h1>
        <Badge variant="secondary" className="text-sm">
          <Clock className="w-4 h-4 mr-1" />
          {settings?.business_hours ? "Horário personalizado" : "Suporte 24/7"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contato Rápido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contato Rápido
            </CardTitle>
            <CardDescription>Entre em contato conosco</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="default" asChild>
              <a href={settings?.chat_url || "#"} target={settings?.chat_url ? "_blank" : undefined} rel="noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat ao Vivo
              </a>
            </Button>

            <Button className="w-full bg-transparent" variant="outline" asChild>
              <a href={settings?.support_email ? `mailto:${settings.support_email}` : "#"}>
              <Mail className="w-4 h-4 mr-2" />
              {settings?.support_email || "Enviar E-mail"}
              </a>
            </Button>

            <Button className="w-full bg-transparent" variant="outline" asChild>
              <a href={settings?.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : "#"} target="_blank" rel="noreferrer">
              <Phone className="w-4 h-4 mr-2" />
              {phoneList[0] || settings?.whatsapp || "Telefone"}
              </a>
            </Button>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Horário de Atendimento:</p>
              {settings?.business_hours ? (
                settings.business_hours.split("\n").map((l, i) => <p key={i}>{l}</p>)
              ) : (
                <>
                  <p>Segunda a Sexta: 8h às 18h</p>
                  <p>Sábado: 9h às 14h</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recursos de Ajuda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Recursos de Ajuda
            </CardTitle>
            <CardDescription>Encontre respostas rapidamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="#faq">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ - Perguntas Frequentes
              </a>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="#videos">
              <Video className="w-4 h-4 mr-2" />
              Tutoriais em Vídeo
              </a>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href={settings?.knowledge_base_url || "#"} target={settings?.knowledge_base_url ? "_blank" : undefined} rel="noreferrer">
              <FileText className="w-4 h-4 mr-2" />
              Guia do Usuário
              </a>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href={settings?.knowledge_base_url || "#"} target={settings?.knowledge_base_url ? "_blank" : undefined} rel="noreferrer">
              <Book className="w-4 h-4 mr-2" />
              Base de Conhecimento
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Novo Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Abrir Ticket
            </CardTitle>
            <CardDescription>Descreva seu problema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Descreva brevemente o problema" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <select className="w-full p-2 border rounded-md" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
                <option>Urgente</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva detalhadamente o problema..." rows={4} />
            </div>

            <Button className="w-full" onClick={onSubmit} disabled={submitting || !subject}>
              {submitting ? 'Enviando...' : 'Enviar Ticket'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Meus Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Tickets</CardTitle>
          <CardDescription>Acompanhe o status dos seus chamados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{ticket.id.slice(0, 8)}</span>
                    <Badge variant={ticket.status === "resolved" ? "default" : "secondary"} className="text-xs">
                      {ticket.status === "resolved" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {ticket.status === "open" ? "Aberto" : ticket.status === "in_progress" ? "Em Progresso" : ticket.status === "resolved" ? "Resolvido" : "Fechado"}
                    </Badge>
                    <Badge variant={ticket.priority === "Alta" || ticket.priority === "Crítica" ? "destructive" : "outline"} className="text-xs">
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
