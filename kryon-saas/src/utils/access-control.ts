import { SupabaseClient } from '@supabase/supabase-js';
import { differenceInDays, parseISO, isPast } from 'date-fns';

/**
 * Interface for subscription check result
 */
export interface AccessResult {
  hasAccess: boolean;
  status?: 'active' | 'trial' | 'trialing' | 'expired' | 'inactive' | 'grace_period' | 'free_tier' | 'no_access';
  daysLeft?: number;
  reason?: 'no_subscription' | 'expired' | 'inactive' | 'error';
  message?: string;
}

/**
 * Centrally validates if an organization has an active/trial subscription for a specific product.
 * @param supabase Authenticated Supabase client
 * @param organizationId UUID of the organization
 * @param productSlug Slug of the product (e.g., 'agenda-facil', 'fashion-ai')
 * @returns AccessResult object
 */
export async function checkAccess(
  supabase: SupabaseClient,
  organizationId: string,
  productSlug: string
): Promise<AccessResult> {
  try {
    // 1. Fetch the subscription for this organization and product
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('organization_id', organizationId)
      .eq('product_slug', productSlug)
      .maybeSingle();

    if (error) {
      console.error(`[checkAccess] Error fetching subscription for ${productSlug}:`, error);
      return { hasAccess: false, reason: 'error', message: 'Erro ao verificar assinatura.' };
    }

    if (!subscription) {
      return { hasAccess: false, reason: 'no_subscription', message: 'Nenhuma assinatura encontrada.' };
    }

    const now = new Date();
    const expiresAt = subscription.current_period_end ? parseISO(subscription.current_period_end) : null;
    
    // 2. Evaluate Status
    const isValidStatus = ['active', 'trial', 'trialing'].includes(subscription.status);
    const isNotExpired = expiresAt ? !isPast(expiresAt) : true;

    if (!isValidStatus || !isNotExpired) {
      return { 
        hasAccess: false, 
        status: subscription.status as any, 
        reason: isNotExpired ? 'inactive' : 'expired',
        daysLeft: 0,
        message: 'Assinatura inativa ou expirada.' 
      };
    }

    const daysLeft = expiresAt ? Math.max(0, differenceInDays(expiresAt, now)) : 30;

    return { 
      hasAccess: true, 
      status: subscription.status as any,
      daysLeft
    };
  } catch (err) {
    console.error('[checkAccess] Critical error:', err);
    return { hasAccess: false, reason: 'error', message: 'Erro crítico de validação.' };
  }
}
