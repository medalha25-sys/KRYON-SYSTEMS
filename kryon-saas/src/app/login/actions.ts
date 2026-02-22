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
  console.log('DEBUG LOGIN: User authenticated', { id: user.id, email: user.email })

  // Use Admin Client for checks to bypass RLS latency/issues during login
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
    const companyName = user.user_metadata?.company_name || 'Minha Empresa'
    let productSlug = user.user_metadata?.product_slug

    // ---------------------------------------------------------
    // 1. RESOLVE ORGANIZATION
    // ---------------------------------------------------------
    // Try to find an existing organization linked to the user's profile
    let { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('organization_id, role, is_super_admin')
        .eq('id', user.id)
        .single()
    
    console.log('DEBUG LOGIN: Service Role Key Present?', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('DEBUG LOGIN: Fetched Profile:', profile)
    if (profileError) console.error('DEBUG LOGIN: Profile Error:', profileError)

    let orgId = profile?.organization_id

    // If not in profile, check organization_members
    if (!orgId) {
        const { data: member } = await supabaseAdmin
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
        
        if (member) {
            orgId = member.organization_id
            // Fix profile link
            await supabaseAdmin.from('profiles').update({ organization_id: orgId }).eq('id', user.id)
        }
    }

    // If still no org, create one (SaaS onboarding)
    if (!orgId) {
        console.log('DEBUG LOGIN: No organization found, creating one...')
        const orgSlug = (companyName || 'org')
            .toLowerCase()
            .trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 7)

        const { data: newOrg, error: orgError } = await supabaseAdmin
            .from('organizations')
            .insert({ name: companyName, slug: orgSlug })
            .select('id')
            .single()

        if (orgError) { 
            console.error('DEBUG LOGIN: Org creation error', orgError)
            return { error: 'Erro ao criar organização: ' + orgError.message }
        }

        orgId = newOrg.id
        
        // Link user to org
        await supabaseAdmin.from('organization_members').insert({ 
            organization_id: orgId, 
            user_id: user.id, 
            role: 'owner' // First user is owner
        })
        
        // Update profile
        await supabaseAdmin.from('profiles').upsert({ 
            id: user.id,
            organization_id: orgId,
            role: 'admin',
            name: user.user_metadata?.full_name || companyName
        })
    }

    // ---------------------------------------------------------
    // 1.5 CHECK SUPER ADMIN BYPASS
    // ---------------------------------------------------------
    if (profile?.is_super_admin) {
        console.log('DEBUG LOGIN: User is Super Admin, bypassing subscription check.')
        return { success: true, redirect: '/super-admin' }
    }

    // ---------------------------------------------------------
    // 2. CHECK SUBSCRIPTION (By Organization)
    // ---------------------------------------------------------
    // Use Admin to bypass RLS, ensuring we see it if it exists
    const { data: existingSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('*, products(slug)')
      .eq('organization_id', orgId)
      .in('status', ['active', 'trial'])

    // If no subscription, create a trial
    if (!existingSubs || existingSubs.length === 0) {
      console.log('DEBUG LOGIN: No active subscription found for org', orgId)
      
      if (!productSlug) {
          // Default to agenda-facil if not specified, or try to detect from legacy shop
          const { data: legacyShop } = await supabaseAdmin.from('shops').select('store_type').eq('owner_id', user.id).maybeSingle()
          if (legacyShop?.store_type === 'agenda_facil_ai') productSlug = 'agenda-facil'
          else if (legacyShop?.store_type === 'fashion_store_ai') productSlug = 'fashion-manager'
          else productSlug = 'agenda-facil' // Default fallback
          
          console.log('DEBUG LOGIN: Force-detected product slug:', productSlug)
      }

      // Try to find the product
      const { data: product } = await supabaseAdmin.from('products').select('id, slug').eq('slug', productSlug).single()

      if (product) {
        console.log('DEBUG LOGIN: Creating trial subscription for product:', product.slug)
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 15)

        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            organization_id: orgId, // LINK TO ORG, NOT USER
            product_id: product.id,
            product_slug: product.slug, // Legacy/Redundancy
            status: 'trial',
            current_period_end: trialEnd.toISOString()
          })
        
        if (subError) {
            console.error('DEBUG LOGIN: Subscription creation error', subError)
            // If checking user_id constraint failure (legacy table?), try adding user_id
            if (subError.message.includes('user_id')) {
                 console.log('DEBUG LOGIN: Retrying subscription with user_id (Legacy Schema support)...')
                 const { error: retryError } = await supabaseAdmin.from('subscriptions').insert({
                    organization_id: orgId,
                    user_id: user.id,
                    product_id: product.id,
                    product_slug: product.slug,
                    status: 'trial',
                    current_period_end: trialEnd.toISOString()
                 })
                 if (retryError) return { error: 'Erro ao criar assinatura (Retry): ' + retryError.message }
            } else {
                return { error: 'Erro ao criar seu período de teste: ' + translateSupabaseError(subError) }
            }
        }
        console.log('DEBUG LOGIN: Trial subscription created successfully')
      } else {
           // Fallback if product lookup failed (e.g., 'agenda-facil' not in DB yet?)
           // Log warning but allow login if user has legacy shop
           console.warn('DEBUG LOGIN: Product not found for slug:', productSlug)
           // If we have a shop, maybe we can proceed without a subscription record for now?
           // No, select-system needs subscriptions. 
           // Let's return a specific error instructing the user to contact support (or we seed the product).
           return { error: `Sistema selecionado (${productSlug}) não encontrado. Contate o suporte.` }
      }
    }

    revalidatePath('/', 'layout')
    
    // ---------------------------------------------------------
    // 3. DETERMINE REDIRECT
    // ---------------------------------------------------------
    // Refetch to be sure we have the latest
    const { data: finalSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('*, products(slug)')
      .eq('organization_id', orgId)
      .in('status', ['active', 'trial'])
    
    // Fallback: Check 'shops' table for legacy store_type redirection
    // (This ensures we don't break old flows if SaaS migration isn't 100%)
    const { data: shop } = await supabaseAdmin
        .from('shops')
        .select('store_type')
        .eq('owner_id', user.id)
        .maybeSingle()

    let redirectPath = '/select-system' // Default

    // Logic: If user has specific legacy store_type, prioritize it
    // Else, if has 1 subscription, go there.
    // If multiple, go to select-system.
    
    if (shop?.store_type === 'agenda_facil_ai') {
        redirectPath = '/products/agenda-facil'
    } else if (shop?.store_type === 'fashion_store_ai') {
        redirectPath = '/fashion/dashboard'
    } else if (shop?.store_type === 'mobile_store_ai') {
        redirectPath = '/mobile/dashboard'
    } else if (finalSubs && finalSubs.length > 0) {
        // SaaS Logic
        if (finalSubs.length === 1) {
             const slug = finalSubs[0].products?.slug || finalSubs[0].product_slug
             if (slug === 'agenda-facil') redirectPath = '/products/agenda-facil'
             else if (slug === 'fashion-ai' || slug === 'fashion-manager') redirectPath = '/fashion/dashboard'
             else if (slug === 'gestao-pet') redirectPath = '/products/gestao-pet' // or wherever
             else redirectPath = `/products/${slug}`
        }
    } else {
        // No subscription found even after creation attempt?
        console.error('DEBUG LOGIN: No subscription found after creation logic.')
        return { error: 'Login realizado, mas você não possui uma assinatura ativa.' }
    }

    // Ensure shop store_type syncs with destination (Legacy Sync)
    // If we determined we are going to Agenda, make sure Shop says Agenda
    if (redirectPath.includes('agenda-facil') && shop?.store_type !== 'agenda_facil_ai') {
        await supabaseAdmin.from('shops').update({ store_type: 'agenda_facil_ai' }).eq('owner_id', user.id)
    }

    return { success: true, redirect: redirectPath }

  } catch (err: any) {
      if (err.digest?.startsWith('NEXT_REDIRECT')) throw err
      console.error('CRITICAL LOGIN ERROR:', err)
      return { error: 'Ocorreu um erro inesperado: ' + (err.message || err) }
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
