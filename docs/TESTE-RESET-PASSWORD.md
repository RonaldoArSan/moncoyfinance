# 🧪 Script de Teste - Fluxo de Reset de Senha

## Pré-requisitos
- Aplicação rodando em localhost:3000 ou em produção
- Email de teste configurado no Supabase
- Console do navegador aberto (F12)

---

## Teste 1: Fluxo Completo (Happy Path)

### Passo 1: Solicitar Reset
```
1. Navegar para: http://localhost:3000/forgot-password
2. Digitar email válido: seu_email@exemplo.com
3. Clicar em "Enviar Link de Recuperação"
4. ✅ Verificar mensagem: "Email enviado com sucesso"
```

### Passo 2: Verificar Email
```
1. Abrir cliente de email
2. Encontrar email do Supabase: "Reset your password"
3. ✅ Verificar que email chegou (pode demorar 1-2min)
4. Clicar no botão "Reset Password" ou copiar link
```

### Passo 3: Verificar Redirecionamento
```
1. Clicar no link do email
2. ✅ ESPERADO: Abre /reset-password com formulário
3. ❌ NÃO DEVE: Redirecionar para /login

Console deve mostrar:
🔐 Reset password page loaded: { hasAccessToken: true, hasRefreshToken: true }
🔄 Setting session with tokens from URL
✅ Session set successfully
```

### Passo 4: Resetar Senha
```
1. Digitar nova senha (mínimo 8 caracteres)
2. Confirmar senha
3. Clicar em "Redefinir Senha"
4. ✅ Verificar loading state: "Redefinindo..."

Console deve mostrar:
🔄 Updating password...
✅ Password updated successfully
```

### Passo 5: Confirmar Sucesso
```
1. ✅ Verificar mensagem: "Senha Redefinida!"
2. ✅ Aguardar redirecionamento automático (3 segundos)
3. ✅ Deve abrir /login
4. Fazer login com nova senha
5. ✅ Login deve funcionar
```

---

## Teste 2: Verificar URL Direta

### Simular Link de Email
```
# Copiar tokens reais do email ou usar tokens de teste
http://localhost:3000/auth/callback?type=recovery&access_token=XXX&refresh_token=YYY

✅ Deve redirecionar para: /reset-password?access_token=XXX&refresh_token=YYY
❌ NÃO DEVE redirecionar para: /login
```

---

## Teste 3: Verificar Proteções

### 3.1 Token Expirado
```
1. Solicitar reset de senha
2. Aguardar 1 hora
3. Clicar no link do email
4. ✅ ESPERADO: Mensagem de erro "Tokens expirados"
```

### 3.2 Token Inválido
```
# Acessar URL com token falso
http://localhost:3000/reset-password?access_token=FAKE&refresh_token=FAKE

✅ ESPERADO: Mensagem de erro "Erro ao validar tokens"
```

### 3.3 Sem Tokens
```
# Acessar URL sem parâmetros
http://localhost:3000/reset-password

✅ ESPERADO: Formulário carrega mas mostrará erro ao tentar atualizar
⚠️ Aviso no console: "No tokens found in URL"
```

---

## Teste 4: Verificar Network

### Requests Esperados (Network Tab)
```
1. GET /reset-password?access_token=...&refresh_token=...
   Status: 200 ✅

2. POST https://[project].supabase.co/auth/v1/token?grant_type=refresh_token
   Status: 200 ✅
   Response: { access_token, refresh_token, user: {...} }

3. PUT https://[project].supabase.co/auth/v1/user
   Status: 200 ✅
   Body: { password: "nova_senha" }
   Response: { user: {...} }
```

---

## Teste 5: Verificar Console Logs

### Logs Esperados (Desenvolvimento)
```javascript
// Middleware (server)
🔐 /auth/callback hit: { type: 'recovery', hasAccessToken: true, ... }
🔄 Password recovery detected, redirecting to /reset-password

// Reset Password Page (client)
🔐 Reset password page loaded: { hasAccessToken: true, hasRefreshToken: true }
🔄 Setting session with tokens from URL
✅ Session set successfully: { data: {...} }
🔄 Updating password...
✅ Password updated successfully
```

