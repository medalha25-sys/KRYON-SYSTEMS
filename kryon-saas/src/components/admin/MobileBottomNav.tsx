'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp,
  Menu,
  ShoppingCart,
  Home,
  DollarSign
} from 'lucide-react'

export function MobileBottomNav() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/concrete/dashboard', label: 'Início', icon: <Home size={22} /> },
    { href: '/concrete/pedidos', label: 'Pedidos', icon: <ShoppingCart size={22} /> },
    { href: '/concrete/clientes', label: 'Clientes', icon: <Users size={22} /> },
    { href: '/concrete/financeiro/contas-receber', label: 'Financeiro', icon: <DollarSign size={22} /> },
    { href: '/concrete/configuracoes', label: 'Mais', icon: <Menu size={22} /> },
  ]

  // Only show on mobile
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/5 py-4 pb-[env(safe-area-inset-bottom,16px)] flex justify-around items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.href)
        return (
          <Link 
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
              isActive ? 'text-orange-500' : 'text-slate-500'
            }`}
          >
            <div className={`p-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
