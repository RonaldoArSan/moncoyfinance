# Documentação do Moncoy Finance

Este diretório contém documentação adicional para configuração e uso do Moncoy Finance.

## Guias Disponíveis

### 📱 Configuração do OAuth do Google

Se você está vendo "dxdbpppymxfiojszrmir.supabase.co" em vez de "Moncoy Finance" durante o login com Google, siga um destes guias:

1. **[Antes e Depois](./ANTES_DEPOIS.md)** 👀
   - Visualização do problema e solução
   - Comparação visual
   - Impacto nos usuários
   - Ideal para entender o problema primeiro

2. **[Guia Rápido (5 minutos)](./GUIA_RAPIDO_OAUTH.md)** ⚡
   - Passo a passo simplificado
   - Solução mais rápida
   - Ideal para quem quer resolver rapidamente

3. **[Guia Completo](./SUPABASE_OAUTH_CONFIG.md)** 📚
   - 3 opções diferentes de configuração
   - Explicações detalhadas
   - Troubleshooting completo
   - Ideal para entender todas as opções

4. **[Checklist Interativo](./CHECKLIST_OAUTH.md)** ✅
   - Lista de verificação passo a passo
   - Marque conforme avança
   - Não esquece nenhum passo
   - Ideal para seguir metodicamente

5. **[Fluxo e Diagrama](./OAUTH_FLUXO.md)** 🔄
   - Diagrama visual do fluxo OAuth
   - Explicação de onde configurar cada coisa
   - FAQ detalhado
   - Ideal para entender como funciona

## Qual Guia Usar?

### Se você quer VER o antes e depois
→ Use o [Antes e Depois](./ANTES_DEPOIS.md)

### Se você quer resolver RÁPIDO
→ Use o [Guia Rápido](./GUIA_RAPIDO_OAUTH.md)

### Se você quer um CHECKLIST para seguir
→ Use o [Checklist Interativo](./CHECKLIST_OAUTH.md)

### Se você quer entender TUDO
→ Use o [Guia Completo](./SUPABASE_OAUTH_CONFIG.md)

### Se você quer saber COMO funciona
→ Use o [Fluxo e Diagrama](./OAUTH_FLUXO.md)

## Resumo da Solução

O problema NÃO está no código da aplicação. Está na configuração do Google Cloud Console.

**Solução em 3 passos:**
1. Acesse https://console.cloud.google.com
2. Vá em "APIs e Serviços" → "Tela de consentimento OAuth"
3. Mude o "Nome do aplicativo" para "Moncoy Finance"

**Tempo:** ~5 minutos  
**Custo:** Gratuito  
**Requer mudança no código:** Não

## Precisa de Ajuda?

- 📧 Abra uma issue no GitHub
- 💬 Entre em contato com o suporte
- 📖 Consulte a [documentação oficial do Supabase](https://supabase.com/docs/guides/auth)
- 📖 Consulte a [documentação do Google OAuth](https://developers.google.com/identity/protocols/oauth2)

## Outros Recursos

- [README Principal](../README.md)
- [Guia de Deploy em Produção](../README-PRODUCTION.md)
