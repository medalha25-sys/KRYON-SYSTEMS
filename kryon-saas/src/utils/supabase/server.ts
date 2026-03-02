import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const host = (await headers()).get('host') || ''
  const isKryonDomain = host.endsWith('kryonsystems.com.br')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      'SUPABASE ERROR (SERVER): Missing Environment Variables!',
      'URL exists (public):', !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'URL exists (private):', !!process.env.SUPABASE_URL,
      'Key exists (public):', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Key exists (private):', !!process.env.SUPABASE_ANON_KEY
    );
    throw new Error(`Não foi possível inicializar a conexão com o banco de dados. (Erro: ENV_${!!url}_${!!key})`);
  }

  console.log(
    'SUPABASE DEBUG (SERVER): Initialization successful.',
    'URL prefix:', url.substring(0, 15),
    'Key length:', key.length
  );

  return createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                  ...options,
                  domain: (process.env.NODE_ENV === 'production' && isKryonDomain) ? '.kryonsystems.com.br' : undefined,
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production'
              })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}
