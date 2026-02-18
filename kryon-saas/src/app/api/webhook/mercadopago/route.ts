import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js'; // Use admin client
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  // Initialize Supabase Admin for DB updates
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Allow empty for build, will fail at runtime if missing
  );

  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    if (id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
          const userId = paymentData.external_reference;
          const metadata = paymentData.metadata;
          
          if (!userId) {
             console.error('Webhook Error: No external_reference (userId) found');
             return NextResponse.json({ error: 'Missing external_reference' }, { status: 400 });
          }

          // Calculate new expiration date
          const daysToAdd = metadata?.expiration_days || 30; // Default to 30 if missing
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + daysToAdd);

          // Update Subscription AND Profile (Grace Period Clear)
          // 1. Update Subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (sub) {
              await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    current_period_end: expiresAt.toISOString(),
                    // product_slug: 'agenda-facil' 
                })
                .eq('user_id', userId);
          } else {
              await supabase
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    status: 'active',
                    current_period_end: expiresAt.toISOString(),
                    product_slug: 'agenda-facil'
                });
          }

          // 2. Clear Grace Period on Profile
          await supabase
            .from('profiles')
            .update({
                payment_status: 'active',
                grace_period_until: null
            })
            .eq('id', userId);

      } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          // Payment Failed Logic
          const userId = paymentData.external_reference;
          
          if (userId) {
             // Set Grace Period + 5 Days
             const gracePeriodEnd = new Date();
             gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);

             await supabase
               .from('profiles')
               .update({
                   payment_status: 'pending',
                   grace_period_until: gracePeriodEnd.toISOString()
               })
               .eq('id', userId);
          }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
