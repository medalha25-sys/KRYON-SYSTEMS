'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { WorkSchedule } from '@/types/agenda'

export async function getWorkSchedules(professionalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('agenda_work_schedules')
    .select('*')
    .eq('tenant_id', user.id)
    .eq('professional_id', professionalId)
    .order('weekday')

  return (data || []) as WorkSchedule[]
}

export async function saveWorkScheduleAction(professionalId: string, schedules: Partial<WorkSchedule>[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  // Get shop_id (tenant_id) from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_id')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.shop_id

  if (!tenantId) {
      return { error: 'Loja não encontrada para este usuário.' }
  }

  // Delete existing schedules for this professional
  await supabase
    .from('agenda_work_schedules')
    .delete()
    .eq('professional_id', professionalId)
    .eq('tenant_id', tenantId)

  // Insert new ones
  const toInsert = schedules.map(s => ({
    tenant_id: tenantId,
    product_slug: 'agenda-facil',
    professional_id: professionalId,
    weekday: s.weekday,
    start_time: s.start_time,
    end_time: s.end_time,
    break_start: s.break_start || null,
    break_end: s.break_end || null
  }))

  const { error } = await supabase.from('agenda_work_schedules').insert(toInsert)

  if (error) {
      console.error('Error saving schedules:', error)
      return { error: 'Erro ao salvar horários' }
  }
  
  revalidatePath('/products/agenda-facil/profissionais')
  return { success: true }
}
