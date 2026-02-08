import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para operações administrativas
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Cron Job: Limpeza e Manutenção
 * Executa toda segunda-feira às 3:00 AM UTC (0:00 AM BRT)
 * 
 * Funções:
 * - Remove notificações lidas com mais de 30 dias
 * - Limpa logs de atividade antigos
 * - Arquiva transações muito antigas (opcional)
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

    console.log('🧹 [CRON] Starting cleanup job:', new Date().toISOString())

    try {
        const today = new Date()

        // Calcular datas para limpeza
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

        const ninetyDaysAgo = new Date(today)
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        const ninetyDaysAgoStr = ninetyDaysAgo.toISOString()

        let deletedNotifications = 0
        let deletedLogs = 0
        let archivedItems = 0

        // 1. Remover notificações lidas com mais de 30 dias
        const { data: notifData, error: notifError } = await supabaseAdmin
            .from('notifications')
            .delete()
            .eq('read', true)
            .lt('created_at', thirtyDaysAgoStr)
            .select('id')

        if (!notifError && notifData) {
            deletedNotifications = notifData.length
            console.log(`🗑️ [CRON] Deleted ${deletedNotifications} old read notifications`)
        }

        // 2. Remover notificações não lidas com mais de 90 dias
        const { data: oldNotifData, error: oldNotifError } = await supabaseAdmin
            .from('notifications')
            .delete()
            .lt('created_at', ninetyDaysAgoStr)
            .select('id')

        if (!oldNotifError && oldNotifData) {
            deletedNotifications += oldNotifData.length
            console.log(`🗑️ [CRON] Deleted ${oldNotifData.length} very old notifications`)
        }

        // 3. Verificar e limpar tabela de logs de atividade (se existir)
        try {
            const { data: logsData, error: logsError } = await supabaseAdmin
                .from('activity_logs')
                .delete()
                .lt('created_at', ninetyDaysAgoStr)
                .select('id')

            if (!logsError && logsData) {
                deletedLogs = logsData.length
                console.log(`🗑️ [CRON] Deleted ${deletedLogs} old activity logs`)
            }
        } catch (e) {
            // Tabela pode não existir, ignorar erro
            console.log('📝 [CRON] Activity logs table not found, skipping')
        }

        // 4. Atualizar estatísticas de cache (se houver)
        try {
            const { error: cacheError } = await supabaseAdmin
                .from('cache_stats')
                .delete()
                .lt('created_at', thirtyDaysAgoStr)

            if (!cacheError) {
                console.log('🗑️ [CRON] Cleaned old cache stats')
            }
        } catch (e) {
            // Tabela pode não existir
        }

        // 5. Marcar compromissos expirados como inativos
        const { data: expiredCommitments, error: expError } = await supabaseAdmin
            .from('commitments')
            .update({ active: false })
            .eq('active', true)
            .not('end_date', 'is', null)
            .lt('end_date', today.toISOString().split('T')[0])
            .select('id')

        if (!expError && expiredCommitments) {
            archivedItems = expiredCommitments.length
            console.log(`📦 [CRON] Archived ${archivedItems} expired commitments`)
        }

        const result = {
            success: true,
            timestamp: new Date().toISOString(),
            job: 'cleanup',
            results: {
                deletedNotifications,
                deletedLogs,
                archivedItems
            }
        }

        console.log('✅ [CRON] Cleanup job completed:', result)

        return NextResponse.json(result)
    } catch (error) {
        console.error('❌ [CRON] Cleanup job failed:', error)

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
