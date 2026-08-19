'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Download, Printer, Calendar, DollarSign, 
  TrendingUp, Boxes, Layers, Package, FileSpreadsheet, 
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Sale, Product, Expense, AccountReceivable, Category } from '../../../lib/db/types';
import { formatCurrency, formatPercent, formatDate } from '../../../lib/formatters';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export default function ReportsPage() {
  const { store } = useStore();
  const { success } = useToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reportType, setReportType] = useState<'dre' | 'products' | 'stock' | 'sales'>('dre');

  const loadData = () => {
    setSales(db.getSales(store.id));
    setProducts(db.getProducts(store.id));
    setExpenses(db.getExpenses(store.id));
    setReceivables(db.getAccountsReceivable(store.id));
    setCategories(db.getCategories(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  // Cálculos do DRE Simplificado
  const dre = useMemo(() => {
    const completedSales = sales.filter((s) => s.status === 'completed');
    const grossRevenue = completedSales.reduce((acc, s) => acc + s.subtotal, 0);
    const discounts = completedSales.reduce((acc, s) => acc + s.discount, 0);
    const netRevenue = grossRevenue - discounts;
    const cmv = completedSales.reduce((acc, s) => acc + s.total_cost, 0);
    const grossProfit = netRevenue - cmv;
    const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    const operatingExpenses = expenses
      .filter((e) => e.status === 'paid')
      .reduce((acc, e) => acc + e.amount, 0);

    const netProfit = grossProfit - operatingExpenses;
    const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    return {
      grossRevenue,
      discounts,
      netRevenue,
      cmv,
      grossProfit,
      grossMargin,
      operatingExpenses,
      netProfit,
      netMargin,
    };
  }, [sales, expenses]);

  // Estoque Valorizado
  const stockValuation = useMemo(() => {
    const totalCostValuation = products.reduce((acc, p) => acc + p.cost_price * p.current_stock, 0);
    const totalSaleValuation = products.reduce((acc, p) => acc + p.sale_price * p.current_stock, 0);
    const potentialProfit = totalSaleValuation - totalCostValuation;
    const totalUnits = products.reduce((acc, p) => acc + p.current_stock, 0);

    return { totalCostValuation, totalSaleValuation, potentialProfit, totalUnits };
  }, [products]);

  // Ranking de Produtos
  const productRanking = useMemo(() => {
    const map: Record<string, { name: string; sku: string; sold: number; total: number; cost: number }> = {};

    sales.filter((s) => s.status === 'completed').forEach((s) => {
      s.items.forEach((item) => {
        if (!map[item.product_id]) {
          map[item.product_id] = {
            name: item.product_name,
            sku: item.sku,
            sold: 0,
            total: 0,
            cost: 0,
          };
        }
        map[item.product_id].sold += item.quantity;
        map[item.product_id].total += item.total_price;
        map[item.product_id].cost += (item.cost_price || 0) * item.quantity;
      });
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [sales]);

  // Exportar CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'products') {
      csvContent += 'SKU,Produto,Qtd Vendida,Total Vendido,Custo,Lucro\n';
      productRanking.forEach((p) => {
        csvContent += `"${p.sku}","${p.name}",${p.sold},${p.total.toFixed(2)},${p.cost.toFixed(2)},${(p.total - p.cost).toFixed(2)}\n`;
      });
    } else if (reportType === 'stock') {
      csvContent += 'SKU,Produto,Categoria,Estoque Atual,Custo Unitario,Venda Unitaria,Total Custo,Total Venda\n';
      products.forEach((p) => {
        csvContent += `"${p.sku}","${p.name}","${p.category_name || ''}",${p.current_stock},${p.cost_price.toFixed(2)},${p.sale_price.toFixed(2)},${(p.cost_price * p.current_stock).toFixed(2)},${(p.sale_price * p.current_stock).toFixed(2)}\n`;
      });
    } else {
      csvContent += 'Indicador,Valor\n';
      csvContent += `Receita Bruta,${dre.grossRevenue.toFixed(2)}\n`;
      csvContent += `Descontos Concedidos,${dre.discounts.toFixed(2)}\n`;
      csvContent += `Receita Liquida,${dre.netRevenue.toFixed(2)}\n`;
      csvContent += `Custo Mercadorias (CMV),${dre.cmv.toFixed(2)}\n`;
      csvContent += `Lucro Bruto,${dre.grossProfit.toFixed(2)}\n`;
      csvContent += `Despesas Operacionais,${dre.operatingExpenses.toFixed(2)}\n`;
      csvContent += `Lucro Liquido,${dre.netProfit.toFixed(2)}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Relatório CSV exportado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Relatórios Estratégicos & Financeiros
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            DRE Simplificado, margens reais, valorização de estoque e curva de vendas de utilidades.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
            size="sm"
          >
            Imprimir Relatório
          </Button>
          <Button
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
            size="sm"
            className="shadow-emerald-600/30"
          >
            Exportar CSV / Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto">
        <button
          onClick={() => setReportType('dre')}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            reportType === 'dre'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" /> DRE Simplificado (Lucro Real)
        </button>
        <button
          onClick={() => setReportType('products')}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            reportType === 'products'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" /> Ranking de Produtos Mais Vendidos
        </button>
        <button
          onClick={() => setReportType('stock')}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            reportType === 'stock'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" /> Valorização & Posição de Estoque
        </button>
      </div>

      {/* REPORT 1: DRE SIMPLIFICADO */}
      {reportType === 'dre' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900 text-white border-slate-800 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Receita Líquida</p>
              <h3 className="text-3xl font-black mt-1 font-display text-white">
                {formatCurrency(dre.netRevenue)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Bruto menos descontos concedidos</p>
            </Card>

            <Card className="bg-emerald-800 text-white border-emerald-700 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Lucro Bruto (Margem {formatPercent(dre.grossMargin)})</p>
              <h3 className="text-3xl font-black mt-1 font-display text-white">
                {formatCurrency(dre.grossProfit)}
              </h3>
              <p className="text-xs text-emerald-200 mt-1">Receita menos Custo de Mercadoria</p>
            </Card>

            <Card className="bg-emerald-950 text-white border-emerald-900 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Lucro Líquido Real ({formatPercent(dre.netMargin)})</p>
              <h3 className="text-3xl font-black mt-1 font-display text-emerald-400">
                {formatCurrency(dre.netProfit)}
              </h3>
              <p className="text-xs text-emerald-300 mt-1">Sobra limpa no caixa da loja</p>
            </Card>
          </div>

          {/* DRE Detailed Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Demonstrativo Estruturado do Período</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="flex justify-between px-5 py-3 text-slate-700 dark:text-slate-300">
                <span className="font-medium">(+) Receita Operacional Bruta (Vendas PDV)</span>
                <span className="font-mono font-semibold">{formatCurrency(dre.grossRevenue)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 text-rose-700 dark:text-rose-400">
                <span className="pl-4">(-) Descontos Concedidos no Balcão</span>
                <span className="font-mono">- {formatCurrency(dre.discounts)}</span>
              </div>
              <div className="flex justify-between px-5 py-3.5 font-extrabold text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/60">
                <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
                <span className="font-mono">{formatCurrency(dre.netRevenue)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 text-rose-700 dark:text-rose-400 font-medium">
                <span className="pl-4">(-) Custo das Mercadorias Vendidas (CMV)</span>
                <span className="font-mono">- {formatCurrency(dre.cmv)}</span>
              </div>
              <div className="flex justify-between px-5 py-3.5 font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40">
                <span>(=) LUCRO BRUTO OPERACIONAL</span>
                <span className="font-mono">{formatCurrency(dre.grossProfit)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 text-rose-700 dark:text-rose-400 font-medium">
                <span className="pl-4">(-) Despesas Operacionais (Aluguel, Luz, Salários, etc.)</span>
                <span className="font-mono">- {formatCurrency(dre.operatingExpenses)}</span>
              </div>
              <div className="flex justify-between px-5 py-4 font-black text-base text-emerald-950 dark:text-emerald-200 bg-emerald-100/60 dark:bg-emerald-950/70">
                <span>(=) RESULTADO LÍQUIDO DO PERÍODO</span>
                <span className="font-mono text-lg">{formatCurrency(dre.netProfit)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* REPORT 2: RANKING DE PRODUTOS */}
      {reportType === 'products' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Posição</th>
                  <th className="px-4 py-3.5">Produto</th>
                  <th className="px-4 py-3.5 text-center">Qtd Vendida</th>
                  <th className="px-4 py-3.5 text-right">Faturamento Total</th>
                  <th className="px-4 py-3.5 text-right">Custo Total</th>
                  <th className="px-4 py-3.5 text-right">Lucro Bruto Gerado</th>
                  <th className="px-4 py-3.5 text-center">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {productRanking.map((p, idx) => {
                  const profit = p.total - p.cost;
                  const margin = p.total > 0 ? (profit / p.total) * 100 : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-400 dark:text-slate-500">#{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">SKU: {p.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">{p.sold} un</td>
                      <td className="px-4 py-3 text-right font-black font-mono text-slate-900 dark:text-white">
                        {formatCurrency(p.total)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-400">
                        {formatCurrency(p.cost)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(profit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {formatPercent(margin)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPORT 3: VALORIZAÇÃO DE ESTOQUE */}
      {reportType === 'stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Patrimônio em Custo</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-display">
                {formatCurrency(stockValuation.totalCostValuation)}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stockValuation.totalUnits} peças físicas</p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Potencial de Venda</p>
              <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1 font-display">
                {formatCurrency(stockValuation.totalSaleValuation)}
              </h3>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/60 p-4 rounded-2xl border border-purple-200 dark:border-purple-900 shadow-sm">
              <p className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">Lucro Projetado em Estoque</p>
              <h3 className="text-2xl font-black text-purple-950 dark:text-purple-200 mt-1 font-display">
                {formatCurrency(stockValuation.potentialProfit)}
              </h3>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Produto</th>
                    <th className="px-4 py-3.5 text-center">Qtd Atual</th>
                    <th className="px-4 py-3.5 text-right">Custo Unitário</th>
                    <th className="px-4 py-3.5 text-right">Preço Venda</th>
                    <th className="px-4 py-3.5 text-right">Total em Custo</th>
                    <th className="px-4 py-3.5 text-right">Total em Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {p.current_stock} {p.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {formatCurrency(p.cost_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {formatCurrency(p.sale_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(p.cost_price * p.current_stock)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-700">
                        {formatCurrency(p.sale_price * p.current_stock)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
