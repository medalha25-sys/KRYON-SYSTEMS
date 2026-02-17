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
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/products/agenda-facil/landing') ||
    request.nextUrl.pathname.startsWith('/agenda-facil') ||
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/); // Assets

  // Exclude new flow pages to prevent loops
  const isFlowPage = 
    request.nextUrl.pathname === '/select-organization' ||
    request.nextUrl.pathname === '/select-system'

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Authenticated User Logic
  if (user && !isPublicPath && !isFlowPage) {
      // Check if user has an active organization selected in profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      // If user is logged in, but has no organization context, send to Org Selection
      if (!profile?.organization_id) {
           const url = request.nextUrl.clone()
           url.pathname = '/select-organization'
           return NextResponse.redirect(url)
      }

      // If user has org, but is at root, send to System Selection (which validates org products)
      if (request.nextUrl.pathname === '/') {
          const url = request.nextUrl.clone()
          url.pathname = '/select-system'
          return NextResponse.redirect(url)
      }
      
      // Check for Admin Routes
      if (request.nextUrl.pathname.startsWith('/admin')) {
        // Fetch profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        
        if (profile?.role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/select-system' 
            return NextResponse.redirect(url)
        }
      }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
