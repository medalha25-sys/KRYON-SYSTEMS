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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('DEBUG LOGIN: Missing Admin Environment Variables for handlePostLogin');
    return { error: 'Erro interno ao processar sua conta. Por favor, tente novamente.' };
  }

  const supabaseAdmin = createClientSSR(
    url,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return [] },
        setAll(cookiesToSet: any) {}
      }
    }
  )

  try {
    console.log('DEBUG LOGIN: Starting post-login for:', user.email, 'ID:', user.id)

    // 1. Buscar Perfil para obter Contexto de Organização e Loja
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id, shop_id, role, is_super_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('DEBUG LOGIN: Profile Error:', profileError)
    }

    const orgId = profile?.organization_id
    const shopIdFromProfile = profile?.shop_id

    console.log('DEBUG LOGIN: Contexto - Org:', orgId, 'Shop (Profile):', shopIdFromProfile, 'Role:', profile?.role)

    // 1.5 Super Admin bypass
    if (profile?.is_super_admin) {
      console.log('DEBUG LOGIN: Super Admin detected. Redirecting to /super-admin')
      return { success: true, redirect: '/super-admin' }
    }

    // 2. Buscar Shop pelo owner_id ou shop_id do profile
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .or(`owner_id.eq.${user.id},id.eq.${shopIdFromProfile || '00000000-0000-0000-0000-000000000000'}`)
      .maybeSingle()

    if (shopError) {
      console.error('DEBUG LOGIN: Shop Fetch Error:', shopError)
    }

    // Onboarding: Se não existe shop, cria um padrão
    if (!shop) {
      console.log('DEBUG LOGIN: No shop found. Creating default onboarding shop.')
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
        console.error('DEBUG LOGIN: Error creating initial shop:', createError)
        return { error: 'Erro ao configurar sua conta inicial.' }
      }
      
      console.log('DEBUG LOGIN: New shop created:', newShop.id)
      return { success: true, redirect: '/products/agenda-facil' }
    }

    console.log('DEBUG LOGIN: Shop Found:', shop.id, 'StoreType:', shop.store_type)

    // 3. Buscar Assinaturas Ativas (Arquitetura Nova: via Organization ID)
    let activeSubs: any[] = []
    if (orgId) {
       const { data: orgSubs, error: orgSubError } = await supabaseAdmin
          .from('subscriptions')
          .select('*, products(slug)')
          .eq('organization_id', orgId)
          .in('status', ['active', 'trial'])
       
       if (orgSubError) console.error('DEBUG LOGIN: Org Subscription Query Error:', orgSubError)
       if (orgSubs) activeSubs = [...activeSubs, ...orgSubs]
    }

    // 4. Fallback: Buscar Assinaturas via Shop ID (Arquitetura Legada)
    if (activeSubs.length === 0) {
      const { data: shopSubs } = await supabaseAdmin
        .from('subscriptions')
        .select('*, products(slug)')
        .eq('shop_id', shop.id)
        .in('status', ['active', 'trial'])
      if (shopSubs) activeSubs = [...activeSubs, ...shopSubs]
    }

    // 5. Fallback: Buscar Assinaturas via User ID
    if (activeSubs.length === 0) {
        const { data: userSubs } = await supabaseAdmin
            .from('subscriptions')
            .select('*, products(slug)')
            .eq('user_id', user.id)
            .in('status', ['active', 'trial'])
        if (userSubs) activeSubs = [...activeSubs, ...userSubs]
    }

    // Prioritizar Concrete ERP se estiver entre as assinaturas ativas
    const concreteSub = activeSubs.find(sub => 
        sub.products?.slug === 'concrete-erp' || 
        sub.product_slug === 'concrete-erp' ||
        sub.products?.slug === 'industrial' ||
        sub.product_slug === 'industrial'
    );
    
    // Escolher a assinatura "principal" (se for concrete, usamos ela)
    const activeSub = concreteSub || (activeSubs.length > 0 ? activeSubs[0] : null);
    const hasMultipleSubs = activeSubs.length > 1;

    console.log('DEBUG LOGIN: Active Subscriptions Found:', activeSubs.length, 'Main Sub Product:', activeSub?.products?.slug)

    // 6. Determinar Redirecionamento
    if (activeSub || shop.plan === 'pro' || shop.plan === 'trial') {
      let redirectPath = ''
      
      // Se tivermos múltiplas assinaturas autivas, mandamos para o seletor, 
      // A MENOS que uma delas seja o Concrete ERP (que priorizamos).
      if (hasMultipleSubs && !concreteSub) {
        console.log('DEBUG LOGIN: Multiple subscriptions found. Redirecting to /select-system');
        return { success: true, redirect: '/select-system' }
      }

      const productSlug = activeSub?.products?.slug || activeSub?.product_slug;
      
      console.log('DEBUG LOGIN: Processing Product:', productSlug, 'ShopType:', shop.store_type);

      if (productSlug === 'fashion-ai' || productSlug === 'fashion-store-ai' || productSlug === 'loja-roupas' || shop.store_type === 'fashion_store_ai') {
        redirectPath = '/fashion/dashboard'
      } else if (productSlug === 'concrete-erp' || productSlug === 'industrial' || shop.store_type === 'concrete_erp' || shop.store_type === 'industrial') {
        redirectPath = '/concrete'
      } else if (productSlug === 'agenda-facil' || productSlug === 'agenda-facil-ai' || shop.store_type === 'agenda_facil_ai') {
        redirectPath = '/products/agenda-facil'
      } else if (productSlug === 'lava-rapido' || shop.store_type === 'lava_rapido') {
        redirectPath = '/products/lava-rapido'
      } else {
        // Fallback para seleção se o produto não for reconhecido
        redirectPath = '/select-system'
      }

      // Proteção extra contra caminhos inválidos
      if (!redirectPath || redirectPath === '/app/' || redirectPath === '/app/undefined') {
        redirectPath = '/select-system'
      }

      console.log('DEBUG LOGIN: Success. Final Redirect Path:', redirectPath)
      return { success: true, redirect: redirectPath }
    }

    // 7. Se tem loja mas não tem assinatura, manda para seleção ou dashboard
    console.warn('DEBUG LOGIN: No active subscription found for shop/org. Falling back to /select-system')
    return { success: true, redirect: '/select-system' }

  } catch (err: any) {
    console.error('CRITICAL POST-LOGIN ERROR:', err)
    return { error: 'Erro inesperado no login (Flow Error).' }
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
      // Log full error object for debugging in the backend
      console.error('CRITICAL LOGIN ACTION ERROR:', err)
      console.dir(err, { depth: null })

      return { error: 'Não foi possível processar o login no momento. Por favor, tente novamente mais tarde.' }
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
