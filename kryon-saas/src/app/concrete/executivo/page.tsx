import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getExecutiveMetrics } from '../actions'
import ExecutiveDashboardClient from './ExecutiveDashboardClient'

export const dynamic = 'force-dynamic'

export default async function ExecutivePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, is_super_admin')
        .eq('id', user.id)
        .single()

    // Access control: only admin (using is_super_admin as proxy for this system's roles for now, 
    // or we can just allow organization users for this specific module if they have access to the dashboard)
    // The user requested: "Apenas usuários admin podem acessar"
    if (!profile?.is_super_admin) {
        // Option: return a "Access Denied" view instead of redirecting
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-md">
                    <h2 className="text-2xl font-black text-red-500 uppercase italic mb-4">Acesso Restrito</h2>
                    <p className="text-slate-400 text-sm">Este painel é destinado apenas à diretoria e administradores do Concrete ERP.</p>
                </div>
            </div>
        )
    }

    const initialMetrics = await getExecutiveMetrics('30d')

    return (
        <div className="min-h-screen bg-neutral-950 text-slate-200 p-4 md:p-8 font-sans">
            <ExecutiveDashboardClient initialMetrics={initialMetrics} />
        </div>
    )
}
