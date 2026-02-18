import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addMinutes, format, isSameDay, parseISO, setHours, setMinutes } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  const dateStr = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')
  const professionalId = searchParams.get('professionalId')

  if (!slug || !dateStr || !serviceId) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 })
  }

  const supabase = await createClient()

  // 1. Get Organization & Validate Public Booking
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, public_booking_enabled')
    .eq('slug', slug)
    .single()

  if (orgError || !org) {
    return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 })
  }

  if (!org.public_booking_enabled) {
    return NextResponse.json({ error: 'Agendamento online desativado para esta organização' }, { status: 403 })
  }

  // 2. Get Service Duration & Validation
  const { data: service, error: serviceError } = await supabase
    .from('agenda_services')
    .select('duration_minutes, organization_id')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service || service.organization_id !== org.id) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
  }

  const duration = service.duration_minutes

  // 3. Get Professionals (Filter by ID if provided)
  let query = supabase
    .from('agenda_professionals')
    .select('id, name, public_booking_enabled')
    .eq('organization_id', org.id)
    .eq('active', true)

  if (professionalId) {
    query = query.eq('id', professionalId)
  }

  const { data: professionals, error: profError } = await query

  if (profError || !professionals || professionals.length === 0) {
    return NextResponse.json({ error: 'Nenhum profissional disponível' }, { status: 404 })
  }

  const availableProfessionals = professionals.filter(p => p.public_booking_enabled)

  if (availableProfessionals.length === 0) {
    return NextResponse.json({ error: 'Profissional selecionado não aceita agendamentos online' }, { status: 403 })
  }

  // 4. Calculate Slots
  // Simplification: Assume 8:00 to 18:00 availability for everyone for now.
  // TODO: Implement real work_schedule check.
  
  const selectedDate = parseISO(dateStr)
  const startOfDay = setMinutes(setHours(selectedDate, 8), 0)
  const endOfDay = setMinutes(setHours(selectedDate, 18), 0)

  // Fetch busy slots (appointments) for these professionals on this date
  const { data: busySlots } = await supabase
    .from('agenda_appointments')
    .select('start_time, end_time, professional_id')
    .in('professional_id', availableProfessionals.map(p => p.id))
    .neq('status', 'canceled')
    .gte('start_time', startOfDay.toISOString())
    .lte('end_time', endOfDay.toISOString())

  const slots: { time: string, professionalId: string }[] = []

  // Generate slots every 30 mins (or service duration?) 
  // Standard practice: fixed intervals (e.g. 30m or 60m) or service duration steps?
  // Let's use 30 min intervals for start times.
  const interval = 30 
  
  let current = startOfDay
  while (current < endOfDay) {
    const slotStart = current
    const slotEnd = addMinutes(current, duration)

    if (slotEnd > endOfDay) break;

    // Check each professional
    for (const prof of availableProfessionals) {
      // Check if prof is busy
      const isBusy = busySlots?.some(appt => {
        if (appt.professional_id !== prof.id) return false
        const apptStart = parseISO(appt.start_time)
        const apptEnd = parseISO(appt.end_time)
        // Overlap check
        return (slotStart < apptEnd && slotEnd > apptStart)
      })

      if (!isBusy) {
        slots.push({
          time: format(slotStart, 'HH:mm'),
          professionalId: prof.id
        })
      }
    }

    current = addMinutes(current, interval)
  }

  // Group by time
  const groupedSlots: Record<string, string[]> = {}
  slots.forEach(s => {
    if (!groupedSlots[s.time]) groupedSlots[s.time] = []
    groupedSlots[s.time].push(s.professionalId)
  })

  return NextResponse.json({ 
    slots: groupedSlots,
    professionals: availableProfessionals
  })
}
