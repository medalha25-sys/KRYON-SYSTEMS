import { createClient } from '@/utils/supabase/server'
import { differenceInDays, parseISO, isPast } from 'date-fns'

export type TrialStatus = 'active_trial' | 'expired_trial' | 'no_trial' | 'active_subscription'

export async function checkTrialStatus(): Promise<{ status: TrialStatus, daysLeft: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { status: 'no_trial', daysLeft: 0 }

  // Check trial_ends_at from user metadata first (fastest)
  const metaTrialEnds = user.user_metadata?.trial_ends_at
  
  // Also check profiles table if needed, but metadata is usually synced
  // For now rely on metadata as it's what we set in API
  if (!metaTrialEnds) {
      // Check if user has active subscription?
      // For now return 'no_trial' or check DB
      return { status: 'no_trial', daysLeft: 0 }
  }

  const trialEndDate = parseISO(metaTrialEnds)
  const now = new Date()

  if (isPast(trialEndDate)) {
    return { status: 'expired_trial', daysLeft: 0 }
  }

  const daysLeft = differenceInDays(trialEndDate, now)
  return { status: 'active_trial', daysLeft }
}
