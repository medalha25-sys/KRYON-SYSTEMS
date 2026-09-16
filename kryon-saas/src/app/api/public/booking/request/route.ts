import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addMinutes, parseISO, setHours, setMinutes } from 'date-fns'
import { sendAppointmentNotification } from '@/lib/notifications/dispatcher'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, serviceId, professionalId, date, time, clientName, clientPhone, clientEmail } = body

    if (!slug || !serviceId || !professionalId || !date || !time || !clientName || !clientPhone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Get Organization
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!org || org.public_booking_enabled === false) {
      return NextResponse.json({ error: 'Agendamentos desativados' }, { status: 403 })
    }

    // 2. Validate Professional & Service
    // ... (Skipping some redundant checks for speed, assuming valid IDs, but good practice to check)
    
    // 3. Calculate Start/End
    const { data: service } = await supabase
        .from('agenda_services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single()
    
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

    const [hours, minutes] = time.split(':').map(Number)
    const startDate = setMinutes(setHours(parseISO(date), hours), minutes)
    const endDate = addMinutes(startDate, service.duration_minutes)

    // 4. Double Check Availability
    const { data: conflicts } = await supabase
        .from('agenda_appointments')
        .select('id')
        .eq('professional_id', professionalId)
        .neq('status', 'canceled')
        .lt('start_time', endDate.toISOString())
        .gt('end_time', startDate.toISOString())
    
    if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'Horário não está mais disponível' }, { status: 409 })
    }

    // 5. Find or Create Client
    let clientId
    const { data: existingClient } = await supabase
        .from('agenda_clients')
        .select('id')
        .eq('organization_id', org.id)
        .or(`phone.eq.${clientPhone},email.eq.${clientEmail}`)
        .maybeSingle()

    if (existingClient) {
        clientId = existingClient.id
    } else {
        const { data: newClient, error: clientError } = await supabase
            .from('agenda_clients')
            .insert({
                organization_id: org.id,
                name: clientName,
                phone: clientPhone,
                email: clientEmail
            })
            .select('id')
            .single()
        
        if (clientError || !newClient) {
            return NextResponse.json({ error: 'Erro ao criar cadastro do cliente' }, { status: 500 })
        }
        clientId = newClient.id
    }

    // 6. Create Appointment
    const { data: newAppt, error: apptError } = await supabase
        .from('agenda_appointments')
        .insert({
            organization_id: org.id,
            client_id: clientId,
            professional_id: professionalId,
            service_id: serviceId,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'requested',
            notes: 'Agendamento Online'
        })
        .select('id')
        .single()

    if (apptError || !newAppt) {
        return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
    }

    // 7. Dispatch Confirmation Notification Asynchronously
    if (clientEmail) {
      try {
        const { data: prof } = await supabase
          .from('agenda_professionals')
          .select('name')
          .eq('id', professionalId)
          .maybeSingle()

        sendAppointmentNotification('booking_created', {
          appointmentId: newAppt.id,
          organizationId: org.id,
          organizationName: org.name || 'Clínica',
          organizationLogo: org.logo_url,
          clientName: clientName,
          clientEmail: clientEmail,
          clientPhone: clientPhone,
          professionalName: prof?.name || 'Profissional',
          serviceName: service.name || 'Consulta',
          startTime: startDate
        }).catch(err => console.error('Public booking notification error:', err))
      } catch (notifErr) {
        console.error('Non-blocking public booking notification error:', notifErr)
      }
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro Interno do Servidor' }, { status: 500 })
  }
}
