"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Mail, X } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { isEmailConfirmed, getDaysSinceRegistration } from '@/lib/email-confirmation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

/**
 * EmailConfirmationBanner - Displays a warning when user's email is not confirmed
 * Shows at the top of the dashboard and other authenticated pages
 */
export function EmailConfirmationBanner() {
  const { userProfile, loading } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)

  // Check localStorage for dismissed state
  useEffect(() => {
    const isDismissed = localStorage.getItem('email-confirmation-banner-dismissed') === 'true'
    setDismissed(isDismissed)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('email-confirmation-banner-dismissed', 'true')
  }

  const handleResendEmail = async () => {
    if (!userProfile?.email) {
      toast.error('Email do usuário não encontrado')
      return
    }

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userProfile.email,
      })

      if (error) {
        throw error
      }

      toast.success('Email de confirmação reenviado! Verifique sua caixa de entrada.')
    } catch (error: any) {
      console.error('Error resending confirmation email:', error)
      toast.error(error.message || 'Erro ao reenviar email. Tente novamente mais tarde.')
    } finally {
      setResending(false)
    }
  }

  // Don't show if loading, dismissed, or email is confirmed
  if (loading || dismissed || !userProfile || isEmailConfirmed(userProfile)) {
    return null
  }

  const daysSinceRegistration = getDaysSinceRegistration(userProfile)

  return (
    <Alert variant="destructive" className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950">
      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertTitle className="text-orange-900 dark:text-orange-100 flex items-center justify-between">
        <span>Email não confirmado</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-200"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <p>
            Por favor, confirme seu endereço de email para ter acesso completo à plataforma.
            {daysSinceRegistration !== null && daysSinceRegistration > 1 && (
              <span className="block mt-1 text-sm">
                Cadastro realizado há {daysSinceRegistration} dia(s). Verifique sua caixa de entrada e spam.
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-orange-600 text-orange-600 hover:bg-orange-100 hover:text-orange-800 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900"
          onClick={handleResendEmail}
          disabled={resending}
        >
          <Mail className="h-4 w-4 mr-2" />
          {resending ? 'Enviando...' : 'Reenviar email'}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
