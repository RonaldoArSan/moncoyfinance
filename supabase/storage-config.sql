-- =====================================================
-- MONCOYFINANCE - CONFIGURAÇÃO DE STORAGE (SUPABASE)
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Cole e Execute
-- =====================================================

-- =====================================================
-- 1. CRIAR BUCKETS (Pastas de armazenamento)
-- =====================================================

-- Bucket para fotos de perfil dos usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Público (imagens podem ser acessadas via URL)
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para comprovantes/recibos de transações
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false, -- Privado (requer autenticação)
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos de investimentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'investment-docs',
  'investment-docs',
  false, -- Privado
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. POLÍTICAS RLS PARA AVATARS (Fotos de Perfil)
-- =====================================================

-- Permitir que qualquer usuário autenticado VISUALIZE avatares
CREATE POLICY "avatars_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Permitir que usuários autenticados façam UPLOAD de seus próprios avatares
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários ATUALIZEM apenas seus próprios avatares
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários DELETEM apenas seus próprios avatares
CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 3. POLÍTICAS RLS PARA RECEIPTS (Comprovantes)
-- =====================================================

-- Permitir que usuários VISUALIZEM apenas seus próprios comprovantes
CREATE POLICY "receipts_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários façam UPLOAD de seus próprios comprovantes
CREATE POLICY "receipts_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários ATUALIZEM seus próprios comprovantes
CREATE POLICY "receipts_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários DELETEM seus próprios comprovantes
CREATE POLICY "receipts_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 4. POLÍTICAS RLS PARA INVESTMENT-DOCS
-- =====================================================

-- Permitir que usuários VISUALIZEM apenas seus próprios documentos
CREATE POLICY "investment_docs_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'investment-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários façam UPLOAD de seus próprios documentos
CREATE POLICY "investment_docs_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'investment-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários ATUALIZEM seus próprios documentos
CREATE POLICY "investment_docs_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'investment-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários DELETEM seus próprios documentos
CREATE POLICY "investment_docs_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'investment-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 5. VERIFICAÇÃO - Listar buckets criados
-- =====================================================
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('avatars', 'receipts', 'investment-docs');

-- =====================================================
-- 6. VERIFICAÇÃO - Listar políticas de storage
-- =====================================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 
-- ESTRUTURA DE PASTAS (recomendada):
-- - avatars/{user_id}/avatar.jpg
-- - receipts/{user_id}/{transaction_id}/receipt.pdf
-- - investment-docs/{user_id}/{investment_id}/document.pdf
--
-- EXEMPLO DE UPLOAD NO CÓDIGO:
-- const { data, error } = await supabase.storage
--   .from('avatars')
--   .upload(`${userId}/avatar.jpg`, file, {
--     cacheControl: '3600',
--     upsert: true
--   })
--
-- EXEMPLO DE URL PÚBLICA (avatars):
-- const { data } = supabase.storage
--   .from('avatars')
--   .getPublicUrl(`${userId}/avatar.jpg`)
--
-- EXEMPLO DE URL ASSINADA (receipts - privado):
-- const { data, error } = await supabase.storage
--   .from('receipts')
--   .createSignedUrl(`${userId}/receipt.pdf`, 3600) // 1 hora
--
-- LIMITES DE TAMANHO:
-- - Avatars: 5MB
-- - Receipts: 10MB
-- - Investment Docs: 20MB
--
-- TIPOS MIME PERMITIDOS:
-- - Avatars: JPEG, JPG, PNG, WebP, GIF
-- - Receipts: Imagens + PDF
-- - Investment Docs: PDF, Excel, Imagens
--
-- =====================================================
