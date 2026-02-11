# Configuração do OAuth do Google no Supabase

Este documento explica como alterar o nome da aplicação que aparece durante o login com Google, de "dxdbpppymxfiojszrmir.supabase.co" para "moncoyfinance".

## Problema

Quando os usuários fazem login com Google, veem a mensagem:
```
Prosseguir para dxdbpppymxfiojszrmir.supabase.co
Fazer login no serviço dxdbpppymxfiojszrmir.supabase.co
```

Em vez de:
```
Prosseguir para Moncoy Finance
Fazer login no serviço Moncoy Finance
```

## Causa

O texto exibido no consentimento do OAuth vem da configuração do **Site URL** no Supabase e das configurações do projeto Google OAuth.

## Solução

### Opção 1: Configurar Nome do Aplicativo no Google Cloud Console (Recomendado)

1. **Acesse o Google Cloud Console**
   - Vá para https://console.cloud.google.com
   - Selecione o projeto vinculado ao seu OAuth do Supabase

2. **Configure a Tela de Consentimento OAuth**
   - No menu lateral, vá em **APIs e Serviços** > **Tela de consentimento OAuth**
   - Clique em **EDITAR APLICATIVO**
   - No campo **Nome do aplicativo**, altere para: `Moncoy Finance`
   - No campo **Logotipo do aplicativo**, você pode adicionar o logo da aplicação (opcional)
   - No campo **Link da página inicial do aplicativo**, adicione: `https://moncoyfinance.com` (ou seu domínio)
   - Clique em **SALVAR E CONTINUAR**

3. **Verifique as Configurações**
   - Certifique-se de que o status está como "Em produção" ou "Teste"
   - Verifique se todos os escopos necessários estão configurados:
     - `email`
     - `profile`
     - `openid`

### Opção 2: Usar Domínio Personalizado (Mais Profissional)

Se você tem um domínio próprio (ex: `app.moncoyfinance.com`):

1. **Configure o Domínio Personalizado no Supabase**
   - Acesse seu Dashboard do Supabase: https://app.supabase.com
   - Vá em **Settings** > **Custom Domains**
   - Adicione seu domínio personalizado (ex: `app.moncoyfinance.com`)
   - Siga as instruções para configurar os registros DNS

2. **Atualize as URLs de Redirecionamento**
   - No Dashboard do Supabase, vá em **Authentication** > **URL Configuration**
   - Em **Site URL**, atualize para: `https://app.moncoyfinance.com`
   - Em **Redirect URLs**, adicione:
     - `https://app.moncoyfinance.com/`
     - `https://app.moncoyfinance.com/admin`
     - `https://app.moncoyfinance.com/**`

3. **Atualize o Google OAuth**
   - No Google Cloud Console, vá em **APIs e Serviços** > **Credenciais**
   - Clique no seu OAuth 2.0 Client ID
   - Em **URIs de redirecionamento autorizados**, adicione:
     - `https://app.moncoyfinance.com/auth/v1/callback`
   - Clique em **SALVAR**

### Opção 3: Atualizar Site URL no Supabase (Solução Rápida)

1. **Acesse o Dashboard do Supabase**
   - Vá para https://app.supabase.com
   - Selecione seu projeto

2. **Configure as URLs**
   - Navegue para **Authentication** > **URL Configuration**
   - Em **Site URL**, você pode adicionar uma URL mais amigável
   - Certifique-se de que as **Redirect URLs** incluem:
     ```
     https://dxdbpppymxfiojszrmir.supabase.co/**
     http://localhost:3000/**
     ```

## Verificação

Após fazer as alterações:

1. **Limpe o cache do navegador** ou use uma janela anônima
2. **Teste o fluxo de login**:
   - Vá para a página de login
   - Clique em "Continuar com Google"
   - Verifique se o nome correto aparece na tela de consentimento

## Notas Importantes

- ⚠️ **Alterações no Google Cloud Console podem levar até 24 horas** para propagar
- ⚠️ **Não remova as URLs antigas** do Supabase até confirmar que as novas funcionam
- ⚠️ **Teste em modo de desenvolvimento** antes de fazer alterações em produção
- ✅ **A Opção 1** (Google Cloud Console) é a mais rápida e não requer domínio personalizado
- ✅ **A Opção 2** (Domínio Personalizado) é a mais profissional mas requer configuração DNS

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de redirecionamento está corretamente configurada no Google Cloud Console
- A URL deve ser exatamente: `https://[SEU-PROJETO].supabase.co/auth/v1/callback`

### Nome ainda aparece incorreto
- Limpe o cache do navegador (Ctrl+Shift+Del no Chrome)
- Aguarde até 24 horas para propagação das alterações do Google
- Verifique se está editando o projeto correto no Google Cloud Console

### Não consigo acessar o Google Cloud Console
- Certifique-se de estar usando a conta Google correta
- O projeto deve estar vinculado à mesma conta usada para criar as credenciais OAuth

## Suporte

Se ainda tiver problemas após seguir este guia, verifique:
- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentação do Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Discord](https://discord.supabase.com/)
