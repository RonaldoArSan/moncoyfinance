# ⚡ GUIA RÁPIDO - Reset Password

## 🎯 O PROBLEMA

Quando você clica no link de **"Esqueci minha senha"** do email, ao invés de abrir a página para criar nova senha, você é redirecionado para `/login` com erro.

---

## 🔍 POR QUE ISSO ACONTECE?

O **template de email no Supabase** está configurado ERRADO. Ele está gerando um link de **OAuth** (usado para login com Google) ao invés de um link de **OTP** (usado para reset de senha).

### Diferença Visual

**❌ Link ERRADO (atual):**
```
https://moncoyfinance.com/auth/callback?code=pkce_abc123&type=recovery
                         ^^^^^^^^^^^^^ (OAuth callback)
                                              ^^^^^^^^^^^^^ (código PKCE)
```

**✅ Link CORRETO (deve ser):**
```
https://moncoyfinance.com/reset-password?token=otp_xyz789&type=recovery
                         ^^^^^^^^^^^^^^^ (página de reset)
                                                ^^^^^^^^^^^^ (token OTP)
```

---

## ✅ SOLUÇÃO EM 3 PASSOS

### 📍 Passo 1: Acessar Supabase Dashboard

**URL:** https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/auth/templates

**Navegação:**
1. Vá em **Authentication** (menu lateral)
2. Clique em **Email Templates** (aba superior)
3. Selecione **"Reset Password"** (não "Confirm signup")

---

### 📝 Passo 2: Substituir Template

**❌ REMOVA este código (se estiver lá):**
```html
<a href="{{ .ConfirmationURL }}">Redefinir Senha</a>
```

**✅ COLE este código:**
```html
<a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery">
  Redefinir Minha Senha
</a>
```

**💡 Template completo está em:** `docs/CORRECAO-ERROS.md` (seção "Template 2: Reset Password")

---

### 💾 Passo 3: Salvar e Testar

1. Clique no botão **"Save"** no Supabase
2. Vá em: https://moncoyfinance.com/forgot-password
3. Digite seu email e envie
4. **⚠️ IMPORTANTE:** Solicite **NOVO** link (links antigos não funcionarão!)
5. Verifique inbox (e pasta de spam)
6. Clique no link do email
7. **DEVE ABRIR:** Página de reset de senha
8. Digite nova senha e confirme
9. **DEVE REDIRECIONAR:** Para página de login

---

## 🔍 COMO SABER SE ESTÁ CORRETO?

### Teste Visual: Olhe a URL do Email

Abra o email no navegador e **copie** o link (não clique ainda).

**Procure por:**
```
✅ CORRETO: reset-password?token=otp_
❌ ERRADO:  auth/callback?code=pkce_
```

Se tiver **`reset-password?token=otp_`** → Está correto! ✅  
Se tiver **`auth/callback?code=pkce_`** → Template ainda não foi salvo ❌

---

## 🧪 TESTE COMPLETO

### Cenário 1: Tudo Funcionando ✅
```
1. /forgot-password → Digite email → "Email enviado!"
2. Inbox → Email "Redefinir Senha" recebido
3. Link → https://moncoyfinance.com/reset-password?token=otp_xxx&type=recovery
4. Página → Carrega formulário "Nova Senha"
5. Digitar senha → "Senha redefinida!"
6. Redireciona → /login
7. Login → Acessa dashboard normalmente
```

### Cenário 2: Template Ainda Errado ❌
```
1. /forgot-password → Digite email → "Email enviado!"
2. Inbox → Email recebido
3. Link → https://moncoyfinance.com/auth/callback?code=pkce_xxx&type=recovery
4. Redireciona → /forgot-password com erro "Link inválido"
                  OU
                 → /login com erro "Erro ao autenticar"
```

---

## 🆘 PROBLEMAS COMUNS

### "Link inválido ou expirado"
**Causa:** Você está testando com link ANTIGO (gerado antes de salvar o novo template)  
**Solução:** Solicite NOVO link em `/forgot-password`

### "Erro ao autenticar"
**Causa:** Template ainda usa `{{ .ConfirmationURL }}`  
**Solução:** Verifique se salvou corretamente no Supabase Dashboard

### "Email não chega"
**Causa 1:** Verifique pasta de spam  
**Causa 2:** Email não confirmado no Supabase (veja em Authentication → Users)  
**Solução:** Use email que já está confirmado

### "Página de reset carrega mas não valida token"
**Causa:** Token expirou (válido por 1 hora)  
**Solução:** Solicite novo link

---

## 📋 CHECKLIST RÁPIDO

- [ ] Acessei Supabase Dashboard → Authentication → Email Templates
- [ ] Selecionei "Reset Password" (não "Confirm signup")
- [ ] Substitui `{{ .ConfirmationURL }}` por `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery`
- [ ] Cliquei em "Save"
- [ ] Solicitei NOVO link em `/forgot-password`
- [ ] Link do email contém `reset-password?token=otp_`
- [ ] Ao clicar, abre página de reset (não redireciona para login)
- [ ] Consegui definir nova senha
- [ ] Fui redirecionado para login
- [ ] Fiz login com nova senha com sucesso

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Diagnóstico detalhado:** `docs/DIAGNOSTICO-RESET-PASSWORD-COMPLETO.md`
- **Correção de erros:** `docs/CORRECAO-ERROS.md`
- **Setup completo:** `docs/RESET-PASSWORD-SETUP.md`

---

## 💬 SUPORTE

Se após seguir este guia ainda tiver problemas:

1. Copie o **link completo** do email
2. Tire **print do console** (F12 → Console)
3. Informe o **erro exato** que aparece
4. Envie para análise

---

**Última atualização:** 18 de novembro de 2025  
**Status:** ✅ Código correto | ⏳ Aguardando configuração Supabase
