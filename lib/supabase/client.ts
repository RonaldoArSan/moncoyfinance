import { createBrowserClient } from '@supabase/ssr'

// Verificar variáveis de ambiente no cliente
const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Client Config:', {
    hasUrl,
    hasKey,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'undefined',
  })
  
  if (!hasUrl || !hasKey) {
    console.error('🚨 ERRO: Variáveis de ambiente Supabase não configuradas no Vercel!')
    console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (!supabaseClient) {
    if (!hasUrl || !hasKey) {
      throw new Error('Supabase environment variables are not configured')
    }
    
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    )
  }
  return supabaseClient
}

// Export the singleton instance directly
export const supabase = createClient()
