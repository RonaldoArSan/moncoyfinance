/**
 * Utility functions for email confirmation checking
 */

import type { User } from '@/lib/supabase/types'

/**
 * Check if a user's email has been confirmed
 * @param user - The user object from the database
 * @returns true if email is confirmed, false otherwise
 */
export function isEmailConfirmed(user: User | null): boolean {
  if (!user) return false
  return !!user.email_confirmed_at
}

/**
 * Get the email confirmation status message
 * @param user - The user object from the database
 * @returns A user-friendly message about email confirmation status
 */
export function getEmailConfirmationMessage(user: User | null): string {
  if (!user) {
    return 'Usuário não encontrado'
  }
  
  if (!user.email_confirmed_at) {
    return 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email para continuar.'
  }
  
  return 'Email confirmado'
}

/**
 * Check if email confirmation is required and not completed
 * @param user - The user object from the database
 * @returns true if confirmation is pending, false if confirmed or not required
 */
export function isEmailConfirmationPending(user: User | null): boolean {
  return !isEmailConfirmed(user)
}

/**
 * Get days since email was sent (assuming registration_date as email send date)
 * @param user - The user object from the database
 * @returns Number of days since registration, or null if user is null
 */
export function getDaysSinceRegistration(user: User | null): number | null {
  if (!user?.registration_date) return null
  
  const registrationDate = new Date(user.registration_date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - registrationDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}
