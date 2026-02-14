'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { type User, type SupabaseClient } from '@supabase/supabase-js'
import { translateSupabaseError } from '@/utils/error_handling'

/**
 * Handles the post-login flow: checks/creates shop, checks/creates subscription, and redirects.
 * Used by both login (password) and verifyOtp (code).
 */
async function handlePostLogin(user: User, supabase: SupabaseClient) {
  console.log('DEBUG LOGIN: User authenticated', { id: user.id, email: user.email, metadata: user.user_metadata })

  try {
    // 1. Post-Confirmation Onboarding Check
    let { data: shop, error: fetchShopError } = await supabase
      .from('shops')
      .select('id, name')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (fetchShopError) {
      console.error('Fetch Shop Error:', fetchShopError)
      return { error: 'Erro ao consultar sua empresa: ' + fetchShopError.message }
    }

    const companyName = user.user_metadata?.company_name || 'Minha Empresa'
    let productSlug = user.user_metadata?.product_slug
    
    // If no shop, create one
    if (!shop) {
      console.log('DEBUG LOGIN: Shop not found, creating one...')
      const slug = (companyName || 'loja')
        .toLowerCase()
        .trim()
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)

      const trialDays = 15
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + trialDays)

      const { data: newShop, error: shopError } = await supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          name: companyName,
          slug: slug,
          plan: 'trial',
          trial_ate: trialEnd.toISOString()
        })
        .select('id')
        .single()

      if (shopError) {
        console.error('DEBUG LOGIN: Shop creation error', shopError)
        return { error: 'Erro ao configurar sua empresa: ' + shopError.message }
      } 
      shop = { id: newShop.id, name: companyName } 
      console.log('DEBUG LOGIN: Shop created', shop.id)
    }

    // 2. Ensure at least one subscription exists
    const { data: existingSubs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])

    if (!existingSubs || existingSubs.length === 0) {
      console.log('DEBUG LOGIN: No active subscription found for user', user.id)
      
      if (!productSlug) {
          console.log('DEBUG LOGIN: No productSlug in metadata, searching for default product...')
          const { data: firstProduct } = await supabase.from('products').select('slug').limit(1).single()
          productSlug = firstProduct?.slug
      }

      if (productSlug) {
        console.log('DEBUG LOGIN: Creating trial subscription for product:', productSlug)
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 15)

        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id, 
            product_slug: productSlug,
            status: 'trial',
            current_period_end: trialEnd.toISOString()
          })
        
        if (subError) {
            console.error('DEBUG LOGIN: Subscription creation error', subError)
            
            // Tradução de erros comuns do banco de dados
            return { error: 'Erro ao criar seu período de teste: ' + translateSupabaseError(subError) }
        }
        console.log('DEBUG LOGIN: Trial subscription created successfully')
      } else {
          return { error: 'Não foi possível identificar o sistema que você deseja acessar. Fale com suporte.' }
      }
    }

    revalidatePath('/', 'layout')
    
    // 3. Final Fetch & Redirect
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*, products(slug)')
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])

    console.log('DEBUG LOGIN: Final subscription check count:', subscriptions?.length)

    // Check store_type for redirection
    const { data: shopData } = await supabase
      .from('shops')
      .select('store_type')
      .eq('owner_id', user.id)
      .maybeSingle()
    
    // Default to 'other' if not found
    let storeType = shopData?.store_type || 'other'
    console.log('DEBUG LOGIN: Store Type:', storeType)

    // CHECK FOR SYNC: Update store_type based on active subscriptions
    // Do not force store_type if it effectively hides other products
    if (subscriptions && subscriptions.length > 0) {
        const subSlugs = subscriptions.map((s: any) => s.product_slug || (s.products as any)?.slug);
        
        let derivedType = 'other';
        const hasFashion = subSlugs.some((s: string) => s && s.includes('fashion-manager'));
        const hasMobile = subSlugs.some((s: string) => s && s.includes('tech-assist'));
        const hasAgenda = subSlugs.some((s: string) => s && s.includes('agenda')); 

        // Only set specific store types if they are the exclusive or dominant intended type
        // If user has Agenda (or mixed), usage determines priority, but exclusive agenda goes to agenda
        if (hasFashion && !hasAgenda && !hasMobile) {
            derivedType = 'fashion_store_ai';
        } else if (hasMobile && !hasFashion && !hasAgenda) {
            derivedType = 'mobile_store_ai';
        } else if (hasAgenda && !hasFashion && !hasMobile) {
            derivedType = 'agenda_facil_ai';
        } else {
             derivedType = 'other';
        }

        // Update DB if mismatch
        if (storeType !== derivedType) {
             console.log(`DEBUG LOGIN: Auto-correcting store_type from '${storeType}' to '${derivedType}'`)
             await supabase.from('shops').update({ store_type: derivedType }).eq('owner_id', user.id)
             storeType = derivedType
        }
    }

    if (storeType === 'fashion_store_ai') {
        console.log('DEBUG LOGIN: Redirecting to fashion dashboard...')
        return { success: true, redirect: '/fashion/dashboard' }
    }

    if (storeType === 'mobile_store_ai') {
        console.log('DEBUG LOGIN: Redirecting to mobile dashboard...')
        return { success: true, redirect: '/mobile/dashboard' }
    }

    if (storeType === 'agenda_facil_ai') {
        console.log('DEBUG LOGIN: Redirecting to agenda dashboard...')
        return { success: true, redirect: '/products/agenda-facil' }
    }

    // Legacy/Generic Redirection
    if (subscriptions && subscriptions.length > 0) {
        if (subscriptions.length === 1) {
            const slug = subscriptions[0].product_slug || (subscriptions[0].products as any)?.slug
            
            // Map legacy slugs to new routes if needed (migration fallback)
            if (slug === 'fashion-manager') return { success: true, redirect: '/fashion/dashboard' }
            if (slug === 'tech-assist') return { success: true, redirect: '/products/tech-assist' }
            
            console.log('DEBUG LOGIN: Redirecting to product dashboard:', slug)
            return { success: true, redirect: `/products/${slug}` }
        } else {
            console.log('DEBUG LOGIN: Multiple systems found, redirecting to selection')
            return { success: true, redirect: '/products' }
        }
    }

    // Fallback if truly no subscription can be created/found
    console.error('DEBUG LOGIN: Reached final fallback. User has no active system.')
    return { error: 'Login realizado, mas você não possui uma assinatura ativa. Por favor, entre em contato com o suporte.' }
  } catch (err: any) {
      if (err.digest?.startsWith('NEXT_REDIRECT')) throw err
      console.error('CRITICAL LOGIN ERROR:', err)
      
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.'
      if (err.message?.includes('Database error')) {
        errorMessage = 'Erro de conexão com o banco de dados. Por favor, tente novamente.'
      }

      return { error: errorMessage }
  }
}

export async function login(prevState: any, formData: FormData) {
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

  return await handlePostLogin(user, supabase)
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
