
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

async function findOrg() {
  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', '%Papa%Leguas%')
    .maybeSingle();

  if (error) {
    console.error('Error fetching org:', error);
    process.exit(1);
  }

  if (orgs) {
    console.log('ORGANIZATION_ID:', orgs.id);
    console.log('ORGANIZATION_NAME:', orgs.name);
  } else {
    // Try listing all orgs to be sure
    const { data: allOrgs } = await supabase.from('organizations').select('id, name');
    console.log('ALL ORGANIZATIONS:', allOrgs);
  }
}

findOrg();
