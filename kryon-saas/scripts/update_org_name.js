const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pgpobxvkojawrstadrel.supabase.co';
const supabaseServiceRoleKey = 'sb_secret_u35x_HnQT3lnHtSgY-90NQ_lhN4oMb-';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function updateOrgName() {
  console.log('Iniciando atualização definitiva do branding...');
  
  const { data, error } = await supabase
    .from('organizations')
    .update({ name: 'Concrete Kryon Systems' })
    .match({ name: 'Clínica Principal' })
    .select();

  if (error) {
    console.error('Erro ao atualizar:', error);
  } else {
    console.log('Sucesso! Organização atualizada para Concrete Kryon Systems:', data);
  }
}

updateOrgName();
