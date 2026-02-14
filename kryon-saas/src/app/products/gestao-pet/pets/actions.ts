'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Pet, PetOwner } from '@/types/gestao-pet'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getPets(query?: string) {
  const supabase = await createClient()
  
  let dbQuery = supabase
    .from('pets')
    .select(`
        *,
        pet_owners (id, name)
    `)
    .eq('product_slug', 'gestao-pet')
    .order('name')

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data, error } = await dbQuery
  
  if (error) console.error('Error fetching pets:', error)

  return (data || []) as Pet[]
}

// Need this to populate the Owner select box in the modal
export async function getOwnersForSelect() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('pet_owners')
        .select('id, name')
        .eq('product_slug', 'gestao-pet')
        .order('name')
    return (data || []) as PetOwner[]
}

export async function createPetAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const owner_id = formData.get('owner_id') as string
  const species = formData.get('species') as string
  const breed = formData.get('breed') as string
  const birth_date = formData.get('birth_date') as string || null
  const notes = formData.get('notes') as string

  if (!name || !owner_id) return { error: 'Nome e Tutor são obrigatórios' }

  const { error } = await supabase.from('pets').insert({
    tenant_id: user.id, 
    product_slug: 'gestao-pet',
    owner_id,
    name,
    species,
    breed,
    birth_date,
    notes
  })

  if (error) {
      console.error('Create pet error:', error)
      return { error: translateSupabaseError(error) }
  }
  
  revalidatePath('/products/gestao-pet/pets')
  return { success: true }
}

export async function updatePetAction(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const owner_id = formData.get('owner_id') as string
  const species = formData.get('species') as string
  const breed = formData.get('breed') as string
  const birth_date = formData.get('birth_date') as string || null
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('pets')
    .update({ name, owner_id, species, breed, birth_date, notes })
    .eq('id', id)

  if (error) {
      console.error('Update pet error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/gestao-pet/pets')
  return { success: true }
}

export async function deletePetAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)

  if (error) {
      console.error('Delete pet error:', error)
      return { error: translateSupabaseError(error) }
  }
  revalidatePath('/products/gestao-pet/pets')
  return { success: true }
}
