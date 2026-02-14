'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CashRegisterProvider, useCashRegister } from '@/components/CashRegisterContext';
import OpenRegisterModal from '@/components/OpenRegisterModal';
import CloseRegisterModal from '@/components/CloseRegisterModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

function FashionSidebar({ shop, user }: { shop: any; user: any }) {
    const pathname = usePathname();
    const { isRegisterOpen, sessionId } = useCashRegister();
    const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-xl">checkroom</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">Fashion AI</span>
            </div>

            <div className="px-4 mb-2">
                 <button
                    onClick={() => isRegisterOpen ? setIsCloseModalOpen(true) : setIsOpenModalOpen(true)}
                    className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${
                        isRegisterOpen 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                    }`}
                >
                    <span className="material-symbols-outlined">
                        {isRegisterOpen ? 'lock_open' : 'lock'}
                    </span>
                    {isRegisterOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-2">
                <Link href="/fashion/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/dashboard') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                </Link>
                <Link href="/fashion/vendas" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/vendas') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">point_of_sale</span>
                    Vendas & PDV
                </Link>
                <Link href="/fashion/produtos" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/produtos') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">apparel</span>
                    Produtos
                </Link>
                <Link href="/fashion/estoque" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/estoque') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">inventory_2</span>
                    Estoque
                </Link>
                <Link href="/fashion/clientes" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/clientes') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">group</span>
                    Clientes
                </Link>
                <Link href="/fashion/ia" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/ia') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Inteligência Artificial
                </Link>
                <Link href="/fashion/relatorios" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/relatorios') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">bar_chart</span>
                    Relatórios
                </Link>
                <Link href="/fashion/configuracoes" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/fashion/configuracoes') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="material-symbols-outlined">settings</span>
                    Configurações
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{shop.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <ThemeToggle />
                    <button 
                        onClick={handleLogout} 
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors"
                        title="Sair do sistema"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>

            <OpenRegisterModal isOpen={isOpenModalOpen} onClose={() => setIsOpenModalOpen(false)} />
            <CloseRegisterModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} />
        </aside>
    );
}

export default function FashionClientLayout({ children, shop, user }: { children: React.ReactNode, shop: any, user: any }) {
    return (
        <CashRegisterProvider>
             <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="flex">
                    <FashionSidebar shop={shop} user={user} />
                    <main className="flex-1 md:ml-64 p-8">
                        {children}
                    </main>
                </div>
            </div>
        </CashRegisterProvider>
    );
}
