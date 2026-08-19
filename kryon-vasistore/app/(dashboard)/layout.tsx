'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { MobileNav } from '../../components/layout/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isManager, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Checagem de permissões por rota
  useEffect(() => {
    if (!mounted || !user) return;

    const managerOnlyRoutes = ['/produtos', '/categorias', '/estoque', '/fornecedores', '/contas-receber', '/despesas', '/relatorios'];
    const adminOnlyRoutes = ['/usuarios', '/configuracoes'];

    if (managerOnlyRoutes.some(r => pathname?.startsWith(r)) && !isManager) {
      router.push('/pdv');
    }

    if (adminOnlyRoutes.some(r => pathname?.startsWith(r)) && !isAdmin) {
      router.push('/dashboard');
    }
  }, [pathname, isManager, isAdmin, user, mounted, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Verificando sessão segura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
