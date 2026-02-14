'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSaaSMetrics() {
  const supabase = await createClient()

  // 1. Calculate MRR (Sum of price for active subscriptions)
  const { data: activeSubs, error: mrrError } = await supabase
    .from('subscriptions')
    .select('price')
    .eq('status', 'active')

  const mrr = activeSubs?.reduce((acc, sub) => acc + (Number(sub.price) || 0), 0) || 0

  // 2. Count Active Trials (Trial end date > now and status = trialing)
  const now = new Date().toISOString()
  const { count: activeTrials } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'trialing')
    .gt('trial_end', now)

  // 3. Conversion Rate
  // Formula: Active / (Active + Trialing + Expired + Canceled) * 100
  // Assumes all subscriptions started as trials.
  const { count: totalActive } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: totalTrialing } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'trialing')

  const { count: totalEnded } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['expired', 'canceled'])

  const totalTrialsStarted = (totalActive || 0) + (totalTrialing || 0) + (totalEnded || 0)
  
  const conversionRate = totalTrialsStarted > 0 
    ? ((totalActive || 0) / totalTrialsStarted) * 100 
    : 0

  // 4. Monthly Churn
  // (Canceled or Expired in last 30 days) / (Active at start of Period)
  // Active at Start = Current Active + Churned in Period
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: churnedLastMonth } = await supabase
     .from('subscriptions')
     .select('*', { count: 'exact', head: true })
     .in('status', ['canceled', 'expired'])
     .or(`canceled_at.gte.${thirtyDaysAgo.toISOString()},updated_at.gte.${thirtyDaysAgo.toISOString()}`) // Use canceled_at if possible, fallback to updated_at logic implicitly if needed (though OR logic here is checking if EITHER is recent)

  const activeAtStart = (totalActive || 0) + (churnedLastMonth || 0)
  
  const churnRate = activeAtStart > 0 
    ? ((churnedLastMonth || 0) / activeAtStart) * 100
    : 0

  // 5. Total Active Customers
  const activeCustomers = totalActive || 0

  return {
    mrr,
    activeTrials: activeTrials || 0,
    conversionRate: conversionRate.toFixed(1),
    churnRate: churnRate.toFixed(1),
    activeCustomers
  }
}
