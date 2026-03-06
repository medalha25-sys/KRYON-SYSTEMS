
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectPapaLeguas() {
  console.log('--- Inspecting Papa Leguas ---');
  
  // 1. Find User by Email
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  const targetUser = userData?.users?.find(u => u.email === 'papaleguaslavajato2026@gmail.com');
  
  if (!targetUser) {
    console.log('User not found by email.');
    return;
  }
  console.log('USER ID:', targetUser.id);

  // 2. Find Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUser.id)
    .maybeSingle();
  
  console.log('PROFILE:', profile);

  // 3. Find Organization
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .maybeSingle();
    console.log('ORGANIZATION:', org);
  }

  // 4. Find Shop
  if (profile?.shop_id) {
    const { data: shop } = await supabase
      .from('shops')
      .select('*')
      .eq('id', profile.shop_id)
      .maybeSingle();
    console.log('SHOP (by profile.shop_id):', shop);
  }

  // 5. Search for ANY shop with "Papa Leguas" in name
  const { data: fuzzyShops } = await supabase
    .from('shops')
    .select('id, name, slug')
    .ilike('name', '%Papa%');
  console.log('SHOPS WITH "Papa" IN NAME:', fuzzyShops);
}

inspectPapaLeguas();
