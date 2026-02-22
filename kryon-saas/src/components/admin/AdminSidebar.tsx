'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Building2, LayoutDashboard, Users, Construction, FileText, Settings, ShieldCheck, Truck, Package, ChevronLeft, ChevronRight, DollarSign, TrendingUp } from 'lucide-react'

interface AdminSidebarProps {
  userEmail: string | undefined
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const [concreteActive, setConcreteActive] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const supabase = createClient()

  // Load collapse state from local storage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  // Save collapse state to local storage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  useEffect(() => {
    async function checkModules() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, organizations(modules)')
        .eq('id', user.id)
        .single()
      
      const isSuper = profile?.is_super_admin === true
      const modules = (profile?.organizations as any)?.modules
      setConcreteActive(isSuper || !!modules?.concrete_erp)
    }
    checkModules()
  }, [supabase])

  const isConcretePath = pathname?.startsWith('/concrete')

  const mainLinks = [
    { href: '/admin/finance', label: 'Financeiro', icon: <Settings size={18} /> },
    { href: '/admin/settings', label: 'Configurações', icon: <Settings size={18} /> },
    { href: '/super-admin', label: 'SaaS Control Center', icon: <ShieldCheck size={18} /> },
  ]

  const concreteLinks = [
    { href: '/concrete/executivo', label: 'Estratégico', icon: <TrendingUp size={18} /> },
    { href: '/concrete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/concrete/clientes', label: 'Clientes', icon: <Users size={18} /> },
    { href: '/concrete/produtos', label: 'Produtos/Serviços', icon: <Construction size={18} /> },
    { href: '/concrete/orcamentos', label: 'Orçamentos', icon: <FileText size={18} /> },
    { href: '/concrete/entregas', label: 'Logística', icon: <Truck size={18} /> },
    { href: '/concrete/estoque', label: 'Estoque', icon: <Package size={18} /> },
    { href: '/concrete/financeiro/contas-receber', label: 'Financeiro', icon: <DollarSign size={18} /> },
    { href: '/concrete/fiscal/nfe', label: 'Fiscal (NF-e)', icon: <FileText size={18} /> },
  ]

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0F172A] border-r border-slate-800 text-slate-300 flex flex-col h-full shadow-2xl transition-all duration-300 ease-in-out relative group/sidebar`}>
      {/* Toggle Button */}
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border border-blue-400 hover:bg-blue-500 transition-colors z-50 opacity-0 group-hover/sidebar:opacity-100"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`p-6 border-b border-slate-800 flex flex-col gap-1 overflow-hidden ${isCollapsed ? 'items-center px-2' : ''}`}>
        <h1 className={`text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap`}>
            <Building2 className="text-blue-500 shrink-0" size={24} />
            {!isCollapsed && "Kryon SaaS"}
        </h1>
        {!isCollapsed && <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold whitespace-nowrap">Industrial Control Unit</span>}
      </div>
      
      <nav className="flex-1 p-4 space-y-8 overflow-y-auto no-scrollbar">
        {/* Main SaaS Section */}
        <div>
            {!isCollapsed && <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-4">Geral</p>}
            <div className="space-y-1">
                {mainLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                    <Link 
                    key={link.href}
                    href={link.href} 
                    title={isCollapsed ? link.label : ""}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'hover:bg-slate-800/50 hover:text-white'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                    <span className="shrink-0">{link.icon}</span>
                    {!isCollapsed && <span>{link.label}</span>}
                    </Link>
                )
                })}
            </div>
        </div>

        {/* Concrete ERP Section (Conditional) */}
        {concreteActive && (
            <div className="animate-in slide-in-from-left duration-300">
                {!isCollapsed && (
                    <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-4 px-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                        Concrete ERP
                    </p>
                )}
                <div className="space-y-1">
                    {concreteLinks.map((link) => {
                    const isActive = pathname?.startsWith(link.href)
                    return (
                        <Link 
                        key={link.href}
                        href={link.href} 
                        title={isCollapsed ? link.label : ""}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive 
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                            : 'hover:bg-slate-800/50 hover:text-white'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                        >
                        <span className="shrink-0">{link.icon}</span>
                        {!isCollapsed && <span>{link.label}</span>}
                        </Link>
                    )
                    })}
                </div>
            </div>
        )}
      </nav>

      <div className={`p-4 border-t border-slate-800 bg-slate-900/50 ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 overflow-hidden ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg">
            {userEmail?.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white uppercase tracking-tighter">{userEmail?.split('@')[0]}</p>
                <p className="text-[10px] truncate text-slate-500">{userEmail}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
