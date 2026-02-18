'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Client } from '@/types/agenda'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getClients(query?: string) {
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
    .from('agenda_clients')
    .select('*')
    .eq('organization_id', orgId)
    .order('name')

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data } = await dbQuery
  return (data || []) as Client[]
}
export async function getClient(id: string) {
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

  const { data, error } = await supabase
    .from('agenda_clients')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()
  
  if (error) {
      console.error(error)
      return { error: 'Paciente não encontrado' }
  }
  return { data: data as Client }
}

export async function getPatientAppointments(clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // RLS handles security (Professional sees only linked, Secretary sees all)
    const { data, error } = await supabase
        .from('agenda_appointments')
        .select(`
            *,
            professionals:professional_id(name),
            services:service_id(name, duration_minutes, price)
        `)
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })
    
    if (error) {
        console.error('Error fetching appointments:', error)
        return []
    }
    return data
}

export async function getPatientRecords(clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('clinical_records')
        .select(`
            *,
            professional:professional_id(name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

    if (error) {
        // If RLS denies access (Secretary), it might return error or empty.
        // We should handle it gracefully.
        console.error('Error fetching records:', error)
        return []
    }
    return data
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const cpf = formData.get('cpf') as string
  const birth_date = formData.get('birth_date') as string
  const consent_lgpd = formData.get('consent_lgpd') === 'on'
  const notes = formData.get('notes') as string

  if (!name) return { error: 'Nome é obrigatório' }

  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
  const orgId = profile.organization_id

  const { error } = await supabase.from('agenda_clients').insert({
    organization_id: orgId,
    name,
    phone,
    email,
    cpf,
    birth_date: birth_date || null,
    consent_lgpd,
    notes
  })

  if (error) {
    console.error('Create client error:', error)
    return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/agenda-facil/clientes')
  return { success: true }
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const cpf = formData.get('cpf') as string
  const birth_date = formData.get('birth_date') as string
  const consent_lgpd = formData.get('consent_lgpd') === 'on'
  const notes = formData.get('notes') as string

  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
  const orgId = profile.organization_id

  const { error } = await supabase
    .from('agenda_clients')
    .update({ 
        name, 
        phone, 
        email, 
        cpf,
        birth_date: birth_date || null,
        consent_lgpd,
        notes 
    })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) {
      console.error('Update client error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/agenda-facil/clientes')
  return { success: true }
}

export async function deleteClientAction(id: string) {
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
    .from('agenda_clients')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) {
      console.error('Delete client error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/agenda-facil/clientes')
  return { success: true }
}
