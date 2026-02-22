'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { translateSupabaseError } from '@/utils/error_handling'

export async function getCases() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.organization_id) return []

    const { data: cases } = await supabase
        .from('law_cases')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    return cases || []
}

export async function createCase(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.organization_id) return { error: 'Organization not found' }

    const case_number = formData.get('case_number') as string
    const title = formData.get('title') as string
    const client_name = formData.get('client_name') as string
    const description = formData.get('description') as string
    const court = formData.get('court') as string

    if (!case_number || !title || !client_name) {
        return { error: 'Campos obrigatórios ausentes' }
    }

    const { error } = await supabase.from('law_cases').insert({
        organization_id: profile.organization_id,
        case_number,
        title,
        client_name,
        description,
        court
    })

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/products/kryon-law')
    return { success: true }
}

export async function getUpcomingDeadlines() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.organization_id) return []

    const { data: deadlines } = await supabase
        .from('law_deadlines')
        .select('*, law_cases(title)')
        .eq('organization_id', profile.organization_id)
        .eq('is_completed', false)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5)

    return deadlines || []
}
