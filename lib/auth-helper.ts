/**
 * Helper functions for authentication and user context
 * Centralizes user ID retrieval to avoid redundant Supabase calls
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

/**
 * Get authenticated user ID from Supabase session
 * Use this only when you don't have access to AuthContext
 * 
 * @deprecated Prefer getting userId from useAuth() context when possible
 * @returns User ID or null if not authenticated
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.error('[AUTH_HELPER] Error getting user:', error)
      return null
    }
    
    return user?.id || null
  } catch (error) {
    logger.error('[AUTH_HELPER] Exception getting user:', error)
    return null
  }
}

/**
 * Require authenticated user ID, throws if not authenticated
 * Use this for operations that MUST have a user
 * 
 * @deprecated Prefer getting userId from useAuth() context when possible
 * @throws Error if user is not authenticated
 * @returns User ID
 */
export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId()
  
  if (!userId) {
    throw new Error('User must be authenticated for this operation')
  }
  
  return userId
}

/**
 * Type guard to ensure userId is provided
 * Useful for API functions that accept optional userId
 */
export function ensureUserId(userId: string | null | undefined): string {
  if (!userId) {
    throw new Error('User ID is required but not provided')
  }
  return userId
}
