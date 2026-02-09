"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredMode?: 'user' | 'admin' | 'public'
  redirectTo?: string
}

export function AuthGuard({
  children,
  requiredMode = 'user',
  redirectTo
}: AuthGuardProps) {
  const { user, loading, isAdmin, isInitialized } = useAuth()
  const router = useRouter()
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthorized'>('checking')

  const checkAuth = useCallback(() => {
    // Aguardar inicialização
    if (!isInitialized) return

    // Páginas públicas - sempre autorizado
    if (requiredMode === 'public') {
      setAuthState('authorized')
      return
    }

    // Páginas de usuário
    if (requiredMode === 'user') {
      if (user) {
        setAuthState('authorized')
      } else {
        setAuthState('unauthorized')
      }
      return
    }

    // Páginas de admin
    if (requiredMode === 'admin') {
      if (user && isAdmin) {
        setAuthState('authorized')
      } else {
        setAuthState('unauthorized')
      }
      return
    }

    setAuthState('authorized')
  }, [user, isAdmin, isInitialized, requiredMode])

  // Verificar autenticação quando dependências mudarem
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Redirecionar se não autorizado (em efeito separado para evitar erros)
  useEffect(() => {
    if (authState === 'unauthorized') {
      const target = requiredMode === 'admin'
        ? (user ? '/admin/login?error=unauthorized' : '/admin/login')
        : (redirectTo || '/login')

      // Usar setTimeout para evitar erro de redirect durante render
      const timer = setTimeout(() => {
        router.replace(target)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [authState, requiredMode, user, redirectTo, router])

  // Ainda inicializando ou verificando
  if (!isInitialized || loading || authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não autorizado - mostra loading enquanto redireciona
  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Autorizado - mostrar conteúdo
  return <>{children}</>
}

// Guard específico para usuários
export function UserGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredMode="user">
      {children}
    </AuthGuard>
  )
}

// Guard específico para admin
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredMode="admin">
      {children}
    </AuthGuard>
  )
}

// Guard específico para páginas públicas
export function PublicGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredMode="public">
      {children}
    </AuthGuard>
  )
}