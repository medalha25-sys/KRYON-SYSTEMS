
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

async function findIds() {
  console.log('--- Searching Profiles and Shops ---');
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, organization_id, shop_id')
    .ilike('name', '%Papa%');

  console.log('Profiles found with "Papa":', profiles);

  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug, store_type')
    .ilike('name', '%Papa%');

  console.log('Shops found with "Papa":', shops);

  const { data: allShops } = await supabase
    .from('shops')
    .select('id, name, slug, store_type');
  
  console.log('All Shops:', allShops);
}

findIds();
