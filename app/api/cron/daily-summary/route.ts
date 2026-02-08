import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Inicialização lazy do cliente Supabase Admin
let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdmin) {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase environment variables for admin client')
        }
        supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )
    }
    return supabaseAdmin
}

/**
 * Cron Job: Resumo Diário e Transações Recorrentes
 * Executa todos os dias às 6:00 AM UTC (3:00 AM BRT)
 * 
 * Funções:
 * - Processa transações recorrentes agendadas para hoje
 * - Calcula resumos financeiros diários
 */
export async function GET(request: NextRequest) {
    // Verificar se é uma requisição do Vercel Cron
    const authHeader = request.headers.get('authorization')
    const userAgent = request.headers.get('user-agent')

    // Em produção, verificar se é do Vercel Cron ou tem a chave secreta
    if (process.env.NODE_ENV === 'production') {
        const isVercelCron = userAgent === 'vercel-cron/1.0'
        const hasValidSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`

        if (!isVercelCron && !hasValidSecret) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
    }

    console.log('🕐 [CRON] Starting daily summary job:', new Date().toISOString())

    try {
        const supabase = getSupabaseAdmin()
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        // 1. Buscar transações recorrentes que devem ser criadas hoje
        const { data: commitments, error: commitmentsError } = await supabase
            .from('commitments')
            .select('*')
            .eq('active', true)
            .lte('next_occurrence', todayStr)

        if (commitmentsError) {
            console.error('❌ [CRON] Error fetching commitments:', commitmentsError)
        }

        let createdTransactions = 0

        if (commitments && commitments.length > 0) {
            console.log(`📋 [CRON] Found ${commitments.length} commitments to process`)

            for (const commitment of commitments) {
                // Criar transação a partir do compromisso
                const { error: insertError } = await supabase
                    .from('transactions')
                    .insert({
                        user_id: commitment.user_id,
                        amount: commitment.type === 'expense' ? -Math.abs(commitment.amount) : Math.abs(commitment.amount),
                        type: commitment.type,
                        category_id: commitment.category_id,
                        description: `${commitment.description} (Automático)`,
                        date: todayStr,
                        source: 'recurring'
                    })

                if (!insertError) {
                    createdTransactions++

                    // Calcular próxima ocorrência
                    const nextDate = calculateNextOccurrence(new Date(commitment.next_occurrence), commitment.frequency)

                    await supabase
                        .from('commitments')
                        .update({
                            next_occurrence: nextDate.toISOString().split('T')[0],
                            last_processed: todayStr
                        })
                        .eq('id', commitment.id)
                } else {
                    console.error(`❌ [CRON] Error creating transaction for commitment ${commitment.id}:`, insertError)
                }
            }
        }

        // 2. Calcular estatísticas do dia anterior para todos os usuários
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const { data: dailyStats, error: statsError } = await supabase
            .from('transactions')
            .select('user_id, amount, type')
            .gte('date', yesterdayStr)
            .lt('date', todayStr)

        if (!statsError && dailyStats) {
            // Agrupar por usuário
            const userStats = dailyStats.reduce((acc: any, tx: any) => {
                if (!acc[tx.user_id]) {
                    acc[tx.user_id] = { income: 0, expense: 0 }
                }
                if (tx.type === 'income') {
                    acc[tx.user_id].income += Math.abs(tx.amount)
                } else {
                    acc[tx.user_id].expense += Math.abs(tx.amount)
                }
                return acc
            }, {})

            console.log(`📊 [CRON] Daily stats calculated for ${Object.keys(userStats).length} users`)
        }

        const result = {
            success: true,
            timestamp: new Date().toISOString(),
            job: 'daily-summary',
            results: {
                commitmentsProcessed: commitments?.length || 0,
                transactionsCreated: createdTransactions
            }
        }

        console.log('✅ [CRON] Daily summary job completed:', result)

        return NextResponse.json(result)
    } catch (error) {
        console.error('❌ [CRON] Daily summary job failed:', error)

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}

/**
 * Calcula a próxima ocorrência baseada na frequência
 */
function calculateNextOccurrence(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate)

    switch (frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1)
            break
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7)
            break
        case 'biweekly':
            nextDate.setDate(nextDate.getDate() + 14)
            break
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1)
            break
        case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3)
            break
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1)
            break
        default:
            nextDate.setMonth(nextDate.getMonth() + 1)
    }

    return nextDate
}
