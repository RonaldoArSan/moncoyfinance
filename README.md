# Moncoy Finance

Moncoy Finance é uma plataforma de gestão financeira pessoal com recursos de inteligência artificial, integração com Stripe, autenticação social (Google) e visual moderno com Tailwind CSS.

## Funcionalidades
- Análise inteligente de gastos e sugestões de orçamento via IA
- Gerenciamento de planos (Básico, Profissional, Premium)
- Upload e exibição de foto de perfil
- Autenticação com Google
- Portal de cobrança Stripe
- Interface responsiva e moderna

## Tecnologias
- Next.js (App Router)
- React
- Tailwind CSS
- Supabase (auth, storage, database)
- Stripe
- Lucide Icons
- PNPM

## Como rodar localmente

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/RonaldoArSan/moncoyfinance.git
cd moncoyfinance
```

### 2️⃣ Instale as dependências
```bash
pnpm install
```

### 3️⃣ Configure as variáveis de ambiente

**Opção A: Script Automático (Recomendado)**
```powershell
.\scripts\setup-env.ps1
```

**Opção B: Manual**
```bash
cp .env.local.example .env.local
# Edite .env.local com suas keys
```

📚 **Guia completo**: [docs/ENV-SETUP-QUICKSTART.md](./docs/ENV-SETUP-QUICKSTART.md)

### 4️⃣ Rode o projeto
```bash
pnpm run dev
```

### 5️⃣ Acesse
```
http://localhost:3000
```

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
