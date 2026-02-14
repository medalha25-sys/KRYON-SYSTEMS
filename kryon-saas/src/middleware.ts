import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Create Supabase Client & Refresh Session
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. Auth Protection (Global)
  // Exclude public paths and auth flows
  const isPublicPath = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/trial') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/upgrade') ||
    request.nextUrl.pathname.startsWith('/agendar') || // Public Scheduling
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/); // Assets

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Subscription Based Redirection (After Auth)
  // Check on Root or Dashboard
  const isRootOrDashboard = request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname === '/app'

  if (user && isRootOrDashboard) {
      // Fetch active subscriptions for this USER
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('product_slug')
        .eq('user_id', user.id)
        .in('status', ['active', 'trial'])

      // Check store type to prevent mixed redirection
      const { data: shop } = await supabase
        .from('shops')
        .select('store_type')
        .eq('owner_id', user.id)
        .maybeSingle()
      
      const storeType = shop?.store_type

      if (storeType === 'fashion_store_ai') {
          const url = request.nextUrl.clone()
          url.pathname = '/fashion/dashboard'
          return NextResponse.redirect(url)
      }

      if (!subscriptions || subscriptions.length === 0) {
          const url = request.nextUrl.clone()
          url.pathname = '/pricing'
          return NextResponse.redirect(url)
      } else if (subscriptions.length === 1) {
          const slug = subscriptions[0].product_slug
          const url = request.nextUrl.clone()
          url.pathname = `/products/${slug}`
          return NextResponse.redirect(url)
      } else {
          const url = request.nextUrl.clone()
          url.pathname = '/select-system'
          return NextResponse.redirect(url)
      }
  }
  
  // 4. Product Access Control
  const productMatch = request.nextUrl.pathname.match(/^\/products\/([^/]+)/)

  if (user && productMatch) {
    const slug = productMatch[1]

    // Fetch subscription for this product linked to USER
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .eq('product_slug', slug)
      .maybeSingle()

    if (!subscription) {
       const url = request.nextUrl.clone()
       url.pathname = '/pricing'
       return NextResponse.redirect(url)
    }

    // 4c. Check for Blocked or Expired status
    if (subscription.status === 'blocked' || subscription.status === 'canceled' || subscription.status === 'expired') {
        const url = request.nextUrl.clone()
        url.pathname = '/upgrade'
        url.searchParams.set('product', slug)
        url.searchParams.set('reason', subscription.status)
        return NextResponse.redirect(url)
    }

    // 4d. Check Trial/Subscription Expiration
    if (subscription.current_period_end) {
        const periodEnd = new Date(subscription.current_period_end)
        const now = new Date()
        
        if (now > periodEnd && subscription.status === 'trial') {
            const url = request.nextUrl.clone()
            url.pathname = '/upgrade'
            url.searchParams.set('reason', 'expired')
            url.searchParams.set('product', slug)
            return NextResponse.redirect(url)
        }
    }
  }

  // 5. Isolation: Store Type Check for Exclusive Routes
  const isFashionRoute = request.nextUrl.pathname.startsWith('/fashion')
  const isMobileRoute = request.nextUrl.pathname.startsWith('/mobile')

  if (user && (isFashionRoute || isMobileRoute)) {
      const { data: shop } = await supabase
        .from('shops')
        .select('store_type')
        .eq('owner_id', user.id)
        .maybeSingle()
      
      const storeType = shop?.store_type || 'other'

      if (isFashionRoute && storeType !== 'fashion_store_ai') {
          // Block access if not fashion store
          const url = request.nextUrl.clone()
          url.pathname = '/products' // Redirect to generic list or 403
          return NextResponse.redirect(url)
      }

      if (isMobileRoute && storeType !== 'mobile_store_ai') {
          // Block access if not mobile store
          const url = request.nextUrl.clone()
          url.pathname = '/products'
          return NextResponse.redirect(url)
      }
  }

  // 6. Admin Routes Protection
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail || user.email !== adminEmail) {
          const url = request.nextUrl.clone()
          url.pathname = '/login' 
          return NextResponse.redirect(url)
      }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
