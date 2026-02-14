'use server'

import { createClient } from '@/utils/supabase/server'
import { translateSupabaseError } from '@/utils/error_handling'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: translateSupabaseError(error) }
  }

  return { success: 'Senha atualizada com sucesso! Você já pode entrar no sistema.' }
}
