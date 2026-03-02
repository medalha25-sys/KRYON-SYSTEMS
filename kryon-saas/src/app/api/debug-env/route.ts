import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    message: 'Debug Environment Check',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!supabaseUrl,
        length: supabaseUrl?.length || 0,
        prefix: supabaseUrl ? `${supabaseUrl.substring(0, 12)}...` : 'N/A',
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!supabaseKey,
        length: supabaseKey?.length || 0,
        prefix: supabaseKey ? `${supabaseKey.substring(0, 5)}...` : 'N/A',
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      },
      SERVICE_ROLE_KEY: {
        exists: !!process.env.SERVICE_ROLE_KEY,
        length: process.env.SERVICE_ROLE_KEY?.length || 0,
      },
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
