import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/transactions'
  
  // Check for direct tokens (password recovery magic link or OTP)
  const accessToken = requestUrl.searchParams.get('access_token')
  const refreshToken = requestUrl.searchParams.get('refresh_token')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const otpType = requestUrl.searchParams.get('type')

  console.log('🔐 Auth callback:', {
    hasCode: !!code,
    hasTokens: !!(accessToken && refreshToken),
    hasTokenHash: !!token_hash,
    type,
    otpType,
    error,
    errorDescription,
  })

  // Handle OAuth errors
  if (error) {
    console.error('❌ OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    )
  }

  // Handle OTP magic link (signInWithOtp)
  if (token_hash && otpType) {
    console.log('🔑 OTP magic link detected')
    
    try {
      const supabase = await createClient()
      
      // Verify OTP and create session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: otpType === 'magiclink' ? 'magiclink' : 'email',
      })
      
      if (verifyError) {
        console.error('❌ Error verifying OTP:', verifyError)
        return NextResponse.redirect(
          new URL('/forgot-password?error=Link expirado ou inválido.', requestUrl.origin)
        )
      }
      
      console.log('✅ Session created via OTP')
      
      // Redirect to password reset page
      return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
      
    } catch (err) {
      console.error('💥 Error verifying OTP:', err)
      return NextResponse.redirect(
        new URL('/forgot-password?error=Erro ao processar link', requestUrl.origin)
      )
    }
  }

  // Handle magic link with direct tokens (legacy password recovery)
  if (accessToken && refreshToken) {
    console.log('🔑 Magic link with tokens detected')
    
    try {
      const supabase = await createClient()
      
      // Set session with provided tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      
      if (sessionError) {
        console.error('❌ Error setting session:', sessionError)
        return NextResponse.redirect(
          new URL('/forgot-password?error=Link expirado. Solicite um novo.', requestUrl.origin)
        )
      }
      
      console.log('✅ Session set via magic link')
      
      // Redirect to password reset page
      return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
      
    } catch (err) {
      console.error('💥 Error setting session:', err)
      return NextResponse.redirect(
        new URL('/forgot-password?error=Erro ao processar link', requestUrl.origin)
      )
    }
  }

  // Handle OAuth code exchange (Google login, etc)
  if (code) {
    try {
      const supabase = await createClient()
      
      console.log('🔄 Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('❌ Exchange error:', exchangeError.message)
        
        // Handle specific errors
        if (exchangeError.message?.includes('expired') || exchangeError.status === 410) {
          return NextResponse.redirect(
            new URL('/login?error=Link expirado. Solicite um novo.', requestUrl.origin)
          )
        }
        
        if (exchangeError.message?.includes('invalid') || exchangeError.message?.includes('not found')) {
          return NextResponse.redirect(
            new URL('/login?error=Link inválido. Solicite um novo.', requestUrl.origin)
          )
        }
        
        // PKCE/code verifier errors
        if (exchangeError.message?.includes('code verifier') || exchangeError.message?.includes('code challenge')) {
          console.error('❌ PKCE error')
          return NextResponse.redirect(
            new URL('/login?error=Sessão expirada. Tente novamente.', requestUrl.origin)
          )
        }
        
        throw exchangeError
      }

      console.log('✅ Session criada via OAuth:', {
        userId: data?.user?.id,
        email: data?.user?.email,
      })

      // Regular OAuth flow
      console.log('✅ Redirecionando para:', next)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
      
    } catch (err) {
      console.error('💥 Erro no callback:', err)
      return NextResponse.redirect(
        new URL('/login?error=Erro ao autenticar', requestUrl.origin)
      )
    }
  }

  // No code or tokens provided
  console.warn('⚠️ Nenhum code ou tokens fornecidos')
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
