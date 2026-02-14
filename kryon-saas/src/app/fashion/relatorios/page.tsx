'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SalesData {
  date: string;
  total: number;
  count: number;
}

interface StockMetrics {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'stock'>('sales');
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [stockMetrics, setStockMetrics] = useState<StockMetrics>({ totalItems: 0, totalValue: 0, lowStockCount: 0 });
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('30'); // days

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [activeTab, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Determine Shop ID (Logic from Dashboard)
      let shopId: string | undefined;
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();
      
      shopId = profile?.shop_id;

      if (!shopId) {
           const { data: shop } = await supabase
              .from('shops')
              .select('id')
              .eq('owner_id', user.id)
              .single();
           shopId = shop?.id;
      }

      if (!shopId) {
          toast.error("Loja não encontrada.");
          return;
      }

      // Sales Report
      if (activeTab === 'sales') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));

        const { data: sales, error } = await supabase
          .from('sales')
          .select('*')
          .eq('shop_id', shopId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Process Sales Data
        const groupedSales = (sales || []).reduce((acc: any, sale: any) => {
          const date = new Date(sale.created_at).toLocaleDateString('pt-BR');
          if (!acc[date]) {
            acc[date] = { date, total: 0, count: 0 };
          }
          acc[date].total += sale.total_amount;
          acc[date].count += 1;
          return acc;
        }, {});

        setSalesData(Object.values(groupedSales));
      } 
      
      // Stock Report
      if (activeTab === 'stock') {
        const { data: items, error } = await supabase
          .from('fashion_products')
          .select('*')
          .eq('shop_id', shopId);

        if (error) throw error;

        if (items) {
           setStockItems(items);
           const metrics = items.reduce((acc: StockMetrics, item: any) => ({
             totalItems: acc.totalItems + (item.quantity || 0),
             totalValue: acc.totalValue + ((item.price || 0) * (item.quantity || 0)),
             lowStockCount: acc.lowStockCount + ((item.quantity || 0) < 5 ? 1 : 0)
           }), { totalItems: 0, totalValue: 0, lowStockCount: 0 });
           setStockMetrics(metrics);
        }
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    let csvContent = '';
    let filename = '';

    if (activeTab === 'sales') {
        const headers = ['Data', 'Total (R$)', 'Quantidade'];
        csvContent = [
        headers.join(','),
        ...salesData.map(row => `${row.date},${row.total.toFixed(2)},${row.count}`)
        ].join('\n');
        filename = `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
        const headers = ['Produto', 'Categoria', 'Preco', 'Quantidade', 'Total'];
        csvContent = [
            headers.join(','),
            ...stockItems.map(item => `"${item.name}","${item.category || ''}",${item.price},${item.quantity || 0},${(item.price * (item.quantity || 0)).toFixed(2)}`)
        ].join('\n');
        filename = `relatorio_estoque_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Relatórios & Insights</h1>
          <p className="text-slate-500 dark:text-slate-400">Analise o desempenho da sua loja e tome decisões baseadas em dados.</p>
        </div>
        <div className="flex gap-2">
           {activeTab === 'sales' && (
            <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Últimos 12 meses</option>
            </select>
           )}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">download</span>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 mb-8">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
            activeTab === 'sales'
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Vendas
          {activeTab === 'sales' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
            activeTab === 'stock'
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Estoque
          {activeTab === 'stock' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-purple-600">progress_activity</span>
        </div>
      ) : activeTab === 'sales' ? (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vendas Totais</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        R$ {salesData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Quantidade de Vendas</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {salesData.reduce((acc, curr) => acc + curr.count, 0)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ticket Médio</p>
                    <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                        R$ {salesData.length > 0 
                            ? (salesData.reduce((acc, curr) => acc + curr.total, 0) / salesData.reduce((acc, curr) => acc + curr.count, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                            : '0,00'}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Evolução de Vendas</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                            />
                            <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Valor Total em Estoque</p>
                    <p className="text-3xl font-black text-green-600 mt-2">
                        R$ {stockMetrics.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Peças</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {stockMetrics.totalItems}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Alerta de Estoque Baixo</p>
                    <p className={`text-3xl font-black mt-2 ${stockMetrics.lowStockCount > 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {stockMetrics.lowStockCount} <span className="text-sm text-slate-400 font-normal">produtos</span>
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventário Completo</h3>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium sticky top-0 backdrop-blur-sm z-10">
                            <tr>
                                <th className="px-6 py-4">Produto</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4 text-right">Preço</th>
                                <th className="px-6 py-4 text-center">Qtd.</th>
                                <th className="px-6 py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stockItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.category || '-'}</td>
                                    <td className="px-6 py-4 text-right">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                            (item.quantity || 0) < 5 
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}>
                                            {item.quantity || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                                        R$ {((item.price || 0) * (item.quantity || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
