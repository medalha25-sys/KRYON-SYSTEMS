'use server'

import { createClient } from '@/utils/supabase/server'

export async function getOrganizationDetails() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, organizations(id, name, logo_url, white_label_enabled)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organizations) return null

  // Handle potential array return
  const org = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations;

  return org


}
