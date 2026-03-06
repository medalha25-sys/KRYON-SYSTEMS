
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

async function findServices() {
  console.log('--- Listing ALL lava_rapido_services ---');
  const { data: services, error } = await supabase
    .from('lava_rapido_services')
    .select('*');
  
  if (error) console.error(error);
  console.log('ALL SERVICES:', services);

  console.log('\n--- Listing ALL profiles to find Papa Leguas ID ---');
  const { data: allProfiles } = await supabase.from('profiles').select('id, name, organization_id, shop_id');
  console.log('ALL PROFILES:', allProfiles);
}

findServices();
