'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { type User, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient as createClientSSR } from '@supabase/ssr'
import { translateSupabaseError } from '@/utils/error_handling'

/**
 * Handles the post-login flow: checks/creates shop, checks/creates subscription, and redirects.
 * Used by both login (password) and verifyOtp (code).
 */
async function handlePostLogin(user: User, supabase: SupabaseClient) {
  const supabaseAdmin = createClientSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll(cookiesToSet: any) {}
      }
    }
  )

  try {
    // 1. Validar Usuário Autenticado (Já recebido via parâmetro)
    console.log('DEBUG LOGIN: Processando pós-login para:', user.email)

    // 2. Buscar Shop pelo owner_id
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (shopError) {
      console.error('DEBUG LOGIN: Erro ao buscar Shop:', shopError)
      return { error: 'Erro ao validar sua loja. Por favor, tente novamente.' }
    }

    // Onboarding: Se não existe shop, cria um padrão (Legacy support)
    if (!shop) {
      console.log('DEBUG LOGIN: Shop não encontrado, criando novo para:', user.id)
      const { data: newShop, error: createError } = await supabaseAdmin
        .from('shops')
        .insert({
          owner_id: user.id,
          name: user.user_metadata?.company_name || 'Minha Empresa',
          slug: `shop-${user.id.slice(0, 8)}`,
          store_type: 'agenda_facil_ai',
          plan: 'trial'
        })
        .select()
        .single()

      if (createError) {
        console.error('DEBUG LOGIN: Erro ao criar Shop:', createError)
        return { error: 'Erro ao configurar sua conta inicial.' }
      }
      
      return { success: true, redirect: '/app/agenda-facil' }
    }

    // 3. Buscar Subscription pelo shop_id
    const { data: sub, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('shop_id', shop.id)
      .in('status', ['active', 'trial'])
      .maybeSingle()

    // 4. Se não encontrar pelo shop_id, tenta pelo user_id (Migração)
    let activeSub = sub
    if (!activeSub) {
        const { data: userSub } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['active', 'trial'])
            .maybeSingle()
        activeSub = userSub
    }

    // 5. Permitir acesso se status for active ou trial
    if (activeSub || shop.plan === 'pro' || shop.plan === 'trial') {
      // 6. Redirecionar para /app/{store_type} ou rotas específicas
      let redirectPath = ''
      
      if (shop.store_type === 'concrete_erp' || shop.store_type === 'industrial') {
        redirectPath = '/concrete'
      } else if (shop.store_type === 'agenda_facil_ai') {
        redirectPath = '/app/agenda-facil'
      } else if (shop.store_type === 'fashion_store_ai') {
        redirectPath = '/fashion/dashboard'
      } else {
        redirectPath = `/app/${shop.store_type}`
      }

      console.log('DEBUG LOGIN: Acesso liberado. Redirecionando para:', redirectPath)
      return { success: true, redirect: redirectPath }
    }

    // Se chegar aqui, não tem assinatura ativa
    console.warn('DEBUG LOGIN: Bloqueado por falta de assinatura ativa.')
    return { error: 'Login realizado, mas você não possui uma assinatura ativa. Por favor, entre em contato com o suporte.' }

  } catch (err: any) {
    console.error('CRITICAL POST-LOGIN ERROR:', err)
    return { error: 'Erro inesperado no login.' }
  }
}

export async function login(prevState: any, formData: FormData) {
  try {
      const supabase = await createClient()

      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      }

      const { error } = await supabase.auth.signInWithPassword(data)

      if (error) {
        let friendlyMessage = error.message
        
        if (error.message === 'Invalid login credentials') {
          friendlyMessage = 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.'
        } else if (error.message === 'Email not confirmed') {
          friendlyMessage = 'E-mail ainda não confirmado. Verifique sua caixa de entrada (e spam).'
        } else {
          friendlyMessage = `Erro na autenticação: ${error.message}`
        }

          console.warn('Login Failed:', error.message)
          return { error: friendlyMessage }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'Erro ao obter usuário após login' }
      }

      const result = await handlePostLogin(user, supabase)
      if (result?.error) {
        console.error('LOGIN FLOW ERROR:', result.error)
      }
      return result
  } catch (err: any) {
      if (err.digest?.startsWith('NEXT_REDIRECT')) throw err
      console.error('CRITICAL LOGIN ACTION ERROR:', err)
      // Log full error object for debugging
      console.dir(err, { depth: null })
      return { error: 'Erro crítico ao tentar entrar: ' + (err.message || 'Erro desconhecido') }
  }
}

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const token = formData.get('token') as string

  if (!email || !token) {
    return { error: 'E-mail e código são obrigatórios.' }
  }

  console.log('DEBUG OTP: Verifying for', email)

  // First try as 'signup' (most common for new users)
  let { data: { session }, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup', 
  })

  // If failed, try 'email' (for login/magiclink flows turned into otp)
  if (error || !session) {
      console.log('DEBUG OTP: signup type failed, trying email type...', error?.message)
      const res = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
    })
    session = res.data.session
    error = res.error
  }
  
  if (error || !session) {
     console.error('OTP Error:', error)
     return { error: 'Código inválido ou expirado. Tente novamente.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      console.error('OTP: User not found after successful verification')
      return { error: 'Usuário não encontrado após verificação. Tente novamente.' }
  }

  return await handlePostLogin(user, supabase)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const shop_id = formData.get('shop_id') as string
  const role = formData.get('role') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        shop_id: shop_id || null,
        role: role || 'admin'
      }
    }
  })

  if (error) {
    let friendlyMessage = error.message
    if (error.message === 'User already registered') {
      friendlyMessage = 'Este e-mail já está cadastrado. Tente entrar na sua conta.'
    } else {
      friendlyMessage = 'Erro ao cadastrar: ' + error.message
    }
    redirect('/register?message=' + encodeURIComponent(friendlyMessage))
  }

  // 1. If session exists immediately (Auto-Confirm ON), proceed to onboarding
  if (data.session) {
     const result = await handlePostLogin(data.session.user, supabase)
     if (result?.error) {
        redirect('/register?message=' + encodeURIComponent(result.error))
     }
     return // handlePostLogin redirects on success
  }

  // 2. If NO session, check if we can login immediately (maybe Auto-Confirm is ON but signUp didn't return session)
  // This happens in some Supabase configs or if the user was already created but not confirmed (and now confirmed?)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (!signInError && signInData.session) {
      const result = await handlePostLogin(signInData.session.user, supabase)
      if (result?.error) {
        redirect('/register?message=' + encodeURIComponent(result.error))
      }
      return
  }

  // 3. Fallback: User is truly unverified or Verify Email is ON.
  // Redirect to OTP verification page
  redirect(`/auth/verify?email=${encodeURIComponent(email)}`)
}
