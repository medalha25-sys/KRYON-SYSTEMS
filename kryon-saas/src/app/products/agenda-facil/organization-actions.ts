'use server'

import { createClient } from '@/utils/supabase/server'

export async function getOrganizationDetails() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('DEBUG ORG: No user found in session')
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('organization_id, organizations(id, name, logo_url, white_label_enabled)')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('DEBUG ORG: Error fetching profile/org:', error)
    return null
  }

  if (!profile) {
     console.log('DEBUG ORG: Profile not found for user', user.id)
     return null
  }
  
  if (!profile.organizations) {
      console.log('DEBUG ORG: Profile found but no linked organization', profile)
      // Attempt to recover if organization_id exists but join failed (RLS on organizations?)
      if (profile.organization_id) {
          console.log('DEBUG ORG: organization_id exists, trying direct fetch...')
          const { data: directOrg, error: directError } = await supabase.from('organizations').select('*').eq('id', profile.organization_id).single()
          if (directOrg) return directOrg
          console.error('DEBUG ORG: Direct fetch failed', directError)
      }
      return null
  }

  // Handle potential array return
  const orgs = profile.organizations
  
  if (Array.isArray(orgs) && orgs.length === 0) {
      console.log('DEBUG ORG: Profile has organizations array but it is empty', profile)
      // Check if we have an ID but no org
      if (profile.organization_id) {
           console.log('DEBUG ORG: (Empty Array) organization_id exists, trying direct fetch...')
           const { data: directOrg, error: directError } = await supabase.from('organizations').select('*').eq('id', profile.organization_id).single()
           if (directOrg) return directOrg
           console.error('DEBUG ORG: Direct fetch failed', directError)
      }
      return null
  }

  const org = Array.isArray(orgs) ? orgs[0] : orgs;

  if (!org) {
      console.log('DEBUG ORG: Final org is null/undefined. Attempting SELF-REPAIR...', profile)
      
      try {
        const companyName = user.user_metadata?.company_name || 'Minha Clínica'
        const orgSlug = 'clinica-' + Math.random().toString(36).substring(2, 7)
        
        // Use service role for repair if possible? 
        // We can't use service role in client function unless we make a new server action or use the admin client here.
        // But this file 'use server', so we can use process.env.SUPABASE_SERVICE_ROLE_KEY if available.
        
        const { createServerClient } = await import('@supabase/ssr')
        const adminClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll() { return [] }, setAll() {} } }
        )

        // 1. Create Org
        const { data: newOrg, error: createError } = await adminClient
            .from('organizations')
            .insert({ name: companyName, slug: orgSlug })
            .select('id')
            .single()
            
        if (createError) throw createError
        
        // 2. Link
        await adminClient.from('organization_members').insert({
            organization_id: newOrg.id,
            user_id: user.id,
            role: 'owner'
        })
        
        // 3. Update Profile
        await adminClient.from('profiles').update({ organization_id: newOrg.id, role: 'admin' }).eq('id', user.id)
        
        // 4. Create Sub
        const { data: product } = await adminClient.from('products').select('id, slug').eq('slug', 'agenda-facil').single()
        if (product) {
            const trialEnd = new Date()
            trialEnd.setDate(trialEnd.getDate() + 30)
            await adminClient.from('subscriptions').insert({
                organization_id: newOrg.id,
                product_id: product.id,
                product_slug: product.slug,
                status: 'trial',
                current_period_end: trialEnd.toISOString()
            })
        }
        
        console.log('DEBUG ORG: Self-repair successful. Fetching new org...')
        const { data: repairedOrg } = await adminClient.from('organizations').select('id, name, logo_url, white_label_enabled').eq('id', newOrg.id).single()
        return repairedOrg

      } catch (err) {
          console.error('DEBUG ORG: Self-repair failed', err)
          return null
      }
  }

  return org


}
