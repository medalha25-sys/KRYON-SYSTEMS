import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { PWARegister } from './PWARegister'

export default async function ConcreteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, is_super_admin')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = profile?.is_super_admin === true
  
  // 2. Access Control
  if (!isSuperAdmin) {
      if (!profile?.organization_id) {
          redirect('/select-system')
      }

      const { data: org } = await supabase
        .from('organizations')
        .select('modules')
        .eq('id', profile.organization_id)
        .single()
      
      const modules = (org as any)?.modules
      if (!modules?.concrete_erp) {
          redirect('/select-system')
      }
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-200 font-sans">
      {/* Sidebar - We'll update the AdminSidebar or create a specific one if needed */}
      <AdminSidebar userEmail={user?.email} />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-[#1E293B] border-b border-slate-700/50 p-6 flex justify-between items-center shadow-xl">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">Concrete ERP Brasil</h2>
           </div>
           
           <div className="flex items-center gap-4">
              <span className="hidden md:inline-block text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-widest">
                Módulo Industrial Ativo
              </span>
           </div>
        </header>
        
        <div className="p-8 animate-in fade-in duration-500">
            <PWARegister />
            {children}
        </div>
      </main>
    </div>
  )
}