### ❌ Logs de Erro (NÃO devem aparecer)
```
❌ Error setting session: ...
❌ Error updating password: ...
Redirecting to /login (loop)
```

---

## Teste 6: Edge Cases

### 6.1 Senha Fraca
```
1. Digitar senha com menos de 8 caracteres
2. ✅ Erro: "A senha deve ter pelo menos 8 caracteres"
```

### 6.2 Senhas Não Coincidem
```
1. Digitar senhas diferentes
2. ✅ Erro: "As senhas não coincidem"
```

### 6.3 Múltiplos Cliques
```
1. Clicar em "Redefinir Senha"
2. Clicar novamente rapidamente
3. ✅ Botão deve ficar disabled
4. ✅ Deve mostrar "Redefinindo..."
```

---

## Teste 7: Diferentes Navegadores

### Testar em:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (se disponível)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Verificar:
- ✅ Formulário renderiza corretamente
- ✅ Tokens são processados
- ✅ Senha é atualizada
- ✅ Redirecionamento funciona

---

## Teste 8: Configuração Supabase

### Verificar no Supabase Dashboard

```
Authentication > URL Configuration:

Site URL:
✅ https://moncoyfinance.com (produção)
✅ http://localhost:3000 (desenvolvimento)

Redirect URLs:
✅ https://moncoyfinance.com/auth/callback
✅ https://moncoyfinance.com/reset-password
✅ http://localhost:3000/auth/callback
✅ http://localhost:3000/reset-password

Email Templates:
✅ "Reset Password" template ativo
✅ Link correto: {{ .SiteURL }}/auth/callback?type=recovery&...
```

---

## Checklist Final

### Fluxo Funcional
- [ ] Página /forgot-password carrega
- [ ] Email é enviado
- [ ] Link do email abre /reset-password (NÃO /login)
- [ ] Formulário aparece corretamente
- [ ] Tokens são processados
- [ ] Senha pode ser atualizada
- [ ] Mensagem de sucesso aparece
- [ ] Redirecionamento para /login funciona
- [ ] Login com nova senha funciona

### Verificações Técnicas
- [ ] Console sem erros
- [ ] Network sem erros 4xx/5xx
- [ ] TypeScript sem erros
- [ ] Nenhum loop de redirecionamento
- [ ] Guards não bloqueiam /reset-password

### UX
- [ ] Loading states aparecem
- [ ] Mensagens de erro são claras
- [ ] Formulário é intuitivo
- [ ] Botões funcionam corretamente
- [ ] Toggle de show/hide password funciona

---

## 🚨 Problemas Comuns e Soluções

### Problema: Link redireciona para /login
**Causa**: `/reset-password` não está em `isAuthPage`  
**Solução**: ✅ JÁ CORRIGIDO no client-layout.tsx

### Problema: "Erro ao validar tokens"
**Causa**: Tokens expirados ou inválidos  
**Solução**: Solicitar novo link de reset

### Problema: Email não chega
**Causa**: Rate limit do Supabase ou email em spam  
**Solução**: 
1. Verificar pasta de spam
2. Aguardar 2-3 minutos
3. Verificar rate limit no Supabase Dashboard

### Problema: "Session not found"
**Causa**: Tokens não foram processados corretamente  
**Solução**: Verificar se setSession está sendo chamado no useEffect

---

## 📊 Métricas de Sucesso

### Critérios de Aceitação
- ✅ 100% dos testes funcionais passando
- ✅ 0 erros no console
- ✅ 0 redirecionamentos para /login durante reset
- ✅ Tempo de resposta < 3 segundos
- ✅ Taxa de sucesso > 95%

### KPIs
- Tempo médio do fluxo: ~30-60 segundos
- Taxa de abandono: < 10%
- Tickets de suporte relacionados: 0

---

## 🎯 Resultado Esperado

**ANTES DO FIX**: 🔴 Loop infinito /reset-password → /login  
**DEPOIS DO FIX**: 🟢 Fluxo completo funcional

---

**Atualizado em**: 22 de Janeiro de 2025  
**Status**: ✅ Pronto para teste  
**Autor**: MoncoyFinance Team
