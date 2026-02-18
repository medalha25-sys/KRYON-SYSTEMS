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

  // Get Organization ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return { error: 'Organização não encontrada.' }
  const orgId = profile.organization_id

  const client_id = formData.get('client_id') as string
  const service_id = formData.get('service_id') as string
  const professional_id = formData.get('professional_id') as string
  const date = formData.get('date') as string // YYYY-MM-DD
  const time = formData.get('time') as string // HH:mm
  const duration = parseInt(formData.get('duration') as string) || 30
  const session_price_input = formData.get('session_price') as string
  let session_price: number | null = session_price_input ? parseFloat(session_price_input) : null

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

  // Fetch professional default price if not provided
  if (session_price === null) {
      const { data: professional } = await supabase
          .from('agenda_professionals')
          .select('default_session_price')
          .eq('id', professional_id)
          .single()
      
      session_price = professional?.default_session_price || 0
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
    organization_id: orgId,
    product_slug: 'agenda-facil',
    client_id,
    service_id,
    professional_id,
    start_time: start_time.toISOString(),
    end_time: end_time.toISOString(),
    status: 'scheduled',
    session_price: session_price
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

    // Get Organization ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations(id, name)')
        .eq('id', user.id)
        .single()
    
    if (!profile || !profile.organization_id) return { professionals: [], appointments: [] }
    const orgId = profile.organization_id

    // Fetch Professionals
    const { data: professionals } = await supabase
        .from('agenda_professionals')
        .select('*') // Select * will include color now
        .eq('organization_id', orgId)
        .order('name')

    // Fetch Services (for modal)
    const { data: services } = await supabase
        .from('agenda_services')
        .select('*')
        .eq('organization_id', orgId)
        .eq('active', true)
        .order('name')

    // Fetch Clients (for modal)
    const { data: clients } = await supabase
        .from('agenda_clients')
        .select('*')
        .eq('organization_id', orgId)
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
            agenda_professionals:professional_id (name, color)
        `)
        .eq('tenant_id', user.id)
        .gte('start_time', startDateTime)
        .lte('start_time', endDateTime)
        .neq('status', 'canceled')
        .order('start_time')

    return { 
        shopId: null, // Deprecated
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

    // Get Organization ID & User Name
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.organization_id) return null
    const orgId = profile.organization_id

    // 1. Next Consultation (First appointment after now)
    const { data: nextAppointment } = await supabase
        .from('agenda_appointments')
        .select(`
            *,
            clients:client_id (name)
        `)
        .eq('organization_id', orgId)
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
        .eq('organization_id', orgId)
        .gte('start_time', startDateThisWeek)
        .neq('status', 'canceled')

    // Last week (startDateThisWeek - 7 days)
    const lastWeekDate = new Date(mondayvar)
    lastWeekDate.setDate(lastWeekDate.getDate() - 7)
    const startDateLastWeek = lastWeekDate.toISOString()

    const { count: sessionsLastWeek } = await supabase
        .from('agenda_appointments')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('start_time', startDateLastWeek)
        .lt('start_time', startDateThisWeek)
        .neq('status', 'canceled')

    // 3. Free Slots Today
    // Fetch work schedule for today
    const weekday = new Date().getDay()
    const { data: schedule } = await supabase
        .from('agenda_work_schedules')
        .select('*')
        .eq('organization_id', orgId) // Assuming user is the professional for now for single-user dashboard, or fetch all if admin
        .eq('weekday', weekday)
        // If multiple professionals, this logic needs to sum up. For now assuming single pro or aggregate.
        // Let's summing up all professionals schedules.
    
    // Actually, getting all schedules for all professionals today
    const { data: allSchedules } = await supabase
        .from('agenda_work_schedules')
        .select('professional_id, start_time, end_time, break_start, break_end')
        .eq('organization_id', orgId)
        .eq('weekday', weekday)

    let totalSlots = 0
    let occupiedSlots = 0
    
    // Fetch all appointments today to calculate occupancy
    const { data: appointmentsToday } = await supabase
        .from('agenda_appointments')
        .select('start_time, end_time, professional_id')
        .eq('organization_id', orgId)
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
        .eq('organization_id', orgId)
        .gte('start_time', startOfToday)
        .lte('start_time', endOfToday)
        .neq('status', 'canceled')
        .order('start_time')

    // User Name already fetched above


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

    // Get Organization ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.organization_id) return { error: 'Unauthorized' }
    const orgId = profile.organization_id

    const { error } = await supabase
        .from('agenda_appointments')
        .update({ notes: note })
        .eq('id', appointmentId)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error updating note:', error)
        return { error: translateSupabaseError(error) }
    }

    revalidatePath('/products/agenda-facil')
    return { success: true }
}

export async function completeAppointment(appointmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Appointment details (price, service name, client name) + Professional Commission details
    const { data: appt, error: fetchError } = await supabase
        .from('agenda_appointments')
        .select(`
        *,
        agenda_services(name, price),
        clients:client_id(name),
        professional:professional_id(commission_type, commission_value)
        `)
        .eq('id', appointmentId)
        .single()

    if (fetchError || !appt) return { error: 'Agendamento não encontrado.' }

    // 2. Update Status
    const { error: updateError } = await supabase
        .from('agenda_appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId)

    if (updateError) return { error: 'Erro ao concluir agendamento.' }

    // 3. Create Financial Transaction (if price > 0)
    // Use session_price from appointment first, fallback to service price if null (legacy)
    const price = appt.session_price !== null ? appt.session_price : appt.agenda_services?.price
    
    if (price && price > 0) {
        // Calculate Commission
        let commissionAmount = 0
        const commType = appt.professional?.commission_type || 'percentage'
        const commValue = appt.professional?.commission_value || 0

        if (commType === 'percentage') {
            commissionAmount = price * (commValue / 100)
        } else {
            commissionAmount = commValue
        }
        
        // Safety check: Commission cannot exceed price
        if (commissionAmount > price) commissionAmount = price

        const profitAmount = price - commissionAmount

        // Try to find 'Serviços' category
        const { data: category } = await supabase
            .from('financial_categories')
            .select('id')
            .eq('organization_id', appt.organization_id)
            .ilike('name', 'Serviços') // Case insensitive match
            .maybeSingle()

        const { error: finError } = await supabase.from('financial_transactions').insert({
            organization_id: appt.organization_id,
            description: `Atendimento ${appt.clients?.name} - ${appt.agenda_services?.name}`,
            amount: price,
            type: 'income',
            status: 'paid', // Default to paid
            date: new Date().toISOString().split('T')[0],
            payment_method: 'money', // Default, ideally prompt user in modal
            professional_id: appt.professional_id, // Link professional
            appointment_id: appt.id, // Link appointment
            category_id: category?.id || null,
            professional_commission_amount: commissionAmount,
            clinic_profit_amount: profitAmount
        })
        
        if (finError) {
            console.error('Error generating transaction:', finError)
            // We don't fail the completion if transaction fails, but log it.
        }
    }

    revalidatePath('/products/agenda-facil')
    return { success: true }
}

export async function cancelAppointment(appointmentId: string) {
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
        .from('agenda_appointments')
        .update({ status: 'canceled' })
        .eq('id', appointmentId)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error canceling appointment:', error)
        return { error: translateSupabaseError(error) }
    }

    revalidatePath('/products/agenda-facil')
    return { success: true }
}

export async function updateAppointment(appointmentId: string, formData: FormData) {
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

    const service_id = formData.get('service_id') as string
    const professional_id = formData.get('professional_id') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const duration = parseInt(formData.get('duration') as string) || 30

    if (!service_id || !professional_id || !date || !time) {
        return { error: 'Todos os campos são obrigatórios' }
    }

    const start_time = new Date(`${date}T${time}:00`)
    const end_time = new Date(start_time.getTime() + duration * 60000)

    // 1. Validate Work Schedule
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

    const schedStart = new Date(`${date}T${schedule.start_time}`)
    const schedEnd = new Date(`${date}T${schedule.end_time}`)
    
    if (start_time < schedStart || end_time > schedEnd) {
        return { error: `Horário fora do expediente (${schedule.start_time.slice(0,5)} - ${schedule.end_time.slice(0,5)}).` }
    }

     if (schedule.break_start && schedule.break_end) {
        const breakStart = new Date(`${date}T${schedule.break_start}`)
        const breakEnd = new Date(`${date}T${schedule.break_end}`)
        if (start_time < breakEnd && end_time > breakStart) {
            return { error: `Horário coincide com o intervalo (${schedule.break_start.slice(0,5)} - ${schedule.break_end.slice(0,5)}).` }
        }
    }

    // 2. Conflict Check (EXCLUDING current appointment)
    const { data: conflicts } = await supabase
        .from('agenda_appointments')
        .select('id')
        .eq('professional_id', professional_id)
        .neq('status', 'canceled')
        .neq('id', appointmentId) // Exclude self
        .lt('start_time', end_time.toISOString())
        .gt('end_time', start_time.toISOString())

    if (conflicts && conflicts.length > 0) {
        return { error: 'Horário indisponível. Já existe um agendamento neste período.' }
    }

    // 3. Update
    const { error } = await supabase
        .from('agenda_appointments')
        .update({
            service_id,
            professional_id,
            start_time: start_time.toISOString(),
            end_time: end_time.toISOString()
        })
        .eq('id', appointmentId)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Update Appointment Error:', error)
        return { error: translateSupabaseError(error) }
    }

    revalidatePath('/products/agenda-facil')
    return { success: true }
}

export async function blockSchedule(formData: FormData) {
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

    const professional_id = formData.get('professional_id') as string
    const date = formData.get('date') as string
    const start_time_str = formData.get('start_time') as string // HH:mm
    const end_time_str = formData.get('end_time') as string // HH:mm
    const reason = formData.get('reason') as string

    if (!professional_id || !date || !start_time_str || !end_time_str) {
        return { error: 'Todos os campos são obrigatórios' }
    }

    const start_time = new Date(`${date}T${start_time_str}:00`)
    const end_time = new Date(`${date}T${end_time_str}:00`)

    if (start_time >= end_time) {
        return { error: 'Horário de término deve ser posterior ao início.' }
    }

    // 1. Validate Conflict for Professional
    const { data: conflicts } = await supabase
        .from('agenda_appointments')
        .select('id')
        .eq('professional_id', professional_id)
        .neq('status', 'canceled')
        .lt('start_time', end_time.toISOString())
        .gt('end_time', start_time.toISOString())

    if (conflicts && conflicts.length > 0) {
        return { error: 'Horário indisponível. Já existe um agendamento neste período.' }
    }

    // 2. Create Blocked "Appointment"
    const { error } = await supabase.from('agenda_appointments').insert({
        organization_id: orgId,
        product_slug: 'agenda-facil',
        professional_id,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        status: 'blocked',
        notes: reason,
        client_id: null,
        service_id: null
    })

    if (error) {
        console.error('Block Schedule Error:', error)
        return { error: translateSupabaseError(error) }
    }

    revalidatePath('/products/agenda-facil')
    return { success: true }
}
