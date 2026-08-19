'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Receipt, Package, Tags, 
  Boxes, Users, Truck, Wallet, CreditCard, ArrowDownCircle, 
  BarChart3, UserCheck, Settings, LogOut, Store as StoreIcon,
  ChevronRight, Sparkles, Download, PanelLeftClose
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useCash } from '../../contexts/CashContext';
import { usePwa } from '../../contexts/PwaContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { db } from '../../lib/db';

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout, isAdmin, isManager } = useAuth();
  const { store } = useStore();
  const { isOpen } = useCash();
  const { isInstalled, openInstallFlow } = usePwa();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Contagem de alertas para badges
  const lowStockCount = React.useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const products = db.getProducts(store.id);
      return products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock).length;
    } catch {
      return 0;
    }
  }, [store.id, pathname]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, visible: true },
    { label: 'PDV (Caixa Rápido)', href: '/pdv', icon: ShoppingCart, highlight: true, visible: true },
    { label: 'Vendas', href: '/vendas', icon: Receipt, visible: true },
    { label: 'Produtos', href: '/produtos', icon: Package, visible: isManager },
    { label: 'Categorias', href: '/categorias', icon: Tags, visible: isManager },
    { 
      label: 'Estoque', 
      href: '/estoque', 
      icon: Boxes, 
      badge: lowStockCount > 0 ? `${lowStockCount} baixo` : undefined,
      badgeVariant: 'warning',
      visible: isManager 
    },
    { label: 'Clientes', href: '/clientes', icon: Users, visible: true },
    { label: 'Fornecedores', href: '/fornecedores', icon: Truck, visible: isManager },
    { 
      label: 'Caixa', 
      href: '/caixa', 
      icon: Wallet, 
      statusDot: isOpen ? 'bg-emerald-500' : 'bg-rose-500',
      visible: true 
    },
    { label: 'Contas a Receber', href: '/contas-receber', icon: CreditCard, visible: isManager },
    { label: 'Despesas', href: '/despesas', icon: ArrowDownCircle, visible: isManager },
    { label: 'Relatórios', href: '/relatorios', icon: BarChart3, visible: isManager },
    { label: 'Equipe & Usuários', href: '/usuarios', icon: UserCheck, visible: isAdmin },
    { label: 'Configurações', href: '/configuracoes', icon: Settings, visible: isAdmin },
  ];

  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 select-none transition-all duration-300 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
          <div className="bg-white p-1 rounded-xl shadow-md border border-white/20 flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="VasiStore"
              className="h-8 w-auto max-w-[100px] object-contain"
            />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-white text-xs truncate tracking-tight group-hover:text-emerald-400 transition-colors">
              {store.name || 'VasiStore'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[9px] text-slate-400 font-medium truncate">Gestão de Utilidades</p>
            </div>
          </div>
        </Link>

        {/* Botão de Ocultar Barra Lateral */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
          title="Ocultar barra lateral (Ctrl+B)"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all mb-2 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin-slow" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.statusDot && (
                    <span className={`w-2 h-2 rounded-full ${item.statusDot}`} title={isOpen ? 'Caixa Aberto' : 'Caixa Fechado'} />
                  )}
                  {item.badge && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 text-slate-500" />}
                </div>
              </Link>
            );
          })}
      </div>

      {/* User Footer Profile & App Install Action */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        {!isInstalled && (
          <button
            type="button"
            onClick={() => openInstallFlow()}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 transition-all text-xs font-semibold group cursor-pointer"
            title="Instalar VasiStore como aplicativo no computador"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px]">Instalar Aplicativo</span>
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
              PWA
            </span>
          </button>
        )}

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Operador'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Sair do Sistema"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Rodapé: Versão do Sistema e Desenvolvedor */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center justify-center gap-0.5 text-center select-none">
          <p className="text-[10px] text-slate-400 font-medium">
            Desenvolvido por: <span className="text-white font-bold tracking-wide hover:text-emerald-400 transition-colors">KryonSystems</span>
          </p>
          <p className="text-[9px] font-mono text-slate-500 tracking-wider">
            Versão 2.4.0
          </p>
        </div>
      </div>
    </aside>
  );
}
