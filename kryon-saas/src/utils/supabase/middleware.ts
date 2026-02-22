import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
                ...options,
                domain: process.env.NODE_ENV === 'production' ? '.kryonsystems.com.br' : undefined,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            })
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getUser
  // A session refresh will occur if the user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/assinar') &&
    request.nextUrl.pathname !== '/'
  ) {
    // No user, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, check shop and trial status
  if (user && !request.nextUrl.pathname.startsWith('/assinar') && !request.nextUrl.pathname.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, is_super_admin, shop_id, shops(plan, trial_ate, store_type)')
      .eq('id', user.id)
      .single()

    const shop = profile?.shops as any
    const isSuperAdmin = profile?.is_super_admin === true

    if (shop) {
      const isTrialOver = shop.trial_ate && new Date(shop.trial_ate) < new Date()
      const isBlocked = shop.plan === 'bloqueado'
      const isTrial = shop.plan === 'trial'
      const storeType = shop.store_type

      if (isBlocked || (isTrial && isTrialOver)) {
        const url = request.nextUrl.clone()
        url.pathname = '/assinar'
        return NextResponse.redirect(url)
      }

      // Route Protection: Prevent Cross-System Access (Skips for Super Admin)
      if (!isSuperAdmin) {
          if (storeType === 'fashion_store_ai') {
              if (request.nextUrl.pathname.startsWith('/mobile') || request.nextUrl.pathname.startsWith('/products/agenda-facil')) {
                  const url = request.nextUrl.clone()
                  url.pathname = '/fashion/dashboard'
                  return NextResponse.redirect(url)
              }
          }

          if (storeType === 'mobile_store_ai') {
              if (request.nextUrl.pathname.startsWith('/fashion') || request.nextUrl.pathname.startsWith('/products/agenda-facil')) {
                  const url = request.nextUrl.clone()
                  url.pathname = '/mobile/dashboard'
                  return NextResponse.redirect(url)
              }
          }

          if (storeType === 'agenda_facil_ai') {
              if (request.nextUrl.pathname.startsWith('/fashion') || request.nextUrl.pathname.startsWith('/mobile')) {
                  const url = request.nextUrl.clone()
                  url.pathname = '/products/agenda-facil'
                  return NextResponse.redirect(url)
              }
          }
      }
    }
  }

  // 5. Multi-domain / Subdomain handling
  const host = request.headers.get('host') || ''
  const isERPSubdomain = host.startsWith('erp.')

  // If accessing via erp. sub-domain, and not already on /concrete, redirect
  if (isERPSubdomain && !request.nextUrl.pathname.startsWith('/concrete')) {
      const url = request.nextUrl.clone()
      url.pathname = `/concrete${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}
