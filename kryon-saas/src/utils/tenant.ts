import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Utility to ensure all queries are scoped to the user's shop.
 * In a more advanced setup, this could be handled by RLS, 
 * but explicit filters are safer for multi-tenant applications.
 */
export async function getTenantScope(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_id')
    .eq('id', user.id)
    .single()

  return profile?.shop_id
}

/**
 * Wraps a query with the tenant filter.
 */
export async function withTenant(query: any, supabase: SupabaseClient) {
  const shopId = await getTenantScope(supabase)
  if (!shopId) throw new Error('Unauthorized: No shop associated with user.')
  
  return query.eq('shop_id', shopId)
}
