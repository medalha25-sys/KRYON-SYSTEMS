'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { translateSupabaseError } from '@/utils/error_handling'

export async function createClientAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    // Get the shop_id for the current user
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        return { error: 'Loja não encontrada' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const city = formData.get('city') as string

    if (!name) {
        return { error: 'O nome é obrigatório' }
    }

    const { error } = await supabase
        .from('customers')
        .insert({
            shop_id: shop.id,
            name,
            email: email || null,
            phone: phone || null,
            city: city || null,
            total_orders: 0
        })

    if (error) {
        console.error('Error creating client:', error)
        const friendlyMessage = translateSupabaseError(error)
        return { error: `Erro ao criar cliente: ${friendlyMessage}` }
    }

    revalidatePath('/fashion/clientes')
    return { success: true }
}

export async function updateClientAction(id: string, formData: FormData) {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const city = formData.get('city') as string
    
    if (!name) return { error: 'Nome é obrigatório' }

    const { error } = await supabase
        .from('customers')
        .update({
            name,
            email: email || null,
            phone: phone || null,
            city: city || null
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating client:', error)
        return { error: translateSupabaseError(error) }
    }

    revalidatePath('/fashion/clientes')
    return { success: true }
}

export async function deleteClientAction(id: string) {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado' }

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting client:', error)
        return { error: translateSupabaseError(error) }
    }

    revalidatePath('/fashion/clientes')
    return { success: true }
}
