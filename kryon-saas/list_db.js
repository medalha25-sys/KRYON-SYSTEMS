
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

async function listEverything() {
  console.log('--- Listing Users ---');
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  userData?.users?.forEach(u => console.log(`- ${u.email} (${u.id})`));

  console.log('\n--- Listing Organizations ---');
  const { data: orgs } = await supabase.from('organizations').select('id, name, slug');
  orgs?.forEach(o => console.log(`- ${o.name} [${o.slug}] (${o.id})`));

  console.log('\n--- Listing Profiles ---');
  const { data: profiles } = await supabase.from('profiles').select('id, name, organization_id, shop_id');
  profiles?.forEach(p => console.log(`- ${p.name} (Org: ${p.organization_id}, Shop: ${p.shop_id})`));
}

listEverything();
