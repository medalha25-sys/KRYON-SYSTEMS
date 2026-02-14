import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const notification = await req.json()
    console.log('--- Webhook Mercado Pago Recv ---')
    console.log('Notification:', JSON.stringify(notification, null, 2))

    // Mercado Pago notifications normally provide the ID in data.id or notification.id
    // and the type in 'type' or 'action'
    const paymentId = notification.data?.id || notification.id
    const type = notification.type || (notification.action?.startsWith('payment.') ? 'payment' : null)

    if (type === 'payment' && paymentId) {
      console.log(`Processing payment ID: ${paymentId}`)
      
      const supabase = await createClient()

      // 1. Idempotency check: Check if this payment was already processed
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('mercadopago_payment_id', paymentId.toString())
        .single()

      if (existingPayment) {
        console.log(`Payment ${paymentId} already processed. Skipping.`)
        return NextResponse.json({ received: true, note: 'already processed' })
      }

      // 2. Fetch payment details from Mercado Pago
      // Documentation: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments_id/get
      const accessToken = process.env.MP_ACCESS_TOKEN
      if (!accessToken) {
        console.error('CRITICAL: MP_ACCESS_TOKEN not found in environment variables.')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!mpResponse.ok) {
        console.error(`Failed to fetch payment ${paymentId} from MP:`, await mpResponse.text())
        return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 502 })
      }

      const paymentData = await mpResponse.json()
      const status = paymentData.status
      const amount = paymentData.transaction_amount
      const paidAt = paymentData.date_approved
      
      // Metadados são essenciais para saber QUAL tenant e QUAL produto ativar
      // Estes metadados devem ser enviados na criação da preferência/checkout
      const tenantId = paymentData.metadata?.tenant_id
      const productId = paymentData.metadata?.product_id

      console.log(`MP Payment Data - Status: ${status}, Tenant: ${tenantId}, Product: ${productId}`)

      if (status === 'approved' && tenantId && productId) {
        // 3. Register payment
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            tenant_id: tenantId,
            product_id: productId,
            mercadopago_payment_id: paymentId.toString(),
            amount: amount,
            status: status,
            paid_at: paidAt || new Date().toISOString()
          })

        if (paymentError) {
          console.error('Error inserting payment:', paymentError)
          throw paymentError
        }

        // 4. Activate or Update Subscription
        // status = 'active', extend end date (e.g., 30 days)
        const periodEnd = new Date()
        periodEnd.setDate(periodEnd.getDate() + 30)

        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            tenant_id: tenantId,
            product_id: productId,
            status: 'active',
            mercadopago_subscription_id: paymentData.id?.toString(),
            current_period_end: periodEnd.toISOString()
          }, { onConflict: 'tenant_id,product_id' })

        if (subError) {
          console.error('Error updating subscription:', subError)
          throw subError
        }

        console.log(`Successfully activated subscription for Tenant ${tenantId} / Product ${productId}`)
      } else {
        console.log(`Payment not approved or metadata missing. Status: ${status}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Mercado Pago Webhook Error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Mercado Pago Webhook Endpoint Active',
    required_metadata: ['tenant_id', 'product_id']
  })
}
