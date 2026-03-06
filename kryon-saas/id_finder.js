
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

async function findPapaShop() {
  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug')
    .ilike('name', '%papa%');
  
  if (shops && shops.length > 0) {
    console.log('ID_PAPALEGUAS:' + shops[0].id);
  } else {
    // Try by slug
    const { data: shopsBySlug } = await supabase
      .from('shops')
      .select('id, name, slug')
      .ilike('slug', '%papa%');
    if (shopsBySlug && shopsBySlug.length > 0) {
      console.log('ID_PAPALEGUAS:' + shopsBySlug[0].id);
    } else {
      console.log('NOT_FOUND');
    }
  }
}

findPapaShop();
