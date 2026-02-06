'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import UserModal from '@/components/UserModal';

export default function UsuariosPage() {
    const [profile, setProfile] = useState<any>(null);
    const [shop, setShop] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*, shops(*)')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setShop(profileData.shops);

                // Fetch other users in the same shop
                const { data: usersData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('shop_id', profileData.shop_id)
                    .order('created_at', { ascending: true });

                if (usersData) setUsers(usersData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const getRoleBadge = (role: string) => {
        const styles: any = {
            'admin': 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            'operator': 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            'tecnico': 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            'caixa': 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        };

        const labels: any = {
            'admin': 'Administrador',
            'operator': 'Operador',
            'tecnico': 'Técnico',
            'caixa': 'Caixa',
        };

        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${styles[role] || styles.operator}`}>
                {labels[role] || 'Membro'}
            </span>
        );
    };

    return (
        <div className="p-6 md:p-8 lg:px-12 max-w-[1280px] mx-auto flex flex-col gap-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#111418] dark:text-white tracking-tight">Gestão de Equipe</h2>
                    <p className="text-[#617589] dark:text-gray-400 mt-1">Gerencie seu perfil e os colaboradores da sua unidade.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined notranslate">person_add</span>
                    Novo Colaborador
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <div className="bg-white dark:bg-[#1e2730] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined notranslate text-6xl">account_circle</span>
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined notranslate text-4xl">person</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold dark:text-white">Seu Perfil</h3>
                            <p className="text-sm text-gray-500">Logado no sistema agora</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail de Acesso</label>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl font-bold text-gray-600 dark:text-gray-300">
                                {profile?.email || 'Admin'}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Sua Função</label>
                            {getRoleBadge(profile?.role)}
                        </div>
                    </div>
                </div>

                {/* Shop Card */}
                <div className="bg-white dark:bg-[#1e2730] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined notranslate text-6xl">store</span>
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                            <span className="material-symbols-outlined notranslate text-4xl">storefront</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold dark:text-white">Sua Loja</h3>
                            <p className="text-sm text-gray-500">Dados da unidade atual</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome da Unidade</label>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl font-bold text-gray-600 dark:text-gray-300 uppercase">
                                {shop?.name || 'Carregando...'}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Plano Atual</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl font-bold text-xs text-gray-500 uppercase">
                                    {shop?.plan || 'Free'}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Membros</label>
                                <div className="p-3 bg-primary/5 rounded-xl text-primary text-xs font-bold text-center">
                                    {users.length} ATIVOS
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Users */}
            <div className="bg-white dark:bg-[#1e2730] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-20">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="font-black text-xs uppercase tracking-widest dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined notranslate text-primary">group</span>
                        Membros da Equipe
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-gray-800">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Função</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                                {user.name?.[0] || user.email?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="font-bold text-sm dark:text-white">{user.name || 'Sem nome'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500">{user.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                shopId={shop?.id} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    loadData();
                }}
            />
        </div>
    );
}
