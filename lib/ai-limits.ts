/**
 * AI Usage Tracking - Server-Side Implementation
 * 
 * This module provides utilities for checking and managing AI usage limits.
 * Usage is now tracked server-side via the /api/ai/usage endpoint.
 * 
 * @deprecated Old localStorage-based functions are kept for backward compatibility
 * but should not be used in new code.
 */

export interface AIUsageResponse {
  allowed: boolean
  remaining: number
  limit: number
  used: number
  resetDate: string
  plan: string
  lastQuestionDate?: string | null
}

/**
 * Check AI usage limit for current user (server-side)
 * @returns Promise with usage information
 */
export async function checkAILimit(): Promise<AIUsageResponse> {
  try {
    const response = await fetch('/api/ai/usage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao verificar limite de IA')
    }

    return await response.json()
  } catch (error) {
    logger.error('Error checking AI limit:', error)
    throw error
  }
}

/**
 * Increment AI usage counter for current user (server-side)
 * @returns Promise with updated usage information
 */
export async function incrementAIUsage(): Promise<{ success: boolean; remaining: number; used: number; limit: number }> {
  try {
    const response = await fetch('/api/ai/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao incrementar uso de IA')
    }

    return await response.json()
  } catch (error) {
    logger.error('Error incrementing AI usage:', error)
    throw error
  }
}

// ========================================
// DEPRECATED: Legacy localStorage-based functions
// Kept for backward compatibility only
// ========================================

export interface AIUsage {
  count: number
  lastReset: string
  plan: string
}

/**
 * @deprecated Use server-side checkAILimit() instead
 */
export function getAIUsageKey(userId: string): string {
  return `ai_usage_${userId}`
}

/**
 * @deprecated Use server-side checkAILimit() instead
 */
export function checkAILimitLocal(plan: string, currentUsage: AIUsage): { allowed: boolean; remaining: number; resetDate: Date } {
  const now = new Date()
  const lastReset = new Date(currentUsage.lastReset)
  
  let limit = 0
  let resetPeriod = 'week' // default
  
  switch (plan) {
    case 'basic':
      limit = 5
      resetPeriod = 'week'
      break
    case 'pro':
    case 'professional':
      limit = 7
      resetPeriod = 'week'
      break
    case 'premium':
      limit = 50
      resetPeriod = 'month'
      break
  }
  
  // Calculate next reset date
  let nextReset = new Date(lastReset)
  if (resetPeriod === 'week') {
    nextReset.setDate(lastReset.getDate() + 7)
  } else {
    nextReset.setMonth(lastReset.getMonth() + 1)
  }
  
  // Check if we need to reset the counter
  const shouldReset = now >= nextReset
  const count = shouldReset ? 0 : currentUsage.count
  
  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
    resetDate: shouldReset ? now : nextReset
  }
}

/**
 * @deprecated Use server-side incrementAIUsage() instead
 */
export function incrementAIUsageLocal(currentUsage: AIUsage): AIUsage {
  return {
    ...currentUsage,
    count: currentUsage.count + 1
  }
}