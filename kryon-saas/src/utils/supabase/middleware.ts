import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('MIDDLEWARE ERROR: Missing Supabase environment variables');
    throw new Error("Your project's URL and Key are required to create a Supabase client!");
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // 3. Authenticated User Logic (Consolidated from proxy.ts)
  const isPublicPath = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/products/agenda-facil/landing') ||
    request.nextUrl.pathname.startsWith('/agenda-facil');

  const isFlowPage = 
    request.nextUrl.pathname === '/select-organization' ||
    request.nextUrl.pathname === '/select-system';

  if (user && !isPublicPath && !isFlowPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, is_super_admin, shop_id, shops(plan, trial_ate, store_type)')
      .eq('id', user.id)
      .single();

    const isSuperAdmin = profile?.is_super_admin === true;

    // 3.1. Organization Context Protection
    const orgIdCookie = request.cookies.get('org_id')?.value;
    const organizationId = profile?.organization_id || orgIdCookie;

    if (!organizationId) {
        const url = request.nextUrl.clone();
        url.pathname = '/select-organization';
        return NextResponse.redirect(url);
    }

    // 3.2. System/Root Redirection
    if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/select-system';
        return NextResponse.redirect(url);
    }

    // 3.3. Subscription & Trial Checks
    const shop = profile?.shops as any;
    if (shop && !request.nextUrl.pathname.startsWith('/assinar')) {
      const isTrialOver = shop.trial_ate && new Date(shop.trial_ate) < new Date();
      const isBlocked = shop.plan === 'bloqueado';
      const isTrial = shop.plan === 'trial';

      if (isBlocked || (isTrial && isTrialOver)) {
        const url = request.nextUrl.clone();
        url.pathname = '/assinar';
        return NextResponse.redirect(url);
      }
    }

    // 3.4. Admin & Super Admin Route Protection
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/super-admin')) {
      if (request.nextUrl.pathname === '/admin' && isSuperAdmin) {
          const url = request.nextUrl.clone();
          url.pathname = '/super-admin';
          return NextResponse.redirect(url);
      }

      if (request.nextUrl.pathname.startsWith('/super-admin') && !isSuperAdmin) {
           const url = request.nextUrl.clone();
           url.pathname = '/select-system';
           return NextResponse.redirect(url);
      }
      
      if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/super-admin')) {
          if (profile?.role !== 'admin' && !isSuperAdmin) {
              const url = request.nextUrl.clone();
              url.pathname = '/select-system';
              url.searchParams.set('message', 'Acesso negado: Apenas administradores podem acessar esta área.');
              return NextResponse.redirect(url);
          }
      }
    }

    // 3.5. System Isolation (Cross-System Protection)
    if (!isSuperAdmin) {
        const storeType = shop?.store_type;
        if (storeType === 'fashion_store_ai' && (request.nextUrl.pathname.startsWith('/mobile') || request.nextUrl.pathname.startsWith('/products/agenda-facil'))) {
            const url = request.nextUrl.clone();
            url.pathname = '/fashion/dashboard';
            return NextResponse.redirect(url);
        }
        if (storeType === 'mobile_store_ai' && (request.nextUrl.pathname.startsWith('/fashion') || request.nextUrl.pathname.startsWith('/products/agenda-facil'))) {
            const url = request.nextUrl.clone();
            url.pathname = '/mobile/dashboard';
            return NextResponse.redirect(url);
        }
        if (storeType === 'agenda_facil_ai' && (request.nextUrl.pathname.startsWith('/fashion') || request.nextUrl.pathname.startsWith('/mobile'))) {
            const url = request.nextUrl.clone();
            url.pathname = '/products/agenda-facil';
            return NextResponse.redirect(url);
        }
        if ((storeType === 'concrete_erp' || storeType === 'industrial') && !request.nextUrl.pathname.startsWith('/concrete')) {
            const url = request.nextUrl.clone();
            url.pathname = '/concrete';
            return NextResponse.redirect(url);
        }
    }
  }

  // 5. Multi-domain / Subdomain handling (DEPRECATED - Redirecting to main domain)
  const host = request.headers.get('host') || ''
  const isERPSubdomain = host.startsWith('erp.')

  if (isERPSubdomain) {
      const url = request.nextUrl.clone()
      // Force main domain in production to avoid cookie issues
      if (process.env.NODE_ENV === 'production') {
        url.host = 'kryonsystems.com.br'
      }
      url.pathname = `/concrete${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}
