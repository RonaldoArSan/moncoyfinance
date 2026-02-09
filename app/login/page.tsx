"use client"

import type React from "react"

import { useState, useEffect, Suspense, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, Chrome, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: authLoading, signInWithGoogle, signIn, isInitialized } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true)
    }
    if (searchParams.get('message') === 'password-updated') {
      setPasswordUpdated(true)
    }

    // Mostrar erro do OAuth se houver
    const oauthError = searchParams.get('error')
    if (oauthError) {
      setError(decodeURIComponent(oauthError))
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    console.log('🔑 Login attempt started', { email })

    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }
    if (!password.trim()) {
      setError('Senha é obrigatória')
      return
    }

    startTransition(async () => {
      try {
        console.log('📤 Calling signIn...')
        const result = await signIn(email, password)

        console.log('📥 signIn result:', result)

        if (!result.success) {
          console.error('❌ Login error:', result.error)
          setError(result.error || 'Erro ao fazer login')
        } else {
          console.log('✅ Login successful, redirecting...')
          // Forçar refresh completo para garantir sincronização
          window.location.href = '/'
        }
      } catch (err: any) {
        console.error('💥 Unexpected error:', err)
        setError(err.message || 'Erro ao fazer login')
      }
    })
  }

  const handleGoogleLogin = async () => {
    setError("")

    const result = await signInWithGoogle()

    if (!result.success) {
      setError(result.error || "Erro ao fazer login com Google")
    }
    // Google OAuth will redirect automatically on success
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo/Brand */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Moncoy</h1>
        <p className="text-muted-foreground">Gerencie suas finanças com inteligência</p>
      </div>

      <Card className="shadow-lg border-0 bg-background/80 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Entrar na sua conta</CardTitle>
          <CardDescription className="text-center">Entre com seu email e senha ou use o Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentSuccess && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              ✅ Pagamento confirmado! Faça login para acessar sua conta.
            </div>
          )}
          {passwordUpdated && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              ✅ Senha redefinida com sucesso! Faça login com sua nova senha.
            </div>
          )}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <Button
            variant="outline"
            className="w-full h-11 bg-transparent"
            onClick={handleGoogleLogin}
            disabled={authLoading}
          >
            {authLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}
            {authLoading ? "Conectando..." : "Continuar com Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
                onClick={() => console.log('🔗 Forgot password link clicked')}
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link href="/register" className="text-primary hover:underline">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Ao continuar, você concorda com nossos</p>
        <div className="space-x-4">
          <Link href="/terms" className="hover:underline">
            Termos de Uso
          </Link>
          <Link href="/privacy" className="hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-gray-900 dark:via-background dark:to-gray-800 p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
