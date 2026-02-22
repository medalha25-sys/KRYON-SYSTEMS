'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT } from 'jose'

/**
 * Checks if the current user is a Super Admin
 */
export async function checkSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
      console.log('SUPER ADMIN CHECK: No user')
      return false
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (error) console.error('SUPER ADMIN CHECK ERROR:', error)
  console.log('SUPER ADMIN CHECK RESULT:', { id: user.id, is_super: profile?.is_super_admin })

  return profile?.is_super_admin === true
}

/**
 * Mint a custom JWT for the target user using the project's JWT Secret
 */
async function mintImpersonationToken(targetUser: any) {
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
  
  const token = await new SignJWT({
    aud: 'authenticated',
    role: 'authenticated',
    email: targetUser.email,
    app_metadata: targetUser.app_metadata || { provider: 'email', providers: ['email'] },
    user_metadata: targetUser.user_metadata || {},
    session_id: crypto.randomUUID(), // Unique session for this impersonation
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(targetUser.id)
    .setIssuedAt()
    .setExpirationTime('1h') // Short lived
    .sign(secret)

  return token
}

/**
 * Starts an impersonation session
 */
export async function startImpersonation(targetUserId: string, reason: string) {
  const isSuper = await checkSuperAdmin()
  if (!isSuper) {
    throw new Error('Não autorizado')
  }

  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  
  // 1. Get Target User Details (Need service role to fetch ANY user by ID)
  // We can't use public client for this usually if they are not me.
  // Actually, we can use the admin client logic from login actions.
  const { createServerClient } = await import('@supabase/ssr')
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const { data: { user: targetUser }, error } = await supabaseAdmin.auth.admin.getUserById(targetUserId)
  
  if (error || !targetUser) {
    throw new Error('Usuário alvo não encontrado')
  }

  // 2. Mint Token
  const impersonationToken = await mintImpersonationToken(targetUser)

  // 3. Log Action
  await supabaseAdmin.from('impersonation_logs').insert({
    admin_id: adminUser?.id,
    target_user_id: targetUserId,
    reason: reason,
    session_metadata: { user_agent: 'web-admin', action: 'start' }
  })

  // 4. Swap Cookies
  // Find the auth cookie name (usually 'sb-<ref>-auth-token')
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find((c: any) => c.name.includes('-auth-token')) // Explicit any to Bypass lint if needed, or rely on type
  
  if (authCookie) {
    // Backup original session
    cookieStore.set('admin-restore-session', authCookie.value, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax'
    })

    // Set new session (mimic Supabase SSR format: ["access_token", "refresh_token"])
    let newValue = ''
    try {
        const originalVal = JSON.parse(decodeURIComponent(authCookie.value))
        if (Array.isArray(originalVal)) {
            newValue = JSON.stringify([impersonationToken, ""])
        } else {
             newValue = JSON.stringify({ access_token: impersonationToken, refresh_token: "" })
        }
    } catch (e) {
        newValue = JSON.stringify([impersonationToken, ""])
    }
    
    cookieStore.set(authCookie.name, newValue, {
        ...authCookie,
        value: newValue,
        maxAge: 3600 // 1 hour
    })
  } else {
      throw new Error('Nenhuma sessão de admin ativa para trocar.')
  }

  redirect('/')
}

/**
 * Stops the impersonation session
 */
export async function stopImpersonation() {
  const cookieStore = await cookies()
  const restoreCookie = cookieStore.get('admin-restore-session')
  
  if (restoreCookie) {
      // Find current auth cookie to overwrite
      const allCookies = cookieStore.getAll()
      const authCookie = allCookies.find((c: any) => c.name.includes('-auth-token'))

      if (authCookie) {
          cookieStore.set(authCookie.name, restoreCookie.value, {
              ...authCookie, 
              value: restoreCookie.value,
              maxAge: 60 * 60 * 24 * 7 // Restore long session
          })
      }
      
      // Clear backup
      cookieStore.delete('admin-restore-session')
  }
  
  redirect('/super-admin')
}

/**
 * Updates an organization's manual status or plan override
 */
export async function updateOrganization(orgId: string, data: { manual_status?: string, manual_plan_override?: string, admin_notes?: string }) {
    const isSuper = await checkSuperAdmin()
    if (!isSuper) throw new Error('Não autorizado')

    const supabase = await createClient()
    const { error } = await supabase.from('organizations').update(data).eq('id', orgId)

    if (error) throw new Error(error.message)
    
    // Log it
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('super_admin_logs').insert({
        admin_id: user?.id,
        action: 'update_organization',
        target_type: 'organization',
        target_id: orgId,
        details: data
    })

    redirect('/super-admin/clinics')
}
