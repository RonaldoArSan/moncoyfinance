# 🔍 DIAGNÓSTICO COMPLETO - Fluxo de Reset de Senha

## 📋 RESUMO DO PROBLEMA

**Sintoma:** Página `/reset-password` não carrega ao clicar no link do email
**Comportamento:** Usuário é redirecionado para `/login` com erro

---

## 🔎 ANÁLISE DO FLUXO ATUAL

### 1️⃣ Fluxo CORRETO (Como deveria funcionar)

```
Usuário → /forgot-password
         ↓ (digita email)
Supabase → Envia email com token
         ↓
Email → Link: https://moncoyfinance.com/reset-password?token=xxx&type=recovery
         ↓ (usuário clica)
/reset-password → verifyOtp(token, 'recovery')
         ↓ (token válido)
Usuário → Define nova senha
         ↓ (updateUser)
Logout → /login (com sucesso)
```

### 2️⃣ Fluxo ATUAL (O que está acontecendo)

```
Usuário → /forgot-password
         ↓
Supabase → Email com LINK ERRADO
         ↓
Email → Link: https://moncoyfinance.com/auth/callback?code=pkce_xxx&type=recovery
         ↓ (ERRO: OAuth code ao invés de OTP token)
/auth/callback → Tenta exchangeCodeForSession()
         ↓
Erro PKCE → Redireciona para /forgot-password
         ↓
OU
         ↓
/reset-password → Sem token válido
         ↓
Erro → Redireciona para /login
```

---

## 🚨 PROBLEMA IDENTIFICADO

### Root Cause: Email Template Incorreto

O **template de email no Supabase** está configurado com:
```html
<a href="{{ .ConfirmationURL }}">Redefinir Senha</a>
```

**ISSO ESTÁ ERRADO!**

`{{ .ConfirmationURL }}` gera um link de **OAuth** (código PKCE), não um link de **OTP token**.

### O que acontece:

1. **`.ConfirmationURL`** gera:
   ```
   https://moncoyfinance.com/auth/callback?code=pkce_abc123&type=recovery
   ```
   - Este é um **OAuth code** (usado para login com Google, etc.)
   - Requer **code verifier** armazenado no navegador
   - **NÃO FUNCIONA** para password reset

2. **`.Token`** gera (CORRETO):
   ```
   https://moncoyfinance.com/reset-password?token=otp_xyz789&type=recovery
   ```
   - Este é um **OTP token** (One-Time Password)
   - Funciona direto sem code verifier
   - **É O FORMATO CORRETO** para password reset

---

## 📊 COMPARAÇÃO: OAuth vs OTP

| Aspecto | OAuth Code (`.ConfirmationURL`) | OTP Token (`.Token`) |
|---------|----------------------------------|----------------------|
| **Uso** | Login com Google, GitHub, etc. | Reset de senha, confirmação de email |
| **Formato** | `code=pkce_abc123` | `token=otp_xyz789` |
| **Requer** | Code verifier no navegador | Nada (token é suficiente) |
| **Expira** | Sim (10 minutos) | Sim (1 hora) |
| **Funciona por email?** | ❌ NÃO (perde code verifier) | ✅ SIM |
| **Template Supabase** | `{{ .ConfirmationURL }}` | `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery` |

---

## ✅ CÓDIGO VERIFICADO

### ✅ 1. forgot-password/page.tsx
```typescript
// CORRETO ✅
redirectTo: `${window.location.origin}/reset-password`
```

### ✅ 2. reset-password/page.tsx
```typescript
// CORRETO ✅
const token = searchParams.get('token')
const type = searchParams.get('type')

if (token && type === 'recovery') {
  supabase.auth.verifyOtp({
    token_hash: token,
    type: 'recovery'
  })
}
```

### ✅ 3. auth/callback/route.ts
```typescript
// CORRETO ✅
// Prioridade 1: token_hash com type=recovery
if (type === 'recovery' && (tokenHash || token)) {
  const resetUrl = new URL('/reset-password', requestUrl.origin)
  resetUrl.searchParams.set('type', 'recovery')
  if (tokenHash) resetUrl.searchParams.set('token_hash', tokenHash)
  if (token) resetUrl.searchParams.set('token', token)
  return NextResponse.redirect(resetUrl)
}

// Fallback: token_hash sem type
if (!type && (tokenHash || token) && !code && !error) {
  // ... redireciona para /reset-password
}
```

### ✅ 4. auth-provider.tsx
```typescript
// CORRETO ✅
// Se estiver na página de reset-password, não processar perfil
if (pathname === '/reset-password') {
  console.log('🔒 User on reset-password page, skipping auto-login')
  return
}
```

### ✅ 5. lib/supabase/client.ts
```typescript
// CORRETO ✅
auth: {
  flowType: 'pkce',
  detectSessionInUrl: true,
  persistSession: true,
}
```

---

## 🎯 SOLUÇÃO

### ÚNICO PROBLEMA: Email Template no Supabase

**Localização:**
```
Dashboard Supabase → Authentication → Email Templates → Reset Password
https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/auth/templates
```

**Template ERRADO (atual):**
```html
<a href="{{ .ConfirmationURL }}">Redefinir Senha</a>
```

**Template CORRETO (deve ser):**
```html
<a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery">
  Redefinir Minha Senha
</a>
```

---

## 🔧 PASSO A PASSO DA CORREÇÃO

