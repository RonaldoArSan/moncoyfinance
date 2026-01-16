# Guia Rápido: Mudar Nome no Login do Google

## Problema
Ao fazer login com Google, aparece "dxdbpppymxfiojszrmir.supabase.co" em vez de "Moncoy Finance".

## Solução Mais Rápida (5 minutos)

### Passo 1: Acesse o Google Cloud Console
1. Abra https://console.cloud.google.com
2. Faça login com a conta que criou o projeto OAuth
3. Selecione o projeto correto no menu superior

### Passo 2: Configure o Nome do Aplicativo
1. No menu lateral esquerdo, clique em **APIs e Serviços**
2. Clique em **Tela de consentimento OAuth**
3. Clique no botão **EDITAR APLICATIVO**
4. Localize o campo **Nome do aplicativo**
5. Altere para: **Moncoy Finance**
6. (Opcional) Adicione um logotipo no campo **Logotipo do aplicativo**
7. (Opcional) No campo **Link da página inicial do aplicativo**, adicione seu domínio
8. Role até o final e clique em **SALVAR E CONTINUAR**
9. Continue clicando em **SALVAR E CONTINUAR** até finalizar

### Passo 3: Teste
1. Abra uma janela anônima no navegador
2. Vá para sua aplicação e clique em "Continuar com Google"
3. Verifique se agora aparece "Moncoy Finance" em vez da URL do Supabase

## Observações
- ⏱️ As alterações podem levar até 24 horas para propagar
- 🔄 Se não funcionar imediatamente, limpe o cache do navegador
- ⚠️ Certifique-se de estar editando o projeto correto

## Não Encontrou a Tela de Consentimento?
Se você não encontrar a opção no Google Cloud Console:
1. Verifique se está usando a conta Google correta
2. Confirme que o projeto OAuth foi criado nesta conta
3. Verifique se você tem permissões de administrador no projeto

## Precisa de Ajuda?
Consulte o guia completo: [SUPABASE_OAUTH_CONFIG.md](./SUPABASE_OAUTH_CONFIG.md)
