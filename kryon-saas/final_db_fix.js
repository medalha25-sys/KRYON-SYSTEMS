
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

async function fixData() {
  const shopId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
  const orgId = '403c97c3-7ec2-498a-b87f-beac0f6de4a1';

  console.log('--- Fixing Papa Leguas Data ---');

  // 1. Update Profile to link Shop
  const { error: pError } = await supabase
    .from('profiles')
    .update({ shop_id: shopId })
    .eq('organization_id', orgId);
  
  if (pError) console.error('Error updating profile:', pError);
  else console.log('Profile linked to shop.');

  // 2. Update Shop Store Type
  const { error: sError } = await supabase
    .from('shops')
    .update({ store_type: 'lava_rapido', name: 'Papa Léguas Lava Jato' })
    .eq('id', shopId);

  if (sError) console.error('Error updating shop:', sError);
  else console.log('Shop store_type set to lava_rapido.');

  // 3. Update Subscription store_type/slug if needed
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ product_slug: 'lava-rapido', status: 'active' })
    .eq('organization_id', orgId);

  if (subError) console.error('Error updating subscription:', subError);
  else console.log('Subscription set to lava-rapido active.');
}

fixData();
