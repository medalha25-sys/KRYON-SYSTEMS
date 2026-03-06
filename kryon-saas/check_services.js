
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

async function checkServices() {
  const shopId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
  
  console.log('--- Checking services for shop ID:', shopId);
  const { data: services } = await supabase
    .from('lava_rapido_services')
    .select('*')
    .eq('tenant_id', shopId);
  
  console.log('Services found:', services);
}

checkServices();
