import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para operações administrativas
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Cron Job: Verificação de Metas Financeiras
 * Executa todos os dias às 12:00 PM UTC (9:00 AM BRT)
 * 
 * Funções:
 * - Verifica progresso das metas
 * - Identifica metas próximas da data limite
 * - Cria notificações para usuários
 */
export async function GET(request: NextRequest) {
    // Verificar se é uma requisição do Vercel Cron
    const authHeader = request.headers.get('authorization')
    const userAgent = request.headers.get('user-agent')

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

    console.log('🎯 [CRON] Starting goals check job:', new Date().toISOString())

    try {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        // Calcular datas para verificação
        const sevenDaysFromNow = new Date(today)
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
        const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0]

        // 1. Buscar metas ativas
        const { data: goals, error: goalsError } = await supabaseAdmin
            .from('goals')
            .select('*')
            .eq('status', 'active')

        if (goalsError) {
            console.error('❌ [CRON] Error fetching goals:', goalsError)
            throw goalsError
        }

        console.log(`📋 [CRON] Found ${goals?.length || 0} active goals to check`)

        let notificationsCreated = 0
        let goalsCompleted = 0
        let goalsNearDeadline = 0

        if (goals && goals.length > 0) {
            for (const goal of goals) {
                const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0

                // Verificar se a meta foi atingida
                if (goal.current >= goal.target) {
                    goalsCompleted++

                    // Atualizar status para completo
                    await supabaseAdmin
                        .from('goals')
                        .update({
                            status: 'completed',
                            completed_at: todayStr
                        })
                        .eq('id', goal.id)

                    // Criar notificação de conclusão
                    await createNotification(
                        goal.user_id,
                        'goal_completed',
                        `🎉 Parabéns! Você atingiu sua meta "${goal.name}"!`,
                        { goal_id: goal.id, goal_name: goal.name }
                    )
                    notificationsCreated++
                }
                // Verificar se está próximo da data limite
                else if (goal.deadline && goal.deadline <= sevenDaysStr && goal.deadline >= todayStr) {
                    goalsNearDeadline++

                    const daysRemaining = Math.ceil(
                        (new Date(goal.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    )

                    // Verificar se já não enviou notificação hoje
                    const { data: existingNotif } = await supabaseAdmin
                        .from('notifications')
                        .select('id')
                        .eq('user_id', goal.user_id)
                        .eq('type', 'goal_deadline')
                        .gte('created_at', todayStr)
                        .limit(1)

                    if (!existingNotif || existingNotif.length === 0) {
                        await createNotification(
                            goal.user_id,
                            'goal_deadline',
                            `⏰ Sua meta "${goal.name}" vence em ${daysRemaining} dias! Progresso: ${progress.toFixed(0)}%`,
                            { goal_id: goal.id, goal_name: goal.name, days_remaining: daysRemaining }
                        )
                        notificationsCreated++
                    }
                }
                // Verificar metas com progresso estagnado (menos de 25% após metade do tempo)
                else if (goal.created_at && goal.deadline) {
                    const totalDays = (new Date(goal.deadline).getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)
                    const daysElapsed = (today.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)
                    const timeProgress = (daysElapsed / totalDays) * 100

                    if (timeProgress >= 50 && progress < 25) {
                        // Verificar se já não enviou notificação esta semana
                        const weekAgo = new Date(today)
                        weekAgo.setDate(weekAgo.getDate() - 7)

                        const { data: existingNotif } = await supabaseAdmin
                            .from('notifications')
                            .select('id')
                            .eq('user_id', goal.user_id)
                            .eq('type', 'goal_stagnant')
                            .gte('created_at', weekAgo.toISOString())
                            .limit(1)

                        if (!existingNotif || existingNotif.length === 0) {
                            await createNotification(
                                goal.user_id,
                                'goal_stagnant',
                                `💡 Sua meta "${goal.name}" precisa de atenção! Você está em ${progress.toFixed(0)}% mas já passou metade do tempo.`,
                                { goal_id: goal.id, goal_name: goal.name }
                            )
                            notificationsCreated++
                        }
                    }
                }
            }
        }

        const result = {
            success: true,
            timestamp: new Date().toISOString(),
            job: 'check-goals',
            results: {
                goalsChecked: goals?.length || 0,
                goalsCompleted,
                goalsNearDeadline,
                notificationsCreated
            }
        }

        console.log('✅ [CRON] Goals check job completed:', result)

        return NextResponse.json(result)
    } catch (error) {
        console.error('❌ [CRON] Goals check job failed:', error)

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
 * Cria uma notificação no banco de dados
 */
async function createNotification(
    userId: string,
    type: string,
    message: string,
    metadata?: Record<string, any>
) {
    try {
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title: type === 'goal_completed' ? 'Meta Atingida!' :
                    type === 'goal_deadline' ? 'Meta Próxima do Prazo' :
                        'Atenção à sua Meta',
                message,
                metadata,
                read: false
            })
    } catch (error) {
        console.error('Error creating notification:', error)
    }
}
