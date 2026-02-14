'use server'

import { createClient } from '@/utils/supabase/server'
import { translateSupabaseError } from '@/utils/error_handling'

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: translateSupabaseError(error) }
  }

  return { success: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.' }
}
