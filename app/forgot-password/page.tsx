"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

import { useSearchParams } from "next/navigation"

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState(searchParams.get('error') || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log('📧 Sending password reset email...')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      if (error) {
        console.error('❌ Error sending reset email:', error)
        throw error
      }

      console.log('✅ Reset email sent successfully')
      setIsEmailSent(true)
    } catch (error: any) {
      setError(error.message || "Erro ao enviar email de recuperação")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setError("")
    setIsLoading(true)
    
    try {
      console.log('📧 Resending password reset email...')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      if (error) {
        console.error('❌ Error resending email:', error)
        throw error
      }
      
      console.log('✅ Reset email resent successfully')
    } catch (error: any) {
      setError(error.message || "Erro ao reenviar email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-gray-900 dark:via-background dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Moncoy</h1>
          <p className="text-muted-foreground">Recupere o acesso à sua conta</p>
        </div>

        <Card className="shadow-lg border-0 bg-background/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isEmailSent ? "Email enviado!" : "Esqueceu sua senha?"}
            </CardTitle>
            <CardDescription className="text-center">
              {isEmailSent
                ? "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha"
                : "Digite seu email e enviaremos um link para redefinir sua senha"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isEmailSent ? (
              <>
                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>
                </form>

                <div className="text-center">
                  <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Voltar para o login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
                    </p>
                    <p className="text-xs text-muted-foreground">O link expira em 24 horas por motivos de segurança.</p>
                  </div>

                  <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-warning-600 dark:text-warning-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-warning-700 dark:text-warning-300">
                        <p className="font-medium">Não recebeu o email?</p>
                        <p>Verifique sua pasta de spam ou lixo eletrônico.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={handleResendEmail}
                      disabled={isLoading}
                    >
                      {isLoading ? "Reenviando..." : "Reenviar email"}
                    </Button>

                    <Link href="/login" className="block">
                      <Button variant="ghost" className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o login
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Precisa de ajuda?</p>
          <div className="space-x-4">
            <Link href="/support" className="hover:underline">
              Central de Ajuda
            </Link>
            <Link href="/support" className="hover:underline">
              Contato
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
