'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { PetOwner } from '@/types/gestao-pet'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getPetOwners(query?: string) {
  const supabase = await createClient()
  
  let dbQuery = supabase
    .from('pet_owners')
    .select('*')
    .eq('product_slug', 'gestao-pet')
    .order('name')

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data, error } = await dbQuery
  
  if (error) console.error('Error fetching owners:', error)

  return (data || []) as PetOwner[]
}

export async function createPetOwnerAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check subscription/tenant access is handled by RLS, but we need to inject tenant_id
  // We assume tenant_id = user.id for now based on current setup
  
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string

  if (!name || !phone) return { error: 'Nome e Telefone são obrigatórios' }

  const { error } = await supabase.from('pet_owners').insert({
    tenant_id: user.id, // RLS will validate this matches get_user_tenant()
    product_slug: 'gestao-pet',
    name,
    phone,
    email
  })

  if (error) {
      console.error('Create owner error:', error)
      return { error: translateSupabaseError(error) }
  }
  
  revalidatePath('/products/gestao-pet/tutores')
  return { success: true }
}

export async function updatePetOwnerAction(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string

  const { error } = await supabase
    .from('pet_owners')
    .update({ name, phone, email })
    .eq('id', id)
    // RLS handles tenant check, but good practice to add if logic gets complex
    // .eq('tenant_id', user.id) 

  if (error) {
      console.error('Update owner error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/gestao-pet/tutores')
  return { success: true }
}

export async function deletePetOwnerAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pet_owners')
    .delete()
    .eq('id', id)

  if (error) {
      console.error('Delete owner error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/gestao-pet/tutores')
  return { success: true }
}
