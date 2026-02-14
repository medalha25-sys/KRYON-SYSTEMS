'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Appointment } from '@/types/agenda'
import { translateSupabaseError } from '@/utils/error_handling'

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('Create Appointment: User not authenticated')
    return { error: 'Usuário não autenticado. Por favor, faça login novamente.' }
  }

  const client_id = formData.get('client_id') as string
  const service_id = formData.get('service_id') as string
  const professional_id = formData.get('professional_id') as string
  const date = formData.get('date') as string // YYYY-MM-DD
  const time = formData.get('time') as string // HH:mm
  const duration = parseInt(formData.get('duration') as string) || 30

  if (!client_id || !service_id || !professional_id || !date || !time) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  // Calculate start and end time
  const start_time = new Date(`${date}T${time}:00`)
  const end_time = new Date(start_time.getTime() + duration * 60000)

  // 1. Validate Work Schedule
  // Fetch professional's schedule for this weekday
  const weekday = start_time.getDay()
  const { data: schedule } = await supabase
    .from('agenda_work_schedules')
    .select('*')
    .eq('professional_id', professional_id)
    .eq('weekday', weekday)
    .single()

  if (!schedule) {
      return { error: 'Este profissional não atende neste dia da semana.' }
  }

  // Check start/end time
  const schedStart = new Date(`${date}T${schedule.start_time}`)
  const schedEnd = new Date(`${date}T${schedule.end_time}`)
  
  // Normalize dates for comparison (ignore seconds/milliseconds issues if any)
  if (start_time < schedStart || end_time > schedEnd) {
      return { error: `Horário fora do expediente (${schedule.start_time.slice(0,5)} - ${schedule.end_time.slice(0,5)}).` }
  }

  // Check break
  if (schedule.break_start && schedule.break_end) {
      const breakStart = new Date(`${date}T${schedule.break_start}`)
      const breakEnd = new Date(`${date}T${schedule.break_end}`)

      // If appointment overlaps with break
      // (Start < BreakEnd) AND (End > BreakStart)
      if (start_time < breakEnd && end_time > breakStart) {
          return { error: `Horário coincide com o intervalo (${schedule.break_start.slice(0,5)} - ${schedule.break_end.slice(0,5)}).` }
      }
  }

  // 2. Validate Conflict for Professional
  // Finds any appointment for this pro that overlaps with new time
  const { data: conflicts } = await supabase
    .from('agenda_appointments')
    .select('id')
    .eq('professional_id', professional_id)
    .neq('status', 'canceled') // Ignore canceled
    .lt('start_time', end_time.toISOString())
    .gt('end_time', start_time.toISOString())

  if (conflicts && conflicts.length > 0) {
    return { error: 'Horário indisponível. Já existe um agendamento neste período.' }
  }

  // 2. Create Appointment
  const { error } = await supabase.from('agenda_appointments').insert({
    tenant_id: user.id,
    product_slug: 'agenda-facil',
    client_id,
    service_id,
    professional_id,
    start_time: start_time.toISOString(),
    end_time: end_time.toISOString(),
    status: 'scheduled'
  })

  if (error) {
    console.error('Create Appointment Error:', error)
    return { error: translateSupabaseError(error) }
  }

  revalidatePath('/products/agenda-facil')
  return { success: true }
}

export async function getAgendaData(date: string, view: 'day' | 'week' = 'day') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { professionals: [], appointments: [] }

    // Fetch Professionals
    const { data: professionals } = await supabase
        .from('agenda_professionals')
        .select('*')
        .eq('tenant_id', user.id)
        .order('name')

    // Fetch Services (for modal)
    const { data: services } = await supabase
        .from('agenda_services')
        .select('*')
        .eq('tenant_id', user.id)
        .eq('active', true)
        .order('name')

    // Fetch Clients (for modal)
    const { data: clients } = await supabase
        .from('agenda_clients')
        .select('*')
        .eq('tenant_id', user.id)
        .order('name')

    // Calculate Date Range
    let startDateTime: string, endDateTime: string

    if (view === 'week') {
        const targetDate = new Date(date + 'T12:00:00')
        const day = targetDate.getDay() // 0 (Sun) - 6 (Sat)
        // Adjust to Monday as start of week
        const diffToMon = targetDate.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(targetDate)
        monday.setDate(diffToMon)
        monday.setHours(0,0,0,0)
        
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23,59,59,999)

        startDateTime = monday.toISOString()
        endDateTime = sunday.toISOString()
    } else {
        startDateTime = new Date(`${date}T00:00:00`).toISOString()
        endDateTime = new Date(`${date}T23:59:59`).toISOString()
    }

    const { data: appointments } = await supabase
        .from('agenda_appointments')
        .select(`
            *,
            clients:client_id (name), 
            agenda_services:service_id (name, duration_minutes),
            agenda_professionals:professional_id (name)
        `)
        .eq('tenant_id', user.id)
        .gte('start_time', startDateTime)
        .lte('start_time', endDateTime)
        .neq('status', 'canceled')
        .order('start_time')

    // Get shop_id from user profile or shop ownership
    const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()
    
    const shopId = profile?.shop_id

    return { 
        shopId,
        professionals: (professionals || []) as unknown as any[], 
        services: (services || []) as unknown as any[], 
        clients: (clients || []) as unknown as any[],
        appointments: (appointments || []) as unknown as any[] 
    }
}

