
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
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, organization_id, shop_id')
    .ilike('name', '%Papa%Leguas%');

  if (error) {
    console.error('Error fetching records:', error);
    process.exit(1);
  }

  console.log('RECORDS FOUND:', profiles);
}

findIds();
