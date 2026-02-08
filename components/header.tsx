"use client"

import { User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { SearchDropdown } from "@/components/search-dropdown"
import { PlanBadge } from "@/components/plan-upgrade-card"
import { useSettingsContext } from "@/contexts/settings-context"
import { useUserPlan } from "@/contexts/user-plan-context"
import { useAuth } from "@/components/auth-provider"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSettingsContext()
  const { currentPlan } = useUserPlan()
  const { signOut } = useAuth()

  const getPlanName = (plan: string) => {
    return plan === 'professional' ? 'Plano Profissional' : 'Plano Básico'
  }

  const handleLogout = async () => {
    try {
      // Usar o signOut do contexto que já está configurado corretamente
      const result = await signOut()

      if (!result.success) {
        console.error('Erro no logout:', result.error)
      }

      // Limpar localStorage e redirecionar
      localStorage.clear()
      sessionStorage.clear()

      // Forçar redirecionamento e limpeza de cache
      window.location.replace("/login")
    } catch (error) {
      console.error('Erro no logout:', error)
      // Mesmo com erro, tentar redirecionar
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace("/login")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo/Brand */}
        <div className="mr-4 hidden md:flex">
          <h1 className="text-xl font-bold text-primary">Olá, {user?.name || 'Usuário'}</h1>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 items-center space-x-2">
          <SearchDropdown />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Plan Badge */}
          <div className="hidden sm:inline-flex">
            <Badge variant={currentPlan === "premium" ? "destructive" : currentPlan === "pro" ? "default" : "secondary"}>
              {currentPlan === "premium" ? "PREMIUM" : currentPlan === "pro" ? "PRO" : "BÁSICO"}
            </Badge>
          </div>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                  <Badge variant="outline" className="w-fit text-xs mt-1">
                    {currentPlan === 'premium' ? 'Premium' : currentPlan === 'pro' ? 'Pro' : 'Básico'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support" className="cursor-pointer">
                  Suporte
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
