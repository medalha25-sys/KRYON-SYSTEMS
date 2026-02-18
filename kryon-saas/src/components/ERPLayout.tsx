'use client';

import React, { useState, useEffect } from 'react';
import { AppView } from '@/types/erp';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import BirthdayModal from './BirthdayModal';

interface LayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

const ERPLayout: React.FC<LayoutProps> = ({ children, userEmail }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [shop, setShop] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'Estoque Baixo', message: '5 produtos estão abaixo do nível mínimo.', time: '10 min atrás', type: 'warning' },
    { id: '2', title: 'Nova Venda', message: 'Venda #1254 finalizada com sucesso.', time: '1 hora atrás', type: 'success' },
    { id: '3', title: 'Sistema', message: 'Backup diário realizado com sucesso.', time: '3 horas atrás', type: 'info' },
  ]);
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        
        // Check if today is birthday
        if (profileData.birth_date) {
            const today = new Date();
            const birthDate = new Date(profileData.birth_date);
            if (today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth()) {
                // Only show once per session or day (simple check here, could be more robust)
                const hasShown = sessionStorage.getItem(`birthday_shown_${user.id}_${today.toDateString()}`);
                if (!hasShown) {
                    setShowBirthdayModal(true);
                    sessionStorage.setItem(`birthday_shown_${user.id}_${today.toDateString()}`, 'true');
                }
            }
        }

        if (profileData.shop_id) {
          const { data: shopData } = await supabase
              .from('shops')
              .select('*')
              .eq('id', profileData.shop_id)
              .single();
          if (shopData) setShop(shopData);
        }
      }
    }
    loadUserData();
  }, []);

  const basePath = slug ? `/products/${slug}` : '/select-system';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: basePath },
    { id: 'vendas', label: 'Vendas', icon: 'shopping_cart', href: `${basePath}/vendas` },
    // Show Service Orders only for Tech Assist/Cell Phone shops
    ...(['tech-assist', 'systems-celulares', 'assistencia-tecnica'].includes(slug) ? [{ id: 'servicos', label: 'Ordens de Serviço', icon: 'build', href: `${basePath}/servicos` }] : []),
    { id: 'estoque', label: 'Estoque', icon: 'inventory_2', href: `${basePath}/estoque` },
    { id: 'financeiro', label: 'Financeiro', icon: 'account_balance', href: `${basePath}/financeiro` },
    { id: 'usuarios', label: 'Usuários', icon: 'group', href: `${basePath}/usuarios` },
    { id: 'configuracoes', label: 'Configurações', icon: 'settings', href: `${basePath}/configuracoes` },
    { id: 'relatorios', label: 'Relatórios', icon: 'bar_chart', href: `${basePath}/relatorios` },
  ];

  const currentView = navItems.find(item => pathname === item.href)?.id || 'dashboard';

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#1e2730] border-r border-gray-200 dark:border-gray-800 shrink-0 transition-colors">
        <div className="p-6 flex flex-col h-full justify-between">
          <div className="flex flex-col gap-6">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2 flex items-center justify-center overflow-hidden w-[44px] h-[44px]">
                {shop?.logo_url ? (
                  <img src={shop.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined notranslate text-primary text-[28px]">smartphone</span>
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#111418] dark:text-white text-base font-bold leading-tight truncate max-w-[140px]">
                  {shop?.name || 'Kryon Systems'}
                </h1>
                <p className="text-[#617589] dark:text-gray-400 text-xs font-medium">Sistema de Gestão</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${pathname === item.href
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-[#617589] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#111418] dark:hover:text-gray-200'
                    }`}
                >
                  <span className={`material-symbols-outlined notranslate !text-[20px] shrink-0 ${pathname === item.href ? 'fill-1' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-sm tracking-tight ${pathname === item.href ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/auth/signout"
              className="flex items-center gap-3 px-3 py-2.5 text-[#617589] dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined notranslate">logout</span>
              <span className="text-sm font-medium">Sair</span>
            </Link>
            <div className="px-3 border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">Versão 1.2.0</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">Kryon Systems Platform</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#1e2730] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-20 transition-colors">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined notranslate">menu</span>
          </button>

          <div className="hidden lg:flex flex-1 max-w-lg">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined notranslate text-gray-400 dark:text-gray-500">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-[#f0f2f4] dark:bg-[#111922] text-[#111418] dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1e2730] transition-all sm:text-sm"
                placeholder="Buscar por cliente, IMEI ou produto..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${showNotifications ? 'text-primary bg-blue-50 dark:bg-gray-800' : 'text-[#617589] dark:text-gray-400'}`}
              >
                <span className="material-symbols-outlined notranslate">notifications</span>
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-[#1e2730]"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e2730] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="font-black text-xs uppercase tracking-widest dark:text-white">Notificações</h3>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{notifications.length} novas</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto no-scrollbar">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                        <div className="flex gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.type === 'warning' ? 'bg-orange-500' : notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <p className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-3 text-xs font-bold text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border-t border-gray-100 dark:border-gray-800 uppercase tracking-widest">
                    Ver todas as notificações
                  </button>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#111418] dark:text-gray-200">{userEmail?.split('@')[0] || 'Admin'}</p>
                <p className="text-xs text-[#617589] dark:text-gray-500">Administrador</p>
              </div>
              <div
                className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white shadow-sm bg-cover bg-center"
                style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${userEmail || 'A'}&background=2b8cee&color=fff')` }}
              ></div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-white dark:bg-[#1e2730] flex flex-col p-6 gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <span className="material-symbols-outlined text-primary">smartphone</span>
              </div>
              <h1 className="text-lg font-bold text-[#111418] dark:text-white">Kryon Systems</h1>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname === item.href ? 'bg-primary/10 text-primary' : 'text-[#617589] dark:text-gray-400'
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t pt-4">
              <Link href="/auth/signout" className="flex items-center gap-3 text-[#617589] w-full">
                <span className="material-symbols-outlined">logout</span>
                <span className="text-sm font-medium">Sair</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {showBirthdayModal && (
        <BirthdayModal 
          userName={profile?.full_name || userEmail?.split('@')[0] || 'Colega'} 
          onClose={() => setShowBirthdayModal(false)} 
        />
      )}
    </div>
  );
};

export default ERPLayout;
