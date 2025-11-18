# ✅ Checklist: Configuração Reset de Senha

## 🔴 **PROBLEMA IDENTIFICADO**
O link de reset está redirecionando para `/login` em vez de `/reset-password`.

## 📋 Checklist de Configuração

### 1. ✅ Código Atualizado (JÁ FEITO)
- [x] `app/forgot-password/page.tsx` - `redirectTo` aponta para `/reset-password`
- [x] `app/reset-password/page.tsx` - processa token OTP
- [x] `app/auth/callback/route.ts` - fallback para token_hash
- [x] `components/auth-provider.tsx` - não redireciona em `/reset-password`

### 2. 🔧 Configuração Supabase Dashboard (FAZER AGORA)

#### A. Site URL
```
Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/settings/auth

Site URL: https://moncoyfinance.com
```

#### B. Redirect URLs
```
Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/settings/auth

Adicionar estas URLs (uma por linha):
https://moncoyfinance.com/reset-password
http://localhost:3000/reset-password

IMPORTANTE: REMOVER URLs antigas com /auth/callback para reset
```

#### C. Email Template
```
Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/auth/templates

Selecione: Reset Password

Substitua TODO o template por:
```

```html
<h2>Redefinir Senha - MoncoyFinance</h2>
<p>Olá,</p>
<p>Você solicitou a redefinição de sua senha.</p>
<p>Clique no botão abaixo para criar uma nova senha:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Redefinir Senha</a></p>
<p>Ou copie e cole este link no seu navegador:</p>
<p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery</p>
<p><strong>Este link expira em 1 hora.</strong></p>
<p>Se você não solicitou esta redefinição, ignore este email.</p>
<hr>
<p style="font-size: 12px; color: #6b7280;">MoncoyFinance - Sua plataforma de finanças pessoais</p>
```

**CRÍTICO:**
- Use `{{ .Token }}` (NÃO use `.ConfirmationURL` ou `.TokenHash`)
- URL deve ser: `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery`
- Clique em "Save" após colar o template

### 3. 🚀 Configuração Vercel (VERIFICAR)

```
Acesse: https://vercel.com/seu-time/moncoyfinance/settings/environment-variables

Verificar se estas variáveis existem:
- NEXT_PUBLIC_SUPABASE_URL = https://jxpgiqmwugsqpvrftmhl.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- NEXT_PUBLIC_SITE_URL = https://moncoyfinance.com
- SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Após adicionar variáveis:**
1. Redeploy da aplicação na Vercel
2. Aguardar conclusão do deploy

### 4. 🧪 Teste Passo a Passo

**IMPORTANTE:** Solicite um NOVO link após fazer todas as configurações acima!

1. [ ] Acesse: https://moncoyfinance.com/forgot-password
2. [ ] Digite seu email
3. [ ] Clique em "Enviar link de recuperação"
4. [ ] Verifique sua caixa de entrada (e spam)
5. [ ] **COPIE O LINK DO EMAIL AQUI:** ___________________________
6. [ ] Clique no link
7. [ ] **DEVE ABRIR:** https://moncoyfinance.com/reset-password?token=xxxxx&type=recovery
8. [ ] **DEVE MOSTRAR:** Formulário com campos "Nova Senha" e "Confirmar Nova Senha"
9. [ ] Digite nova senha (mínimo 8 caracteres)
10. [ ] Clique em "Redefinir Senha"
11. [ ] **DEVE REDIRECIONAR:** Para /login com mensagem de sucesso
12. [ ] Faça login com a nova senha

### 5. 🔍 Diagnóstico de Problemas

#### Problema: Link redireciona para /login

**Causa 1: Email Template incorreto**
- Verificar se template usa `{{ .Token }}` e não `{{ .ConfirmationURL }}`
- Link deve ter formato: `/reset-password?token=xxx&type=recovery`

**Causa 2: Redirect URLs não configuradas**
- Verificar se `/reset-password` está nas Redirect URLs do Supabase
- Remover URLs antigas com `/auth/callback` para reset

**Causa 3: Link antigo**
- Solicitar NOVO link após configurar template
- Links antigos não funcionarão

**Causa 4: Token expirado**
- Links expiram em 1 hora
- Solicitar novo link

#### Problema: "Erro ao autenticar"

**Causa: Link está usando OAuth code flow**
- Significa que o email template está usando `{{ .ConfirmationURL }}`
- SOLUÇÃO: Atualizar template para usar `{{ .Token }}`

#### Problema: Abre a aplicação ao invés da página de reset

**Causa: AuthProvider redirecionando**
- Código já foi corrigido para detectar `/reset-password`
- Fazer novo deploy na Vercel
- Solicitar novo link

### 6. 📊 Logs para Debug

Se o problema persistir, abra o Console do Browser (F12) e procure por:

```javascript
// Logs esperados na página /reset-password:
🔐 Reset password page loaded: { hasToken: true, type: 'recovery' }
🔄 Verifying OTP with token
✅ OTP verified successfully

// Se ver estes logs, há problema:
❌ Error verifying OTP: Token expired
⚠️ No valid recovery token found in URL
```

### 7. 🆘 Último Recurso

Se NADA funcionar, copie e me envie:

1. **Link completo do email** (sem remover nenhum caractere)
2. **Console logs** (F12 → Console → copie tudo)
3. **Network tab** (F12 → Network → mostre requisições para `/reset-password`)

## 📝 Resumo das URLs Corretas

```
Solicitar reset: /forgot-password
Link do email:   /reset-password?token=xxx&type=recovery
Após sucesso:    /login (com mensagem)
```

## ⚡ Ação Imediata

**FAÇA AGORA (em ordem):**

1. ✅ Configure Email Template no Supabase (passo 2.C)
2. ✅ Configure Redirect URLs no Supabase (passo 2.B)
3. ✅ Verifique variáveis de ambiente na Vercel (passo 3)
4. ✅ Faça redeploy na Vercel
5. ✅ Solicite NOVO link de reset
6. ✅ Teste o fluxo completo

---

**Data desta configuração:** 17 de novembro de 2025
**Versão do código:** Branch `copilot/fix-ai-usage-increment-error`
