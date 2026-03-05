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
          const host = request.headers.get('host') || ''
          const isKryonDomain = host.endsWith('kryonsystems.com.br')
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
                ...options,
                domain: (process.env.NODE_ENV === 'production' && isKryonDomain) ? '.kryonsystems.com.br' : undefined,
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
    // 3. Fetch Profile (Fixed: Separate queries to avoid ambiguous relationship joins in production)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role, is_super_admin, shop_id')
      .eq('id', user.id)
      .maybeSingle();
    
    // Fetch Shop separately if shop_id exists
    let shop = null;
    if (profile?.shop_id) {
        const { data: shopData } = await supabase
            .from('shops')
            .select('plan, trial_ate, store_type')
            .eq('id', profile.shop_id)
            .maybeSingle();
        shop = shopData;
    } else {
        // If no shop_id, create a new shop for the user
        const { data: newShop, error: newShopError } = await supabase
            .from('shops')
            .insert({
                slug: `shop-${user.id.slice(0, 8)}`,
                store_type: user.user_metadata?.product_slug === 'lava-rapido' ? 'lava_rapido' : 'agenda_facil_ai',
                plan: 'trial'
            })
            .select('id, plan, trial_ate, store_type')
            .single();

        if (newShopError) {
            console.error('MIDDLEWARE ERROR: Failed to create new shop:', newShopError.message);
            // Handle error, maybe redirect to an error page or login
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('message', 'Erro ao criar loja. Tente novamente.');
            return NextResponse.redirect(url);
        }

        // Update the user's profile with the new shop_id
        await supabase
            .from('profiles')
            .update({ shop_id: newShop.id })
            .eq('id', user.id);
        
        shop = newShop;
    }

    if (profileError) {
        console.error('MIDDLEWARE ERROR: Failed to fetch profile:', profileError.message);
        // If there's a DB error (like recursion), don't redirect to a flow page that might loop
        // Instead, try to proceed or send to a safe error/login page
        return supabaseResponse; 
    }

    if (!profile && !isFlowPage) {
        console.warn('MIDDLEWARE: No profile found for user', user.id);
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('message', 'Perfil não encontrado.');
        return NextResponse.redirect(url);
    }

    const hardcodedAdmins = ['medalha25@gmail.com', process.env.ADMIN_EMAIL].filter(Boolean);
    const isSuperAdmin = profile?.is_super_admin === true || (user.email && hardcodedAdmins.includes(user.email));

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
        if (storeType === 'agenda_facil_ai' && (request.nextUrl.pathname.startsWith('/fashion') || request.nextUrl.pathname.startsWith('/mobile') || request.nextUrl.pathname.startsWith('/products/lava-rapido'))) {
            const url = request.nextUrl.clone();
            url.pathname = '/products/agenda-facil';
            return NextResponse.redirect(url);
        }
        if (storeType === 'lava_rapido' && (request.nextUrl.pathname.startsWith('/fashion') || request.nextUrl.pathname.startsWith('/mobile') || request.nextUrl.pathname.startsWith('/products/agenda-facil'))) {
            const url = request.nextUrl.clone();
            url.pathname = '/products/lava-rapido';
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

  if (isERPSubdomain && !request.nextUrl.pathname.startsWith('/concrete')) {
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
