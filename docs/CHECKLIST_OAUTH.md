# ✅ Checklist: Configurar Nome no Login do Google

Use este checklist para garantir que você configurou tudo corretamente.

## Antes de Começar

- [ ] Você tem acesso ao Google Cloud Console
- [ ] Você sabe qual é a conta Google usada para criar o projeto OAuth
- [ ] Você tem permissões de administrador no projeto Google Cloud

## Passo 1: Google Cloud Console

### 1.1 Acessar o Console
- [ ] Abri https://console.cloud.google.com
- [ ] Fiz login com a conta correta
- [ ] Selecionei o projeto correto no menu superior

### 1.2 Navegar até OAuth
- [ ] Cliquei em "APIs e Serviços" no menu lateral
- [ ] Cliquei em "Tela de consentimento OAuth"
- [ ] Vi a tela com informações do meu aplicativo

### 1.3 Editar Nome do Aplicativo
- [ ] Cliquei no botão "EDITAR APLICATIVO"
- [ ] Localizei o campo "Nome do aplicativo"
- [ ] Alterei para: **Moncoy Finance**
- [ ] (Opcional) Adicionei um logotipo
- [ ] (Opcional) Adicionei o link da página inicial
- [ ] Cliquei em "SALVAR E CONTINUAR" até finalizar

## Passo 2: Verificar Configurações do Supabase (Opcional)

### 2.1 URLs de Redirecionamento
- [ ] Acessei https://app.supabase.com
- [ ] Fui em "Authentication" → "URL Configuration"
- [ ] Verifiquei que as "Redirect URLs" incluem:
  - `https://dxdbpppymxfiojszrmir.supabase.co/**`
  - `http://localhost:3000/**`

## Passo 3: Testar

### 3.1 Teste Inicial
- [ ] Abri uma janela anônima/privada no navegador
- [ ] Acessei a página de login da aplicação
- [ ] Cliquei em "Continuar com Google"
- [ ] Vi a tela de consentimento do Google

### 3.2 Verificação
- [ ] ✅ O nome "Moncoy Finance" aparece na tela
- [ ] ✅ O logotipo aparece (se configurado)
- [ ] ✅ Consigo selecionar uma conta e fazer login

## Troubleshooting

Se algo não funcionou, marque o que aconteceu:

### Problemas Comuns
- [ ] ❌ Nome ainda aparece como URL do Supabase
  - Solução: Aguarde até 24 horas ou limpe o cache
  - Comando: Ctrl+Shift+Del (Chrome) → Limpar cache
  
- [ ] ❌ Erro "redirect_uri_mismatch"
  - Solução: Verifique as URLs no Google Cloud Console
  - Elas devem incluir: `https://[seu-projeto].supabase.co/auth/v1/callback`

- [ ] ❌ Não encontro a "Tela de consentimento OAuth"
  - Solução: Verifique se está na conta Google correta
  - Confirme que o projeto OAuth está nesta conta

- [ ] ❌ Não tenho permissão para editar
  - Solução: Peça acesso de administrador ao dono do projeto
  - Ou use a conta que criou o projeto originalmente

## Após Configuração

### Documentar
- [ ] Salvei as informações do projeto Google Cloud
- [ ] Documentei onde está configurado
- [ ] Informei a equipe sobre a mudança

### Próximos Passos (Opcional)
- [ ] Considerar usar um domínio personalizado
- [ ] Adicionar logo personalizado
- [ ] Configurar outras informações na tela de consentimento

## Recursos Adicionais

Se precisar de mais ajuda:
- 📖 [Guia Rápido](./GUIA_RAPIDO_OAUTH.md)
- 📖 [Guia Completo](./SUPABASE_OAUTH_CONFIG.md)
- 📖 [Fluxo e Diagrama](./OAUTH_FLUXO.md)

## Status Final

Marque quando estiver 100% concluído:
- [ ] ✅ Nome "Moncoy Finance" aparece no login do Google
- [ ] ✅ Login funciona corretamente
- [ ] ✅ Testei em navegador anônimo
- [ ] ✅ Documentei as alterações

---

**Data de Configuração:** _________________

**Configurado por:** _________________

**Tempo total:** _______ minutos
