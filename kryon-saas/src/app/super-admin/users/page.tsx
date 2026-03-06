import { createClient } from '@/utils/supabase/server'
import { startImpersonation, toggleSubscriptionStatus } from '../actions'
import Link from 'next/link'

export default async function UsersAdminPage() {
  const supabase = await createClient()

  // 1. Fetch all profiles with their organizations
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select(`
        id,
        name,
        organization_id,
        organizations ( name, slug )
    `)
    .order('created_at', { ascending: false })

  // 2. Fetch all active subscriptions across the platform to cross-reference
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, organization_id, product_slug, status')
    .eq('status', 'active')

  if (pError) {
      return <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">Erro ao carregar perfis: {pError.message}</div>
  }

  // 3. SECURE: Fetch emails from auth.users using Admin Client (since profiles doesn't have email)
  const { createServerClient } = await import('@supabase/ssr')
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  let authData = null
  let authError = null

  try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers()
      authData = data
      authError = error
  } catch (err: any) {
      console.error('CRITICAL AUTH ERROR (Crashed):', err)
      authError = { message: 'Erro crítico na API de Auth: ' + err.message }
  }
  
  const authUsers = authData?.users || []
  
  if (authError) {
      console.error('AUTH ERROR FETCHING USERS:', authError)
  }

  // 4. Logic to identify duplicate emails (if any) and multiple system access
  const processedUsers = profiles?.map((p: any) => {
      // Find email from authUsers
      const authUser = authUsers?.find((u: any) => u.id === p.id)
      const email = authUser?.email || 'N/A'

      // Find subscriptions for this user OR their organization
      const userSubs = subscriptions?.filter((s: any) => 
        (s.user_id && s.user_id === p.id) || 
        (s.organization_id && s.organization_id === p.organization_id)
      ) || []
      
      const distinctSystems = userSubs.map((s: any) => ({
          name: s.product_slug?.includes('concrete') || s.product_slug?.includes('industrial') ? 'Concrete ERP' :
                s.product_slug?.includes('fashion') || s.product_slug?.includes('loja') ? 'Fashion AI' :
                s.product_slug?.includes('lava') ? 'Lava Rápido' : 'Clínica Serena',
          slug: s.product_slug,
          status: s.status
      }))

      // Filter uniques
      const uniqueSystems = distinctSystems.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.name === v.name) === i)

      // Check for actual duplicate emails in the list
      // Note: Since emails are unique in auth, duplicates here would mean something is wrong or they have different IDs but same email
      const isEmailDuplicate = authUsers?.filter(u => u.email === email).length > 1
      const hasMultipleSystems = uniqueSystems.length > 1

      return {
          ...p,
          email,
          systems: uniqueSystems,
          hasAlert: isEmailDuplicate || hasMultipleSystems,
          alertType: isEmailDuplicate ? 'E-mail Duplicado' : 'Múltiplas Contas'
      }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
            <p className="text-slate-400 text-sm">Controle de acesso e cruzamento de dados multi-sistema.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtrar
            </button>
            <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">person_add</span>
                Convidar Usuário
            </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="p-4 bg-slate-700/30 border-b border-slate-700">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <span className="material-symbols-outlined text-sm">search</span>
                </span>
                <input 
                    type="text" 
                    placeholder="Buscar por nome, e-mail ou sistema..." 
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>
        </div>

        <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Organização de Origem</th>
                    <th className="px-6 py-4">Sistemas Ativos</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
                {processedUsers?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center font-bold text-slate-300">
                                    {(user.name || user.email || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-white flex items-center gap-2">
                                        {user.name || 'Sem Nome'}
                                        {user.hasAlert && (
                                            <span className="bg-red-500/20 text-red-500 text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 font-bold uppercase animate-pulse">
                                                {user.alertType}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-slate-300">
                                {user.organizations?.name || 'N/A'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                                id: {user.organizations?.slug || user.organization_id?.split('-')[0]}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                                {user.systems.length > 0 ? (
                                    user.systems.map((sys: any) => (
                                        <div key={sys.slug} className="flex items-center gap-2 mb-1 last:mb-0">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sys.status === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {sys.name} ({sys.status === 'active' ? 'Ativo' : 'Inativo'})
                                            </span>
                                            <form action={async () => {
                                                'use server'
                                                await toggleSubscriptionStatus(user.organization_id, sys.slug, sys.status)
                                            }}>
                                                <button type="submit" className="text-[9px] text-slate-500 hover:text-white underline decoration-slate-600 transition">
                                                    {sys.status === 'active' ? 'Desativar' : 'Ativar'}
                                                </button>
                                            </form>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-slate-600 italic text-xs">Nenhum sistema detectado</span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-3">
                                <form action={async () => {
                                    'use server'
                                    await startImpersonation(user.id, 'Super Admin User Management Access')
                                }}>
                                    <button type="submit" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition group">
                                        <span className="material-symbols-outlined text-lg group-hover:scale-110">login</span>
                                        <span className="hidden sm:inline">Acessar</span>
                                    </button>
                                </form>
                                <button className="text-slate-400 hover:text-white transition">
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                </button>
                             </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  )
}
