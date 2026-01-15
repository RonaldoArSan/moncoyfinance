# 🔑 Guia Completo: Como Obter Todas as Keys

## 📋 Índice
1. [Supabase (Banco de Dados)](#1-supabase)
2. [OpenAI (Inteligência Artificial)](#2-openai)
3. [Stripe (Pagamentos)](#3-stripe)
4. [URLs do Site](#4-urls)
5. [Google OAuth (Opcional)](#5-google-oauth)
6. [Verificação Final](#6-verificação)

---

## 1. Supabase (Banco de Dados) 🗄️

### Passo a Passo

1. **Acesse o Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Login/Criar Conta**
   - Use sua conta GitHub, Google ou Email

3. **Selecione ou Crie Projeto**
   - Se não tem projeto: "New Project"
   - Nome: `moncoyfinance`
   - Database Password: Crie uma senha forte
   - Region: Escolha mais próxima (ex: South America - São Paulo)

4. **Buscar as Keys**
   ```
   Settings > API
   ```
   
   Copie:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

5. **Adicionar ao .env.local**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 🔐 Service Role Key (Opcional)
**⚠️ CUIDADO**: Apenas para operações admin no servidor

```
Settings > API > service_role (precisa confirmar senha)
```

---

## 2. OpenAI (Inteligência Artificial) 🤖

### Passo a Passo

1. **Acesse o Portal**
   ```
   https://platform.openai.com/
   ```

2. **Login/Criar Conta**
   - Use email ou continuar com Google

3. **Verificar Créditos**
   - Conta nova: geralmente $5 de crédito grátis
   - Se não tiver: adicione cartão em Billing

4. **Criar API Key**
   ```
   API Keys > Create new secret key
   ```
   
   - Nome: `MoncoyFinance Development`
   - **⚠️ IMPORTANTE**: Copie agora! Não será mostrado novamente
   - Formato: `sk-proj-xxxxxxxxxxxxxxxxxxxxx`

5. **Adicionar ao .env.local**
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

### 💰 Custos
- GPT-4o-mini (Basic/Pro): ~$0.15 por 1M tokens de input
- GPT-4o (Premium): ~$2.50 por 1M tokens de input
- Limite Basic: 5 perguntas/semana = ~$0.01/semana

---

## 3. Stripe (Pagamentos) 💳

### Passo a Passo - Modo TESTE

1. **Acesse o Dashboard**
   ```
   https://dashboard.stripe.com/register
   ```

2. **Criar Conta**
   - Preencha dados da empresa/pessoa
   - Ative modo TESTE (toggle no canto superior esquerdo)

3. **Buscar Keys de Teste**
   ```
   Developers > API keys > Test mode ON
   ```
   
   Copie:
   - **Publishable key**: `pk_test_xxxxxxxxxx`
   - **Secret key**: `sk_test_xxxxxxxxxx`

4. **Adicionar ao .env.local**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
   ```

### 🪝 Webhook (Para receber eventos)

1. **Instalar Stripe CLI** (opcional para dev local)
   ```bash
   # Windows (com Chocolatey)
   choco install stripe-cli
   
   # Ou baixar em: https://github.com/stripe/stripe-cli/releases
   ```

2. **Escutar Webhooks Localmente**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   - Copie o `whsec_xxxxx` que aparecer

3. **Ou Criar Webhook no Dashboard** (produção)
   ```
   Developers > Webhooks > Add endpoint
   ```
   
   - URL: `https://moncoyfinance.com/api/stripe/webhook`
   - Eventos: 
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

4. **Adicionar ao .env.local**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### 💳 Cartões de Teste
```
Sucesso: 4242 4242 4242 4242
Recusado: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

Data: Qualquer data futura
CVC: Qualquer 3 dígitos
```

---

## 4. URLs do Site 🌐

### Desenvolvimento Local
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Produção (Vercel/outro host)
```env
NEXT_PUBLIC_SITE_URL=https://moncoyfinance.com
```

### ⚠️ Configurar no Supabase Também
```
Authentication > URL Configuration

Site URL: https://moncoyfinance.com
Redirect URLs:
  - https://moncoyfinance.com/auth/callback
  - https://moncoyfinance.com/reset-password
  - http://localhost:3000/auth/callback
  - http://localhost:3000/reset-password
```

---

## 5. Google OAuth (Opcional) 🔐

### Se Quiser Login Social com Google

1. **Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Criar/Selecionar Projeto**
   - "Select a project" > "New Project"
   - Nome: `MoncoyFinance`

3. **Ativar OAuth**
   ```
   APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID
   ```
   
   - Application type: Web application
   - Name: `MoncoyFinance`
   - Authorized redirect URIs:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```

4. **Copiar Credenciais**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxx`

5. **Configurar no Supabase** (não no .env!)
   ```
   Authentication > Providers > Google
   
   - Enabled: ON
   - Client ID: [cole aqui]
   - Client Secret: [cole aqui]
   - Redirect URL: (já preenchido automaticamente)
   ```

---

## 6. Verificação Final ✅

### Checklist .env.local

```bash
# Copiar o exemplo
cp .env.local.example .env.local

# Editar e preencher todas as keys
code .env.local  # ou seu editor preferido
```

### Verificar se Está Funcionando

1. **Reiniciar o servidor**
   ```bash
   # Parar o servidor (CTRL+C)
   npm run dev
   ```

2. **Verificar no console**
   ```javascript
   // Deve aparecer no terminal ao iniciar:
   ✓ Ready in XXXms
   ○ Compiling / ...
   ✓ Compiled / in XXXs
   ```

3. **Testar Funcionalidades**
   - [ ] Criar conta (Supabase)
   - [ ] Fazer login
   - [ ] Usar IA (OpenAI)
   - [ ] Testar checkout (Stripe teste)
   - [ ] Reset de senha

### Debug de Problemas

```bash
# Ver se variáveis estão carregadas
npm run dev

# No navegador console:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

# Server-side (ver no terminal do servidor):
# As variáveis sem NEXT_PUBLIC_ não aparecem no browser
```

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────────────────┐
│ .env.local                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ NEXT_PUBLIC_SUPABASE_URL          [Dashboard Supabase]  │
│ ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY     [Dashboard Supabase]  │
│                                                             │
│ ✅ OPENAI_API_KEY                    [OpenAI Platform]     │
│                                                             │
│ ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY [Stripe Dashboard]   │
│ ✅ STRIPE_SECRET_KEY                  [Stripe Dashboard]   │
│ ✅ STRIPE_WEBHOOK_SECRET              [Stripe CLI/Webhook] │
│                                                             │
│ ✅ NEXT_PUBLIC_SITE_URL               [Seu domínio]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deploy em Produção (Vercel)

### Adicionar Variáveis no Vercel

1. **Acessar Settings**
   ```
   https://vercel.com/[seu-usuario]/moncoyfinance
   Settings > Environment Variables
   ```

2. **Adicionar TODAS as variáveis**
   - Copie do seu .env.local
   - ⚠️ Use keys de PRODUÇÃO do Stripe
   - ⚠️ Use SITE_URL de produção

3. **Redeploy**
   ```
   Deployments > [último deploy] > Redeploy
   ```

---

## 💡 Dicas de Segurança

### ✅ FAZER
- Usar keys de TESTE em desenvolvimento
- Adicionar .env.local ao .gitignore
- Nunca commitar .env.local
- Rotar keys periodicamente
- Usar keys diferentes por ambiente

### ❌ NÃO FAZER
- Commitar keys no Git
- Compartilhar keys publicamente
- Usar keys de produção em dev
- Expor service_role_key no client
- Hardcodar keys no código

---

## 📞 Precisa de Ajuda?

### Supabase
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### OpenAI
- Docs: https://platform.openai.com/docs
- Help: https://help.openai.com

### Stripe
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

---

**Última atualização**: 22 de Janeiro de 2025  
**Versão do guia**: 1.0
