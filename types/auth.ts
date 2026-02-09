import type { User, UserSettings } from '../lib/supabase/types'

// Re-export types for compatibility
export type { User, UserSettings }

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    name?: string
    full_name?: string
    avatar_url?: string
    plan?: string
    [key: string]: any
  }
  role?: string
  aud: string
  created_at: string
  updated_at?: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  plan: 'basic' | 'professional'
  openaiKey?: string
  phone?: string
  accountType?: 'personal' | 'business'
}

export interface AuthContextType {
  // Estado
  user: AuthUser | null
  userProfile: User | null
  loading: boolean
  isAdmin: boolean
  isInitialized: boolean

  // Métodos de autenticação
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>

  // Métodos admin
  signInAsAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>

  // Métodos de perfil
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  getUserSettings: () => Promise<UserSettings | null>
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<{ success: boolean; error?: string }>
}

export type AppMode = 'user' | 'admin' | 'public'

export interface AuthState {
  user: AuthUser | null
  userProfile: User | null
  userSettings: UserSettings | null
  loading: boolean
  mode: AppMode
}