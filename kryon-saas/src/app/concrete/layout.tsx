import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Building2 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { MobileBottomNav } from '@/components/admin/MobileBottomNav'
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
  
  // 2. Fetch Org Data for Header
  const { data: org } = await supabase
    .from('organizations')
    .select('name, modules')
    .eq('id', profile?.organization_id || '00000000-0000-0000-0000-000000000000')
    .single()

  const orgName = org?.name || 'Sistema'
  
  // 3. Access Control
  if (!isSuperAdmin) {
      if (!profile?.organization_id) {
          redirect('/select-organization')
      }

      const modules = (org as any)?.modules
      if (!modules?.concrete_erp) {
          redirect('/select-system')
      }
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-slate-200 font-sans pb-20 md:pb-0">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <AdminSidebar userEmail={user?.email} />
      </div>
      
      {/* Mobile Nav */}
      <MobileBottomNav />

      <main className="flex-1 overflow-auto">
        <header className="bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800/50 p-4 md:p-6 flex justify-between items-center sticky top-0 z-40">
           <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                 <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase truncate max-w-[200px] md:max-w-none">
                {orgName}
              </h2>
           </div>
           
           <div className="flex items-center gap-2 md:gap-4">
              <span className="text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-widest whitespace-nowrap">
                Módulo Ativo
              </span>
           </div>
        </header>

        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <PWARegister />
            {children}
        </div>
      </main>
    </div>
  )
}
