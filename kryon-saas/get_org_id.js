
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getIds() {
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error listing users:', userError);
    process.exit(1);
  }

  const targetUser = userData.users.find(u => u.email === 'papaleguaslavajato2026@gmail.com');
  
  if (!targetUser) {
    console.error('User not found');
    process.exit(1);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, shop_id')
    .eq('id', targetUser.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    process.exit(1);
  }

  console.log('ORGANIZATION_ID:', profile.organization_id);
  console.log('SHOP_ID:', profile.shop_id);
}

getIds();
