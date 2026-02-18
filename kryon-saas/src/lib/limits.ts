import { createClient } from '@/utils/supabase/server'
import { checkAccess } from './checkAccess'

const FREE_PATIENTS_LIMIT = 20
const FREE_CALENDARS_LIMIT = 1

export async function checkLimits(resource: 'patients' | 'calendars') {
  const { status } = await checkAccess()
  
  // Premium users have no limits
  if (status === 'active_subscription' || status === 'active_trial' || status === 'grace_period') {
    return { allowed: true }
  }

  // Free Tier checks
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { allowed: false }

  if (resource === 'patients') {
    const { count } = await supabase
      .from('patients') // Assuming 'patients' table
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if ((count || 0) >= FREE_PATIENTS_LIMIT) {
       return { 
          allowed: false, 
          message: `Você atingiu o limite de ${FREE_PATIENTS_LIMIT} pacientes do plano Gratuito.`,
          upgradeRequired: true
       }
    }
  }

  if (resource === 'calendars') {
    const { count } = await supabase
      .from('calendars') // Assuming 'calendars' table or similar
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('active', true)

    if ((count || 0) >= FREE_CALENDARS_LIMIT) {
        return { 
          allowed: false, 
          message: `O plano Gratuito permite apenas ${FREE_CALENDARS_LIMIT} agenda ativa.`,
          upgradeRequired: true
       }
    }
  }

  return { allowed: true }
}
