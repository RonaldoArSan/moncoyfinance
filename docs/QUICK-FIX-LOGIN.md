# 🔐 Fix Rápido - Erro de Login no Novo Supabase

## ❌ Problema
```
Invalid login credentials
```

## ✅ Causa
Você criou um **novo projeto Supabase**, mas o usuário ainda não existe nele.

## 🚀 Solução (Escolha uma)

### **OPÇÃO 1: Via Interface (MAIS FÁCIL)** ⭐

1. Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl
2. Vá em: **Authentication → Users**
3. Clique em: **"Add user" → "Create new user"**
4. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: sua-senha-segura
   - ✅ Marque: **"Auto Confirm User"** (importante!)
5. Clique em: **"Create user"**
6. ✅ Pronto! O trigger vai criar automaticamente:
   - Perfil em `public.users`
   - Configurações em `public.user_settings`
   - Registro em `public.ai_usage`

### **OPÇÃO 2: Via SQL Editor**

1. Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/editor
2. Vá em: **SQL Editor → New Query**
3. Cole o conteúdo do arquivo: `supabase/create-test-user.sql`
4. **Substitua** os valores:
   - `seu-email@exemplo.com` → Seu email real
   - `sua-senha-segura` → Sua senha real
   - `Seu Nome` → Seu nome real
5. Execute a query
6. Verifique se funcionou com as queries de verificação

### **OPÇÃO 3: Via Cadastro na Aplicação**

1. Acesse: http://localhost:3000/register
2. Faça um novo cadastro normalmente
3. O sistema vai criar tudo automaticamente

## 🔍 Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Ver usuários criados
SELECT id, email, confirmed_at, created_at 
FROM auth.users;

-- Ver perfis criados
SELECT id, name, email, plan 
FROM public.users;
```

## ⚠️ Importante

- O **trigger `on_auth_user_created`** cria automaticamente:
  - `public.users` (perfil)
  - `public.user_settings` (configurações)
  - `public.ai_usage` (controle de IA)

- Se você criou o usuário via SQL e o trigger não funcionou, execute manualmente os INSERTs do arquivo `create-test-user.sql`

## 🎯 Credenciais de Teste Sugeridas

Para desenvolvimento local, use:
- **Email**: dev@moncoyfinance.com
- **Password**: Test@123456
- **Nome**: Desenvolvedor Teste

## 📝 Próximos Passos

Após criar o usuário:
1. ✅ Faça login em: http://localhost:3000/login
2. ✅ Verifique se o dashboard carrega
3. ✅ Teste criar uma transação
4. ✅ Teste os recursos de IA (se aplicável ao plano)

## 🔗 Links Úteis

- **Dashboard Supabase**: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl
- **SQL Editor**: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/editor
- **Auth Users**: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/auth/users
- **Table Editor**: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/editor
