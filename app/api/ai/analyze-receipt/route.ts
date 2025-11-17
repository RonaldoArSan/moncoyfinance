import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'income' ou 'expense'

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP' },
        { status: 400 }
      )
    }

    // Converter para base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const imageUrl = `data:${file.type};base64,${base64Image}`

    // Prompt para extração de dados
    const systemPrompt = `Você é um assistente especializado em extrair dados de comprovantes, notas fiscais e recibos brasileiros.

INSTRUÇÕES:
1. Analise cuidadosamente a imagem fornecida
2. Identifique e extraia TODAS as informações visíveis
3. Para a descrição, seja específico sobre o que foi comprado/vendido
4. Para o valor, considere SEMPRE o VALOR TOTAL FINAL (após descontos, taxas, etc.)
5. Para a data, procure pela data da transação/emissão
6. Para o estabelecimento, identifique o nome da empresa/loja
7. Para a categoria, analise o tipo de compra e escolha UMA das opções abaixo:
   - "alimentação" → supermercados, restaurantes, lanchonetes, delivery de comida
   - "transporte" → combustível, Uber, táxi, ônibus, metrô, pedágio, estacionamento
   - "saúde" → farmácias, consultas médicas, exames, planos de saúde
   - "educação" → escolas, cursos, livros, materiais escolares
   - "lazer" → cinema, teatro, streaming, jogos, viagens, turismo
   - "moradia" → aluguel, condomínio, água, luz, gás, internet, telefone
   - "vestuário" → roupas, calçados, acessórios
   - "outros" → qualquer item que não se encaixe nas categorias acima

FORMATO DE RESPOSTA:
Retorne APENAS um objeto JSON válido, sem texto adicional, no formato:
{
  "description": "Descrição específica do que foi comprado (ex: Compras no supermercado, Almoço no restaurante, Combustível)",
  "amount": 99.99,
  "date": "2025-11-17",
  "merchant": "Nome exato do estabelecimento conforme aparece no comprovante",
  "category": "uma das categorias listadas acima"
}

IMPORTANTE:
- Se não conseguir identificar algum campo, use valores padrão razoáveis
- O campo "amount" deve ser SEMPRE um número positivo
- O campo "date" deve estar no formato YYYY-MM-DD
- Se a data não estiver visível, use a data de hoje
- Seja preciso e objetivo nas descrições`

    // Chamar OpenAI Vision API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo com suporte a visão
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analise este comprovante de ${type === 'income' ? 'RECEITA (entrada de dinheiro)' : 'DESPESA (saída de dinheiro)'} e extraia TODOS os dados visíveis no formato JSON solicitado.

EXEMPLO DE RESPOSTA ESPERADA:
{
  "description": "Compras no Supermercado Extra",
  "amount": 156.78,
  "date": "2025-11-17",
  "merchant": "Supermercado Extra",
  "category": "alimentação"
}`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      temperature: 0.2, // Reduzido para mais precisão
      max_tokens: 500,
      response_format: { type: "json_object" } // Forçar resposta JSON
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    // Extrair JSON da resposta (pode vir com texto adicional)
    let extractedData
    try {
      // Tentar parsear diretamente
      extractedData = JSON.parse(responseText)
    } catch {
      // Se falhar, procurar por JSON no texto
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Não foi possível extrair dados estruturados do comprovante')
      }
    }

    // Validar dados extraídos
    if (!extractedData.description || !extractedData.amount) {
      return NextResponse.json(
        { error: 'Não foi possível extrair informações suficientes do comprovante' },
        { status: 400 }
      )
    }

    // Garantir que amount seja número
    extractedData.amount = parseFloat(extractedData.amount)

    // Se for despesa, garantir que seja negativo
    if (type === 'expense' && extractedData.amount > 0) {
      extractedData.amount = -Math.abs(extractedData.amount)
    }

    // Se não tiver data, usar hoje
    if (!extractedData.date) {
      extractedData.date = new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: extractedData
    })

  } catch (error: any) {
    console.error('Erro na análise de comprovante:', error)
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Chave da API OpenAI inválida ou não configurada' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Erro ao processar comprovante' },
      { status: 500 }
    )
  }
}