### Etapa 1: Acessar Supabase Dashboard
1. Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl
2. Menu lateral: **Authentication**
3. Aba: **Email Templates**
4. Selecione: **Reset Password**

### Etapa 2: Substituir Template
1. Copie o template completo do arquivo: `docs/CORRECAO-ERROS.md`
2. Seção: **Template 2: Reset Password**
3. Cole no editor do Supabase
4. Clique em **Save**

### Etapa 3: Verificar Redirect URLs
1. Vá em: **Authentication → URL Configuration**
2. Adicione em **Redirect URLs:**
   ```
   https://moncoyfinance.com/reset-password
   http://localhost:3000/reset-password
   ```
3. Verifique **Site URL:**
   ```
   https://moncoyfinance.com
   ```

### Etapa 4: Testar com NOVO Link
⚠️ **IMPORTANTE:** Links antigos NÃO funcionarão!

1. Vá em: https://moncoyfinance.com/forgot-password
2. Solicite NOVO link de reset
3. Verifique email (inbox + spam)
4. Clique no link
5. **DEVE ABRIR:** `/reset-password?token=otp_xxx&type=recovery`
6. Digite nova senha
7. **DEVE REDIRECIONAR:** Para `/login` com sucesso

---

## 🧪 COMO VERIFICAR SE ESTÁ CORRETO

### Teste 1: Verificar Link do Email
```
✅ CORRETO: https://moncoyfinance.com/reset-password?token=otp_abc123&type=recovery
❌ ERRADO:  https://moncoyfinance.com/auth/callback?code=pkce_abc123&type=recovery
```

### Teste 2: Verificar Parâmetros da URL
Quando clicar no link, veja os parâmetros na barra de endereço:
```
✅ token=otp_xxx   (começa com 'otp_')
❌ code=pkce_xxx   (começa com 'pkce_')
```

### Teste 3: Console do Navegador (F12)
Logs esperados:
```javascript
✅ "🔐 Reset password page loaded: hasToken: true, type: recovery"
✅ "🔄 Verifying OTP with token"
✅ "✅ OTP verified successfully"

❌ "❌ Error verifying OTP: invalid token"
❌ "⚠️ No valid recovery token found in URL"
```

---

## 📝 CHECKLIST DE VERIFICAÇÃO

### Configuração Supabase
- [ ] Email Template usa `{{ .Token }}`
- [ ] Email Template NÃO usa `{{ .ConfirmationURL }}`
- [ ] Link no template: `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery`
- [ ] Redirect URLs incluem `/reset-password`
- [ ] Site URL é `https://moncoyfinance.com`

### Teste de Fluxo
- [ ] Solicitar novo link em `/forgot-password`
- [ ] Email recebido (verificar spam)
- [ ] Link no email contém `token=otp_`
- [ ] Link NÃO contém `code=pkce_`
- [ ] Ao clicar, abre `/reset-password?token=...&type=recovery`
- [ ] Página de reset carrega sem erro
- [ ] Consegue definir nova senha
- [ ] Após resetar, redireciona para `/login`
- [ ] Consegue fazer login com nova senha

---

## 🆘 TROUBLESHOOTING

### Erro: "Link inválido ou expirado"
**Causa:** Link antigo (gerado antes da correção do template)
**Solução:** Solicite NOVO link de reset

### Erro: "Unable to exchange code"
**Causa:** Email template ainda usa `.ConfirmationURL`
**Solução:** Verifique se salvou corretamente o novo template

### Erro: "No valid recovery token found"
**Causa:** Link não contém `token=` na URL
**Solução:** Verifique template do email no Supabase

### Página carrega mas não valida token
**Causa:** Token expirado (>1 hora) ou já usado
**Solução:** Solicite novo link

### Link redireciona para /auth/callback
**Causa:** Email template ainda não foi atualizado
**Solução:** Salve o novo template no Supabase Dashboard

---

## 📚 REFERÊNCIAS

### Documentação Supabase
- **Auth OTP:** https://supabase.com/docs/reference/javascript/auth-verifyotp
- **Reset Password:** https://supabase.com/docs/guides/auth/auth-password-reset
- **Email Templates:** https://supabase.com/docs/guides/auth/auth-email-templates

### Variáveis de Template Disponíveis
```
{{ .SiteURL }}         - URL base do site
{{ .Token }}           - OTP token para password reset
{{ .TokenHash }}       - Hash do token (raramente usado)
{{ .ConfirmationURL }} - OAuth URL (NÃO usar para password reset!)
{{ .Email }}           - Email do usuário
```

---

## 🎓 LIÇÕES APRENDIDAS

1. **`.ConfirmationURL` ≠ Password Reset**
   - ConfirmationURL é para OAuth (Google, etc.)
   - Password reset precisa de `.Token` (OTP)

2. **PKCE Flow vs OTP Flow**
   - PKCE: Para login social (Google, GitHub)
   - OTP: Para password reset e confirmação de email

3. **Links antigos não funcionam após correção**
   - Sempre solicitar NOVO link após mudar template
   - Token antigo é de tipo diferente

4. **Redirect URLs são importantes**
   - Supabase valida se URL está na whitelist
   - Adicionar tanto produção quanto localhost

---

**Data:** 18 de novembro de 2025  
**Status:** ✅ Código correto | ⏳ Aguardando configuração Supabase Dashboard
