import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkAccess } from './utils/access_control'

export async function middleware(request: NextRequest) {
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
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
                ...options,
                // Same domain as global if needed for cookies, or isolated
                domain: process.env.NODE_ENV === 'production' ? '.kryonsystems.com.br' : undefined,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1. Liberate login
  if (path === '/login') {
      return supabaseResponse
  }

  // 2. Auth Protection
  if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
  }

  // 3. Subscription Protection (MISSION CRITICAL)
  const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, is_super_admin')
      .eq('id', user.id)
      .single()
  
  if (!profile?.is_super_admin) {
      if (!profile?.organization_id) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('message', 'Sem organização vinculada.')
          return NextResponse.redirect(url)
      }

      const access = await checkAccess(supabase, profile.organization_id, 'concrete-erp')
      if (!access.hasAccess) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('error', 'NO_CONCRETE_SUBSCRIPTION')
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
