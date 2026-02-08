"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  const [isChecking, setIsChecking] = useState(true)
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpar timeout na desmontagem
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Se ainda está carregando no AuthProvider, aguardar
    if (loading) return

    const checkAccess = () => {
      // Páginas públicas - não precisam de autenticação
      if (requiredMode === 'public') {
        setIsChecking(false)
        return
      }

      // Páginas de usuário - precisam estar logados
      if (requiredMode === 'user') {
        if (!user) {
          // Usuário não logado - redirecionar para login
          if (!hasRedirected.current) {
            hasRedirected.current = true
            router.replace(redirectTo || '/login')
          }
          return
        }

        // Usuário existe - verificar perfil
        if (!userProfile) {
          // Aguardar um tempo máximo para o perfil carregar
          // Se não carregar em 5 segundos, permitir continuar mesmo assim
          if (!checkTimeoutRef.current) {
            checkTimeoutRef.current = setTimeout(() => {
              console.warn('⚠️ UserProfile timeout - proceeding without profile')
              setIsChecking(false)
            }, 5000)
          }
          return
        }

        // Limpar timeout se o perfil foi carregado
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current)
          checkTimeoutRef.current = null
        }

        setIsChecking(false)
        return
      }

      // Páginas de admin - precisam ser admin
      if (requiredMode === 'admin') {
        if (!user) {
          if (!hasRedirected.current) {
            hasRedirected.current = true
            router.replace('/admin/login')
          }
          return
        }
        if (!isAdmin) {
          if (!hasRedirected.current) {
            hasRedirected.current = true
            router.replace('/admin/login?error=unauthorized')
          }
          return
        }
        setIsChecking(false)
        return
      }

      setIsChecking(false)
    }

    checkAccess()
  }, [user, userProfile, loading, isAdmin, requiredMode, router, redirectTo])

  // Resetar flag de redirecionamento quando user muda
  useEffect(() => {
    hasRedirected.current = false
  }, [user])

  // Loading state
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {loading ? 'Verificando autenticação...' : 'Carregando...'}
          </p>
        </div>
      </div>
    )
  }

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