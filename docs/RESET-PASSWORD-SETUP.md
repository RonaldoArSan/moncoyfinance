# 🔑 Configuração de Reset de Senha - Supabase

## Problema Identificado
O link de reset de senha está usando formato antigo (`token_hash`) que expira rapidamente e gera erro:
```
Email link is invalid or has expired (otp_expired)
```

## Solução Implementada

### 1. Código Atualizado ✅
- `app/forgot-password/page.tsx`: Envia `type=recovery` na URL de callback
- `middleware.ts`: Captura múltiplos formatos de token
- `app/reset-password/page.tsx`: Processa tokens novos e antigos

### 2. Configuração do Supabase Dashboard 🔧

#### Passo 1: Acessar Dashboard
```
https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/auth/url-configuration
```

#### Passo 2: Configurar URLs

**Site URL:**
```
https://moncoyfinance.com
```

**Redirect URLs (adicionar todas):**
```
https://moncoyfinance.com/auth/callback
https://moncoyfinance.com/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

#### Passo 3: Configurar Email Template

Acesse: `Authentication → Email Templates → Reset Password`

**Template Recomendado:**
```html
<h2>Redefinir Senha</h2>
<p>Você solicitou a redefinição de senha para sua conta.</p>
<p>Clique no botão abaixo para criar uma nova senha:</p>
<p><a href="{{ .SiteURL }}/auth/callback?type=recovery&token_hash={{ .TokenHash }}">Redefinir Senha</a></p>
<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .SiteURL }}/auth/callback?type=recovery&token_hash={{ .TokenHash }}</p>
<p>Este link expira em 1 hora.</p>
<p>Se você não solicitou esta redefinição, ignore este email.</p>
```

**Importante:** Use `{{ .SiteURL }}` em vez de `{{ .ConfirmationURL }}` para ter mais controle sobre a URL.

### 3. Fluxo de Autenticação

```
1. Usuário solicita reset → /forgot-password
2. Backend envia email com link:
   https://moncoyfinance.com/auth/callback?type=recovery&token_hash=xxx
3. Callback route detecta type=recovery e redireciona para:
   https://moncoyfinance.com/reset-password?type=recovery&token_hash=xxx
4. Página /reset-password:
   - Verifica OTP com Supabase
   - Permite criar nova senha
   - Redireciona para /login após sucesso
```

## Importante: Mudanças na Arquitetura

**Middleware foi simplificado** - toda a lógica de redirecionamento de password recovery agora está no `app/auth/callback/route.ts`. O middleware apenas gerencia cookies de sessão.

**Prioridade de processamento no callback:**
1. Se `type=recovery` + `token_hash` → redireciona para `/reset-password` IMEDIATAMENTE
2. Se houver `error` → redireciona para `/login` com mensagem
3. Se houver `code` (OAuth) → processa sessão OAuth normalmente

## Teste do Fluxo

### Desenvolvimento (localhost:3000)
1. Acesse `/forgot-password`
2. Digite seu email
3. Verifique o email (confira spam)
4. Clique no link
5. Crie nova senha em `/reset-password`

### Produção (moncoyfinance.com)
1. Mesmo fluxo acima
2. Se houver erro `otp_expired`, solicite novo link
3. O novo email usará o formato correto

## Diagnóstico de Problemas

### Link expira muito rápido
- **Causa:** Token OTP tem vida curta (default: 1 hora)
- **Solução:** Configure tempo maior no Supabase: `Authentication → Settings → Auth → OTP Expiry`

### Erro "otp_expired" ao clicar no link
- **Causa:** Email antigo com formato incorreto
- **Solução:** Solicite novo link após configurar template

### Redireciona para localhost
- **Causa:** `Site URL` no Supabase está incorreta
- **Solução:** Configure `https://moncoyfinance.com` (sem barra no final)

### Link não funciona em produção
- **Causa:** URL não está na lista de `Redirect URLs`
- **Solução:** Adicione todas as URLs listadas acima

## Logs de Debug

Os logs já estão implementados no código. Para verificar:

### Frontend (Console do Browser)
```
🔐 Reset password page loaded: { hasToken: true, type: 'recovery' }
🔄 Verifying OTP with token_hash
✅ OTP verified successfully
```

### Backend (Terminal/Logs)
```
🔐 /auth/callback hit: { type: 'recovery', hasTokenHash: true }
🔄 Password recovery detected, redirecting to /reset-password
```

## Variáveis de Ambiente

Verifique se estão configuradas:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jxpgiqmwugsqpvrftmhl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://moncoyfinance.com
```

## Checklist de Implantação

- [ ] Atualizar código (já feito ✅)
- [ ] Configurar Site URL no Supabase
- [ ] Adicionar Redirect URLs no Supabase
- [ ] Atualizar Email Template no Supabase
- [ ] Testar em desenvolvimento
- [ ] Deploy para produção
- [ ] Testar em produção
- [ ] Solicitar novo link se houver emails antigos

## Suporte

Se o problema persistir após seguir todos os passos:
1. Verifique os logs no browser (F12 → Console)
2. Verifique os logs no terminal do servidor
3. Confirme que as variáveis de ambiente estão corretas
4. Teste com email diferente (evita cache)
