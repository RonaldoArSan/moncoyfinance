import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint de debug para testar links de reset de senha
 * 
 * Acesse: /api/debug-reset?token_hash=xxx&type=recovery
 * 
 * Isso vai mostrar exatamente o que o callback receberia
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const params: Record<string, string> = {}
  
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })

  return NextResponse.json({
    message: 'Debug de parâmetros recebidos',
    params,
    hasType: !!params.type,
    hasTokenHash: !!params.token_hash,
    hasToken: !!params.token,
    hasCode: !!params.code,
    wouldRedirectToReset: (params.type === 'recovery' && (params.token_hash || params.token)),
    wouldTryOAuth: !!params.code,
    recommendation: !params.type 
      ? 'PROBLEMA: Falta parâmetro type=recovery na URL. Configure o Email Template no Supabase.'
      : 'OK: Parâmetros corretos para reset de senha'
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
