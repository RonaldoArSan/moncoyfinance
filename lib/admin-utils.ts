/**
 * Utilitários para gerenciamento de usuários admin
 * 
 * IMPORTANTE: Execute os scripts SQL de migração antes de usar estas funções
 */

// Update the import path to the correct relative location
import { createClient } from '../lib/supabase/server'
import { logger } from './logger'
import { ADMIN_CONFIG } from './admin-config'

export interface AdminUser {
  id: string
  email: string
  name: string
  roles: string[]
  created_at: string
  last_login?: string
  is_active: boolean
}

export const adminUtils = {
  /**
   * Verificar se um usuário é admin
   */
  async isUserAdmin(userId: string): Promise<boolean> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    const roles = data?.map(r => r.role) || []
    return roles.includes('admin') || roles.includes('super_admin')
  },

  /**
   * Listar todos os admins
   */
  async listAdmins(): Promise<AdminUser[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        created_at,
        last_login,
        is_active,
        user_roles(role)
      `)
      .eq('user_roles.role', 'admin')
      .or('user_roles.role.eq.super_admin')

    if (error) {
      console.error('Error listing admins:', error)
      return []
    }

    return data?.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.user_roles?.map((r: any) => r.role) || [],
      created_at: user.created_at,
      last_login: user.last_login,
      is_active: user.is_active
    })) || []
  },

  /**
   * Promover usuário para admin
   */
  async promoteToAdmin(userId: string, role: 'admin' | 'super_admin' = 'admin'): Promise<boolean> {
    const supabase = await createClient()
    
    // Verificar se o usuário atual é super admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    const isSuperAdmin = await this.isUserSuperAdmin(currentUser.id)
    if (!isSuperAdmin) {
      throw new Error('Apenas super admins podem promover usuários')
    }

    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role,
        granted_by: currentUser.id
      }, {
        onConflict: 'user_id,role'
      })

    if (error) {
      console.error('Error promoting user to admin:', error)
      return false
    }

    // Log da ação
    await supabase.rpc('log_admin_action', {
      action_name: 'promote_user',
      target_user: userId,
      action_details: { role, promoted_by: currentUser.id }
    })

    return true
  },

  /**
   * Remover role admin de um usuário
   */
  async demoteFromAdmin(userId: string): Promise<boolean> {
    const supabase = await createClient()
    
    // Verificar se o usuário atual é super admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    const isSuperAdmin = await this.isUserSuperAdmin(currentUser.id)
    if (!isSuperAdmin) {
      throw new Error('Apenas super admins podem remover admins')
    }

    // Não permitir que um super admin remova a si mesmo
    if (userId === currentUser.id) {
      throw new Error('Não é possível remover suas próprias permissões')
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['admin', 'super_admin'])

    if (error) {
      console.error('Error demoting user from admin:', error)
      return false
    }

    // Garantir que o usuário tenha pelo menos a role 'user'
    await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'user',
        granted_by: currentUser.id
      }, {
        onConflict: 'user_id,role'
      })

    // Log da ação
    await supabase.rpc('log_admin_action', {
      action_name: 'demote_user',
      target_user: userId,
      action_details: { demoted_by: currentUser.id }
    })

    return true
  },

  /**
   * Verificar se um usuário é super admin
   */
  async isUserSuperAdmin(userId: string): Promise<boolean> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .single()

    if (error) {
      return false
    }

    return !!data
  },

  /**
   * Buscar logs de auditoria admin
   */
  async getAuditLogs(limit: number = 50): Promise<any[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select(`
        *,
        admin_user:users!admin_user_id(name, email),
        target_user:users!target_user_id(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }

    return data || []
  }
}

/**
 * Hook para usar em componentes React
 */
export function useAdminUtils() {
  return adminUtils
}