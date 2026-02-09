/**
 * Configuração centralizada de administradores
 * Esta é a única fonte de verdade para verificação de permissões admin
 */

import { logger } from '@/lib/logger'

/**
 * Lista de emails autorizados como administradores
 * IMPORTANTE: Configurar via variáveis de ambiente em produção
 */
export const ADMIN_EMAILS: string[] = [
  'admin@financeira.com',
  'ronald@financeira.com',
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
].filter((email): email is string => Boolean(email))

/**
 * Configuração de administração
 */
export const ADMIN_CONFIG = {
  /**
   * Lista de emails admin (somente leitura)
   */
  get emails(): readonly string[] {
    return ADMIN_EMAILS
  },

  /**
   * Verifica se um email pertence a um administrador
   * @param email - Email do usuário
   * @returns true se o email está na lista de admins
   */
  isAdmin(email: string | null | undefined): boolean {
    if (!email) {
      return false
    }

    const normalizedEmail = email.toLowerCase().trim()
    const isAdminUser = ADMIN_EMAILS.some(
      adminEmail => adminEmail.toLowerCase().trim() === normalizedEmail
    )

    logger.dev('[ADMIN_CONFIG] Admin check:', { email: normalizedEmail, isAdmin: isAdminUser })

    return isAdminUser
  },

  /**
   * Verifica se um usuário tem permissões de admin
   * @param user - Objeto do usuário com email
   * @returns true se o usuário é admin
   */
  isUserAdmin(user: { email?: string | null } | null | undefined): boolean {
    if (!user?.email) {
      return false
    }
    return this.isAdmin(user.email)
  },

  /**
   * Retorna a quantidade de admins configurados
   */
  get adminCount(): number {
    return ADMIN_EMAILS.length
  },

  /**
   * Valida se pelo menos um admin está configurado
   */
  hasAdmins(): boolean {
    const hasValidAdmins = ADMIN_EMAILS.length > 0
    if (!hasValidAdmins) {
      logger.warn('[ADMIN_CONFIG] Nenhum email de admin configurado!')
    }
    return hasValidAdmins
  }
} as const

/**
 * Hook helper para componentes React
 * @deprecated Use ADMIN_CONFIG diretamente
 */
export function useAdminCheck(email: string | null | undefined): boolean {
  return ADMIN_CONFIG.isAdmin(email)
}

// Log inicial com informações de configuração (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  logger.dev('[ADMIN_CONFIG] Initialized with', ADMIN_CONFIG.adminCount, 'admin(s)')
  logger.dev('[ADMIN_CONFIG] Admin emails:', ADMIN_EMAILS)
}
