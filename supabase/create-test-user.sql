-- =====================================================
-- CRIAR USUÁRIO DE TESTE NO NOVO SUPABASE
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Cole e Execute
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO JÁ EXISTE
SELECT id, email, created_at, confirmed_at, email_confirmed_at
FROM auth.users
WHERE email = 'ronaldoarsan@gmail.com'; -- SUBSTITUA PELO SEU EMAIL

-- =====================================================
-- 2. CRIAR NOVO USUÁRIO (se não existir)
-- =====================================================
-- IMPORTANTE: Substitua 'seu-email@exemplo.com' e 'sua-senha-segura'

-- Método 1: Via SQL (cria usuário já confirmado)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ronaldoarsan@gmail.com', -- SUBSTITUA AQUI
  crypt('7$@C8623df', gen_salt('bf')), -- SUBSTITUA A SENHA AQUI
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Ronaldo"}', -- SUBSTITUA SEU NOME AQUI
  NOW(),
  NOW()
);

-- =====================================================
-- 3. VERIFICAR SE O PERFIL FOI CRIADO AUTOMATICAMENTE
-- =====================================================
-- O trigger handle_new_user() deve criar automaticamente
SELECT * FROM public.users WHERE email = 'seu-email@exemplo.com';

-- =====================================================
-- 4. SE O PERFIL NÃO FOI CRIADO, CRIAR MANUALMENTE
-- =====================================================
-- Pegue o ID do usuário criado acima e substitua aqui:
/*
INSERT INTO public.users (id, name, email, plan, registration_date)
VALUES (
  'cole-o-uuid-do-usuario-aqui',
  'Seu Nome',
  'seu-email@exemplo.com',
  'basic',
  NOW()
);

INSERT INTO public.user_settings (user_id)
VALUES ('cole-o-uuid-do-usuario-aqui');

INSERT INTO public.ai_usage (user_id, plan)
VALUES ('cole-o-uuid-do-usuario-aqui', 'basic');
*/

-- =====================================================
-- ALTERNATIVA: USAR A INTERFACE DO SUPABASE
-- =====================================================
-- Mais simples e seguro:
-- 1. Vá em: Authentication → Users
-- 2. Clique em: "Add user" → "Create new user"
-- 3. Preencha: Email e Password
-- 4. Marque: "Auto Confirm User" (para não precisar confirmar email)
-- 5. Clique em "Create user"
-- 6. O trigger vai criar automaticamente o perfil em public.users

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Após criar o usuário, verifique se tudo está ok:

-- Usuário na tabela auth
SELECT id, email, confirmed_at, created_at 
FROM auth.users 
WHERE email = 'ronaldoarsan@gmail.com';

-- Perfil na tabela public.users
SELECT id, name, email, plan, registration_date 
FROM public.users 
WHERE email = 'ronaldoarsan@gmail.com';

-- Configurações
SELECT * FROM public.user_settings 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'ronaldoarsan@gmail.com');

-- AI Usage
SELECT * FROM public.ai_usage 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'ronaldoarsan@gmail.com');

-- =====================================================
-- RESETAR SENHA (se necessário)
-- =====================================================
-- Se você esquecer a senha, execute:
/*
UPDATE auth.users 
SET encrypted_password = crypt('nova-senha-aqui', gen_salt('bf'))
WHERE email = 'seu-email@exemplo.com';
*/
