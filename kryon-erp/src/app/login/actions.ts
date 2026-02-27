'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createServerClient as createClientSSR } from '@supabase/ssr'

/**
 * MISSION: Isolated login action for Standalone Concrete ERP.
 */
export async function loginConcrete(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  try {
    // 1. Authenticate
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) return { error: 'E-mail ou senha incorretos.' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Erro ao identificar o usuário.' }

    // 2. Setup Admin Client for validation (bypassing RLS for check)
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

    // 3. Resolve Organization
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('organization_id, is_super_admin')
        .eq('id', user.id)
        .single()
    
    if (profile?.is_super_admin) {
        return { success: true, redirect: '/dashboard' }
    }

    let organizationId = profile?.organization_id
    if (!organizationId) {
        const { data: membership } = await supabaseAdmin
            .from('organization_users')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
        organizationId = membership?.organization_id
    }

    if (!organizationId) {
        return { error: 'Usuário não vinculado a nenhuma organização industrial.' }
    }

    // 4. SUBSCRIPTION VALIDATION (REQUISITO ARQUITETURAL)
    const { data: subs, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('product_slug', 'concrete-erp')
        .in('status', ['active', 'trial', 'trialing'])
        .gt('current_period_end', new Date().toISOString())
        .limit(1)

    if (subError) {
        console.error('ERP LOGIN ERROR:', subError)
        return { error: 'Erro ao validar sua assinatura do ERP.' }
    }

    if (!subs || subs.length === 0) {
        await supabase.auth.signOut()
        return { error: 'NO_CONCRETE_SUBSCRIPTION' }
    }

    // 5. Success
    return { success: true, redirect: '/dashboard' }

  } catch (err: any) {
    console.error('CRITICAL ERP LOGIN ERROR:', err)
    return { error: 'Erro inesperado no fluxo do ERP.' }
  }
}
