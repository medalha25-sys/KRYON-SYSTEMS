import { createClient } from '@supabase/supabase-js'

process.loadEnvFile('.env')
try { process.loadEnvFile('.env.local') } catch(e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function run() {
  console.log("Checking for papaleguaslavajato2026@gmail.com...")
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
  
  if (listError) {
     console.error("Error listing users. Service role key might be invalid.", listError)
     return
  }

  const papaUser = users.users.find(u => u.email === 'papaleguaslavajato2026@gmail.com')
  if (papaUser) {
    console.log("Deleting papaleguaslavajato2026@gmail.com...")
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(papaUser.id)
    if (delError) console.error("Error deleting:", delError)
    else console.log("Deleted successfully.")
  } else {
    console.log("User papaleguaslavajato2026@gmail.com not found.")
  }

  console.log("Creating medalha25@gmail.com...")
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: 'medalha25@gmail.com',
    password: 'Salinas@15252833',
    email_confirm: true
  })

  if (createError) {
    if (createError.message.includes('already been registered')) {
        console.log("User medalha25@gmail.com already exists. Updating password...")
        const medalhaUser = users.users.find(u => u.email === 'medalha25@gmail.com')
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(medalhaUser.id, {
            password: 'Salinas@15252833'
        })
        if (updateError) console.error("Error updating password:", updateError)
        else {
            console.log("Password updated!")
            await supabaseAdmin.from('profiles').update({ is_super_admin: true }).eq('id', medalhaUser.id)
        }
    } else {
        console.error("Error creating user:", createError)
    }
  } else {
    console.log("User created successfully!")
    await supabaseAdmin.from('profiles').update({ is_super_admin: true }).eq('id', newUser.user.id)
  }
}

run()
