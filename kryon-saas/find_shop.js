
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

async function findShop() {
  const { data: shops, error } = await supabase
    .from('shops')
    .select('id, name, organization_id')
    .ilike('name', '%Papa%Leguas%');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('SHOPS FOUND:', shops);
}

findShop();
