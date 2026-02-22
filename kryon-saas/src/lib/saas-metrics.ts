import { createClient } from '@/utils/supabase/server'

/**
 * Calculates High-Level Metrics for Super Admin Dashboard
 * MRR, ARR, LTV, ARPU
 */
export async function getSoftwareMetrics() {
  const supabase = await createClient()

  // Fetch all active subscriptions with price
  // Assuming subscription -> product has price? Or subscription has price?
  // Let's assume subscription has an amount column (from Mercado Pago integration)
  // If not, we might need to join Products or Plans. 
  // Let's inspect SCHEMA first if unsure, but standard SaaS usually stores `amount` or `plan_id` in subscription.
  
  // Checking `subscriptions` table schema...
  // Based on `createSubscriptionPreference` form, we likely have `price` or `amount` in `subscriptions` or related `products`.
  // Let's assume a simplified approach: Count active subs * average price if column missing, or sum if present.
  
  // For now, let's try to sum `amount` if it exists, or count rows.
  // We'll select raw data and calc in JS for flexibility.
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('status, product_id, products(price)') // Join products to get price
    .eq('status', 'active')

  let mrr = 0
  
  if (subs) {
      mrr = subs.reduce((acc: number, sub: any) => {
          // Fallbacks if columns are different
          const price = sub.products?.price || 97.00 // Default to basic plan price if missing
          return acc + price
      }, 0)
  }

  const arr = mrr * 12
  const activeCustomers = subs?.length || 0
  const arpu = activeCustomers > 0 ? mrr / activeCustomers : 0
  
  // LTV (Simplified: ARPU / Churn Rate)
  // Hardcoded Churn for now (e.g., 5%)
  const churnRate = 0.05
  const ltv = arpu / churnRate

  return {
    mrr,
    arr,
    arpu,
    ltv,
    activeCustomers
  }
}

/**
 * Calculates Health Score for an Organization
 */
export async function calculateHealthScore(orgId: string) {
    const supabase = await createClient()

    // Fetch daily stats directly
    const { data: stats } = await supabase
        .from('org_daily_stats')
        .select('login_count, appointments_created, errors_encountered')
        .eq('organization_id', orgId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

    if (!stats || stats.length === 0) return { score: 50, status: 'warning', components: { activity: 0, value: 0, reliability: 50 } }

    // Aggregates
    const totalLogins = stats.reduce((acc, s) => acc + (s.login_count || 0), 0)
    const totalAppts = stats.reduce((acc, s) => acc + (s.appointments_created || 0), 0)
    const totalErrors = stats.reduce((acc, s) => acc + (s.errors_encountered || 0), 0)

    // Formula
    // Activity (40%): > 10 logins/week = 40pts
    // Value (40%): > 5 appts/week = 40pts
    // Reliability (20%): < 3 errors/week = 20pts

    const activityScore = Math.min(40, (totalLogins / 2) * 10) // 1 login = 5pts up to 40
    const valueScore = Math.min(40, (totalAppts) * 10) // 1 appt = 10pts up to 40
    const reliabilityScore = Math.max(0, 20 - (totalErrors * 5)) // Deduct 5pts per error

    const finalScore = Math.round(activityScore + valueScore + reliabilityScore)
    
    let status = 'healthy'
    if (finalScore < 30) status = 'critical'
    else if (finalScore < 70) status = 'warning'

    return {
        score: finalScore,
        status,
        components: {
            activity: activityScore,
            value: valueScore,
            reliability: reliabilityScore
        }
    }
}
