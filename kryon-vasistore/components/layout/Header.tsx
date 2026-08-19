'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, ShoppingCart, User, CheckCircle2, 
  AlertCircle, ShieldCheck, ChevronDown, PlusCircle, Sparkles,
  Sun, Moon, Download, Lock, Eye, EyeOff, KeyRound,
  PanelLeftClose, PanelLeftOpen, Tag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePwa } from '../../contexts/PwaContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useToast } from '../../contexts/ToastContext';
import { Profile } from '../../lib/db/types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { NotificationBell } from '../notifications/NotificationBell';
import { PriceCheckModal } from '../price-check/PriceCheckModal';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, role, switchUserWithPassword, availableUsers } = useAuth();
  const { store } = useStore();
  const { isDark, toggleTheme } = useTheme();
  const { isInstallable, isInstalled, openInstallFlow } = usePwa();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { success, error } = useToast();

  const [showPriceCheckModal, setShowPriceCheckModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [targetUserForSwitch, setTargetUserForSwitch] = useState<Profile | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSelectUser = (u: Profile) => {
    setShowUserDropdown(false);
    if (u.id === user?.id) return;
    setTargetUserForSwitch(u);
    setPasswordInput('');
    setPasswordError('');
    setShowPassword(false);
  };

  const handleConfirmSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForSwitch) return;

    if (!passwordInput.trim()) {
      setPasswordError('Digite a senha para confirmar.');
      return;
    }

    const res = switchUserWithPassword(targetUserForSwitch.id, passwordInput);
    if (res.success) {
      success('Usuário alternado!', `Você agora está conectado como ${targetUserForSwitch.full_name}.`);
      setTargetUserForSwitch(null);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError(res.message || 'Senha incorreta para este usuário.');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 transition-colors duration-200">
      {/* Left side: Mobile trigger, Desktop Sidebar toggle & Page Info */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
            isCollapsed
              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={isCollapsed ? "Mostrar Barra Lateral (Ctrl+B)" : "Ocultar Barra Lateral (Ctrl+B)"}
        >
          {isCollapsed ? (
            <>
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mostrar Menu</span>
              <span className="text-[10px] opacity-70 bg-emerald-200/60 dark:bg-emerald-900/60 px-1 py-0.5 rounded font-mono">Ctrl+B</span>
            </>
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden xl:inline">Ocultar Menu</span>
            </>
          )}
        </button>

        {/* Brand preview when sidebar is collapsed */}
        {isCollapsed && (
          <Link href="/dashboard" className="hidden lg:flex items-center gap-2 group">
            <div className="bg-white p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
              <img src="/logo.png" alt="VasiStore" className="h-6 w-auto object-contain" />
            </div>
            <span className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
              {store.name || 'VasiStore'}
            </span>
          </Link>
        )}
      </div>

      {/* Right side: Dark Mode Toggle, Install App, Quick PDV button & User Profile Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Action Button */}
        {!isInstalled && (
          <button
            onClick={() => openInstallFlow()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Instalar VasiStore como aplicativo no computador ou celular"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Instalar App</span>
            <span className="sm:hidden">App</span>
          </button>
        )}

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          title={isDark ? 'Ativar Tema Claro' : 'Ativar Tema Escuro'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" />
          )}
        </button>

        {/* Quick Price Check Action Button */}
        <button
          type="button"
          onClick={() => setShowPriceCheckModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
          title="Consulta Rápida de Preços de Produtos"
        >
          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">Consultar Preço</span>
        </button>

        {/* Sino de Notificações & Alertas */}
        <NotificationBell />

        {/* PDV shortcut button */}
        <Link href="/pdv">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<ShoppingCart className="w-4 h-4" />}
            className="hidden sm:inline-flex shadow-emerald-600/20"
          >
            Frente de Caixa (PDV)
          </Button>
        </Link>

        {/* Role & User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user?.full_name?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowUserDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-40 animate-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Alternar Usuário / Perfil</p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Exige senha do usuário selecionado</p>
                </div>
                <div className="py-1 space-y-1">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        user?.id === u.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="leading-tight font-semibold">{u.full_name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                        </div>
                      </div>
                      {user?.id === u.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE SENHA PARA TROCA DE USUÁRIO */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!targetUserForSwitch}
        onClose={() => setTargetUserForSwitch(null)}
        title="Confirmar Troca de Usuário"
        subtitle="Autenticação de segurança exigida"
        maxWidth="sm"
      >
        {targetUserForSwitch && (
          <form onSubmit={handleConfirmSwitch} className="space-y-4">
            {/* Perfil Selecionado */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm uppercase shadow-sm flex-shrink-0">
                {targetUserForSwitch.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {targetUserForSwitch.full_name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                  Cargo: <strong className="text-emerald-700 dark:text-emerald-400">{targetUserForSwitch.role}</strong>
                </p>
              </div>
            </div>

            {/* Input de Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Senha do Usuário *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Digite a senha para alternar..."
                  className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Alerta de Erro */}
            {passwordError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="font-semibold">{passwordError}</span>
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTargetUserForSwitch(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<KeyRound className="w-4 h-4" />}
                className="font-bold shadow-emerald-600/30"
              >
                Confirmar e Alternar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal de Consulta Rápida de Preços */}
      <PriceCheckModal
        isOpen={showPriceCheckModal}
        onClose={() => setShowPriceCheckModal(false)}
      />
    </header>
  );
}
