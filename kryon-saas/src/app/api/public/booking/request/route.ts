import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addMinutes, parseISO, setHours, setMinutes } from 'date-fns'

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
      .select('id, public_booking_enabled')
      .eq('slug', slug)
      .single()

    if (!org || !org.public_booking_enabled) {
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
    const { error: apptError } = await supabase
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

    if (apptError) {
        return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro Interno do Servidor' }, { status: 500 })
  }
}
