# Moncoy Finance

Moncoy Finance é uma plataforma de gestão financeira pessoal com recursos de inteligência artificial, integração com Stripe, autenticação social (Google) e visual moderno com Tailwind CSS.

## Funcionalidades
- 🤖 Análise inteligente de gastos e sugestões de orçamento via IA (OpenAI GPT-4)
- 📸 Upload e análise automática de comprovantes com IA Vision (Plano PRO/Premium)
- 💳 Gerenciamento de planos com Stripe (Básico, Profissional, Premium)
- 👤 Upload e exibição de foto de perfil com otimização automática
- 🔐 Autenticação com Google (OAuth 2.0)
- 💰 Portal de cobrança Stripe para gerenciamento de assinaturas
- 📊 Dashboard financeiro com insights e métricas
- 🎯 Gerenciamento de metas financeiras
- 📈 Rastreamento de investimentos
- 🔄 Transações recorrentes automáticas
- 📱 Interface responsiva e moderna

## Tecnologias
- Next.js (App Router)
- React
- Tailwind CSS
- Supabase (auth, storage, database)
- Stripe
- Lucide Icons
- PNPM

## Como rodar localmente
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/moncoy-finance-landing-page.git
   ```
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-do-supabase
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua-publishable-key-do-stripe
   STRIPE_SECRET_KEY=sua-secret-key-do-stripe
   STRIPE_WEBHOOK_SECRET=seu-webhook-secret (para produção)
   
   # OpenAI (para análise de IA e comprovantes)
   OPENAI_API_KEY=sua-api-key-do-openai
   
   # Next.js
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
4. Rode o projeto:
   ```bash
   pnpm run dev
   ```
5. Acesse `http://localhost:3000`

## Estrutura do Projeto
```
moncoy-finance-landing-page/
  app/
    ai-advice/
    profile/
    ...
  components/
  contexts/
  hooks/
  lib/
  public/
  styles/
  ...
```

## Contribuição
Pull requests são bem-vindos! Para grandes mudanças, abra uma issue primeiro para discutir o que você gostaria de modificar.

## Licença
MIT
