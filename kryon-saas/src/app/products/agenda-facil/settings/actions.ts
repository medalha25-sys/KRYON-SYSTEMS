'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

function translateSupabaseError(error: any): string {
  if (!error) return 'Erro desconhecido'
  console.error('Supabase Error:', error)
  return error.message || 'Erro ao processar solicitação'
}

export async function updatePublicBookingSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  // Get Organization ID
  const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
  
  if (!profile || !profile.organization_id) return { error: 'Não autorizado' }
  const orgId = profile.organization_id

  const public_booking_enabled = formData.get('public_booking_enabled') === 'on'
  const primary_color = formData.get('primary_color') as string
  const secondary_color = formData.get('secondary_color') as string
  const welcome_message = formData.get('welcome_message') as string

  const { error } = await supabase
    .from('organizations')
    .update({
        public_booking_enabled,
        primary_color,
        secondary_color,
        welcome_message
    })
    .eq('id', orgId)

  if (error) {
    return { error: translateSupabaseError(error) }
  }

  revalidatePath('/products/agenda-facil/settings')
  revalidatePath('/book/[slug]', 'page') // Invalidate public pages? Hard to know slug here without fetching.
  // We should ideally fetch slug to revalidate specific path or just rely on dynamic rendering (it is dynamic).

  return { success: true }
}
