"use client"

import { useEffect, useState } from 'react'
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
  const { user, loading, isAdmin, isInitialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Aguardar inicialização completa do auth
    if (!isInitialized) return

    // Páginas públicas - não precisam de autenticação
    if (requiredMode === 'public') {
      setHasChecked(true)
      return
    }

    // Páginas de usuário - precisam estar logados
    if (requiredMode === 'user') {
      if (!user) {
        router.replace(redirectTo || '/login')
        return
      }
      setHasChecked(true)
      return
    }

    // Páginas de admin - precisam ser admin
    if (requiredMode === 'admin') {
      if (!user) {
        router.replace('/admin/login')
        return
      }
      if (!isAdmin) {
        router.replace('/admin/login?error=unauthorized')
        return
      }
      setHasChecked(true)
      return
    }

    setHasChecked(true)
  }, [user, isAdmin, isInitialized, requiredMode, router, redirectTo])

  // Ainda inicializando
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Verificação concluída - mostrar conteúdo
  if (hasChecked) {
    return <>{children}</>
  }

  // Aguardando redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  )
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