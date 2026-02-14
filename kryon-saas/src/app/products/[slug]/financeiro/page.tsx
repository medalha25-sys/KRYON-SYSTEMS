'use client';

import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts';
import { createClient } from '@/utils/supabase/client';
import { format, subDays, startOfDay, endOfDay, startOfMonth } from 'date-fns';

const FinanceiroPage: React.FC = () => {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        faturamentoHoje: 0,
        vendasHoje: 0,
        projecaoMensal: 0,
        faturamentoMensal: 0,
        aReceber: 0,
        pendenciasCount: 0,
        margemLiquida: 0,
        lucroEstimado: 0
    });
    const [salesData, setSalesData] = useState<any[]>([]);
    const [paymentData, setPaymentData] = useState<any[]>([]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('shop_id')
                .eq('id', user.id)
                .single();

            if (!profile?.shop_id) return;

            const today = new Date();
            const startOfToday = startOfDay(today).toISOString();
            const endOfToday = endOfDay(today).toISOString();
            const startOfMnth = startOfMonth(today).toISOString();

            // 1. Fetch Sales Today
            const { data: salesToday } = await supabase
                .from('sales')
                .select('total')
                .eq('shop_id', profile.shop_id)
                .gte('created_at', startOfToday)
                .lte('created_at', endOfToday);

            const fatHoje = salesToday?.reduce((acc, s) => acc + Number(s.total), 0) || 0;
            const countHoje = salesToday?.length || 0;

            // 2. Fetch Sales Month
            const { data: salesMonth } = await supabase
                .from('sales')
                .select('total, payment_methods')
                .eq('shop_id', profile.shop_id)
                .gte('created_at', startOfMnth);

            const fatMes = salesMonth?.reduce((acc, s) => acc + Number(s.total), 0) || 0;

            // 3. Fetch Service Orders Pending
            const { data: pendingSo } = await supabase
                .from('service_orders')
                .select('estimated_cost')
                .eq('shop_id', profile.shop_id)
                .neq('status', 'finished');
            
            const toReceive = pendingSo?.reduce((acc, so) => acc + Number(so.estimated_cost), 0) || 0;
            const soCount = pendingSo?.length || 0;

            // Calculate projections (Linear projection)
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const currentDay = today.getDate();
            const projection = (fatMes / currentDay) * daysInMonth;

            setStats({
                faturamentoHoje: fatHoje,
                vendasHoje: countHoje,
                faturamentoMensal: fatMes,
                projecaoMensal: projection,
                aReceber: toReceive,
                pendenciasCount: soCount,
                margemLiquida: 0, // Need cost price in products for this
                lucroEstimado: 0
            });

            // 4. Chart Data: Last 10 days
            const last10Days: any[] = [];
            for (let i = 9; i >= 0; i--) {
                const date = subDays(today, i);
                const dayStr = format(date, 'dd');
                const start = startOfDay(date).toISOString();
                const end = endOfDay(date).toISOString();

                const { data: daySales } = await supabase
                    .from('sales')
                    .select('total')
                    .eq('shop_id', profile.shop_id)
                    .gte('created_at', start)
                    .lte('created_at', end);

                last10Days.push({
                    day: dayStr,
                    value: daySales?.reduce((acc, s) => acc + Number(s.total), 0) || 0
                });
            }
            setSalesData(last10Days);

            // 5. Payment Methods Data
            const paymentMap: any = {
                'money': { name: 'Dinheiro', value: 0, color: '#6366f1' },
                'pix': { name: 'Pix', value: 0, color: '#2b8cee' },
                'credit': { name: 'Crédito', value: 0, color: '#10b981' },
                'debit': { name: 'Débito', value: 0, color: '#f59e0b' },
            };

            salesMonth?.forEach(sale => {
                const methods = sale.payment_methods as any[];
                methods?.forEach(m => {
                    if (paymentMap[m.method]) {
                        paymentMap[m.method].value += Number(m.amount);
                    }
                });
            });

            const totalPay = Object.values(paymentMap).reduce((acc: number, p: any) => acc + p.value, 0) as number;
            const finalPaymentData = Object.values(paymentMap).map((p: any) => ({
                ...p,
                value: totalPay > 0 ? Math.round((p.value / totalPay) * 100) : 0
            })).filter(p => p.value > 0);

            setPaymentData(finalPaymentData.length > 0 ? finalPaymentData : [
                { name: 'Sem dados', value: 100, color: '#e5e7eb' }
            ]);

        } catch (error) {
            console.error('Error loading financial data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-400 font-bold animate-pulse">Sincronizando dados financeiros...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[#111418] dark:text-white text-3xl font-black tracking-tight">Fluxo Financeiro</h1>
                    <p className="text-[#617589] dark:text-gray-400 font-medium">Dashboard consolidado de receitas e performance de vendas.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl hover:bg-red-500/20 transition-all font-black text-sm active:scale-95">
                        <span className="material-symbols-outlined">remove_circle</span>
                        Nova Despesa
                    </button>
                    <button className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-2xl hover:bg-green-600 transition-all font-black text-sm shadow-lg shadow-green-500/20 active:scale-95">
                        <span className="material-symbols-outlined">add_circle</span>
                        Nova Receita
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Faturamento Hoje', value: formatCurrency(stats.faturamentoHoje), sub: `${stats.vendasHoje} vendas realizadas`, trend: stats.vendasHoje > 0 ? '+100%' : null, trendColor: 'green' },
                    { label: 'Projeção Mensal', value: formatCurrency(stats.projecaoMensal), sub: `Faturamento atual: ${formatCurrency(stats.faturamentoMensal)}`, trend: null, trendColor: 'green' },
                    { label: 'Margem Líquida', value: stats.margemLiquida > 0 ? `${stats.margemLiquida}%` : '--', sub: stats.lucroEstimado > 0 ? `Lucro: ${formatCurrency(stats.lucroEstimado)}` : 'Aguardando dados de custo', trend: null, trendColor: 'green' },
                    { label: 'A Receber', value: formatCurrency(stats.aReceber), sub: `${stats.pendenciasCount} O.S. pendentes`, trend: null, trendColor: null },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1e2730] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                        <div className="flex items-center justify-between relative z-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            {stat.trend && (
                                <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded-full font-black">
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-[#111418] dark:text-white tracking-tighter">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-gray-400 italic mt-1">{stat.sub}</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5">
                          <span className="material-symbols-outlined text-8xl font-black">
                            {idx === 0 ? 'payments' : idx === 1 ? 'trending_up' : idx === 2 ? 'pie_chart' : 'account_balance_wallet'}
                          </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1e2730] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-lg font-black text-[#111418] dark:text-white tracking-tight">Performance Diária</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fluxo de Vendas (Últimos 10 Dias)</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 242, 255, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1e2730',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        color: '#fff',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#00f2ff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                                    {salesData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === salesData.length - 1 ? '#00f2ff' : 'rgba(0, 242, 255, 0.2)'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Pie Chart */}
                <div className="bg-white dark:bg-[#1e2730] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 flex flex-col transition-all hover:shadow-md">
                    <h3 className="text-lg font-black text-[#111418] dark:text-white tracking-tight mb-8">Meios de Pagamento</h3>
                    <div className="flex-1 flex flex-col items-center justify-center gap-10">
                        <div className="h-52 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {paymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share</span>
                                <span className="text-2xl font-black text-[#111418] dark:text-white">PDV</span>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4">
                            {paymentData.map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-800 dark:text-gray-200 ml-4">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceiroPage;
