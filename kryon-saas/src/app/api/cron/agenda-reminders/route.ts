import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { sendAppointmentNotification } from '@/lib/notifications/dispatcher';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Authenticate Cron Request (Vercel Cron Secret)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date();

  console.log(`[AGENDA CRON] Executing Reminder Routine at: ${now.toISOString()}`);

  try {
    // -------------------------------------------------------------
    // 2. Window 1: 24-Hour Reminders (Target: now + 23h to now + 25h)
    // -------------------------------------------------------------
    const start24h = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
    const end24h = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

    const { data: appointments24h, error: error24h } = await supabase
      .from('agenda_appointments')
      .select(`
        id,
        organization_id,
        start_time,
        status,
        organizations (id, name, logo_url),
        clients:client_id (name, email, phone),
        agenda_services:service_id (name),
        agenda_professionals:professional_id (name)
      `)
      .in('status', ['scheduled', 'confirmed'])
      .gte('start_time', start24h)
      .lte('start_time', end24h);

    if (error24h) {
      console.error('[AGENDA CRON ERROR] Query 24h appointments failed:', error24h);
    }

    let count24h = 0;
    if (appointments24h && appointments24h.length > 0) {
      for (const appt of appointments24h) {
        const client = appt.clients as any;
        const org = appt.organizations as any;
        const service = appt.agenda_services as any;
        const prof = appt.agenda_professionals as any;

        if (client?.email && org?.id) {
          const result = await sendAppointmentNotification('reminder_24h', {
            appointmentId: appt.id,
            organizationId: org.id,
            organizationName: org.name || 'Clínica',
            organizationLogo: org.logo_url,
            clientName: client.name || 'Paciente',
            clientEmail: client.email,
            clientPhone: client.phone,
            professionalName: prof?.name || 'Profissional',
            serviceName: service?.name || 'Consulta',
            startTime: appt.start_time
          });

          if (result.success && !result.skipped) {
            count24h++;
          }
        }
      }
    }

    // -------------------------------------------------------------
    // 3. Window 2: 2-Hour Reminders (Target: now + 1.5h to now + 2.5h)
    // -------------------------------------------------------------
    const start2h = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
    const end2h = new Date(now.getTime() + 150 * 60 * 1000).toISOString();

    const { data: appointments2h, error: error2h } = await supabase
      .from('agenda_appointments')
      .select(`
        id,
        organization_id,
        start_time,
        status,
        organizations (id, name, logo_url),
        clients:client_id (name, email, phone),
        agenda_services:service_id (name),
        agenda_professionals:professional_id (name)
      `)
      .in('status', ['scheduled', 'confirmed'])
      .gte('start_time', start2h)
      .lte('start_time', end2h);

    if (error2h) {
      console.error('[AGENDA CRON ERROR] Query 2h appointments failed:', error2h);
    }

    let count2h = 0;
    if (appointments2h && appointments2h.length > 0) {
      for (const appt of appointments2h) {
        const client = appt.clients as any;
        const org = appt.organizations as any;
        const service = appt.agenda_services as any;
        const prof = appt.agenda_professionals as any;

        if (client?.email && org?.id) {
          const result = await sendAppointmentNotification('reminder_2h', {
            appointmentId: appt.id,
            organizationId: org.id,
            organizationName: org.name || 'Clínica',
            organizationLogo: org.logo_url,
            clientName: client.name || 'Paciente',
            clientEmail: client.email,
            clientPhone: client.phone,
            professionalName: prof?.name || 'Profissional',
            serviceName: service?.name || 'Consulta',
            startTime: appt.start_time
          });

          if (result.success && !result.skipped) {
            count2h++;
          }
        }
      }
    }

    console.log(`[AGENDA CRON DONE] Processed 24h: ${count24h} | Processed 2h: ${count2h}`);

    return NextResponse.json({
      ok: true,
      timestamp: now.toISOString(),
      processed24h: count24h,
      processed2h: count2h,
      totalProcessed: count24h + count2h
    });

  } catch (err: any) {
    console.error('[AGENDA CRON FATAL ERROR]:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Error' }, { status: 500 });
  }
}
