'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Professional } from '@/types/agenda'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getProfessionals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return []
  const orgId = profile.organization_id

  const { data } = await supabase
    .from('agenda_professionals')
    .select('*')
    .eq('organization_id', orgId)
    .order('name')

  return (data || []) as Professional[]
}

export async function createProfessionalAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const specialty = formData.get('specialty') as string

  if (!name) return { error: 'Nome é obrigatório' }

  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
  const orgId = profile.organization_id

  const { error } = await supabase.from('agenda_professionals').insert({
    organization_id: orgId,
    name,
    specialty
  })

  if (error) {
    console.error('Create professional error:', error)
    return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/agenda-facil/profissionais')
  return { success: true }
}

export async function updateProfessionalAction(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
  
    const name = formData.get('name') as string
    const specialty = formData.get('specialty') as string
  
  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
  const orgId = profile.organization_id

  const { error } = await supabase
    .from('agenda_professionals')
    .update({ name, specialty })
    .eq('id', id)
    .eq('organization_id', orgId)
  
    if (error) {
        console.error('Update professional error:', error)
        return { error: translateSupabaseError(error) }
    }
    revalidatePath('/products/agenda-facil/profissionais')
    return { success: true }
}

export async function deleteProfessionalAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
  
  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
  const orgId = profile.organization_id

  const { error } = await supabase
    .from('agenda_professionals')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId)
  
    if (error) {
        console.error('Delete professional error:', error)
        return { error: translateSupabaseError(error) }
    }
    revalidatePath('/products/agenda-facil/profissionais')
    return { success: true }
}
