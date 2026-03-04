const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pgpobxvkojawrstadrel.supabase.co',
  'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-'
);

async function checkUser() {
  const email = 'medalha25@gmail.com';
  console.log(`Checking user: ${email}`);

  // Try list users via auth admin first to get the ID
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
      console.error('Error listing users:', authError);
      process.exit(1);
  }

  const user = users.find(u => u.email === email);
  if (!user) {
      console.log('User not found in auth.users.');
      process.exit(1);
  }

  console.log(`Found auth user ID: ${user.id}`);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
      console.error('Error fetching profile:', profileError);
      process.exit(1);
  }

  console.log('Profile Data:');
  console.log(JSON.stringify(profile, null, 2));

  if (!profile?.is_super_admin) {
      console.log('User is NOT a Super Admin. Fixing...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_super_admin: true })
        .eq('id', user.id);
      
      if (updateError) {
          console.error('Error updating profile:', updateError);
      } else {
          console.log('User promoted to Super Admin successfully!');
      }
  } else {
      console.log('User is already a Super Admin.');
  }
}

checkUser();
