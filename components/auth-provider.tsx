"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { userApi } from '@/lib/api'
import { logger } from '@/lib/logger'
import { ADMIN_CONFIG, ADMIN_EMAILS } from '@/lib/admin-config'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type {
  AuthContextType,
  AuthUser,
  User,
  UserSettings,
  RegisterData,
  AppMode
} from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<AppMode>('public')

  const router = useRouter()
  const pathname = usePathname()

  // Refs para valores que mudam frequentemente mas não devem re-executar o useEffect de auth
  const modeRef = useRef(mode)
  const pathnameRef = useRef(pathname)

  // Atualizar refs quando valores mudam
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  // Determinar o modo da aplicação baseado na URL
  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      setMode('admin')
    } else if (
      pathname?.startsWith('/landingpage') ||
      pathname === '/privacy' ||
      pathname === '/terms' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password' ||
      pathname?.startsWith('/auth/callback')
    ) {
      setMode('public')
    } else {
      setMode('user')
    }
  }, [pathname])

  // Verificar se é admin usando configuração centralizada
  const isAdmin = ADMIN_CONFIG.isAdmin(user?.email)

  // Inicializar sessão - executa apenas uma vez
  useEffect(() => {
    let mounted = true
    let isProcessing = false

    const initializeAuth = async () => {
      try {
        logger.dev('🔄 Initializing auth...')
        const { data: { session } } = await supabase.auth.getSession()

        if (mounted && !isProcessing) {
          if (session?.user) {
            logger.dev('✅ Session found:', session.user.email)
            isProcessing = true
            await handleAuthUser(session.user)
            isProcessing = false
          } else {
            logger.dev('❌ No session found')
            setUser(null)
            setUserProfile(null)
            setUserSettings(null)
          }
          setLoading(false)
        }
      } catch (error) {
        logger.error('❌ Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
          isProcessing = false
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted || isProcessing) {
          logger.dev('⏭️ Skipping auth change (not mounted or processing):', event)
          return
        }

        logger.dev('🔔 Auth state change:', event, session?.user?.email)

        // Eventos que indicam sessão ativa
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          logger.dev('✨ User session detected:', event, session.user.email)
          isProcessing = true
          await handleAuthUser(session.user)
          isProcessing = false
          setLoading(false)
          return
        }

        // Eventos que indicam logout ou sessão inválida
        if (event === 'SIGNED_OUT' || (!session?.user && event !== 'INITIAL_SESSION')) {
          const currentPathname = pathnameRef.current
          const currentMode = modeRef.current

          logger.dev('👋 User signed out')
          logger.dev('📍 Current pathname:', currentPathname)
          logger.dev('🔧 Current mode:', currentMode)
          setUser(null)
          setUserProfile(null)
          setUserSettings(null)

          // Redirect based on mode APENAS se não estiver em página pública
          const publicRoutes = [
            '/landingpage',
            '/privacy',
            '/terms',
            '/login',
            '/register',
            '/admin/login',
            '/forgot-password',
            '/reset-password',
            '/auth/callback'
          ]
          const isPublicRoute = publicRoutes.some(route => currentPathname?.startsWith(route))
          logger.dev('🔍 isPublicRoute check:', { pathname: currentPathname, isPublicRoute, publicRoutes })

          if (!isPublicRoute) {
            logger.dev('⚠️ Not a public route, redirecting based on mode:', currentMode)
            if (currentMode === 'admin') {
              logger.dev('↪️ Redirecting to admin login')
              router.push('/admin/login')
            } else if (currentMode === 'user') {
              logger.dev('↪️ Redirecting to user login')
              router.push('/login')
            }
          } else {
            logger.dev('✅ Public route detected, no redirect needed')
          }

          setLoading(false)
          return
        }

        // INITIAL_SESSION sem usuário (primeira visita sem login)
        if (event === 'INITIAL_SESSION' && !session?.user) {
          logger.dev('📋 Initial session: No user found')
          setUser(null)
          setUserProfile(null)
          setUserSettings(null)
          setLoading(false)
          return
        }

        setLoading(false)
      }
    )

    return () => {
      logger.dev('🧹 Cleaning up auth subscription')
      mounted = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executa apenas uma vez na montagem

  // Processar usuário autenticado
  const handleAuthUser = async (authUser: any) => {
    try {
      logger.dev('👤 [AuthProvider] Handling auth user:', { id: authUser.id, email: authUser.email })

      // Evitar processamento duplo do mesmo usuário
      if (user?.id === authUser.id && userProfile) {
        logger.dev('⏭️ [AuthProvider] User already processed, skipping')
        return
      }

      const formattedUser: AuthUser = {
        id: authUser.id,
        email: authUser.email || '',
        user_metadata: authUser.user_metadata || {},
        role: authUser.role,
        aud: authUser.aud,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at
      }

      setUser(formattedUser)
      logger.dev('✅ [AuthProvider] User state updated')

      // Verificar se está em página pública (não carregar perfil)
      const currentPathname = pathnameRef.current
      const currentMode = modeRef.current

      const isPublicPage = currentPathname?.startsWith('/landingpage') ||
        currentPathname === '/privacy' ||
        currentPathname === '/terms' ||
        currentPathname === '/forgot-password' ||
        currentPathname === '/reset-password' ||
        currentPathname?.startsWith('/auth/callback')

      // Carregar perfil do usuário (exceto para modo público ou páginas públicas)
      if (currentMode !== 'public' && !isPublicPage) {
        logger.dev('📋 [AuthProvider] Loading user profile (mode:', currentMode, 'pathname:', currentPathname, ')')
        try {
          const profile = await userApi.getCurrentUser()
          logger.dev('✅ [AuthProvider] Profile loaded:', { id: profile?.id, plan: profile?.plan })
          setUserProfile(profile)

          // Carregar configurações do usuário
          if (profile) {
            logger.dev('⚙️ [AuthProvider] Loading user settings...')
            await loadUserSettings(profile.id)
          }
        } catch (error) {
          logger.error('❌ [AuthProvider] Error loading user profile:', error)
          // Se não conseguir carregar o perfil, criar um
          try {
            logger.dev('🆕 [AuthProvider] Attempting to create user profile...')
            const newProfile = await userApi.createUserProfile(authUser)
            logger.dev('✅ [AuthProvider] Profile created:', newProfile.id)
            setUserProfile(newProfile)
            await loadUserSettings(newProfile.id)
          } catch (createError) {
            logger.error('❌ [AuthProvider] Error creating user profile:', createError)
          }
        }
      } else {
        logger.dev('🔓 [AuthProvider] Public mode, skipping profile load')
      }
    } catch (error) {
      logger.error('❌ [AuthProvider] Error handling auth user:', error)
    }
  }

  // Carregar configurações do usuário
  const loadUserSettings = async (userId?: string) => {
    try {
      const id = userId || user?.id || userProfile?.id

      if (!id) {
        logger.warn('No user ID available for loading settings')
        return
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setUserSettings(data || null)
    } catch (error) {
      logger.error('Error loading user settings:', error)
    }
  }  // Métodos de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Validar campos antes de enviar
      if (!email || !email.trim()) {
        throw new Error('Email é obrigatório')
      }
      if (!password || !password.trim()) {
        throw new Error('Senha é obrigatória')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        // Melhorar mensagens de erro
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos')
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.')
        }
        throw error
      }

      return { success: true }
    } catch (error: any) {
      logger.error('Sign in error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: RegisterData) => {
    try {
      setLoading(true)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            full_name: data.name,
            plan: data.plan,
            openai_key: data.openaiKey,
            phone: data.phone,
            account_type: data.accountType
          }
        }
      })

      if (authError) throw authError

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)

      // Use a URL correta do site em produção
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'https://moncoyfinance.com'

      const redirectUrl = mode === 'admin'
        ? `${baseUrl}/auth/callback?next=/admin`
        : `${baseUrl}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            ...(process.env.NEXT_PUBLIC_GOOGLE_HD && { hd: process.env.NEXT_PUBLIC_GOOGLE_HD })
          },
          scopes: 'openid profile email',
          skipBrowserRedirect: false
        }
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      logger.error('Google sign in error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Verificar se o email é de admin
      if (!ADMIN_EMAILS.includes(email)) {
        throw new Error('Email não autorizado para acesso administrativo')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Verificar novamente após login
      if (!ADMIN_EMAILS.includes(data.user.email || '')) {
        await supabase.auth.signOut()
        throw new Error('Usuário não possui permissões administrativas')
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)

      // Limpar estado local primeiro
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)

      // Usar scope 'global' para invalidar a sessão em todos os dispositivos
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Erro no signOut:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)

      const redirectUrl = mode === 'admin'
        ? `${window.location.origin}/admin/reset-password`
        : `${window.location.origin}/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Métodos de perfil
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')

      const updatedProfile = await userApi.updateUser(updates)
      setUserProfile(updatedProfile)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const getUserSettings = async (): Promise<UserSettings | null> => {
    if (!userSettings && user) {
      await loadUserSettings()
    }
    return userSettings
  }

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updates
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error

      setUserSettings(data)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signInAsAdmin,
    signOut,
    resetPassword,
    updateProfile,
    getUserSettings,
    updateUserSettings
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}