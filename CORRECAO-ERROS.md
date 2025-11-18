# 🔧 CORREÇÃO DE ERROS - Build Vercel, Google OAuth e Reset Password

## ✅ PROBLEMA 1: Build Vercel - pnpm-lock.yaml desatualizado

**RESOLVIDO:** Execute no terminal:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "fix: update pnpm-lock.yaml"
git push
```

O pnpm-lock.yaml foi atualizado. Faça commit e push.

---

## 🔴 PROBLEMA 2: Google OAuth - "Unable to exchange external code"

Este erro significa que o **Google Cloud Console** não está configurado corretamente.

### Configuração Necessária no Google Cloud Console

**1. Acesse:** https://console.cloud.google.com/apis/credentials

**2. Selecione seu projeto** ou crie um novo

**3. Clique em "Criar Credenciais" → "ID do cliente OAuth 2.0"**

**4. Configure:**

**Tipo de aplicativo:** Aplicativo da Web

**Origens JavaScript autorizadas:**
```
https://moncoyfinance.com
http://localhost:3000
```

**URIs de redirecionamento autorizados (CRÍTICO):**
```
https://jxpgiqmwugsqpvrftmhl.supabase.co/auth/v1/callback
https://moncoyfinance.com/auth/callback
http://localhost:3000/auth/callback
```

**⚠️ IMPORTANTE:** O primeiro URI deve ser exatamente o do Supabase!

### Configuração no Supabase Dashboard

**Acesse:** https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/auth/providers

**1. Habilite Google Provider**

**2. Configure:**
- **Client ID:** (do Google Cloud Console)
- **Client Secret:** (do Google Cloud Console)

**3. Authorized redirect URLs deve incluir:**
```
https://jxpgiqmwugsqpvrftmhl.supabase.co/auth/v1/callback
```

### Tela de Consentimento OAuth

**Acesse:** https://console.cloud.google.com/apis/credentials/consent

**Configure:**
- **Tipo de usuário:** Externo
- **Nome do app:** MoncoyFinance
- **Email de suporte:** seu email
- **Domínios autorizados:** moncoyfinance.com
- **Escopos:** email, profile, openid

**Status:** Deve estar em "Produção" (não "Teste")

---

## 🔴 PROBLEMA 3: Reset Password não abre página de nova senha

### Causa Raiz
O **Email Template no Supabase** está gerando URL incorreta.

### Solução Definitiva

**1. Acesse Email Template:**
```
https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/auth/templates
```

---

### Template 1: Confirmação de Email (Confirm signup)

**Selecione:** "Confirm signup"

**SUBSTITUA TODO O TEMPLATE POR:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirme seu Email - MoncoyFinance</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MoncoyFinance</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Sua plataforma de finanças pessoais</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">🎉 Bem-vindo(a) ao MoncoyFinance!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Olá,
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                Estamos felizes em tê-lo conosco! Para começar a usar sua conta, precisamos confirmar seu endereço de email.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" 
                       style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                      Confirmar Meu Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 20px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #4f46e5; border-radius: 4px;">
                Ou copie e cole este link no seu navegador:<br>
                <span style="word-break: break-all; color: #4f46e5;">{{ .ConfirmationURL }}</span>
              </p>
              
              <p style="color: #ef4444; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                <strong>⏱ Este link expira em 24 horas.</strong>
              </p>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 16px;">✨ Próximos passos:</h3>
                <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Complete seu perfil</li>
                  <li>Configure suas categorias</li>
                  <li>Comece a registrar transações</li>
                  <li>Defina suas metas financeiras</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                Se você não criou uma conta no MoncoyFinance, ignore este email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2025 MoncoyFinance - Sua plataforma de finanças pessoais
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0;">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Template 2: Reset Password

**Selecione:** "Reset Password"

**SUBSTITUA TODO O TEMPLATE POR:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redefinir Senha - MoncoyFinance</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MoncoyFinance</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">Redefinir Senha</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                Olá,
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery" 
                       style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                      Redefinir Minha Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 20px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #4f46e5; border-radius: 4px;">
                Ou copie e cole este link no seu navegador:<br>
                <span style="word-break: break-all; color: #4f46e5;">{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery</span>
              </p>
              
              <p style="color: #ef4444; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                <strong>⏱ Este link expira em 1 hora.</strong>
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2025 MoncoyFinance - Sua plataforma de finanças pessoais
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0;">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**4. Clique em "Save"**

### Verificar Redirect URLs no Supabase

**Acesse:** https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/settings/auth

**Role até "Redirect URLs" e adicione:**
```
https://moncoyfinance.com/reset-password
http://localhost:3000/reset-password
```

**Site URL deve ser:**
```
https://moncoyfinance.com
```

---

## ✅ CHECKLIST FINAL

### Vercel
- [x] pnpm-lock.yaml atualizado
- [ ] Git commit e push
- [ ] Aguardar novo deploy

### Google OAuth
- [ ] Origens JavaScript configuradas
- [ ] URIs de redirecionamento configurados (incluindo Supabase callback)
- [ ] Client ID e Secret no Supabase
- [ ] Tela de consentimento em "Produção"
- [ ] Testar login com Google

### Reset Password
- [ ] Email Template atualizado no Supabase
- [ ] Redirect URLs configuradas no Supabase
- [ ] Solicitar NOVO link de reset
- [ ] Testar fluxo completo

---

## 🧪 TESTE FINAL

### Reset Password
1. Acesse: https://moncoyfinance.com/forgot-password
2. Digite email e envie
3. Verifique inbox (e spam)
4. Clique no link do email
5. **DEVE ABRIR:** https://moncoyfinance.com/reset-password?token=xxx&type=recovery
6. Digite nova senha
7. **DEVE REDIRECIONAR:** Para /login com sucesso

### Google OAuth
1. Acesse: https://moncoyfinance.com/login
2. Clique em "Continuar com Google"
3. Selecione conta Google
4. **DEVE REDIRECIONAR:** Para dashboard logado

---

## 🆘 SE AINDA NÃO FUNCIONAR

### Reset Password
Copie e me envie:
1. Link completo do email
2. Logs do console (F12 → Console)
3. URL que abre quando clica no link

### Google OAuth
Copie e me envie:
1. Erro completo da console
2. URIs configurados no Google Cloud Console
3. Screenshot da configuração do Google Provider no Supabase

---

## 📝 VARIÁVEIS DE AMBIENTE VERCEL

Certifique-se de que estas variáveis estão configuradas na Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://jxpgiqmwugsqpvrftmhl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://moncoyfinance.com
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Após adicionar/alterar variáveis:**
- Redeploy da aplicação
- Aguardar conclusão
- Testar novamente

---

**Data:** 18 de novembro de 2025
**Status:** Correções implementadas, aguardando configuração do Supabase/Google
