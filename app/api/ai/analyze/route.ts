import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactions, type, userPlan } = body

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'Transações inválidas' },
        { status: 400 }
      )
    }

    // Selecionar modelo baseado no plano
    const model = userPlan === 'premium' ? 'gpt-4o' : 'gpt-4o-mini'

    // Preparar prompt baseado no tipo de análise
    let systemPrompt = ''
    let userPrompt = ''

    switch (type) {
      case 'spending_analysis':
        systemPrompt = 'Você é um assistente financeiro especializado em análise de gastos. Analise os dados fornecidos e forneça insights práticos em português.'
        userPrompt = `Analise estas transações e forneça:
1. Resumo dos gastos por categoria
2. Padrões de consumo identificados
3. Sugestões de economia

Transações: ${JSON.stringify(transactions.slice(0, 50))}`
        break

      case 'monthly':
        systemPrompt = 'Você é um consultor financeiro. Forneça uma análise mensal detalhada em português.'
        userPrompt = `Analise este mês financeiro:
- Total de receitas: R$ ${transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0).toFixed(2)}
- Total de despesas: R$ ${transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0).toFixed(2)}
- Número de transações: ${transactions.length}

Forneça insights sobre saúde financeira, áreas de atenção e recomendações.`
        break

      case 'savings_opportunities':
        systemPrompt = 'Você é um especialista em economia e otimização de gastos. Identifique oportunidades de economia em português.'
        userPrompt = `Baseado nestas transações, identifique:
1. Gastos que podem ser reduzidos
2. Assinaturas ou gastos recorrentes desnecessários
3. Melhores práticas para economizar

Transações: ${JSON.stringify(transactions.slice(0, 50))}`
        break

      default:
        systemPrompt = 'Você é um assistente financeiro. Analise os dados e forneça insights em português.'
        userPrompt = `Analise estas transações: ${JSON.stringify(transactions.slice(0, 50))}`
    }

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const analysis = completion.choices[0]?.message?.content || 'Análise não disponível'

    return NextResponse.json({
      analysis: {
        summary: analysis,
        model,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Erro na análise de IA:', error)
    
    // Tratar erro de API key
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Chave da API OpenAI inválida ou não configurada' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Erro ao processar análise de IA' },
      { status: 500 }
    )
  }
}
