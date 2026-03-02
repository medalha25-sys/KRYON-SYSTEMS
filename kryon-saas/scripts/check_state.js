const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.ADMIN_EMAIL

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkState() {
    console.log('--- Verificando Estado do Sistema ---')
    
    // 1. Get Admin User
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === adminEmail)
    
    if (!user) {
        console.error('Usuário admin não encontrado:', adminEmail)
        return
    }
    
    console.log('Usuário ID:', user.id)
    
    // 2. Get Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single()
    
    if (profileError) {
        console.error('Erro ao buscar perfil:', profileError)
    } else {
        console.log('Perfil Organization ID:', profile.organization_id)
        console.log('Organização Atual:', profile.organizations?.name)
        console.log('Módulos:', profile.organizations?.modules)
    }
}

checkState()
