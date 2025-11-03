# Configuração URGENTE: Supabase Email Template

## Problema
O password reset está falhando porque o Supabase está enviando um `code` (que requer PKCE) em vez de tokens diretos (`access_token` + `refresh_token`).

## Solução: Configurar Email Template

### 1. Acessar Supabase Dashboard
1. Ir para: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navegar: **Authentication** → **Email Templates**

### 2. Editar Template "Reset Password"

**Localizar a seção**: `Reset Password`

**Substituir o template atual por**:

```html
<h2>Reset Password</h2>

<p>Olá!</p>

<p>Você solicitou a redefinição da sua senha no MoncoyFinance.</p>

<p>Clique no link abaixo para criar uma nova senha:</p>

<p><a href="{{ .SiteURL }}/auth/callback?access_token={{ .Token }}&refresh_token={{ .TokenHash }}&type=recovery">Redefinir Senha</a></p>

<p>Se você não solicitou essa redefinição, ignore este email.</p>

<p>Este link expira em 24 horas por motivos de segurança.</p>

<p>Atenciosamente,<br>Equipe MoncoyFinance</p>
```

### 3. Verificar URL Configuration

Ainda em **Authentication**:

1. Clicar em **URL Configuration**
2. Verificar:
   - **Site URL**: 
     - Dev: `http://localhost:3000`
     - Prod: `https://moncoyfinance.com`
   
   - **Redirect URLs** (adicionar se não existir):
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/reset-password
     https://moncoyfinance.com/auth/callback
     https://moncoyfinance.com/reset-password
     ```

### 4. Salvar e Testar

1. Clicar em **Save** no template
2. Esperar ~1 minuto para propagar
3. Acessar: http://localhost:3000/forgot-password
4. Solicitar reset com seu email
5. Clicar no link do email
6. ✅ Deve abrir `/reset-password` com sessão ativa

## Template Atual vs. Novo

### ❌ Template Padrão (Causa o erro)
```
{{ .SiteURL }}/auth/callback?code={{ .Token }}
```
- Envia apenas `code`
- Requer PKCE (code_verifier)
- Falha com: "code verifier should be non-empty"

### ✅ Template Correto (Funciona)
```
{{ .SiteURL }}/auth/callback?access_token={{ .Token }}&refresh_token={{ .TokenHash }}&type=recovery
```
- Envia tokens diretos
- Não requer PKCE
- Cria sessão imediatamente

## Variáveis Disponíveis

- `{{ .SiteURL }}` - URL configurada em Site URL
- `{{ .Token }}` - Access token do usuário
- `{{ .TokenHash }}` - Refresh token do usuário
- `{{ .Email }}` - Email do usuário
- `{{ .ConfirmationURL }}` - URL de confirmação (deprecated)

## Se Não Tiver Acesso ao Dashboard

**Alternativa**: Usar `signInWithOtp` no código

Editar `app/forgot-password/page.tsx`:

```typescript
// Substituir resetPasswordForEmail por:
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: false, // Não criar novo usuário
    emailRedirectTo: `${window.location.origin}/reset-password`
  }
})
```

⚠️ **Nota**: `signInWithOtp` cria uma sessão temporária que permite trocar a senha.
