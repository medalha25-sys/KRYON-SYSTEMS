import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export type OrganizationRole = 'admin' | 'professional' | 'secretary'

export const getOrganization = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get the current organization from the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role, organizations(name, slug, logo_url, white_label_enabled)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.organization_id) return null

  // Supabase join might return an array or object depending on types. Safely handle both.
  const org = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations;

  return {
    id: profile.organization_id,
    name: org?.name,
    slug: org?.slug,
    logoUrl: org?.logo_url,
    whiteLabelEnabled: org?.white_label_enabled,
    role: profile.role as OrganizationRole,
  }
})
