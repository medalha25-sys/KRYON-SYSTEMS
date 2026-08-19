'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Boxes, PlusCircle, ArrowDownLeft, ArrowUpRight, 
  AlertTriangle, RefreshCw, Search, Check, Filter, 
  FileText, ClipboardList, ShieldAlert
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Product, StockMovement, StockMovementType } from '../../../lib/db/types';
import { formatDateTime, formatNumber } from '../../../lib/formatters';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export default function StockPage() {
  const { store } = useStore();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [tab, setTab] = useState<'movements' | 'lowStock' | 'inventory'>('movements');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Nova Movimentação
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<StockMovementType>('entrada');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('Entrada de Mercadoria / NF');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setProducts(db.getProducts(store.id));
    setMovements(db.getStockMovements(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleOpenMovementModal = (type: StockMovementType = 'entrada', prodId?: string) => {
    setMovementType(type);
    setSelectedProductId(prodId || products[0]?.id || '');
    setQuantity('10');
    if (type === 'entrada') setReason('Compra / Nota Fiscal Fornecedor');
    else if (type === 'ajuste') setReason('Ajuste de Balanço de Estoque');
    else if (type === 'perda') setReason('Item quebrado / Avaria no mostruário');
    else if (type === 'devolucao') setReason('Devolução de Cliente');
    else setReason('Saída Manual');
    setNotes('');
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      error('Selecione o produto', 'Informe o produto para movimentar.');
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      error('Quantidade inválida', 'Informe uma quantidade maior que zero.');
      return;
    }

    try {
      db.recordStockMovement({
        store_id: store.id,
        product_id: selectedProductId,
        user_id: user?.id || 'admin',
        user_name: user?.full_name || 'Operador',
        type: movementType,
        quantity: qty,
        reason: reason,
        notes: notes,
      });

      success('Movimentação registrada com sucesso!');
      setIsMovementModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao movimentar estoque', err.message);
    }
  };

  // Produtos com estoque baixo
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.current_stock <= p.min_stock);
  }, [products]);

  // Movimentações filtradas por busca
  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) return movements;
    const q = searchQuery.toLowerCase().trim();
    return movements.filter(
      (m) =>
        m.product_name.toLowerCase().includes(q) ||
        m.product_sku.toLowerCase().includes(q) ||
        m.reason.toLowerCase().includes(q) ||
        m.user_name.toLowerCase().includes(q)
    );
  }, [movements, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Controle de Estoque & Inventário
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Auditoria completa de entradas, saídas, quebras, devoluções e alertas de reposição.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            leftIcon={<ArrowDownLeft className="w-4 h-4 text-rose-600" />}
            onClick={() => handleOpenMovementModal('perda')}
            size="sm"
          >
            Registrar Perda/Avaria
          </Button>
          <Button
            variant="primary"
            leftIcon={<PlusCircle className="w-5 h-5" />}
            onClick={() => handleOpenMovementModal('entrada')}
            className="shadow-emerald-600/30"
          >
            Nova Entrada de Mercadoria
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setTab('movements')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            tab === 'movements'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Histórico de Movimentações ({movements.length})
        </button>
        <button
          onClick={() => setTab('lowStock')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            tab === 'lowStock'
              ? 'border-amber-500 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Produtos com Estoque Baixo ({lowStockProducts.length})
        </button>
      </div>

      {/* TAB 1: MOVIMENTAÇÕES */}
      {tab === 'movements' && (
        <div className="space-y-4">
          <Card className="p-3">
            <Input
              placeholder="Buscar histórico por produto, SKU, responsável ou motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Data / Hora</th>
                    <th className="px-4 py-3.5">Produto</th>
                    <th className="px-4 py-3.5">Tipo</th>
                    <th className="px-4 py-3.5 text-center">Qtd Movimentada</th>
                    <th className="px-4 py-3.5 text-center">Estoque Resultante</th>
                    <th className="px-4 py-3.5">Motivo / Documento</th>
                    <th className="px-4 py-3.5">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500">
                        Nenhuma movimentação registrada.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((m) => {
                      let typeVariant: 'success' | 'danger' | 'warning' | 'info' | 'purple' = 'info';
                      let typeLabel = m.type.toUpperCase();

                      if (m.type === 'entrada') {
                        typeVariant = 'success';
                        typeLabel = '+ ENTRADA';
                      } else if (m.type === 'saida') {
                        typeVariant = 'danger';
                        typeLabel = '- SAÍDA';
                      } else if (m.type === 'perda') {
                        typeVariant = 'danger';
                        typeLabel = '⚠️ PERDA/AVARIA';
                      } else if (m.type === 'devolucao') {
                        typeVariant = 'purple';
                        typeLabel = '+ DEVOLUÇÃO';
                      } else if (m.type === 'ajuste' || m.type === 'inventario') {
                        typeVariant = 'warning';
                        typeLabel = '⚖️ AJUSTE/BALANÇO';
                      }

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">
                            {formatDateTime(m.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900 dark:text-white">{m.product_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {m.product_sku}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={typeVariant} size="sm">
                              {typeLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-white">
                            {m.type === 'saida' || m.type === 'perda' ? '-' : '+'}
                            {m.quantity}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {m.previous_stock} → <strong className="text-emerald-700 dark:text-emerald-400">{m.new_stock}</strong>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                            {m.reason}
                            {m.notes && <p className="text-[10px] text-slate-400 dark:text-slate-500">{m.notes}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{m.user_name}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PRODUTOS COM ESTOQUE BAIXO */}
      {tab === 'lowStock' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Lista de Compras & Reposição Sugerida</span>
            </div>
            <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              Critério: Estoque Atual ≤ Estoque Mínimo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Produto</th>
                  <th className="px-4 py-3.5">Fornecedor</th>
                  <th className="px-4 py-3.5 text-center">Estoque Atual</th>
                  <th className="px-4 py-3.5 text-center">Estoque Mínimo</th>
                  <th className="px-4 py-3.5 text-center">Estoque Máximo</th>
                  <th className="px-4 py-3.5 text-center">Sugestão de Compra</th>
                  <th className="px-4 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500">
                      🎉 Parabéns! Todos os produtos estão com níveis de estoque saudáveis.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p) => {
                    const suggestedBuy = Math.max(0, (p.max_stock || 50) - p.current_stock);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {p.supplier_name || 'Diversos'}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-rose-600">
                          {p.current_stock} {p.unit}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{p.min_stock}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{p.max_stock}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            + {suggestedBuy} {p.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenMovementModal('entrada', p.id)}
                          >
                            Dar Entrada
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal de Registro de Movimentação */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Registrar Movimentação de Estoque"
        subtitle="Entrada de compra, ajuste de balanço, perda ou devolução"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Selecione o Produto *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} (Atual: {p.current_stock} un)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipo de Movimentação *
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold"
              >
                <option value="entrada">➕ Entrada (Compra / NF)</option>
                <option value="saida">➖ Saída Manual</option>
                <option value="ajuste">⚖️ Ajuste de Balanço</option>
                <option value="perda">⚠️ Perda / Avaria</option>
                <option value="devolucao">🔄 Devolução de Cliente</option>
              </select>
            </div>

            <Input
              label="Quantidade *"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <Input
            label="Motivo / Justificativa *"
            placeholder="Ex: NF-e 12345 Fornecedor Sanremo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <Input
            label="Observações Adicionais"
            placeholder="Detalhes ou número do lote"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsMovementModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Confirmar Movimentação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
