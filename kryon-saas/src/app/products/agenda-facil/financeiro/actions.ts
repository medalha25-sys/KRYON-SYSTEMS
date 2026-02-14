'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'money' | 'credit' | 'debit' | 'pix' | 'transfer' | 'other'
export type TransactionStatus = 'paid' | 'pending' | 'canceled'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category_id?: string
  date: string
  status: TransactionStatus
  payment_method?: PaymentMethod
  reference_id?: string
  reference_type?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon?: string
  color?: string
}

export async function getFinancialSummary(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { income: 0, expense: 0, balance: 0 }

  let query = supabase
    .from('financial_transactions')
    .select('amount, type, status')
    .eq('tenant_id', user.id)
    .eq('status', 'paid')

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data: transactions } = await query

  let income = 0
  let expense = 0

  transactions?.forEach(t => {
    if (t.type === 'income') income += Number(t.amount)
    if (t.type === 'expense') expense += Number(t.amount)
  })

  return {
    income,
    expense,
    balance: income - expense
  }
}

export async function getTransactions(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('financial_transactions')
    .select('*, financial_categories(*)')
    .eq('tenant_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data } = await query
  return data as any[]
}

export async function getCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('financial_categories')
    .select('*')
    .eq('tenant_id', user.id)
    .order('name')

  return data as Category[]
}

export async function saveTransaction(data: Partial<Transaction>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  // Ensure category exists or is valid if provided
  
  if (data.id) {
    // Update
    const { error } = await supabase
      .from('financial_transactions')
      .update({
        description: data.description,
        amount: data.amount,
        type: data.type,
        category_id: data.category_id,
        date: data.date,
        status: data.status,
        payment_method: data.payment_method
      })
      .eq('id', data.id)
      .eq('tenant_id', user.id)

    if (error) {
        console.error('Update transaction error:', error)
        return { error: 'Erro ao atualizar transação. Tente novamente.' }
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('financial_transactions')
      .insert({
        tenant_id: user.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category_id: data.category_id,
        date: data.date || new Date().toISOString().split('T')[0],
        status: data.status || 'paid',
        payment_method: data.payment_method,
        reference_id: data.reference_id,
        reference_type: data.reference_type
      })

    if (error) {
        console.error('Create transaction error:', error)
        return { error: 'Erro ao criar transação. Tente novamente.' }
    }
  }

  revalidatePath('/products/agenda-facil')
  revalidatePath('/products/agenda-facil/financeiro')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('financial_transactions')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) {
      console.error('Delete transaction error:', error)
      return { error: 'Erro ao excluir transação. Tente novamente.' }
   }

  revalidatePath('/products/agenda-facil')
  revalidatePath('/products/agenda-facil/financeiro')
  return { success: true }
}

export async function seedCategories() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Check if user has categories
    const { count } = await supabase
        .from('financial_categories')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        
    if (count === 0) {
        await supabase.rpc('seed_financial_categories', { user_id: user.id })
    }
}

