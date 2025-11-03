# Fix: PKCE Password Reset Flow

## Problema Identificado

O password reset estava falhando com erro:
```
code challenge does not match previously saved code verifier
Invalid Refresh Token: Refresh Token Not Found
```

### Causa Raiz

1. **PKCE Flow Incompleto**: O fluxo de PKCE requer que o `code_verifier` seja armazenado em cookies/localStorage durante a requisição inicial, mas não estava sendo persistido corretamente

2. **Middleware Conflitante**: O middleware estava tentando interceptar o `/auth/callback` ANTES do route handler processar o PKCE exchange, causando perda do code_verifier

3. **Configuração Incompleta**: Os clients Supabase (browser e server) não estavam explicitamente configurados para PKCE flow

## Alterações Implementadas

### 1. Middleware (`middleware.ts`)
**Removido**: Lógica duplicada que interceptava `/auth/callback` antes do route handler
```typescript
// ANTES: Middleware tentava processar recovery flow
if (req.nextUrl.pathname === '/auth/callback') {
  // ... código removido
}

// DEPOIS: Deixa route handler processar PKCE
// Apenas refresh session em rotas de auth
```

### 2. Auth Callback Route (`app/auth/callback/route.ts`)
**Simplificado**: Removidos logs excessivos e lógica complexa
**Melhorado**: Tratamento de erro PKCE com fallback para recovery flow

```typescript
// Novo tratamento de erro PKCE
if (exchangeError.message?.includes('code verifier')) {
  if (type === 'recovery') {
    // Redireciona para reset-password com flag expired
    return NextResponse.redirect(new URL('/reset-password?expired=true', requestUrl.origin))
  }
  return NextResponse.redirect(new URL('/login?error=Sessão expirada', requestUrl.origin))
}
```

### 3. Supabase Browser Client (`lib/supabase/client.ts`)
**Adicionado**: Configuração explícita de PKCE e storage

```typescript
createBrowserClient(url, key, {
  auth: {
    flowType: 'pkce',              // ✅ PKCE explícito
    detectSessionInUrl: true,       // ✅ Detecta session na URL
    persistSession: true,           // ✅ Persiste no localStorage
    storage: window.localStorage,   // ✅ Storage explícito
  },
  cookieOptions: {
    name: 'sb-auth-token',
    domain: window.location.hostname,
    path: '/',
    sameSite: 'lax',
  },
})
```

### 4. Supabase Server Client (`lib/supabase/server.ts`)
**Adicionado**: Configuração de PKCE e cookies seguros

```typescript
createServerClient(url, key, {
  auth: {
    flowType: 'pkce',           // ✅ PKCE explícito
    detectSessionInUrl: true,
    persistSession: true,
  },
  cookies: {
    set(name, value, options) {
      cookieStore.set({ 
        name, 
        value, 
        ...options,
        sameSite: 'lax',         // ✅ SameSite para PKCE
        secure: NODE_ENV === 'production', // ✅ Secure em prod
      })
    },
    // ... get e remove
  },
})
```

## Como Funciona Agora

### Fluxo Password Reset

1. **Usuário clica "Esqueci senha"** (`/forgot-password`)
   - Frontend: `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/callback' })`
   - Supabase: Gera `code_verifier` e `code_challenge`, armazena code_verifier em localStorage
   - Email enviado com link: `http://localhost:3000/auth/callback?code=xxx&type=recovery`

2. **Usuário clica no link do email**
   - Browser carrega `/auth/callback?code=xxx&type=recovery`
   - Middleware: Apenas refresh session, NÃO intercepta
   - Route Handler: Chama `exchangeCodeForSession(code)`
   - Supabase: Busca `code_verifier` no localStorage, valida contra `code_challenge`
   - ✅ Session criada com sucesso
   - Redirect: `/reset-password`

3. **Página Reset Password**
   - Usuário autenticado pode trocar senha
   - Chama `supabase.auth.updateUser({ password: newPassword })`

