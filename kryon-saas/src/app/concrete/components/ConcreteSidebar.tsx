'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Building2, LayoutDashboard, Users, Construction, FileText, Settings, Truck, Package, ChevronLeft, ChevronRight, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react'

interface ConcreteSidebarProps {
  userEmail: string | undefined
}

export function ConcreteSidebar({ userEmail }: ConcreteSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [orgName, setOrgName] = useState('Concrete ERP')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const savedState = localStorage.getItem('concrete-sidebar-collapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('concrete-sidebar-collapsed', String(newState))
  }

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations(name)')
        .eq('id', user.id)
        .maybeSingle()
      
      const org = profile?.organizations as any
      if (org?.name) {
        setOrgName(org.name)
      }
    }
    loadProfile()
  }, [supabase])

  const navLinks = [
    { href: '/concrete/dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
    { href: '/concrete/pedidos', label: 'Pedidos de Concreto', icon: <ShoppingCart size={20} /> },
    { href: '/concrete/producao', label: 'Usinagem & Traços', icon: <Construction size={20} /> },
    { href: '/concrete/entregas', label: 'Logística & Frotas', icon: <Truck size={20} /> },
    { href: '/concrete/estoque', label: 'Insumos / Estoque', icon: <Package size={20} /> },
    { href: '/concrete/clientes', label: 'Obras & Clientes', icon: <Users size={20} /> },
    { href: '/concrete/financeiro/contas-receber', label: 'Gestão Financeira', icon: <DollarSign size={20} /> },
    { href: '/concrete/fiscal/nfe', label: 'Módulo Fiscal', icon: <FileText size={20} /> },
    { href: '/concrete/executivo', label: 'Relatórios Executivos', icon: <TrendingUp size={20} /> },
    { href: '/concrete/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  ]

  return (
    <aside 
      className={`h-screen bg-[#0A0D14] border-r border-white/5 flex flex-col transition-all duration-300 relative select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-8 bg-orange-500 hover:bg-orange-600 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110 z-50 flex items-center justify-center border-2 border-[#0A0D14]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-5 border-b border-white/5 flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 flex-shrink-0">
          <Building2 size={22} />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-white text-base tracking-wide truncate">{orgName}</h1>
            <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Concrete ERP</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {navLinks.map((link) => {
          const isActive = pathname?.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              title={isCollapsed ? link.label : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive 
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <span className={`transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${
                isActive ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                {link.icon}
              </span>
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{userEmail || 'Operador'}</p>
            <p className="text-[10px] text-slate-500">Conectado</p>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" title={userEmail}></div>
        )}
      </div>
    </aside>
  )
}
