
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
  console.log('--- Services Check ---');
  const { data: services } = await supabase.from('lava_rapido_services').select('tenant_id');
  if (services && services.length > 0) {
    console.log('TENANT_ID_WITH_SERVICES:' + services[0].tenant_id);
  } else {
    console.log('NO_SERVICES_FOUND');
  }

  console.log('\n--- Papa Leguas Profile Check ---');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, organization_id, shop_id')
    .ilike('name', '%Papa%');
  console.log('PAPA_PROFILES:', JSON.stringify(profiles, null, 2));

  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug')
    .ilike('name', '%Papa%');
  console.log('PAPA_SHOPS:', JSON.stringify(shops, null, 2));
}

findIds();
