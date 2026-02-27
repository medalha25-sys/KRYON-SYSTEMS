import { createClient } from '@/utils/supabase/server'
import { differenceInDays, parseISO, isPast, addDays } from 'date-fns'

export type AccessStatus = 
  | 'active_trial' 
  | 'expired_trial' 
  | 'active_subscription' 
  | 'grace_period' 
  | 'expired_subscription' 
  | 'free_tier'
  | 'no_access'

export type AccessInfo = {
  status: AccessStatus
  daysLeft: number
  message?: string
}

export async function checkAccess(productSlug: string = 'agenda-facil'): Promise<AccessInfo> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { status: 'no_access', daysLeft: 0, message: 'Usuário não autenticado.' }

  // 1. Get User's Current Organization Context
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
       return { status: 'no_access', daysLeft: 0, message: 'Nenhuma organização selecionada.' }
  }

  // 2. Fetch Active Subscription for this Org & Product
  // First get product ID
  const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productSlug)
      .single()
  
  if (!product) {
      console.error(`Product ${productSlug} not found in DB`)
      return { status: 'no_access', daysLeft: 0, message: 'Produto inválido.' }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, valid_until')
    .eq('organization_id', profile.organization_id)
    .eq('product_id', product.id)
    .single()

  const now = new Date()

  // 3. Evaluate Status
  if (subscription) {
      const validUntil = subscription.valid_until ? parseISO(subscription.valid_until) : null
      const isValid = ['active', 'trialing'].includes(subscription.status) && (validUntil ? !isPast(validUntil) : true)

      if (isValid) {
          const daysLeft = validUntil ? differenceInDays(validUntil, now) : 30 // defaults to 30 if null?
          return { status: subscription.status === 'trialing' ? 'active_trial' : 'active_subscription', daysLeft }
      }

      // Expired
      return { status: 'expired_subscription', daysLeft: 0, message: 'Assinatura expirada.' }
  }

  // 4. No Subscription Found -> Check for Global Trial (User metadata legacy) or Organization Default Trial
  // For V2, we enforce a subscription record exists even for trials.
  // If no record, maybe create one or deny access?
  // Let's deny access to prompt "Start Trial" or "Buy".
  
  return { status: 'no_access', daysLeft: 0, message: 'Nenhuma assinatura ativa encontrada.' }
}