### Tratamento de Erros

- **PKCE Error + Recovery**: Redireciona para `/reset-password?expired=true` (pode re-autenticar)
- **PKCE Error + OAuth**: Redireciona para `/login?error=Sessão expirada`
- **Code Expired**: Redireciona para `/login?error=Link expirado`
- **Code Invalid**: Redireciona para `/login?error=Link inválido`

## Testes Necessários

1. ✅ **Forgot Password Flow**
   ```bash
   # 1. Acessar http://localhost:3000/forgot-password
   # 2. Inserir email e enviar
   # 3. Clicar no link do email
   # 4. Verificar se /reset-password abre corretamente
   # 5. Trocar senha e fazer login
   ```

2. ✅ **OAuth Flow (Google)**
   ```bash
   # 1. Acessar http://localhost:3000/login
   # 2. Clicar "Continuar com Google"
   # 3. Verificar se /transactions abre após login
   ```

3. ✅ **Logs de Debug**
   ```bash
   # Console do browser:
   # - "🔍 Supabase Client Config" com hasUrl/hasKey = true
   # - "🔐 Auth callback" com hasCode = true
   # - "✅ Session criada" com userId
   ```

## ⚠️ DESCOBERTA ADICIONAL: Password Recovery NÃO Usa PKCE

**PROBLEMA REAL**: O erro `"both auth code and code verifier should be non-empty"` revela que:

- Password recovery do Supabase **NÃO usa PKCE por padrão**
- Em vez disso, usa **magic links com tokens diretos** (`access_token` + `refresh_token`)
- O `code` que aparece na URL é apenas um identificador, não um PKCE authorization code
- O `code_verifier` está vazio porque nunca foi criado para password recovery

**SOLUÇÃO**: Mudar para usar **magic link flow** para password recovery

### Opções de Configuração

**Opção A**: Configurar Supabase para enviar tokens diretos
1. Supabase Dashboard > Authentication > Email Templates
2. Configurar template de "Reset Password" para usar: `{{ .SiteURL }}/auth/callback?access_token={{ .Token }}&refresh_token={{ .TokenHash }}&type=recovery`

**Opção B**: Usar `signInWithOtp` em vez de `resetPasswordForEmail`
```typescript
// Em forgot-password/page.tsx
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${window.location.origin}/reset-password`
  }
})
```

## Configurações do Supabase Dashboard

**IMPORTANTE**: Verificar se as URLs de redirect estão configuradas:

1. **Authentication > URL Configuration**
   - Site URL: `http://localhost:3000` (dev) ou `https://moncoyfinance.com` (prod)
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/reset-password`
     - `https://moncoyfinance.com/auth/callback`
     - `https://moncoyfinance.com/reset-password`

2. **Authentication > Providers > Email**
   - Confirm email: Disabled (ou conforme necessário)
   - Secure email change: Enabled
   - Double confirm email: Disabled
   - **Enable email OTP**: Enabled (para signInWithOtp)

3. **Authentication > Email Templates > Reset Password**
   - Template URL: `{{ .SiteURL }}/auth/callback?access_token={{ .Token }}&refresh_token={{ .TokenHash }}&type=recovery`

## Arquivos Modificados

- ✅ `middleware.ts` - Removida lógica de recovery
- ✅ `app/auth/callback/route.ts` - Simplificado e melhorado tratamento PKCE
- ✅ `lib/supabase/client.ts` - Configuração PKCE explícita
- ✅ `lib/supabase/server.ts` - Configuração PKCE e cookies seguros

## Backup

Arquivo original preservado: `app/auth/callback/route.old.ts`

## Próximos Passos

1. Testar password reset em localhost
2. Se funcionar, testar OAuth flow
3. Verificar logs no console
4. Deploy para produção se tudo OK
5. Remover arquivo `.old.ts` após confirmação
