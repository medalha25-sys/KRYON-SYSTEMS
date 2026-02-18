'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { PetAppointment, Pet } from '@/types/gestao-pet'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getPetAppointments(date?: string) {
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
  
  let dbQuery = supabase
    .from('pet_appointments')
    .select(`
        *,
        pets (id, name, owner_id, pet_owners(name))
    `)
    .eq('organization_id', orgId)
    .eq('product_slug', 'gestao-pet')
    .order('appointment_date')

  if (date) {
      // Filter by specific date (ignoring time for the day match)
      const startDate = `${date}T00:00:00`
      const endDate = `${date}T23:59:59`
      dbQuery = dbQuery.gte('appointment_date', startDate).lte('appointment_date', endDate)
  }

  const { data, error } = await dbQuery
  
  if (error) console.error('Error fetching appointments:', error)

  return (data || []) as unknown as PetAppointment[]
}

export async function getPetsForSelect() {
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
        .from('pets')
        .select('id, name, owner_id, pet_owners(name)')
        .eq('organization_id', orgId)
        .eq('product_slug', 'gestao-pet')
        .order('name')
    return (data || []) as unknown as Pet[]
}

export async function createPetAppointmentAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const pet_id = formData.get('pet_id') as string
  const service = formData.get('service') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const status = formData.get('status') as string

  if (!pet_id || !service || !date || !time) return { error: 'Todos os campos são obrigatórios' }

  const appointment_date = new Date(`${date}T${time}`).toISOString()

  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
  const orgId = profile.organization_id

  const { error } = await supabase.from('pet_appointments').insert({
    organization_id: orgId, 
    product_slug: 'gestao-pet',
    pet_id,
    service,
    appointment_date,
    status
  })

  if (error) {
      console.error('Create appointment error:', error)
      return { error: translateSupabaseError(error) }
  }
  
  revalidatePath('/products/gestao-pet/agendamentos')
  return { success: true }
}

export async function updatePetAppointmentAction(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const pet_id = formData.get('pet_id') as string
  const service = formData.get('service') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const status = formData.get('status') as string

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

  const appointment_date = new Date(`${date}T${time}`).toISOString()

  const { error } = await supabase
    .from('pet_appointments')
    .update({ pet_id, service, appointment_date, status })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) {
      console.error('Update appointment error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/gestao-pet/agendamentos')
  return { success: true }
}

export async function deletePetAppointmentAction(id: string) {
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
    .from('pet_appointments')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) {
      console.error('Delete appointment error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/gestao-pet/agendamentos')
  return { success: true }
}
