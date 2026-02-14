'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Client } from '@/types/agenda'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getClients(query?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let dbQuery = supabase
    .from('agenda_clients')
    .select('*')
    .eq('tenant_id', user.id)
    .order('name')

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data } = await dbQuery
  return (data || []) as Client[]
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const notes = formData.get('notes') as string

  if (!name) return { error: 'Nome é obrigatório' }

  const { error } = await supabase.from('agenda_clients').insert({
    tenant_id: user.id,
    product_slug: 'agenda-facil',
    name,
    phone,
    email,
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
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('agenda_clients')
    .update({ name, phone, email, notes })
    .eq('id', id)
    .eq('tenant_id', user.id)

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

  const { error } = await supabase
    .from('agenda_clients')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) {
      console.error('Delete client error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/agenda-facil/clientes')
  return { success: true }
}
