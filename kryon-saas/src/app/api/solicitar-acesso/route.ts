import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Resend client moved inside handler


// Initialize Supabase Admin Client for user creation skipping email confirmation loop if possible
// We try to use SERVICE_ROLE_KEY if available, otherwise ANON key (which might trigger confirmation email)
// Clients initialized inside handler to prevent build-time errors


export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const body = await request.json()
    const { nome, email, crp, cidade } = body

    // 1. Validate fields
    if (!nome || !email || !crp || !cidade) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
    }

    // 2. Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!' // Simple random password

    // Calculate trial end date (15 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 15)

    // 3. Create User in Supabase Auth
    // Using admin.createUser if service role is available allows verifying email immediately
    let authData, authError

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                name: nome,
                crp,
                city: cidade,
                role: 'psicologo_premium',
                trial_ends_at: trialEndsAt.toISOString()
            }
        })
        authData = data
        authError = error
    } else {
        // Fallback to signUp (might trigger Rate Limit or Confirmation Email)
        const { data, error } = await supabase.auth.signUp({
            email,
            password: tempPassword,
            options: {
                data: {
                    name: nome,
                    crp,
                    city: cidade,
                    role: 'psicologo_premium',
                    trial_ends_at: trialEndsAt.toISOString()
                }
            }
        })
        authData = data
        authError = error
    }

    if (authError) {
      console.error('Error creating user:', authError)
      return NextResponse.json({ error: 'Erro ao criar usuário. Tente novamente ou use outro e-mail.' }, { status: 500 })
    }

    // 4. Send Email with Instructions
    if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
            from: 'Agenda Fácil <nao-responda@kryonsystems.com.br>',
            to: email,
            subject: 'Bem-vindo ao Agenda Fácil - Acesso Liberado',
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Olá, Dr(a). ${nome}!</h1>
                    <p>Sua solicitação de acesso foi aprovada automaticamente.</p>
                    <p>Aqui estão suas credenciais provisórias:</p>
                    <p><strong>E-mail:</strong> ${email}</p>
                    <p><strong>Senha:</strong> ${tempPassword}</p>
                    <p>Acesse agora: <a href="https://kryon-saas.vercel.app/login">Login Agenda Fácil</a></p>
                    <p>Recomendamos trocar sua senha após o primeiro acesso.</p>
                </div>
            `
        })
    } else {
        console.log('RESEND_API_KEY missing. Mocking email send.')
        console.log(`To: ${email}, Pass: ${tempPassword}`)
    }

    // 5. Return Success (NEVER return password)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
