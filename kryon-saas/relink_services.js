
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

async function finalFix() {
  const correctShopId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
  const oldTenantId = 'd5aa74dd-5047-4956-8238-bb1d21a1df84';

  console.log('--- Moving services to correct Shop ID ---');
  const { error: servError } = await supabase
    .from('lava_rapido_services')
    .update({ tenant_id: correctShopId })
    .eq('tenant_id', oldTenantId);
  
  if (servError) console.error('Error updating services:', servError);
  else console.log('Services moved to correct shop!');

  // Also move bookings if any
  const { error: bookError } = await supabase
    .from('lava_rapido_bookings')
    .update({ tenant_id: correctShopId })
    .eq('tenant_id', oldTenantId);
  
  if (bookError) console.log('No bookings to move or error:', bookError.message);
  else console.log('Bookings moved to correct shop!');
}

finalFix();
