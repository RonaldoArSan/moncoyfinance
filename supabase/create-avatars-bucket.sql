-- =====================================================
-- CRIAR BUCKET AVATARS - VERSÃO SIMPLIFICADA
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase
-- Se der erro, use o método alternativo abaixo
-- =====================================================

-- MÉTODO 1: Criar bucket via SQL (tente este primeiro)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Verificar se foi criado
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- =====================================================
-- CRIAR POLÍTICAS RLS PARA O BUCKET
-- =====================================================

-- Deletar políticas antigas se existirem
DROP POLICY IF EXISTS "avatars_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

-- Permitir SELECT (visualizar) para usuários autenticados
CREATE POLICY "avatars_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Permitir INSERT (upload) apenas para a própria pasta
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir UPDATE apenas para a própria pasta
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir DELETE apenas para a própria pasta
CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- 1. Verificar bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'avatars';

-- 2. Verificar políticas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE 'avatars%'
ORDER BY policyname;

-- =====================================================
-- SE O MÉTODO ACIMA NÃO FUNCIONAR:
-- Use a interface do Supabase Storage
-- =====================================================
-- 
-- 1. Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/storage/buckets
-- 
-- 2. Clique em: "New bucket"
-- 
-- 3. Preencha:
--    - Name: avatars
--    - Public bucket: ✅ SIM (marque esta opção)
--    - File size limit: 5242880 (5MB)
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
-- 
-- 4. Clique em "Create bucket"
-- 
-- 5. Depois vá em "Policies" e adicione as políticas acima
-- 
-- =====================================================
