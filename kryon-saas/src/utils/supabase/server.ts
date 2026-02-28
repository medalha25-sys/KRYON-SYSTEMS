import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error(
      'SUPABASE ERROR (SERVER): Missing Environment Variables!',
      'URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  } else {
    console.log(
      'SUPABASE DEBUG (SERVER): Initialization successful.',
      'URL prefix:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15),
      'Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
                  domain: process.env.NODE_ENV === 'production' ? '.kryonsystems.com.br' : undefined,
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