export async function getDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const startOfToday = new Date(`${todayStr}T00:00:00`).toISOString()
    const endOfToday = new Date(`${todayStr}T23:59:59`).toISOString()

    // 1. Next Consultation (First appointment after now)
    const { data: nextAppointment } = await supabase
        .from('agenda_appointments')
        .select(`
            *,
            clients:client_id (name)
        `)
        .eq('tenant_id', user.id)
        .eq('status', 'scheduled') // Or confirmed?
        .gte('start_time', now.toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .single()

    // 2. Weekly Sessions (This week vs Last week)
    // Current week
    const currentDay = now.getDay() // 0-6
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1) // adjust when day is sunday
    const mondayvar = new Date(now.setDate(diff))
    mondayvar.setHours(0,0,0,0)
    const startDateThisWeek = mondayvar.toISOString()
    
    // Simple 7 days lookback for simplicity? Or strict week? strict week is better.
    // Let's use simple logic: Count appointments in current ISO week.
    
    const { count: sessionsThisWeek } = await supabase
        .from('agenda_appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        .gte('start_time', startDateThisWeek)
        .neq('status', 'canceled')

    // Last week (startDateThisWeek - 7 days)
    const lastWeekDate = new Date(mondayvar)
    lastWeekDate.setDate(lastWeekDate.getDate() - 7)
    const startDateLastWeek = lastWeekDate.toISOString()

    const { count: sessionsLastWeek } = await supabase
        .from('agenda_appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        .gte('start_time', startDateLastWeek)
        .lt('start_time', startDateThisWeek)
        .neq('status', 'canceled')

    // 3. Free Slots Today
    // Fetch work schedule for today
    const weekday = new Date().getDay()
    const { data: schedule } = await supabase
        .from('agenda_work_schedules')
        .select('*')
        .eq('tenant_id', user.id) // Assuming user is the professional for now for single-user dashboard, or fetch all if admin
        .eq('weekday', weekday)
        // If multiple professionals, this logic needs to sum up. For now assuming single pro or aggregate.
        // Let's summing up all professionals schedules.
    
    // Actually, getting all schedules for all professionals today
    const { data: allSchedules } = await supabase
        .from('agenda_work_schedules')
        .select('professional_id, start_time, end_time, break_start, break_end')
        .eq('tenant_id', user.id)
        .eq('weekday', weekday)

    let totalSlots = 0
    let occupiedSlots = 0
    
    // Fetch all appointments today to calculate occupancy
    const { data: appointmentsToday } = await supabase
        .from('agenda_appointments')
        .select('start_time, end_time, professional_id')
        .eq('tenant_id', user.id)
        .gte('start_time', startOfToday)
        .lte('start_time', endOfToday)
        .neq('status', 'canceled')

    // Calculate approx slots (30 min chunks?)
    // This is an estimation. 
    allSchedules?.forEach(sch => {
        const start = parseInt(sch.start_time.split(':')[0]) * 60 + parseInt(sch.start_time.split(':')[1])
        const end = parseInt(sch.end_time.split(':')[0]) * 60 + parseInt(sch.end_time.split(':')[1])
        const duration = end - start
        
        let breakDuration = 0
        if (sch.break_start && sch.break_end) {
            const bStart = parseInt(sch.break_start.split(':')[0]) * 60 + parseInt(sch.break_start.split(':')[1])
            const bEnd = parseInt(sch.break_end.split(':')[0]) * 60 + parseInt(sch.break_end.split(':')[1])
            breakDuration = bEnd - bStart
        }
        
        // Assuming 30 min slots roughly
        totalSlots += Math.floor((duration - breakDuration) / 30) // 30 min slots
    })

    occupiedSlots = appointmentsToday?.length || 0
    const freeSlots = Math.max(0, totalSlots - occupiedSlots)

    // 4. Today's Agenda List
    const { data: todaysAppointments } = await supabase
        .from('agenda_appointments')
        .select(`
            *,
            clients:client_id (name),
            agenda_services:service_id (name),
            agenda_professionals:professional_id (name)
        `)
        .eq('tenant_id', user.id)
        .gte('start_time', startOfToday)
        .lte('start_time', endOfToday)
        .neq('status', 'canceled')
        .order('start_time')

    // User Name
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()


    return {
        userName: profile?.full_name || 'Doutor(a)',
        nextAppointment,
        stats: {
            sessionsThisWeek: sessionsThisWeek || 0,
            sessionsLastWeek: sessionsLastWeek || 0,
            freeSlots
        },
        todaysAppointments: todaysAppointments || []
    }
}

export async function updateAppointmentNote(appointmentId: string, note: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('agenda_appointments')
        .update({ notes: note })
        .eq('id', appointmentId)
        .eq('tenant_id', user.id)

    if (error) {
        console.error('Error updating note:', error)
        return { error: translateSupabaseError(error) }
    }

    revalidatePath('/products/agenda-facil/clientes')
    return { success: true }
}
