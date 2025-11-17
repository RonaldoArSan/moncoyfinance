"use client"

import type React from "react"
import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { UserGuard, AdminGuard, PublicGuard } from "@/components/auth-guards"
import { UserPlanProvider } from "@/contexts/user-plan-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { CookieBanner } from "@/components/cookie-banner"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { usePathname } from "next/navigation"
import "./globals.css"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Determinar o tipo de página baseado na URL
  const isPublicPage = 
    pathname === "/landingpage" ||
    pathname === "/privacy" ||
    pathname === "/terms"

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"

  const isAdminPage = pathname?.startsWith("/admin")

  // Determinar o layout a ser usado
  const getPageLayout = () => {
    // Páginas públicas ou de auth - layout simples
    if (isPublicPage || isAuthPage) {
      return (
        <main className="min-h-screen bg-background">{children}</main>
      )
    }

    // Páginas de admin - layout específico para admin
    if (isAdminPage) {
      return (
        <AdminGuard>
          <main className="min-h-screen bg-background">{children}</main>
        </AdminGuard>
      )
    }

    // Páginas de usuário - layout com sidebar
    return (
      <UserGuard>
        <div className="flex h-screen bg-background">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="flex flex-1 flex-col">
            <Header onMenuClick={() => setIsSidebarOpen(prev => !prev)} />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </UserGuard>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <SettingsProvider>
          <UserPlanProvider>
            {getPageLayout()}
            <CookieBanner />
          </UserPlanProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
