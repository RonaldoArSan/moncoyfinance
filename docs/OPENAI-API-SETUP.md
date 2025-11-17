# 🤖 Configuração da API OpenAI - Análise de Comprovantes

Este documento explica como configurar a API do OpenAI para habilitar a análise inteligente de comprovantes e transações no MoncoyFinance.

## 📋 Pré-requisitos

- Conta no [OpenAI Platform](https://platform.openai.com/)
- Acesso à página de [API Keys](https://platform.openai.com/api-keys)
- Créditos ou método de pagamento configurado na conta OpenAI

## 🔑 Obtendo a API Key

### 1. Criar Conta no OpenAI
1. Acesse: https://platform.openai.com/signup
2. Complete o cadastro
3. Confirme seu email

### 2. Adicionar Método de Pagamento
1. Acesse: https://platform.openai.com/account/billing
2. Clique em "Add payment method"
3. Configure seu cartão de crédito
4. Adicione créditos iniciais (recomendado: $10-20)

### 3. Criar API Key
1. Acesse: https://platform.openai.com/api-keys
2. Clique em "+ Create new secret key"
3. Nomeie a chave (ex: "MoncoyFinance - Production")
4. Defina permissões (recomendado: "All")
5. **IMPORTANTE**: Copie a chave imediatamente (ela só aparece uma vez)
6. Armazene em local seguro (gerenciador de senhas)

## ⚙️ Configurando no Projeto

### Desenvolvimento Local
1. Crie/edite o arquivo `.env.local` na raiz do projeto:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. Reinicie o servidor de desenvolvimento:
```bash
pnpm dev
```

### Produção (Vercel)
1. Acesse seu projeto no Vercel
2. Settings → Environment Variables
3. Adicione nova variável:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-xxxxx...`
   - **Environment**: Production (e Development se necessário)
4. Redeploy o projeto

### Produção (Docker)
Adicione ao seu `docker-compose.yml` ou comando `docker run`:
```yaml
environment:
  - OPENAI_API_KEY=sk-proj-xxxxx...
```

## 🎯 Funcionalidades Habilitadas

### 1. Análise de Transações
- Endpoint: `/api/ai/analyze`
- Modelos usados:
  - **Plano Premium**: `gpt-4o` (mais preciso)
  - **Plano PRO/Basic**: `gpt-4o-mini` (mais rápido e econômico)
- Funcionalidades:
  - Análise mensal de gastos
  - Identificação de padrões de consumo
  - Sugestões de economia
  - Insights financeiros personalizados

### 2. Análise de Comprovantes (PRO/Premium)
- Endpoint: `/api/ai/analyze-receipt`
- Modelo usado: `gpt-4o-mini` (com Vision)
- Funcionalidades:
  - Upload de foto de comprovante
  - Extração automática de:
    - Descrição da compra
    - Valor total
    - Data da transação
    - Nome do estabelecimento
    - Categoria sugerida
  - Preenchimento automático do formulário

## 💰 Custos Estimados

### Análise de Transações
- **gpt-4o-mini**: ~$0.0001 por análise
- **gpt-4o**: ~$0.001 por análise

### Análise de Comprovantes (Vision)
- **gpt-4o-mini**: ~$0.0015 por imagem analisada

### Estimativa Mensal por Usuário
- **Plano Basic**: 5 análises/semana = ~$0.01/mês
- **Plano PRO**: 7 análises/semana + 10 comprovantes = ~$0.03/mês
- **Plano Premium**: 50 análises/mês + 30 comprovantes = ~$0.10/mês

**Custo total estimado para 100 usuários ativos**: ~$5-10/mês

## 🔒 Segurança

### Boas Práticas
1. ✅ **NUNCA** commitar a API key no Git
2. ✅ Usar variáveis de ambiente
3. ✅ Rotacionar keys periodicamente (a cada 90 dias)
4. ✅ Monitorar uso no dashboard OpenAI
5. ✅ Configurar limites de gasto (Billing → Usage limits)

### Configuração de Limites
1. Acesse: https://platform.openai.com/account/limits
2. Configure "Soft limit" (ex: $10/mês)
3. Configure "Hard limit" (ex: $20/mês)
4. Adicione notificações por email

## 🧪 Testando a Integração

### 1. Teste via cURL
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Teste"}]
  }'
```

### 2. Teste no MoncoyFinance
1. Faça upgrade para plano PRO (ou configure manualmente no banco)
2. Acesse "Transações" → "Nova Transação"
3. Clique em "Upload de Comprovante"
4. Envie uma foto de nota fiscal
5. Aguarde a análise (5-10 segundos)
6. Verifique se os dados foram extraídos corretamente

### 3. Teste de Análise de IA
1. Acesse "IA Financeira"
2. Clique em "Analisar Gastos"
3. Aguarde a análise
4. Verifique se recebeu insights relevantes

## 📊 Monitoramento

### Dashboard OpenAI
- **URL**: https://platform.openai.com/usage
- **Métricas**:
  - Requests por dia
  - Tokens consumidos
  - Custo acumulado
  - Modelos mais usados

### Logs no MoncoyFinance
```bash
# Development
pnpm dev
# Verifique console para erros de API

# Production (Vercel)
vercel logs
```

## 🚨 Troubleshooting

### Erro: "Invalid API Key"
- ✅ Verifique se a key foi copiada corretamente
- ✅ Confirme que não tem espaços extras
- ✅ Verifique se a key não foi revogada
- ✅ Teste a key via cURL

### Erro: "Rate limit exceeded"
- ✅ Aguarde alguns minutos
- ✅ Verifique limites em: https://platform.openai.com/account/limits
- ✅ Considere upgrade do tier OpenAI

### Erro: "Insufficient funds"
- ✅ Adicione créditos em: https://platform.openai.com/account/billing
- ✅ Configure auto-recharge

### Comprovante não é reconhecido
- ✅ Use imagens de boa qualidade (mínimo 800x600px)
- ✅ Certifique-se que o texto está legível
- ✅ Evite imagens muito escuras ou borradas
- ✅ Formatos suportados: JPEG, PNG, WebP

## 📚 Referências

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vision API Guide](https://platform.openai.com/docs/guides/vision)
- [Pricing](https://openai.com/api/pricing/)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

## 💡 Dicas de Otimização

1. **Cache de Respostas**: Considere cachear análises similares
2. **Batch Processing**: Agrupe múltiplas análises quando possível
3. **Prompt Engineering**: Otimize prompts para respostas mais concisas
4. **Monitoramento**: Configure alertas de custo no OpenAI dashboard
5. **Fallback**: Implemente modo offline para indisponibilidade da API

---

**Última atualização**: Novembro 2025  
**Versão do documento**: 1.0
