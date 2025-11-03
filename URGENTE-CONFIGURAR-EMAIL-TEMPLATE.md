# 🚨 SOLUÇÃO URGENTE: Configurar Supabase Email Template

## Problema Atual
O Supabase está enviando links com `code` (PKCE flow) que requerem `code_verifier`, mas esse verifier não está sendo armazenado corretamente, causando o erro:

```
invalid request: both auth code and code verifier should be non-empty
```

## ✅ SOLUÇÃO IMEDIATA: Configurar Email Template no Supabase

### Passo 1: Acessar Supabase Dashboard

1. Ir para: https://supabase.com/dashboard/project/dxdbpppymxfiojszrmir
2. Login se necessário

### Passo 2: Navegar para Email Templates

1. No menu lateral: **Authentication**
2. Clicar em: **Email Templates**
3. Localizar: **Reset Password** (ou **Change Email**)

### Passo 3: Modificar o Template

**ENCONTRE esta linha** no template (algo parecido com):
```
{{ .ConfirmationURL }}
```

**SUBSTITUA por**:
```
{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery
```

**OU se não funcionar, use**:
```
{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=recovery&redirect=true
```

### Passo 4: Salvar

1. Clicar em **Save**
2. Aguardar propagação (~1 minuto)

### Passo 5: Testar

1. Limpar cookies: F12 > Application > Clear storage
2. Ir para: http://localhost:3000/forgot-password
3. Solicitar reset
4. Clicar no novo link do email
5. ✅ Deve funcionar!

## Alternativa: Desabilitar PKCE no Supabase

Se não conseguir modificar o template:

1. Supabase Dashboard > **Authentication** > **Settings**
2. Procurar: **PKCE Flow**
3. Desabilitar para email password reset
4. Salvar

## Se Não Tiver Acesso ao Dashboard

**Solução Temporária**: Usar servidor proxy para interceptar links

Vou criar um endpoint API que gera um link válido manualmente.

## Status Atual

❌ Link do email: `http://localhost:3000/auth/callback?code=xxx` (PKCE - não funciona)  
✅ Link esperado: `http://localhost:3000/reset-password?access_token=xxx&type=recovery` (direto - funciona)

## Teste Rápido

Para testar se conseguiu configurar, veja se o próximo email contém:
- ❌ `?code=` ← Ainda com problema
- ✅ `?access_token=` ou `?token=` ← Corrigido!
