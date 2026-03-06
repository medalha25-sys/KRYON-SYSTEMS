
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

async function verifyCloudState() {
  console.log('--- Verifying Cloud State ---');
  
  // 1. Get Papa Leguas Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, organization_id, shop_id')
    .ilike('name', '%Papa%')
    .single();
  
  console.log('PROFILE:', profile);

  // 2. Get the Shop it points to
  if (profile?.shop_id) {
    const { data: shop } = await supabase
      .from('shops')
      .select('id, name, store_type')
      .eq('id', profile.shop_id)
      .maybeSingle();
    console.log('SHOP FROM PROFILE:', shop);
  }

  // 3. Search for the specific shop ID from the URL
  const urlId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
  const { data: shopByUrl } = await supabase
    .from('shops')
    .select('id, name, store_type')
    .eq('id', urlId)
    .maybeSingle();
  console.log('SHOP BY URL ID:', shopByUrl);
}

verifyCloudState();
