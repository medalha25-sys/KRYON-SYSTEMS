'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Service } from '@/types/agenda'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getServices() {
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
    .from('agenda_services')
    .select('*')
    .eq('organization_id', orgId)
    .order('name')

  return (data || []) as Service[]
}

export async function createServiceAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const duration = parseInt(formData.get('duration_minutes') as string) || 30
  const price = parseFloat(formData.get('price') as string) || 0

  if (!name) return { error: 'Nome é obrigatório' }

  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
  const orgId = profile.organization_id

  const { error } = await supabase.from('agenda_services').insert({
    organization_id: orgId,
    name,
    duration_minutes: duration,
    price
  })

  if (error) {
    console.error('Create service error:', error)
    return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/agenda-facil/servicos')
  return { success: true }
}

// Update and Delete actions would follow similar pattern...
export async function updateServiceAction(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
  
    const name = formData.get('name') as string
    const duration = parseInt(formData.get('duration_minutes') as string)
    const price = parseFloat(formData.get('price') as string)
  
    // Get Organization ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
    
    if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
    const orgId = profile.organization_id
  
    const { error } = await supabase
      .from('agenda_services')
      .update({ name, duration_minutes: duration, price })
      .eq('id', id)
      .eq('organization_id', orgId)
  
    if (error) {
        console.error('Update service error:', error)
        return { error: translateSupabaseError(error) }
    }
    revalidatePath('/products/agenda-facil/servicos')
    return { success: true }
}

export async function deleteServiceAction(id: string) {
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
      .from('agenda_services')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId)
  
    if (error) {
        console.error('Delete service error:', error)
        return { error: translateSupabaseError(error) }
    }
    revalidatePath('/products/agenda-facil/servicos')
    return { success: true }
}
