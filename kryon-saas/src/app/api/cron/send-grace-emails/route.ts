import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { gracePeriodTemplates } from '@/lib/email-templates/grace-period'
import { differenceInDays, parseISO } from 'date-fns'

// Clients initialized inside handler to prevent build-time errors


export async function GET(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  // Verify Cron Secret (Optional but recommended)
  // const authHeader = request.headers.get('authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 })
  // }

  try {
    // 1. Fetch pending profiles with grace period
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, name, grace_period_until') // Ensure email is in profiles or fetch from auth
      .eq('payment_status', 'pending')
      .not('grace_period_until', 'is', null)

    if (error) throw error

    const now = new Date()
    const results = []

    for (const profile of profiles || []) {
      const graceEnd = parseISO(profile.grace_period_until)
      const daysRemaining = differenceInDays(graceEnd, now)
      
      // Calculate "Day After Failure". 
      // Total grace is 5 days.
      // If daysRemaining = 4, Day 1 passed.
      // If daysRemaining = 3, Day 2 passed (Send #1).
      // If daysRemaining = 1, Day 4 passed (Send #2).
      // If daysRemaining = 0, Day 5 passed/Today (Send #3).

      let template = null
      let subject = ''

      if (daysRemaining === 3) {
        template = gracePeriodTemplates.friendly_reminder
        subject = 'Identificamos um problema no seu pagamento'
      } else if (daysRemaining === 1) {
        template = gracePeriodTemplates.soft_warning
        subject = 'Seu acesso Premium pode ser interrompido'
      } else if (daysRemaining === 0) {
        template = gracePeriodTemplates.final_notice
        subject = 'Seu plano será ajustado hoje'
      }

      if (template && profile.email) {
          // Send Email
          const { data, error: emailError } = await resend.emails.send({
            from: 'Agenda Fácil <nao-responda@agenda-facil.com>',
            to: [profile.email],
            subject: subject,
            html: template(profile.name || 'Cliente', `${process.env.NEXT_PUBLIC_APP_URL}/products/agenda-facil`),
          })

          results.push({ email: profile.email, status: emailError ? 'failed' : 'sent', type: subject })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results })

  } catch (error) {
    console.error('Cron Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
