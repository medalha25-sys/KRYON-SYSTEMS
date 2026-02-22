'use server'

import { createClient } from '@/utils/supabase/server'

export async function getUsers() {
  const supabase = await createClient()

  console.log('Admin calling get_admin_users_data RPC...')
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_users_data')

  if (!rpcError && rpcData && rpcData.length > 0) {
    console.log('RPC success. Users found:', rpcData.length)
  // Deduplicate by ID
  const uniqueUsers = new Map();
  
  (rpcData as any[]).forEach((u) => {
    if (!uniqueUsers.has(u.id)) {
      uniqueUsers.set(u.id, {
        id: u.id,
        email: u.email || 'Sem email',
        name: u.name || 'Sem nome',
        shop_name: u.shop_name || 'Sem Loja',
        cnpj: u.shop_cnpj || '-',
        status: u.sub_status || 'inactive',
        product: u.sub_product || '-',
        joined_at: u.joined_at ? new Date(u.joined_at).toLocaleDateString('pt-BR') : '-'
      });
    }
  });

  return Array.from(uniqueUsers.values());
}

console.error('RPC failed or empty. Falling back to manual join...')
if (rpcError) console.error('RPC Error:', rpcError)

// Fallback: Manually join profiles and subscriptions
const { data: profiles, error: profilesError } = await supabase
  .from('profiles')
  .select('*, shops(name, cnpj), subscriptions(status, product_slug)')
  .order('created_at', { ascending: false })

if (profilesError) {
  console.error('Error fetching profiles fallback:', profilesError)
  return []
}

const uniqueProfiles = new Map();

profiles.forEach((p) => {
  if (!uniqueProfiles.has(p.id)) {
    const sub = p.subscriptions?.[0] || {}
    const shop = p.shops?.[0] || {} 

    uniqueProfiles.set(p.id, {
      id: p.id,
      email: p.email || 'Email não disponível (Use RPC)',
      name: p.name || 'Sem nome',
      shop_name: shop.name || 'Sem Loja',
      cnpj: shop.cnpj || '-',
      status: sub.status || 'inactive',
      product: sub.product_slug || '-',
      joined_at: p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-'
    });
  }
});

return Array.from(uniqueProfiles.values())
}

export async function toggleVipStatus(userId: string, currentStatus: string) {
  const supabase = await createClient()
  
  // Logic: If active, downgrade to trialing. If not active, upgrade to active (VIP)
  const newStatus = currentStatus === 'active' ? 'trialing' : 'active'

  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      status: newStatus,
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error toggling VIP status:', error)
    throw new Error('Falha ao alterar status VIP. Tente novamente.')
  }

  return { success: true, newStatus }
}

export async function updateUserProduct(userId: string, productSlug: string) {
  const supabase = await createClient()
  
  // 1. Update Subscription
  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      product_slug: productSlug,
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user product:', error)
    throw new Error('Falha ao atualizar produto. Verifique se o slug do produto é válido.')
  }

  // 2. Update Shop Store Type (Required for correct Middleware redirection)
  // Map product slug to store type if matched, otherwise generic
  let storeType = 'generic'
  if (productSlug === 'fashion-manager') {
      storeType = 'fashion_store_ai'
  } else if (productSlug === 'app-mobile') {
      storeType = 'mobile_store_ai'
  } else if (productSlug === 'agenda-facil' || productSlug.includes('agenda')) {
      storeType = 'agenda_facil_ai'
  }

  const { error: shopError } = await supabase
    .from('shops')
    .update({ store_type: storeType })
    .eq('owner_id', userId)

  if (shopError) {
      console.error('Error updating shop store_type:', shopError)
      // Non-blocking but logged
  }

  return { success: true }
}

export async function getProducts() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('slug, name')
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return data
  }
  return data
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // 1. Delete Subscriptions
  const { error: subError } = await supabase.from('subscriptions').delete().eq('user_id', userId)
  if (subError) console.error('Error deleting subscriptions:', subError)

  // 2. Delete Shops
  const { error: shopError } = await supabase.from('shops').delete().eq('owner_id', userId)
  if (shopError) console.error('Error deleting shops:', shopError)

  // 3. Delete Organization Memberships
  const { error: memberError } = await supabase.from('organization_members').delete().eq('user_id', userId)
  if (memberError) console.error('Error deleting memberships:', memberError)

  // 4. Delete Profile
  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId)
  if (profileError) {
      console.error('Error deleting profile:', profileError)
      throw new Error('Erro ao excluir perfil do usuário')
  }

  // Note: This does NOT delete the user from Authentication (requires Service Role). 
  // But it removes them from the system data/lists.
  
  return { success: true }
}

