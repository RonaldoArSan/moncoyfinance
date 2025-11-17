# 🚨 Fix Rápido - Bucket not found

## ❌ Erro:
```
Bucket not found
```

## ✅ Solução Rápida (Via Interface - MAIS FÁCIL):

### **Opção 1: Criar Bucket via Interface Supabase** ⭐

1. **Acesse o Storage:**
   - URL: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/storage/buckets

2. **Clique em "New bucket"**

3. **Preencha os dados:**
   ```
   Name: avatars
   Public bucket: ✅ MARCAR (muito importante!)
   File size limit: 5242880
   Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp,image/gif
   ```

4. **Clique em "Create bucket"**

5. **Configure as Políticas:**
   - Clique no bucket `avatars` que acabou de criar
   - Vá na aba **"Policies"**
   - Clique em **"New Policy"**
   - Selecione **"For full customization"**
   - Cole cada uma das políticas abaixo (uma de cada vez):

**Política 1 - SELECT (Visualizar):**
```sql
CREATE POLICY "avatars_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
```

**Política 2 - INSERT (Upload):**
```sql
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Política 3 - UPDATE (Atualizar):**
```sql
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Política 4 - DELETE (Deletar):**
```sql
CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

### **Opção 2: Via SQL Editor (Alternativa)**

1. Acesse: https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/editor
2. Vá em: **SQL Editor → New Query**
3. Cole o conteúdo de: `supabase/create-avatars-bucket.sql`
4. Execute (clique em "Run")

---

## 🔍 Verificar se Funcionou:

Após criar o bucket, verifique:

1. **Via Interface:**
   - Storage → Buckets → Deve aparecer `avatars` (com ícone de 🌐 indicando público)

2. **Via SQL:**
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'avatars';
```

Deve retornar:
```
id: avatars
name: avatars
public: true
file_size_limit: 5242880
```

---

## ✅ Após Criar o Bucket:

1. **Reinicie o servidor** (se necessário):
   ```bash
   npm run dev
   ```

2. **Teste o upload novamente:**
   - Acesse: http://localhost:3000/profile
   - Clique em "Alterar Foto"
   - Selecione uma imagem
   - ✅ Deve funcionar!

---

## ⚠️ Troubleshooting:

### **Erro persiste após criar bucket?**

**Verifique se o bucket é público:**
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';
```

**Verifique as políticas RLS:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE 'avatars%';
```

Deve retornar 4 políticas (SELECT, INSERT, UPDATE, DELETE).

### **Erro: "new row violates row-level security policy"**

Execute as políticas novamente uma por uma no SQL Editor.

### **Erro 403 (Forbidden)**

O bucket não está público. Execute:
```sql
UPDATE storage.buckets SET public = true WHERE id = 'avatars';
```

---

## 📝 Resumo:

1. ✅ Criar bucket `avatars` (público)
2. ✅ Adicionar 4 políticas RLS
3. ✅ Testar upload

**Tempo estimado:** 2-3 minutos

**Link direto:** https://supabase.com/dashboard/project/jxpgiqmwugsqpvrftmhl/storage/buckets
