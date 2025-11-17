import { supabase } from '@/lib/supabase/client'
import { createClient } from '@/lib/supabase/server'

/**
 * Utilitários para upload e gerenciamento de arquivos no Supabase Storage
 */

// =====================================================
// TIPOS
// =====================================================
export type StorageBucket = 'avatars' | 'receipts' | 'investment-docs'

export interface UploadOptions {
  bucket: StorageBucket
  path: string
  file: File
  upsert?: boolean
}

export interface UploadResult {
  url: string
  path: string
  error?: string
}

// =====================================================
// UPLOAD DE ARQUIVOS (CLIENT-SIDE)
// =====================================================

/**
 * Faz upload de um arquivo para o Supabase Storage
 * @param options - Opções de upload
 * @returns URL pública ou assinada do arquivo
 */
export async function uploadFile({
  bucket,
  path,
  file,
  upsert = true,
}: UploadOptions): Promise<UploadResult> {
  try {
    // Validar tamanho do arquivo
    const maxSizes: Record<StorageBucket, number> = {
      avatars: 5 * 1024 * 1024, // 5MB
      receipts: 10 * 1024 * 1024, // 10MB
      'investment-docs': 20 * 1024 * 1024, // 20MB
    }

    if (file.size > maxSizes[bucket]) {
      return {
        url: '',
        path: '',
        error: `Arquivo muito grande. Máximo: ${maxSizes[bucket] / 1024 / 1024}MB`,
      }
    }

    // Validar tipo MIME
    const allowedTypes: Record<StorageBucket, string[]> = {
      avatars: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      receipts: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
      ],
      'investment-docs': [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
      ],
    }

    if (!allowedTypes[bucket].includes(file.type)) {
      return {
        url: '',
        path: '',
        error: 'Tipo de arquivo não permitido',
      }
    }

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert,
      })

    if (error) {
      console.error('Erro no upload:', error)
      return {
        url: '',
        path: '',
        error: error.message,
      }
    }

    // Obter URL pública (para buckets públicos) ou criar URL assinada
    let url = ''
    if (bucket === 'avatars') {
      // Bucket público - URL pública
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)
      url = publicData.publicUrl
    } else {
      // Bucket privado - URL assinada (válida por 1 hora)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 3600)

      if (signedError) {
        console.error('Erro ao criar URL assinada:', signedError)
        return {
          url: '',
          path: data.path,
          error: signedError.message,
        }
      }

      url = signedData?.signedUrl || ''
    }

    return {
      url,
      path: data.path,
    }
  } catch (error) {
    console.error('Erro no upload:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Faz upload de um avatar do usuário
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  const extension = file.name.split('.').pop()
  const path = `${userId}/avatar.${extension}`

  return uploadFile({
    bucket: 'avatars',
    path,
    file,
    upsert: true,
  })
}

/**
 * Faz upload de um comprovante de transação
 */
export async function uploadReceipt(
  userId: string,
  transactionId: string,
  file: File
): Promise<UploadResult> {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const path = `${userId}/${transactionId}/${timestamp}.${extension}`

  return uploadFile({
    bucket: 'receipts',
    path,
    file,
  })
}

/**
 * Faz upload de um documento de investimento
 */
export async function uploadInvestmentDoc(
  userId: string,
  investmentId: string,
  file: File
): Promise<UploadResult> {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const path = `${userId}/${investmentId}/${timestamp}.${extension}`

  return uploadFile({
    bucket: 'investment-docs',
    path,
    file,
  })
}

// =====================================================
// DELETAR ARQUIVOS
// =====================================================

/**
 * Deleta um arquivo do storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error('Erro ao deletar arquivo:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// =====================================================
// OBTER URLs
// =====================================================

/**
 * Obtém URL pública de um avatar
 */
export function getAvatarUrl(path: string): string {
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

/**
 * Cria URL assinada para um arquivo privado (receipts, investment-docs)
 */
export async function getSignedUrl(
  bucket: 'receipts' | 'investment-docs',
  path: string,
  expiresIn: number = 3600 // 1 hora por padrão
): Promise<{ url: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Erro ao criar URL assinada:', error)
      return { url: '', error: error.message }
    }

    return { url: data?.signedUrl || '' }
  } catch (error) {
    console.error('Erro ao criar URL assinada:', error)
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// =====================================================
// SERVER-SIDE UTILITIES (para usar em Server Actions)
// =====================================================

/**
 * Upload de arquivo usando client server-side (para Server Actions)
 */
export async function uploadFileServer({
  bucket,
  path,
  file,
  upsert = true,
}: UploadOptions): Promise<UploadResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert,
      })

    if (error) {
      console.error('Erro no upload (server):', error)
      return {
        url: '',
        path: '',
        error: error.message,
      }
    }

    // Obter URL
    let url = ''
    if (bucket === 'avatars') {
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)
      url = publicData.publicUrl
    } else {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 3600)

      if (signedError) {
        return {
          url: '',
          path: data.path,
          error: signedError.message,
        }
      }

      url = signedData?.signedUrl || ''
    }

    return { url, path: data.path }
  } catch (error) {
    console.error('Erro no upload (server):', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Deleta arquivo usando client server-side
 */
export async function deleteFileServer(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
