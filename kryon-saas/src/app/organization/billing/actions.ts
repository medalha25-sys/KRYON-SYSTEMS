'use server'

import { createClient } from '@/utils/supabase/server'
import { MercadoPagoService } from '@/lib/mercadopago'
import { redirect } from 'next/navigation'

export async function createSubscriptionPreference(orgId: string, currentUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error("Unauthorized")

    // 1. Validate User Relationship to Org
    const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single() // Ensure member exists
    
    if (!member || !['admin', 'owner'].includes(member.role)) {
        throw new Error("Only admins can manage billing")
    }

    // 2. Create Preapproval
    // Price could be dynamic or fixed const
    const PRICE = 99.90
    
    try {
        const response = await MercadoPagoService.createSubscriptionPreference({
            reason: 'Assinatura Agenda Fácil - Clínica Serena',
            auto_recurring: {
                frequency: 1,
                frequency_type: 'months',
                transaction_amount: PRICE,
                currency_id: 'BRL'
            },
            payer_email: user.email || 'billing@example.com',
            back_url: `${currentUrl}?success=true`, // Return to billing page
            external_reference: orgId
        })
        
        // Response usually contains 'init_point' for the payer to visit
        return { init_point: response.init_point, id: response.id }
        
    } catch (e: any) {
        console.error("MP Create Error:", e)
        return { error: e.message }
    }
}
