'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfMonth, endOfMonth, subMonths, eachDayOfInterval, format, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type DashboardMetrics = {
  revenue: number
  sessions: number
  occupancyRate: number
  newPatients: number
  attendanceRate: number
  revenueChart: { date: string; value: number }[]
  sessionsByPro: { name: string; value: number }[]
  patientGrowth: { month: string; value: number }[]
  performanceTable: {
      id: string
      name: string
      appointments: number
      revenue: number
      ticket: number
      attendance: number
  }[]
}

export type ProfessionalMetrics = {
    revenue: number
    sessions: number
    attendanceRate: number
    nextAppointment: any
    revenueChart: { date: string; value: number }[]
    appointments: any[]
}

export async function getAdminDashboardMetrics(): Promise<DashboardMetrics | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Get Organization ID via new Profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return null
  const orgId = profile.organization_id

  const now = new Date()
  const startMonth = startOfMonth(now).toISOString()
  const endMonth = endOfMonth(now).toISOString()

  // 2. Metric: Revenue & Sessions (This Month)
  // Join appointments with services to get price
  const { data: appointments } = await supabase
    .from('agenda_appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      agenda_services (price),
      professional_id
    `)
    .eq('organization_id', orgId)
    .gte('start_time', startMonth)
    .lte('start_time', endMonth)
    .neq('status', 'canceled')

  const totalSessions = appointments?.length || 0
  
  // Calculate Revenue
  const revenue = appointments?.reduce((acc, curr) => {
    // @ts-ignore
    const price = curr.agenda_services?.price || 0
    return acc + price
  }, 0) || 0

  // 3. Metric: New Patients (This Month)
  const { count: newPatients } = await supabase
    .from('agenda_clients')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .gte('created_at', startMonth)
    .lte('created_at', endMonth)
  
    .lte('created_at', endMonth)

  // 4. Metric: Attendance Rate (Completed / (Completed + Canceled + NoShow + Scheduled?))
  // Usually Attendance = Completed / (Total - Canceled By Clinic) OR Completed / Total Scheduled.
  // Simple Definition: Completed / (Completed + NoShow + CanceledByPatient)
  // Let's use: Completed / (Completed + NoShow). Canceled usually doesn't count as "missed" if rescheduled?
  // User asked for "Taxa de comparecimento". 
  // Rate = Completed / (Completed + NoShow)
  
  const completedOrNoShow = appointments?.filter(a => a.status === 'completed' || a.status === 'no_show') || []
  const completedCount = completedOrNoShow.filter(a => a.status === 'completed').length
  const attendanceRate = completedOrNoShow.length > 0 ? Math.round((completedCount / completedOrNoShow.length) * 100) : 0


  // 5. Metric: Occupancy Rate (Approximate)
  // Total Slots = (Work Hours * Days * Pros). 
  // Simplified: Count Total Possible Slots vs Booked.
  // Booked = totalSessions.
  // Capacity = Fetch Work Schedules -> Sum hours per week -> * 4.
  const { data: schedules } = await supabase
    .from('agenda_work_schedules')
    .select('*')
    .eq('organization_id', orgId)
  
  let monthlyCapacitySlots = 0
  if (schedules && schedules.length > 0) {
      // Calculate weekly capacity in minutes
      let weeklyMinutes = 0
      schedules.forEach(s => {
          const start = parseInt(s.start_time.split(':')[0]) * 60 + parseInt(s.start_time.split(':')[1])
          const end = parseInt(s.end_time.split(':')[0]) * 60 + parseInt(s.end_time.split(':')[1])
          let duration = end - start
          if (s.break_start && s.break_end) {
              const bStart = parseInt(s.break_start.split(':')[0]) * 60 + parseInt(s.break_start.split(':')[1])
              const bEnd = parseInt(s.break_end.split(':')[0]) * 60 + parseInt(s.break_end.split(':')[1])
              duration -= (bEnd - bStart)
          }
          weeklyMinutes += duration
      })
      // Approx 4.2 weeks in a month
      const monthlyMinutes = weeklyMinutes * 4.2
      // Assuming avg appointment is 30 mins? Or use actual service duration?
      // Let's use 30 mins as standard slot for capacity calculation
      monthlyCapacitySlots = Math.floor(monthlyMinutes / 30)
  }
  
  const occupancyRate = monthlyCapacitySlots > 0 ? Math.round((totalSessions / monthlyCapacitySlots) * 100) : 0

  // 5. Chart: Revenue Breakdown (Daily for this month)
  // Group appointments by day
  const revenueMap = new Map<string, number>()
  appointments?.forEach(app => {
      const day = format(new Date(app.start_time), 'yyyy-MM-dd')
      // @ts-ignore
      const price = app.agenda_services?.price || 0
      revenueMap.set(day, (revenueMap.get(day) || 0) + price)
  })

  // Fill all days
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })
  const revenueChart = daysInMonth.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      return {
          date: format(day, 'dd'), // Just day number for chart
          fullDate: dayStr,
          value: revenueMap.get(dayStr) || 0
      }
  })

  // 6. Chart: Sessions by Professional
  const { data: professionals } = await supabase
    .from('agenda_professionals')
    .select('id, name')
    .eq('organization_id', orgId)
  
  const proMap = new Map<string, number>()
  appointments?.forEach(app => {
      if (app.professional_id) {
          proMap.set(app.professional_id, (proMap.get(app.professional_id) || 0) + 1)
      }
  })

  const sessionsByPro = professionals?.map(pro => ({
      name: pro.name,
      value: proMap.get(pro.id) || 0
  })) || []

  // 7. Performance Table
  // Group by Professional
  const perfMap = new Map<string, {
      name: string, 
      appointments: number, 
      revenue: number, 
      completed: number,
      no_show: number
  }>()

  professionals?.forEach(pro => {
      perfMap.set(pro.id, { 
          name: pro.name, 
          appointments: 0, 
          revenue: 0,
          completed: 0,
          no_show: 0
     })
  })

  appointments?.forEach(app => {
      if (app.professional_id && perfMap.has(app.professional_id)) {
          const entry = perfMap.get(app.professional_id)!
          entry.appointments += 1
          // @ts-ignore
          const price = app.agenda_services?.price || 0
          entry.revenue += price // Tracking generated revenue regardless of status? usually only completed/paid.
          // Let's count revenue for all scheduled/completed for projection, or strictly completed? 
          // Strictly: Revenue usually means realizes.
          // But 'appointments' count includes scheduled.
          // Let's stick to: Revenue = Sum of price of ALL appointments in list (which are != canceled).
          
          if (app.status === 'completed') entry.completed += 1
          if (app.status === 'no_show') entry.no_show += 1
      }
  })

  const performanceTable = Array.from(perfMap.entries()).map(([id, data]) => {
      const total = data.completed + data.no_show
      const attRate = total > 0 ? Math.round((data.completed / total) * 100) : 0
      const ticket = data.appointments > 0 ? data.revenue / data.appointments : 0
      
      return {
          id,
          name: data.name,
          appointments: data.appointments,
          revenue: data.revenue,
          ticket,
          attendance: attRate
      }
  }).sort((a,b) => b.revenue - a.revenue)

  // 8. Chart: Patient Growth (Last 6 Months)
  // This is heavier. We can just count new patients per month.
  // Or just Total Active?
  // "Crescimento" usually means new patients.
  const sixMonthsAgo = subMonths(now, 5) // Include current
  const { data: patientsHistory } = await supabase
    .from('agenda_clients')
    .select('created_at')
    .eq('organization_id', orgId)
    .gte('created_at', startOfMonth(sixMonthsAgo).toISOString())
  
  const growthMap = new Map<string, number>()
  // Initialize last 6 months
  for (let i = 0; i < 6; i++) {
      const d = subMonths(now, i)
      const key = format(d, 'MMM', { locale: ptBR })
      growthMap.set(key, 0)
  }

  patientsHistory?.forEach(p => {
      const key = format(new Date(p.created_at), 'MMM', { locale: ptBR })
      // If key exists (it might be older if my date math is slightly off, but query filtered it)
      if (growthMap.has(key)) {
         growthMap.set(key, (growthMap.get(key) || 0) + 1)
      }
  })

  // Convert map to array in correct order (reverse)
  const patientGrowth = Array.from(growthMap.entries()).map(([month, value]) => ({ month, value })).reverse()


  return {
    revenue,
    sessions: totalSessions,
    occupancyRate,
    newPatients: newPatients || 0,
    attendanceRate,
    revenueChart,
    sessionsByPro,
    patientGrowth,
    performanceTable
  }
}

export async function getProfessionalMetrics(): Promise<ProfessionalMetrics | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. Get Organization ID via new Profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
  
    if (!profile || !profile.organization_id) return null
    const orgId = profile.organization_id

    // We need to find the professional ID linked to this user.
    // Assuming for now the User ID checks against some field or we filter by user email if stored in professionals?
    // Since we don't have a direct link yet in schema (user_id in agenda_professionals), 
    // AND the requirements say "Professionals view their own performance", 
    // we need to know WHICH professional this user is.
    // Quick Fix: Look for a professional with same name? Or just Return ALL for now if role is professional?
    // Correct approach: We should have `user_id` in `agenda_professionals`.
    // Missing column `user_id` in `agenda_professionals`.
    // Workaround Strategy:
    // If the user role is 'professional', we can assume they might be seeing the dashboard.
    // Since we can't filter by ID easily without the link, we will return NULL or a specific error to prompt setup?
    // OR, we can try to find a professional with the same Email? (Professionals table has email).
    
    // Let's try to match by Email from Auth User.
    const { data: professional } = await supabase
        .from('agenda_professionals')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('email', user.email) // Assuming email match
        .single()
    
    if (!professional) {
        // If not found, maybe return null or empty metrics
        return null
    }

    const now = new Date()
    const startMonth = startOfMonth(now).toISOString()
    const endMonth = endOfMonth(now).toISOString()

    // Query appointments for THIS professional
    const { data: appointments } = await supabase
        .from('agenda_appointments')
        .select(`
            id, start_time, end_time, status,
            agenda_services (name, price),
            clients (name)
        `)
        .eq('organization_id', orgId)
        .eq('professional_id', professional.id)
        .gte('start_time', startMonth)
        .lte('start_time', endMonth)
        .neq('status', 'canceled')
    
    const sessions = appointments?.length || 0
    const revenue = appointments?.reduce((acc, curr) => {
        const services = curr.agenda_services as any
        const price = (Array.isArray(services) ? services[0]?.price : services?.price) || 0
        return acc + price
    }, 0) || 0

    const completedOrNoShow = appointments?.filter(a => a.status === 'completed' || a.status === 'no_show') || []
    const completedCount = completedOrNoShow.filter(a => a.status === 'completed').length
    const attendanceRate = completedOrNoShow.length > 0 ? Math.round((completedCount / completedOrNoShow.length) * 100) : 0

    // Revenue Chart (Daily)
    const revenueMap = new Map<string, number>()
    appointments?.forEach(app => {
        const day = format(new Date(app.start_time), 'yyyy-MM-dd')
        const services = app.agenda_services as any
        const price = (Array.isArray(services) ? services[0]?.price : services?.price) || 0
        revenueMap.set(day, (revenueMap.get(day) || 0) + price)
    })
    const daysInMonth = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })
    const revenueChart = daysInMonth.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd')
        return {
            date: format(day, 'dd'),
            value: revenueMap.get(dayStr) || 0
        }
    })

    // Next Appointment
    const { data: nextAppt } = await supabase
        .from('agenda_appointments')
        .select(`*, clients(name), agenda_services(name)`)
        .eq('organization_id', orgId)
        .eq('professional_id', professional.id)
        .eq('status', 'scheduled')
        .gte('start_time', now.toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .single()

    return {
        revenue,
        sessions,
        attendanceRate,
        revenueChart,
        nextAppointment: nextAppt,
        appointments: appointments || []
    }
}
