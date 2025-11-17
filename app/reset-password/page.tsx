"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Verificar se há tokens de recuperação na URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const token = searchParams.get('token')
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    
    console.log('🔐 Reset password page loaded:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasToken: !!token,
      hasTokenHash: !!tokenHash,
      tokenHashValue: tokenHash,
      type,
      allParams: Object.fromEntries(searchParams.entries())
    })
    
    // Verificar se access_token e refresh_token são válidos (não null/undefined/string "null")
    const hasValidTokens = accessToken && accessToken !== 'null' && refreshToken && refreshToken !== 'null'
    
    // Tentar definir sessão com access_token/refresh_token (formato novo)
    if (hasValidTokens) {
      console.log('🔄 Setting session with access/refresh tokens from URL')
      supabase.auth.setSession({
        access_token: accessToken!,
        refresh_token: refreshToken!
      }).then((result: { data: unknown; error: unknown }) => {
        if (result.error) {
          console.error('❌ Error setting session:', result.error)
          setError('Erro ao validar tokens de recuperação')
        } else {
          console.log('✅ Session set successfully:', result.data)
        }
      })
    } 
    // Tentar com token_hash (formato do email)
    else if (tokenHash && type === 'recovery') {
      console.log('🔄 Verifying OTP with token_hash:', tokenHash)
      
      // Remover prefixo pkce_ se existir
      const cleanTokenHash = tokenHash.replace(/^pkce_/, '')
      
      supabase.auth.verifyOtp({
        token_hash: cleanTokenHash,
        type: 'recovery'
      }).then((result: { data: unknown; error: any }) => {
        if (result.error) {
          console.error('❌ Error verifying OTP:', result.error)
          
          // Se o erro for de token expirado, dar feedback específico
          if (result.error.message?.includes('expired') || result.error.message?.includes('invalid')) {
            setError('Link de recuperação expirado. Solicite um novo link.')
          } else {
            setError('Erro ao validar link de recuperação. Tente novamente.')
          }
        } else {
          console.log('✅ OTP verified successfully:', result.data)
        }
      })
    }
    // Tentar com token simples
    else if (token && type === 'recovery') {
      console.log('🔄 Verifying OTP with token')
      supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      }).then((result: { data: unknown; error: unknown }) => {
        if (result.error) {
          console.error('❌ Error verifying OTP:', result.error)
          setError('Link inválido ou expirado. Solicite um novo link de recuperação.')
        } else {
          console.log('✅ OTP verified successfully:', result.data)
        }
      })
    } 
    else {
      console.warn('⚠️ No valid tokens found in URL')
      setError('Link de recuperação inválido. Por favor, solicite um novo.')
    }
  }, [searchParams, supabase])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Updating password...')

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('❌ Error updating password:', error)
        throw error
      }

      console.log('✅ Password updated successfully')
      setSuccess(true)
      
      // Deslogar o usuário após resetar senha
      await supabase.auth.signOut()
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/login?message=Senha redefinida com sucesso! Faça login com sua nova senha.')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Reset password error:', error)
      setError(error.message || "Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-gray-900 dark:via-background dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-lg border-0 bg-background/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Senha Redefinida!</h2>
              <p className="text-muted-foreground mb-4">
                Sua senha foi alterada com sucesso. Você será redirecionado para a página de login.
              </p>
              <Link href="/login">
                <Button className="w-full">Ir para Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-gray-900 dark:via-background dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Moncoy</h1>
          <p className="text-muted-foreground">Redefinir sua senha</p>
        </div>

        <Card className="shadow-lg border-0 bg-background/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Nova Senha</CardTitle>
            <CardDescription className="text-center">
              Digite sua nova senha para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Lembrou da senha? </span>
              <Link href="/login" className="text-primary hover:underline">
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}