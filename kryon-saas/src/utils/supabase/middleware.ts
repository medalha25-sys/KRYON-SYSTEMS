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
            supabaseResponse.cookies.set(name, value, options)
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
      .select('shop_id, shops(plan, trial_ate)')
      .eq('id', user.id)
      .single()

    const shop = profile?.shops as any

    if (shop) {
      const isTrialOver = shop.trial_ate && new Date(shop.trial_ate) < new Date()
      const isBlocked = shop.plan === 'bloqueado'
      const isTrial = shop.plan === 'trial'

      if (isBlocked || (isTrial && isTrialOver)) {
        const url = request.nextUrl.clone()
        url.pathname = '/assinar'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
