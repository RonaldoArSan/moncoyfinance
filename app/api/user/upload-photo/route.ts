import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Obter arquivo do FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validar se userId corresponde ao usuário autenticado
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF' },
        { status: 400 }
      )
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 5MB' },
        { status: 400 }
      )
    }

    // Fazer upload para Supabase Storage
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId}/avatar.${extension}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Substituir se já existir
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path)

    const photoUrl = urlData.publicUrl

    console.log('=== UPLOAD SUCCESS ===')
    console.log('Upload path:', uploadData.path)
    console.log('Public URL:', photoUrl)
    console.log('User ID:', userId)
    console.log('======================')

    // Atualizar perfil do usuário no banco
    const { error: updateError } = await supabase
      .from('users')
      .update({ photo_url: photoUrl })
      .eq('id', userId)

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil no banco de dados' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      photoUrl,
      path: uploadData.path,
    })
  } catch (error) {
    console.error('Erro no upload de foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
