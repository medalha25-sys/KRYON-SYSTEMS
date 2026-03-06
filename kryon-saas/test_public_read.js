
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
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('Using URL:', supabaseUrl);
// Using ANON KEY to simulate public user
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublicRead() {
  const targetId = '9df44da8-ed46-43d5-8c47-bc54f18889bf';
  
  console.log('--- Testing Public Read for Shop ID:', targetId);
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', targetId)
    .maybeSingle();

  if (error) {
    console.error('PUBLIC READ ERROR:', error);
  } else {
    console.log('PUBLIC READ RESULT:', data);
  }

  console.log('--- Testing Public Read for Services ---');
  const { data: services, error: sError } = await supabase
    .from('lava_rapido_services')
    .select('*')
    .eq('tenant_id', targetId);

  if (sError) {
    console.error('SERVICES READ ERROR:', sError);
  } else {
    console.log('SERVICES READ RESULT (count):', services?.length || 0);
  }
}

testPublicRead();
