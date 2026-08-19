'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  DollarSign, ShoppingBag, ShoppingCart, TrendingUp, AlertTriangle, 
  PackageX, CreditCard, Wallet, Percent, ArrowUpRight, Plus, 
  Calendar, Boxes, ChevronRight, Eye, Sparkles, RefreshCw
} from 'lucide-react';
import { db } from '../../../lib/db';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useCash } from '../../../contexts/CashContext';
import { formatCurrency, formatNumber, formatPercent, formatDateTime } from '../../../lib/formatters';
import { StatCard } from '../../../components/ui/StatCard';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SalesTrendChart } from '../../../components/charts/SalesTrendChart';
import { CategoryPieChart } from '../../../components/charts/CategoryPieChart';
import { PaymentMethodsChart } from '../../../components/charts/PaymentMethodsChart';
import { Sale, Product } from '../../../lib/db/types';

type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth';

export default function DashboardPage() {
  const { store } = useStore();
  const { isCashier } = useAuth();
  const { isOpen, cashBalance } = useCash();

  const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth');
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const s = db.getSales(store.id);
    const p = db.getProducts(store.id);
    setSales(s);
    setProducts(p);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [store.id]);

  // Filtragem de vendas baseada no seletor de data
  const filteredSales = useMemo(() => {
    const now = new Date();
    const completedSales = sales.filter((s) => s.status === 'completed');

    if (dateFilter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return completedSales.filter((s) => s.created_at.startsWith(todayStr));
    }

    if (dateFilter === 'yesterday') {
      const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
      return completedSales.filter((s) => s.created_at.startsWith(yesterday));
    }

    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      return completedSales.filter((s) => new Date(s.created_at) >= sevenDaysAgo);
    }

    if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      return completedSales.filter((s) => new Date(s.created_at) >= thirtyDaysAgo);
    }

    if (dateFilter === 'thisMonth') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return completedSales.filter((s) => {
        const d = new Date(s.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    if (dateFilter === 'lastMonth') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return completedSales.filter((s) => {
        const d = new Date(s.created_at);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      });
    }

    return completedSales;
  }, [sales, dateFilter]);

  // Métricas calculadas dinâmicas
  const metrics = useMemo(() => {
    const totalSales = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const countSales = filteredSales.length;
    const avgTicket = countSales > 0 ? totalSales / countSales : 0;
    const totalItems = filteredSales.reduce(
      (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
      0
    );
    const totalCost = filteredSales.reduce((acc, s) => acc + s.total_cost, 0);
    const profit = totalSales - totalCost;
    const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

    const lowStock = products.filter((p) => p.current_stock > 0 && p.current_stock <= p.min_stock).length;
    const outOfStock = products.filter((p) => p.current_stock <= 0).length;

    return {
      totalSales,
      countSales,
      avgTicket,
      totalItems,
      profit,
      margin,
      lowStock,
      outOfStock,
    };
  }, [filteredSales, products]);

  // Dados para o Gráfico de Tendência Diária
  const trendData = useMemo(() => {
    const dayMap: Record<string, { total: number; count: number }> = {};

    filteredSales.forEach((s) => {
      const day = new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!dayMap[day]) {
        dayMap[day] = { total: 0, count: 0 };
      }
      dayMap[day].total += s.total;
      dayMap[day].count += 1;
    });

    return Object.keys(dayMap).map((k) => ({
      date: k,
      total: parseFloat(dayMap[k].total.toFixed(2)),
      count: dayMap[k].count,
    }));
  }, [filteredSales]);

  // Dados para o Gráfico de Categorias
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        const catName = prod?.category_name || 'Utilidades';
        catMap[catName] = (catMap[catName] || 0) + item.total_price;
      });
    });

    return Object.keys(catMap).map((cat) => ({
      name: cat,
      value: parseFloat(catMap[cat].toFixed(2)),
    }));
  }, [filteredSales, products]);

  // Dados para o Gráfico de Formas de Pagamento
  const paymentMethodsData = useMemo(() => {
    const payMap: Record<string, { total: number; count: number }> = {};

    filteredSales.forEach((s) => {
      s.payments.forEach((p) => {
        const method = p.method.toUpperCase();
        if (!payMap[method]) {
          payMap[method] = { total: 0, count: 0 };
        }
        payMap[method].total += p.amount;
        payMap[method].count += 1;
      });
    });

    return Object.keys(payMap).map((method) => ({
      method,
      total: parseFloat(payMap[method].total.toFixed(2)),
      count: payMap[method].count,
    }));
  }, [filteredSales]);

  // Top 5 Produtos mais vendidos
  const topProducts = useMemo(() => {
    const prodMap: Record<string, { name: string; sku: string; qty: number; total: number; image?: string }> = {};

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!prodMap[item.product_id]) {
          const prod = products.find((p) => p.id === item.product_id);
          prodMap[item.product_id] = {
            name: item.product_name,
            sku: item.sku,
            qty: 0,
            total: 0,
            image: prod?.image_url,
          };
        }
        prodMap[item.product_id].qty += item.quantity;
        prodMap[item.product_id].total += item.total_price;
      });
    });

    return Object.values(prodMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredSales, products]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              {store.name}
            </span>
            <span className="text-xs text-slate-400">Painel Operacional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 font-display">
            Visão Geral da Loja
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Acompanhe vendas de potes, vasilhas, estoque e movimentações em tempo real.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700/60">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateFilter === 'today' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setDateFilter('yesterday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateFilter === 'yesterday' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ontem
          </button>
          <button
            onClick={() => setDateFilter('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateFilter === '7days' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Dias
          </button>
          <button
            onClick={() => setDateFilter('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateFilter === '30days' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            30 Dias
          </button>
          <button
            onClick={() => setDateFilter('thisMonth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateFilter === 'thisMonth' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setDateFilter('lastMonth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateFilter === 'lastMonth' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mês Anterior
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/pdv" className="block">
          <div className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">Frente de Caixa</p>
              <h4 className="text-base sm:text-lg font-bold">Abrir PDV (F2)</h4>
            </div>
            <ShoppingCart className="w-6 h-6 text-emerald-200" />
          </div>
        </Link>

        <Link href="/estoque" className="block">
          <div className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between text-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-500">Estoque</p>
              <h4 className="text-base sm:text-lg font-bold">Nova Entrada</h4>
            </div>
            <Boxes className="w-6 h-6 text-blue-600" />
          </div>
        </Link>

        <Link href="/caixa" className="block">
          <div className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between text-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-500">Financeiro</p>
              <h4 className="text-base sm:text-lg font-bold">{isOpen ? 'Fechar Caixa' : 'Abrir Caixa'}</h4>
            </div>
            <Wallet className={`w-6 h-6 ${isOpen ? 'text-emerald-600' : 'text-rose-600'}`} />
          </div>
        </Link>

        <Link href="/relatorios" className="block">
          <div className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between text-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-500">Estratégico</p>
              <h4 className="text-base sm:text-lg font-bold">Ver DRE & Lucro</h4>
            </div>
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Faturamento no Período"
          value={formatCurrency(metrics.totalSales)}
          subtitle={`${metrics.countSales} vendas finalizadas`}
          icon={<DollarSign className="w-6 h-6" />}
          variant="emerald"
        />

        <StatCard
          title="Ticket Médio"
          value={formatCurrency(metrics.avgTicket)}
          subtitle={`${formatNumber(metrics.totalItems)} itens vendidos`}
          icon={<ShoppingBag className="w-6 h-6" />}
          variant="blue"
        />

        <StatCard
          title="Lucro Bruto Estimado"
          value={formatCurrency(metrics.profit)}
          subtitle={`Margem média: ${formatPercent(metrics.margin)}`}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="purple"
        />

        <StatCard
          title="Saldo em Caixa"
          value={formatCurrency(cashBalance)}
          subtitle={isOpen ? 'Caixa em operação' : 'Caixa fechado'}
          icon={<Wallet className="w-6 h-6" />}
          variant={isOpen ? 'emerald' : 'rose'}
        />
      </div>

      {/* Secondary Stock & Operational Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/estoque?filter=low" className="block">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between hover:bg-amber-100/70 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-900 uppercase">Produtos com Estoque Baixo</p>
                <h4 className="text-xl font-bold text-amber-950">{metrics.lowStock} itens</h4>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600" />
          </div>
        </Link>

        <Link href="/estoque" className="block">
          <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-center justify-between hover:bg-rose-100/70 dark:hover:bg-rose-900/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500 text-white rounded-xl shadow-sm">
                <PackageX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-900 dark:text-rose-300 uppercase">Produtos Sem Estoque</p>
                <h4 className="text-xl font-bold text-rose-950 dark:text-rose-200">{metrics.outOfStock} itens zerados</h4>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
        </Link>

        <Link href="/contas-receber" className="block">
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 flex items-center justify-between hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase">Contas a Receber / Fiado</p>
                <h4 className="text-xl font-bold text-blue-950 dark:text-blue-200">Acompanhar Cobranças</h4>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </Link>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend (2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Evolução Diária de Vendas"
              subtitle="Volume total comercializado no período selecionado"
              action={
                <Badge variant="success">
                  {filteredSales.length} vendas
                </Badge>
              }
            />
            <SalesTrendChart data={trendData} />
          </Card>
        </div>

        {/* Category breakdown (1 col) */}
        <div>
          <Card>
            <CardHeader
              title="Vendas por Categoria"
              subtitle="Potes, Vasilhas, Panelas e mais"
            />
            <CategoryPieChart data={categoryData} />
          </Card>
        </div>
      </div>

      {/* Secondary Row: Payment Methods & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader
            title="Formas de Pagamento Utilizadas"
            subtitle="Valores apurados em Dinheiro, PIX, Débito e Crédito"
          />
          <PaymentMethodsChart data={paymentMethodsData} />
        </Card>

        {/* Top 5 Products */}
        <Card>
          <CardHeader
            title="Produtos Mais Vendidos"
            subtitle="Top 5 itens com maior volume de faturamento"
            action={
              <Link href="/produtos" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">Nenhum produto vendido no período.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      #{idx + 1}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{p.name}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">SKU: {p.sku} • {p.qty} un. vendidas</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(p.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Latest Sales Table */}
      <Card>
        <CardHeader
          title="Últimas Vendas Realizadas"
          subtitle="Histórico recente de transações no balcão e PDV"
          action={
            <Link href="/vendas">
              <Button variant="outline" size="sm">
                Histórico Completo
              </Button>
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Cupom</th>
                <th className="px-4 py-3">Data / Hora</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{sale.sale_number}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(sale.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{sale.customer_name || 'Cliente Balcão'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sale.cashier_name}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{sale.payment_method}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={sale.status === 'completed' ? 'success' : 'danger'}>
                      {sale.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
