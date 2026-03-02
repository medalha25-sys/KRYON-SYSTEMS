'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Building2, LayoutDashboard, Users, Construction, FileText, Settings, ShieldCheck, Truck, Package, ChevronLeft, ChevronRight, DollarSign, TrendingUp, ShoppingCart, LogOut } from 'lucide-react'

interface AdminSidebarProps {
  userEmail: string | undefined
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const [concreteActive, setConcreteActive] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [orgName, setOrgName] = useState('Sistema')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const supabase = useMemo(() => createClient(), [])

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
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, organization_id, organizations(name, modules)')
        .eq('id', user.id)
        .single()
      
      const isSuper = profile?.is_super_admin === true
      setIsSuperAdmin(isSuper)
      
      const org = profile?.organizations as any
      if (org) {
        setOrgName(org.name || 'Sistema')
        const modules = org.modules
        setConcreteActive(isSuper || !!modules?.concrete_erp)
      }
    }
    loadProfile()
  }, [supabase])

  const isConcretePath = pathname?.startsWith('/concrete')


  const concreteLinks = [
    { href: '/concrete/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/concrete/pedidos', label: 'Meus Pedidos', icon: <ShoppingCart size={18} /> },
    { href: '/concrete/clientes', label: 'Clientes', icon: <Users size={18} /> },
    { href: '/concrete/orcamentos', label: 'Orçamentos', icon: <FileText size={18} /> },
    { href: '/concrete/entregas', label: 'Status de Entrega', icon: <Truck size={18} /> },
    { href: '/concrete/financeiro/contas-receber', label: 'Financeiro', icon: <DollarSign size={18} /> },
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
        <h1 className="text-xl font-bold text-white flex items-center justify-center">
            <Building2 className="text-blue-500 shrink-0" size={28} />
        </h1>
      </div>

      {/* User Profile and Logout at the TOP */}
      <div className={`p-4 border-b border-slate-800 bg-slate-900/30 ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center justify-between gap-3 bg-slate-800/20 p-3 rounded-xl border border-slate-700/30 overflow-hidden ${isCollapsed ? 'justify-center px-0 ring-1 ring-slate-800' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg border border-white/10">
            {userEmail?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                  <p className="text-[10px] font-black truncate text-white uppercase tracking-tight">{userEmail?.split('@')[0]}</p>
                  <p className="text-[9px] truncate text-slate-500 font-medium">{userEmail}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={() => {
                supabase.auth.signOut().then(() => window.location.assign('/login'))
              }}
              title="Sair do sistema"
              className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-lg transition-all group/logout"
            >
              <LogOut size={16} className="group-hover/logout:scale-110 transition-transform" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button 
             onClick={() => {
                supabase.auth.signOut().then(() => window.location.assign('/login'))
              }}
             className="w-10 h-10 mt-2 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
             <LogOut size={16} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-8 overflow-y-auto no-scrollbar">

        {/* Concrete ERP Section (Conditional) */}
        {concreteActive && (
            <div className="animate-in slide-in-from-left duration-300">
                {!isCollapsed && (
                    <div className="mb-4 px-4" />
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

    </aside>
  )
}
