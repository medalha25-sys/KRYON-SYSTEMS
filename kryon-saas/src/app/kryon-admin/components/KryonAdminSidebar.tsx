'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Layers,
  Building2,
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  FileBarChart2,
  BrainCircuit,
  Lock,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'

const navItems = [
  { href: '/kryon-admin', label: 'Visão Geral', icon: LayoutDashboard, exact: true },
  { href: '/kryon-admin/produtos', label: 'Produtos', icon: Layers },
  { href: '/kryon-admin/empresas', label: 'Empresas', icon: Building2 },
  { href: '/kryon-admin/assinaturas', label: 'Assinaturas e Cobranças', icon: CreditCard },
  { href: '/kryon-admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/kryon-admin/fluxo-caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
  { href: '/kryon-admin/reservas', label: 'Reservas e Investimentos', icon: ShieldCheck },
  { href: '/kryon-admin/relatorios', label: 'Relatórios', icon: FileBarChart2 },
  { href: '/kryon-admin/intelligence', label: 'Kryon Intelligence', icon: BrainCircuit, badge: 'IA' },
  { href: '/kryon-admin/seguranca', label: 'Segurança e Auditoria', icon: Lock },
  { href: '/kryon-admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function KryonAdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLinkActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.08] bg-gradient-to-b from-blue-950/20 to-transparent">
        <Link href="/kryon-admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">Kryon Admin</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Central de Controle</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Navegação Executiva
        </div>

        {navItems.map((item) => {
          const active = isLinkActive(item)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={17}
                  className={`transition-colors duration-200 ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {active && !item.badge && (
                <ChevronRight size={14} className="text-white/70 animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0A0E17]/80 space-y-1">
        <Link
          href="/kryon-admin/configuracoes"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
            <User size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Meu Perfil</p>
            <p className="text-[10px] text-slate-400 truncate">Administrador Dono</p>
          </div>
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
        >
          <LogOut size={15} />
          <span>Sair da Central</span>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-[#080C14] border-r border-white/[0.08] flex-col shrink-0 sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#080C14]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between z-50">
        <Link href="/kryon-admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="font-black text-white text-sm">Kryon Admin</h1>
            <p className="text-[10px] text-slate-400">Central de Controle</p>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          aria-label="Abrir Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#080C14] border-r border-white/10 flex flex-col z-50 pt-16">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
