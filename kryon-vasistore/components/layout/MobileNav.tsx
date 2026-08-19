'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Receipt, Package, Tags, 
  Boxes, Users, Truck, Wallet, CreditCard, ArrowDownCircle, 
  BarChart3, UserCheck, Settings, X, Store as StoreIcon,
  Sun, Moon, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePwa } from '../../contexts/PwaContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { role, logout, isAdmin, isManager } = useAuth();
  const { store } = useStore();
  const { isDark, toggleTheme } = useTheme();
  const { isInstalled, openInstallFlow } = usePwa();

  if (!isOpen) return null;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, visible: true },
    { label: 'PDV (Caixa Rápido)', href: '/pdv', icon: ShoppingCart, highlight: true, visible: true },
    { label: 'Vendas', href: '/vendas', icon: Receipt, visible: true },
    { label: 'Produtos', href: '/produtos', icon: Package, visible: isManager },
    { label: 'Categorias', href: '/categorias', icon: Tags, visible: isManager },
    { label: 'Estoque', href: '/estoque', icon: Boxes, visible: isManager },
    { label: 'Clientes', href: '/clientes', icon: Users, visible: true },
    { label: 'Fornecedores', href: '/fornecedores', icon: Truck, visible: isManager },
    { label: 'Caixa', href: '/caixa', icon: Wallet, visible: true },
    { label: 'Contas a Receber', href: '/contas-receber', icon: CreditCard, visible: isManager },
    { label: 'Despesas', href: '/despesas', icon: ArrowDownCircle, visible: isManager },
    { label: 'Relatórios', href: '/relatorios', icon: BarChart3, visible: isManager },
    { label: 'Equipe & Usuários', href: '/usuarios', icon: UserCheck, visible: isAdmin },
    { label: 'Configurações', href: '/configuracoes', icon: Settings, visible: isAdmin },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 text-slate-200 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-xl shadow-md flex items-center justify-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="VasiStore"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{store.name || 'VasiStore'}</p>
              <p className="text-[10px] text-slate-400">Gestão de Utilidades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.highlight
                      ? 'bg-emerald-600 text-white font-bold'
                      : isActive
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </div>

        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* PWA Install Button for Mobile */}
          {!isInstalled && (
            <button
              onClick={() => {
                onClose();
                openInstallFlow();
              }}
              className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                Instalar Aplicativo (PWA)
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-bold">App</span>
            </button>
          )}

          {/* Theme Switcher Button on Mobile */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              {isDark ? 'Tema Claro' : 'Tema Escuro'}
            </span>
            <span className="text-[10px] text-slate-400">{isDark ? 'Ativar Claro' : 'Ativar Escuro'}</span>
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold"
          >
            Sair do Sistema
          </button>

          {/* Rodapé: Versão e Desenvolvedor */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center justify-center gap-0.5 text-center select-none">
            <p className="text-[10px] text-slate-400 font-medium">
              Desenvolvido por: <span className="text-white font-bold tracking-wide">KryonSystems</span>
            </p>
            <p className="text-[9px] font-mono text-slate-500 tracking-wider">
              Versão 2.4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
