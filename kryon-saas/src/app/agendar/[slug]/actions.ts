'use server'

import { createClient } from '@/utils/supabase/server'

export async function getPublicShopData(slug: string) {
  const supabase = await createClient()
  
  // 1. Get User/Tenant ID from Shop Slug/ID
  // Assuming slug is currently the user ID (tenant_id) or shop_id.
  // Ideally we query a profiles/shops table by slug.
  // For MVP: assume slug is the tenant_id (user id) since our system is tenant-based.
  // OR query profiles table where shop_id = slug (if slug is UUID).
  // Let's assume slug is the userId for now to match current architecture where tenant_id = user.id
  
  // Actually, usually public link is like /agendar/user_id_123.
  // Let's stick with that for safety.
  
  const tenant_id = slug

  // 2. Get Professionals
  const { data: professionals } = await supabase
    .from('agenda_professionals')
    .select('*')
    .eq('tenant_id', tenant_id)
    .eq('active', true)
    
  // 3. Get Services
  const { data: services } = await supabase
    .from('agenda_services')
    .select('*')
    .eq('tenant_id', tenant_id)
    .eq('active', true)

  // 4. Get Shop Info (Profile)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, shop_id') // Add shop name/logo if in profile or join with shops table
    .eq('id', tenant_id)
    .single()
    
  // If we have a shops table, get details
  let shopDetails = null
  if (profile?.shop_id) {
      const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('id', profile.shop_id)
        .single()
      shopDetails = shop
  }

  return {
    tenant_id,
    shop: shopDetails || { name: profile?.full_name || 'Agendamento', logo_url: profile?.avatar_url },
    professionals: professionals || [],
    services: services || []
  }
}

export async function getAvailableSlots(tenant_id: string, professional_id: string, service_id: string, date: string) {
    const supabase = await createClient()
    
    // 1. Get Service Duration
    const { data: service } = await supabase
        .from('agenda_services')
        .select('duration_minutes')
        .eq('id', service_id)
        .single()
        
    const duration = service?.duration_minutes || 30

    // 2. Get Work Schedule for the day
    const weekday = new Date(date).getDay() // 0-6. Ensure date string is YYYY-MM-DD and interpreted correctly.
    // Use T12:00:00 to avoid timezone shift when getting day?
    // Actually if date is YYYY-MM-DD, new Date(date) is UTC 00:00.
    // weekday might be off if local time differs.
    // Better to append T12:00:00.
    const dayDate = new Date(date + 'T12:00:00')
    const dayOfWeek = dayDate.getDay()

    const { data: schedule } = await supabase
        .from('agenda_work_schedules')
        .select('*')
        .eq('professional_id', professional_id)
        .eq('weekday', dayOfWeek)
        .single()

    if (!schedule) return []

    // 3. Get Existing Appointments
    const startOfDay = new Date(`${date}T00:00:00`).toISOString()
    const endOfDay = new Date(`${date}T23:59:59`).toISOString()

    const { data: appointments } = await supabase
        .from('agenda_appointments')
        .select('start_time, end_time')
        .eq('professional_id', professional_id)
        .neq('status', 'canceled')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)

    // 4. Generate Slots
    // Parse times
    const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number)
        return h * 60 + m
    }
    
    const startMinutes = parseTime(schedule.start_time)
    const endMinutes = parseTime(schedule.end_time)
    const breakStart = schedule.break_start ? parseTime(schedule.break_start) : null
    const breakEnd = schedule.break_end ? parseTime(schedule.break_end) : null

    const slots: string[] = []
    let current = startMinutes

    // Loop through day in `duration` steps
    while (current + duration <= endMinutes) {
        const slotStart = current
        const slotEnd = current + duration

        // Check Break
        let inBreak = false
        if (breakStart !== null && breakEnd !== null) {
            // Overlaps with break if (Start < BreakEnd) AND (End > BreakStart)
            if (slotStart < breakEnd && slotEnd > breakStart) {
                inBreak = true
            }
        }

        // Check Appointments
        let collision = false
        if (!inBreak) {
            // Convert slot start to date for comparison
            const slotDateStart = new Date(`${date}T${Math.floor(slotStart/60).toString().padStart(2,'0')}:${(slotStart%60).toString().padStart(2,'0')}:00`)
            const slotDateEnd = new Date(slotDateStart.getTime() + duration * 60000)
            
            // Check collisions
            for (const app of (appointments || [])) {
                const appStart = new Date(app.start_time)
                const appEnd = new Date(app.end_time)
                
                if (slotDateStart < appEnd && slotDateEnd > appStart) {
                    collision = true
                    break
                }
            }
        }

        if (!inBreak && !collision) {
            slots.push(`${Math.floor(slotStart/60).toString().padStart(2,'0')}:${(slotStart%60).toString().padStart(2,'0')}`)
        }

        current += duration // Or Step? usually slots are fixed grid or duration based.
        // If we want detailed grid, step could be smaller (e.g. 15 or 30 mins) even if duration is long.
        // For simplicity, let's step by duration OR 30 mins?
        // Let's step by duration for now to maximize efficiency, or 30 min if standard?
        // Standard agenda usually has fixed slots (e.g. 30m).
        // Using duration as step ensures services fit perfectly back-to-back.
    }

    return slots
}

export async function createPublicAppointment(tenant_id: string, data: any) {
    const supabase = await createClient()
    
    // 1. Find or Create Client
    // Check by phone or email
    let client_id = null
    
    // Use phone as primary key?
    const { data: existingClient } = await supabase
        .from('agenda_clients')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('phone', data.phone)
        .single()
        
    if (existingClient) {
        client_id = existingClient.id
    } else {
        const { data: newClient, error } = await supabase
            .from('agenda_clients')
            .insert({
                tenant_id,
                product_slug: 'agenda-facil',
                name: data.name,
                phone: data.phone,
                email: data.email
            })
            .select('id')
            .single()
            
        if (error) return { error: 'Erro ao cadastrar cliente' }
        client_id = newClient.id
    }

    // 2. Create Appointment
    const start_time = new Date(`${data.date}T${data.time}:00`)
    // Get service duration
    const { data: service } = await supabase
        .from('agenda_services')
        .select('duration_minutes')
        .eq('id', data.service_id)
        .single()
        
    const duration = service?.duration_minutes || 30
    const end_time = new Date(start_time.getTime() + duration * 60000)

    const { error: appError } = await supabase.from('agenda_appointments').insert({
        tenant_id,
        product_slug: 'agenda-facil',
        client_id,
        service_id: data.service_id,
        professional_id: data.professional_id,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        status: 'scheduled', // Pending confirmation?
        notes: 'Agendamento Online'
    })

    if (appError) return { error: 'Erro ao criar agendamento' }

    return { success: true }
}
