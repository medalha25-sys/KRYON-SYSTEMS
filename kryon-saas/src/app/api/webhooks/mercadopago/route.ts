import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MercadoPagoService } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    // 1. Parse Notification
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    // Sometimes MP sends data in body
    const body = await req.json().catch(() => ({}));
    
    // Normalize data inputs
    const notificationId = id || body?.data?.id || body?.id;
    const notificationTopic = topic || body?.type || body?.topic; // 'subscription_preapproval' or 'payment'

    console.log(`[MP Webhook] Topic: ${notificationTopic}, ID: ${notificationId}`);

    if (!notificationId) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const supabase = await createClient();

    // 2. Handle Subscription Updates
    if (notificationTopic === 'subscription_preapproval') {
        // Fetch latest status from MP
        const subData = await MercadoPagoService.getSubscription(notificationId);
        
        const status = subData.status; // authorized, paused, cancelled
        const externalReference = subData.external_reference; // organization_id
        const payerId = subData.payer_id;
        
        console.log(`[MP Webhook] Sub ID: ${notificationId} | Status: ${status} | Check Org: ${externalReference}`);

        if (externalReference) {
            // Map MP status to our DB status
            // MP: authorized, paused, cancelled, pending
            // DB: active, past_due, canceled, trialing
            let dbStatus = 'active';
            if (status === 'authorized') dbStatus = 'active';
            if (status === 'paused') dbStatus = 'past_due';
            if (status === 'cancelled') dbStatus = 'canceled';
            if (status === 'pending') dbStatus = 'trialing'; // or inactive

            // Update Subscription Record
            // We find by organization_id (stored in external_reference)
            // Ideally we also know the product... but here we might assume 'agenda-facil' 
            // OR we stored "orgId:productId" in external_reference.
            // Let's assume external_reference is just organization_id for now, and we apply to the main product or all?
            // BETTER: Migration to store 'subscription_id' in local DB allows lookup by `external_id`.
            
            // Try to find by external_id first
            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('external_id', notificationId)
                .single();

            if (existingSub) {
                 await supabase
                    .from('subscriptions')
                    .update({
                        status: dbStatus,
                        external_payer_id: payerId?.toString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingSub.id);
            } else {
                // First time sync? Or maybe we can't link it if we don't know the product.
                // Fallback: Try update by Organization ID if we can assume a default product (Agenda Facil)
                // This is risky. Prefer finding by external_id. 
                // If it doesn't exist, it might be the INITIAL creation webhook.
                // In separate flow, we should save the ID immediately after user returns from checkout.
                console.warn(`[MP Webhook] Subscription local record not found for external_id: ${notificationId}`);
            }
        }
    }
    
    // 3. Handle Payments (Charge success/fail)
    if (notificationTopic === 'payment') {
         // Log payment logic here if needed, or link to subscription `last_charged_at`
         // ... implementation for payment history ...
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[MP Webhook] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
