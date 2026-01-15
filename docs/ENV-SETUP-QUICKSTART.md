# 🔑 Configuração de Environment Variables - Quick Start

## 🚀 Modo Rápido (Recomendado)

### Opção 1: Script Interativo (PowerShell)
```powershell
.\scripts\setup-env.ps1
```

O script vai perguntar cada key e criar o arquivo `.env.local` automaticamente.

---

### Opção 2: Copiar Template Manualmente
```bash
# 1. Copiar o template
cp .env.local.example .env.local

# 2. Editar o arquivo
code .env.local
```

Preencha cada variável seguindo os comentários no arquivo.

---

## 📋 Variáveis Obrigatórias

| Variável | Onde Buscar | Exemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon public | `eyJhbG...` |
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) > Create key | `sk-proj-...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) > Publishable key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Secret key | `sk_test_...` |
| `NEXT_PUBLIC_SITE_URL` | Seu domínio/localhost | `http://localhost:3000` |

---

## 📚 Guia Completo

Para instruções detalhadas de cada serviço:
**[docs/GUIA-ENVIRONMENT-KEYS.md](./docs/GUIA-ENVIRONMENT-KEYS.md)**

---

## ✅ Verificar se Está Funcionando

```bash
# 1. Reiniciar o servidor
npm run dev

# 2. No navegador (Console F12):
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
# Deve mostrar sua URL (não undefined)

# 3. Testar funcionalidades:
# - Criar conta
# - Fazer login  
# - Usar IA
```

---

## 🔒 Segurança

- ✅ `.env.local` já está no `.gitignore`
- ❌ **NUNCA** commite o arquivo com suas keys
- ⚠️ Use keys de **TESTE** em desenvolvimento
- 🔑 Use keys de **PRODUÇÃO** apenas no deploy

---

## 🐛 Problemas Comuns

### "Cannot find module .env.local"
**Solução**: O arquivo deve estar na raiz do projeto (mesmo nível do package.json)

### "Supabase/OpenAI/Stripe not working"
**Solução**: 
1. Verifique se as keys estão corretas
2. Reinicie o servidor
3. Limpe o cache: `rm -rf .next`

### "CORS error" ou "Invalid API key"
**Solução**: Verifique se copiou a key completa (incluindo prefixo sk-, pk-, etc)

---

## 💡 Dicas

- 🔄 Após editar `.env.local`, sempre reinicie o servidor
- 📝 Use `.env.local` para dev, configure no Vercel para produção
- 🧪 Stripe tem [cartões de teste](https://stripe.com/docs/testing): `4242 4242 4242 4242`

---

## 📞 Precisa de Ajuda?

1. Veja o guia completo: `docs/GUIA-ENVIRONMENT-KEYS.md`
2. Veja o template: `.env.local.example`
3. Abra uma issue no GitHub

---

**Status**: ✅ Pronto para usar  
**Última atualização**: 22 de Janeiro de 2025
