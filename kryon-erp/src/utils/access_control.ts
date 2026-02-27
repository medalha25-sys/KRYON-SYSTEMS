import { SupabaseClient } from '@supabase/supabase-js'
import { parseISO, isPast } from 'date-fns'

export type AccessResult = {
  hasAccess: boolean
  status?: 'active' | 'trial' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'no_subscription' | 'error'
  message?: string
  daysLeft?: number
}

/**
 * Centrally validates if an organization has access to a specific product.
 * MISSION: Use EXCLUSIVELY organization_id, product_slug, status (active/trial/trialing), and current_period_end.
 */
export async function checkAccess(
  supabase: SupabaseClient,
  organizationId: string,
  productSlug: string
): Promise<AccessResult> {
  try {
    console.log(`[checkAccess] Validating ${productSlug} for Org: ${organizationId}`)

    // 1. Fetch the subscription for this organization and product
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('organization_id', organizationId)
      .eq('product_slug', productSlug)
      .in('status', ['active', 'trial', 'trialing'])
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle()

    if (error) {
      console.error(`[checkAccess] DB Error:`, error)
      return { hasAccess: false, status: 'error', message: 'Erro ao verificar assinatura.' }
    }

    if (!subscription) {
      console.warn(`[checkAccess] No active subscription found for ${productSlug}`)
      return { 
        hasAccess: false, 
        status: 'no_subscription', 
        message: 'Você não possui uma assinatura ativa para este produto.' 
      }
    }

    return { 
      hasAccess: true, 
      status: subscription.status as any 
    }
  } catch (err) {
    console.error('[checkAccess] Critical error:', err)
    return { hasAccess: false, status: 'error', message: 'Erro crítico de validação.' }
  }
}
