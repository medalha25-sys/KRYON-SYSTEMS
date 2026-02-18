'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFinancialSummary(params?: { startDate?: string, endDate?: string, professionalId?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Perfil não encontrado' }

  // Secretary cannot see summary
  if (profile.role === 'secretary') {
    return { error: 'Acesso negado a relatórios estratégicos.' }
  }

  // Professional sees limited (or zero, depending on policy - Assuming zero for now unless explicity commission logic added)
  if (profile.role === 'professional' && !params?.professionalId) {
     // Force professional filter if they try to see global
     // Actually for summary, professionals might see their own totals? 
     // For now, let's restrict summary to Admin only based on "Bloquear acesso de professional a dados globais"
     return { error: 'Acesso negado a dados globais.' }
  }


  let query = supabase
    .from('financial_transactions')
    .select('type, amount, status')
    .eq('organization_id', profile.organization_id)
    .neq('status', 'canceled')

  if (params?.startDate) query = query.gte('date', params.startDate)
  if (params?.endDate) query = query.lte('date', params.endDate)
  if (params?.professionalId) query = query.eq('professional_id', params.professionalId)

  const { data: transactions, error } = await query

  if (error) return { error: error.message }

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  return {
    income,
    expense,
    balance: income - expense
  }
}

export async function getTransactions(params?: { startDate?: string, endDate?: string, professionalId?: string, type?: string, page?: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  
  if (!profile) return { error: 'Perfil não encontrado' }

  let query = supabase
    .from('financial_transactions')
    .select(`
        *,
        category:financial_categories(name, color, icon),
        professional:agenda_professionals(name)
    `)
    .eq('organization_id', profile.organization_id)
    .order('date', { ascending: false })

  if (params?.startDate) query = query.gte('date', params.startDate)
  if (params?.endDate) query = query.lte('date', params.endDate)
  if (params?.type) query = query.eq('type', params.type)
  if (params?.professionalId) query = query.eq('professional_id', params.professionalId)

  const { data, error } = await query

  if (error) return { error: error.message }
  return { data }
}

export async function createTransaction(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil não encontrado' }
  const { error } = await supabase.from('financial_transactions').insert({
    ...data,
    organization_id: profile.organization_id,
    created_by: user.id
  })

  if (error) return { error: error.message }
  revalidatePath('/products/agenda-facil/financeiro')
  return { success: true }
}

export async function updateTransaction(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('financial_transactions').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/products/agenda-facil/financeiro')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('financial_transactions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/products/agenda-facil/financeiro')
  return { success: true }
}


export async function getProfessionals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  
  if (!profile) return []

  const { data } = await supabase
    .from('agenda_professionals')
    .select('id, name, default_session_price')
    .eq('organization_id', profile.organization_id)
    .eq('active', true)
    .order('name')
  
  return data || []
}


export async function getCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  
  if (!profile) return []

  const { data } = await supabase
    .from('financial_categories')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('name')
  
  return data || []
}

export async function createCategory(name: string, type: 'income' | 'expense', color?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  
  if (!profile) return { error: 'Perfil não encontrado' }

  const { error } = await supabase.from('financial_categories').insert({
    organization_id: profile.organization_id,
    name,
    type,
    color,
    icon: null // Default
  })

  if (error) return { error: error.message }
  revalidatePath('/products/agenda-facil/financeiro')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('financial_categories').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/products/agenda-facil/financeiro')
  return { success: true }
}

export async function getCommissionReport(params?: { startDate?: string, endDate?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()
    if (!profile) return { error: 'Perfil não encontrado' }

    if (profile.role === 'secretary') {
        return { error: 'Acesso negado.' }
    }

    let query = supabase
        .from('financial_transactions')
        .select(`
            id, date, description, amount, 
            professional_commission_amount, clinic_profit_amount,
            professional:agenda_professionals!inner(id, name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('type', 'income') // Only income generates commission usually
        .neq('status', 'canceled')
        .not('professional_id', 'is', null) // Must be linked to a professional

    if (params?.startDate) query = query.gte('date', params.startDate)
    if (params?.endDate) query = query.lte('date', params.endDate)

    // If professional, restrict to own data
    if (profile.role === 'professional') {
         // Find professional ID linked to this user (assuming one-to-one or some linkage? 
         // Actually, usually user.id is not professional.id directly unless linked.
         // For now, let's assume if role is professional, we might need to find their professional record.
         // OR, if the policy is strict, maybe we just trust the profile linkage? 
         // PROPOSAL: Professionals can only see transactions where they are listed.
         // PROBLEM: We don't have user_id -> professional_id mapping easily here without lookup.
         // ASSUMPTION: For this MVP, let's assume the user IS the professional or linked.
         // Actually, if role is professional, they likely only want to see *their* generated revenue.
         // Querying `agenda_professionals` by `user_id` (if that column existed) would be ideal.
         // Fallback: If no direct link, maybe we return error or empty?
         // Let's Skip strict filtering for now and assume Admin view for 'owner/admin' and 
         // if we had a professional login, we'd need that link.
         // Given "Clinica Serena" context, it's likely the Admin looking at this report mostly.
         // If a Professional logs in, we should filter.
         // Let's Try to find professional by matching some email? Or just create a TODO.
         // SAFEGUARD: If role is professional, return empty for now to prevent leak until link is established
         return { error: 'Funcionalidade disponível apenas para Administradores no momento.' }
    }

    const { data: transactions, error } = await query

    if (error) return { error: error.message }

    // Aggregate by Professional
    const reportVal = transactions.reduce((acc: any, t: any) => {
        const profId = t.professional.id
        const profName = t.professional.name
        
        if (!acc[profId]) {
            acc[profId] = {
                id: profId,
                name: profName,
                total_generated: 0,
                total_commission: 0,
                total_profit: 0,
                transactions: []
            }
        }
        
        acc[profId].total_generated += Number(t.amount)
        acc[profId].total_commission += Number(t.professional_commission_amount || 0)
        acc[profId].total_profit += Number(t.clinic_profit_amount || 0)
        acc[profId].transactions.push(t)
        
        return acc
    }, {})

    return Object.values(reportVal)
}
