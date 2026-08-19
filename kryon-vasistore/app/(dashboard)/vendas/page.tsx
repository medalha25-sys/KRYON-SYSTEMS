'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, Search, Eye, Printer, XCircle, 
  RotateCcw, Calendar, User, DollarSign, Check, Filter 
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Sale } from '../../../lib/db/types';
import { formatCurrency, formatDateTime } from '../../../lib/formatters';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ReceiptModal } from '../../../components/receipt/ReceiptModal';

export default function SalesHistoryPage() {
  const { store } = useStore();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  // Modal de Detalhes da Venda
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal de Cancelamento
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Desistência do cliente');

  // Modal de Impressão de Recibo
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  const loadData = () => {
    setSales(db.getSales(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleOpenDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleOpenCancel = (sale: Sale) => {
    setSelectedSale(sale);
    setCancelReason('Desistência do cliente / Troca');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;

    try {
      db.cancelSale(
        selectedSale.id,
        cancelReason,
        user?.id || 'admin',
        user?.full_name || 'Operador'
      );
      success(`Venda ${selectedSale.sale_number} cancelada!`, 'Os produtos foram devolvidos ao estoque.');
      setIsCancelModalOpen(false);
      setIsDetailModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao cancelar venda', err.message);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.sale_number.toLowerCase().includes(q) ||
          (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
          s.cashier_name.toLowerCase().includes(q) ||
          s.payment_method.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sales, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Histórico de Vendas Realizadas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consulte cupons emitidos, reimprima comprovantes térmicos e faça cancelamentos com estorno de estoque.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Buscar por cupom (ex: VD-1001), cliente ou vendedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all" className="bg-white dark:bg-slate-900">Todos os Status ({sales.length})</option>
            <option value="completed" className="bg-white dark:bg-slate-900">Apenas Concluídas</option>
            <option value="cancelled" className="bg-white dark:bg-slate-900">Apenas Canceladas</option>
          </select>
        </div>
      </Card>

      {/* Sales Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Cupom</th>
                <th className="px-4 py-3.5">Data / Hora</th>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Vendedor(a)</th>
                <th className="px-4 py-3.5">Forma Pagamento</th>
                <th className="px-4 py-3.5 text-right">Valor Total</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    Nenhuma venda encontrada com os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{sale.sale_number}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">{formatDateTime(sale.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {sale.customer_name || 'Cliente Balcão'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sale.cashier_name}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">{sale.payment_method}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={sale.status === 'completed' ? 'success' : 'danger'} size="sm">
                        {sale.status === 'completed' ? 'Concluída' : 'Cancelada'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(sale)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setReceiptSale(sale)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Reimprimir Recibo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {sale.status === 'completed' && (
                          <button
                            onClick={() => handleOpenCancel(sale)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Cancelar Venda e Devolver Estoque"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: DETALHES DA VENDA */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Detalhes da Venda #${selectedSale?.sale_number}`}
        subtitle={`Realizada em ${formatDateTime(selectedSale?.created_at)} por ${selectedSale?.cashier_name}`}
        maxWidth="lg"
      >
        {selectedSale && (
          <div className="space-y-4">
            {/* Customer & Status Header */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-500">Cliente Identificado:</p>
                <p className="font-bold text-slate-900">{selectedSale.customer_name || 'Cliente Balcão'}</p>
              </div>
              <Badge variant={selectedSale.status === 'completed' ? 'success' : 'danger'}>
                {selectedSale.status === 'completed' ? 'Concluída' : 'Cancelada'}
              </Badge>
            </div>

            {/* Items List */}
            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-center">Qtd</th>
                    <th className="px-3 py-2 text-right">Unitário</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{item.quantity}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedSale.subtotal)}</span>
              </div>
              {selectedSale.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Desconto Aplicado:</span>
                  <span>- {formatCurrency(selectedSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 border-t text-slate-900">
                <span>Total Final:</span>
                <span className="text-emerald-700">{formatCurrency(selectedSale.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  setReceiptSale(selectedSale);
                  setIsDetailModalOpen(false);
                }}
              >
                Imprimir Cupom
              </Button>
              {selectedSale.status === 'completed' && (
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenCancel(selectedSale);
                  }}
                >
                  Cancelar Venda
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: CANCELAR VENDA */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={`Cancelar Venda #${selectedSale?.sale_number}?`}
        subtitle="O estoque de todos os itens será devolvido e o valor será estornado do caixa."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <Input
            label="Motivo do Cancelamento *"
            placeholder="Ex: Desistência do cliente / Pagamento incorreto"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            autoFocus
          />

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            ⚠️ <strong>Atenção:</strong> Ao confirmar, o estoque será ajustado automaticamente e a venda será marcada como cancelada permanentemente.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button type="submit" variant="danger" size="sm" leftIcon={<XCircle className="w-4 h-4" />}>
              Confirmar Cancelamento
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: RECIBO TÉRMICO */}
      <ReceiptModal
        isOpen={!!receiptSale}
        onClose={() => setReceiptSale(null)}
        sale={receiptSale}
        store={store}
      />
    </div>
  );
}
