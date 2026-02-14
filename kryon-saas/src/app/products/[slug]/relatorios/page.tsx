'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface DamagedProduct {
    id: string;
    created_at: string;
    quantity: number;
    reason: string;
    products: {
        name: string;
        price: number;
    };
}

const RelatoriosPage: React.FC = () => {
    const [damagedItems, setDamagedItems] = useState<DamagedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
    const [totalLoss, setTotalLoss] = useState(0);
    const supabase = createClient();

    const fetchDamagedProducts = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('shop_id')
                .eq('id', user.id)
                .single();

            const shopId = profile?.shop_id;

            const { data, error } = await supabase
                .from('damaged_products')
                .select(`
                    *,
                    products (
                        name,
                        price
                    )
                `)
                .eq('shop_id', shopId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setDamagedItems(data as any);
                const loss = data.reduce((acc, item: any) => acc + (item.quantity * (item.products?.price || 0)), 0);
                setTotalLoss(loss);
            }
        } catch (error) {
            console.error('Error fetching damaged products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredItems = damagedItems.filter(item => {
        const matchesSearch = item.products?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (dateFilter === 'all') return matchesSearch;
        
        const itemDate = new Date(item.created_at);
        const now = new Date();
        
        if (dateFilter === 'today') {
            return matchesSearch && itemDate.toDateString() === now.toDateString();
        }
        if (dateFilter === 'week') {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return matchesSearch && itemDate >= lastWeek;
        }
        if (dateFilter === 'month') {
            return matchesSearch && itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }
        
        return matchesSearch;
    });

    useEffect(() => {
        const loss = filteredItems.reduce((acc, item) => acc + (item.quantity * (item.products?.price || 0)), 0);
        setTotalLoss(loss);
    }, [filteredItems]);

    useEffect(() => {
        fetchDamagedProducts();
    }, []);

    return (
        <div className="flex flex-col gap-10 p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[#111418] dark:text-white text-3xl font-black tracking-tight tracking-tighter">Inventário de Perdas</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Controle de avarias, itens danificados e impacto financeiro no estoque.</p>
                </div>
                <button
                    onClick={fetchDamagedProducts}
                    className="flex items-center justify-center gap-3 bg-white dark:bg-[#1e2730] text-[#111418] dark:text-white px-8 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-black text-sm shadow-md active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                    Sincronizar Dados
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input 
                        type="text"
                        placeholder="Buscar por produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white dark:bg-[#1e2730] border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:border-primary transition-all dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <select 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="h-12 px-4 bg-white dark:bg-[#1e2730] border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none focus:border-primary transition-all"
                    >
                        <option value="all">Todo o Período</option>
                        <option value="today">Hoje</option>
                        <option value="week">Últimos 7 dias</option>
                        <option value="month">Este Mês</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-[#1e2730] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-6 relative overflow-hidden group">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-3xl font-black">trending_down</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prejuízo Bruto Estimado</p>
                        <h3 className="text-3xl font-black text-[#111418] dark:text-white mt-1">R$ {totalLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12">
                      <span className="material-symbols-outlined text-9xl">analytics</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e2730] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-6 relative overflow-hidden group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-3xl font-black">inventory_2</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registros de Perda</p>
                        <h3 className="text-3xl font-black text-[#111418] dark:text-white mt-1">{damagedItems.length} Operações</h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12">
                      <span className="material-symbols-outlined text-9xl">list_alt</span>
                    </div>
                </div>
            </div>

            {/* Damaged Products Table */}
            <div className="bg-white dark:bg-[#1e2730] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/20">
                    <h2 className="text-[#111418] dark:text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 text-gray-400">
                        <span className="material-symbols-outlined text-red-500 text-sm">history</span>
                        Histórico de Ajustes de Inventário
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-4 text-gray-400">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Consultando banco de dados...</p>
                    </div>
                ) : damagedItems.length === 0 ? (
                    <div className="p-24 text-center flex flex-col items-center gap-4 text-gray-400">
                        <div className="bg-green-500/5 p-10 rounded-full">
                          <span className="material-symbols-outlined text-7xl text-green-500/30">fact_check</span>
                        </div>
                        <div className="max-w-xs space-y-1">
                          <p className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">Estoque Saudável</p>
                          <p className="text-xs leading-relaxed">Não encontramos registros de perdas ou avarias em seu estoque. Excelente controle!</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/30 dark:bg-gray-900/30 text-[10px] font-black font-black uppercase tracking-widest text-gray-400">
                                <tr>
                                    <th className="px-8 py-4">Evento / Data</th>
                                    <th className="px-6 py-4">Item de Estoque</th>
                                    <th className="px-6 py-4 text-center">Quant.</th>
                                    <th className="px-6 py-4 text-right">Custo Unit.</th>
                                    <th className="px-6 py-4 text-right">Impacto Total</th>
                                    <th className="px-8 py-4">Motivo / Causa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-red-500/[0.02] dark:hover:bg-red-500/[0.05] transition-colors">
                                        <td className="px-8 py-6">
                                          <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
                                              {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                                              {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-6">
                                          <div className="flex flex-col">
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{item.products?.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">ID_{item.id.slice(0,8).toUpperCase()}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl text-xs font-black">
                                                -{item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <p className="text-xs font-medium text-gray-400">R$ {item.products?.price?.toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <p className="text-sm font-black text-red-600 dark:text-red-400">
                                                - R$ {(item.quantity * (item.products?.price || 0)).toFixed(2)}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 max-w-xs">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic font-medium leading-relaxed">
                                                {item.reason || 'Nenhuma descrição detalhada providenciada.'}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RelatoriosPage;
