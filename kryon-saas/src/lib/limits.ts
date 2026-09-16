import { createClient } from '@/utils/supabase/server'
import { checkAccess } from './checkAccess'

const FREE_PATIENTS_LIMIT = 20
const FREE_CALENDARS_LIMIT = 1

export async function checkLimits(resource: 'patients' | 'calendars' | 'clients' | 'professionals') {
  const { status } = await checkAccess()
  
  // Premium users have no limits
  if (status === 'active_subscription' || status === 'active_trial' || status === 'grace_period') {
    return { allowed: true }
  }

  // Free Tier checks
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { allowed: false }

  // Get Organization Context from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return { allowed: false, message: 'Nenhuma organização selecionada.' }
  }

  const orgId = profile.organization_id

  if (resource === 'patients' || resource === 'clients') {
    const { count } = await supabase
      .from('agenda_clients')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
    
    if ((count || 0) >= FREE_PATIENTS_LIMIT) {
       return { 
          allowed: false, 
          message: `Você atingiu o limite de ${FREE_PATIENTS_LIMIT} pacientes do plano Gratuito.`,
          upgradeRequired: true
       }
    }
  }

  if (resource === 'calendars' || resource === 'professionals') {
    const { count } = await supabase
      .from('agenda_professionals')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
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
