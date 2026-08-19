'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, Search, DollarSign, Calendar, MessageCircle, 
  Check, AlertTriangle, User, Filter, ArrowUpRight 
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { AccountReceivable, Customer } from '../../../lib/db/types';
import { formatCurrency, formatDate, getWhatsAppLink } from '../../../lib/formatters';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export default function AccountsReceivablePage() {
  const { store } = useStore();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  // Modal de Baixa / Pagamento
  const [selectedReceivable, setSelectedReceivable] = useState<AccountReceivable | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');

  // Modal de Novo Fiado Manual
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [newDescription, setNewDescription] = useState('Compra a prazo / Fiado');

  const loadData = () => {
    setReceivables(db.getAccountsReceivable(store.id));
    setCustomers(db.getCustomers(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleOpenPayment = (item: AccountReceivable) => {
    setSelectedReceivable(item);
    const remaining = item.amount - item.amount_paid;
    setPayAmount(remaining.toFixed(2));
    setPaymentMethod('dinheiro');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;
    const val = parseFloat(payAmount) || 0;
    if (val <= 0) {
      error('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    try {
      db.payAccountReceivable({
        id: selectedReceivable.id,
        amount: val,
        payment_method: paymentMethod,
        userId: user?.id || 'admin',
        userName: user?.full_name || 'Operador',
      });

      success('Pagamento registrado com sucesso!', `Valor recebido: ${formatCurrency(val)}`);
      setSelectedReceivable(null);
      loadData();
    } catch (err: any) {
      error('Erro ao registrar pagamento', err.message);
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustomerId);
    if (!cust) {
      error('Selecione um cliente', 'Escolha o cliente para vincular a conta.');
      return;
    }
    const val = parseFloat(newAmount) || 0;
    if (val <= 0) {
      error('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    try {
      db.addAccountReceivable({
        store_id: store.id,
        customer_id: cust.id,
        customer_name: cust.name,
        customer_phone: cust.whatsapp || cust.phone,
        description: newDescription,
        amount: val,
        due_date: newDueDate,
        status: 'pending',
        installment_number: 1,
        total_installments: 1,
      });

      success('Conta a receber criada com sucesso!');
      setIsNewModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao criar conta', err.message);
    }
  };

  const filtered = useMemo(() => {
    return receivables.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          r.customer_name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.sale_number && r.sale_number.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [receivables, statusFilter, searchQuery]);

  const summary = useMemo(() => {
    const totalPending = receivables
      .filter((r) => r.status === 'pending')
      .reduce((acc, r) => acc + (r.amount - r.amount_paid), 0);
    const totalOverdue = receivables
      .filter((r) => r.status === 'overdue')
      .reduce((acc, r) => acc + (r.amount - r.amount_paid), 0);
    const totalPaid = receivables
      .filter((r) => r.status === 'paid')
      .reduce((acc, r) => acc + r.amount_paid, 0);

    return { totalPending, totalOverdue, totalPaid };
  }, [receivables]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Contas a Receber (Fiado / Crediário)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Controle de vendas a prazo, vencimentos, liquidações e lembretes de cobrança no WhatsApp.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<CreditCard className="w-5 h-5" />}
          onClick={() => {
            setNewCustomerId(customers[0]?.id || '');
            setNewAmount('100.00');
            setIsNewModalOpen(true);
          }}
          className="shadow-emerald-600/30"
        >
          Novo Lançamento a Prazo
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">A Vencer (Pendente)</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-display">
            {formatCurrency(summary.totalPending)}
          </h3>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/60 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-sm">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase">Vencidas (Inadimplência)</p>
          <h3 className="text-2xl font-black text-rose-950 dark:text-rose-200 mt-1 font-display">
            {formatCurrency(summary.totalOverdue)}
          </h3>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Total Já Recebido</p>
          <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1 font-display">
            {formatCurrency(summary.totalPaid)}
          </h3>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Buscar por cliente ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all" className="bg-white dark:bg-slate-900">Todos os Status ({receivables.length})</option>
            <option value="pending" className="bg-white dark:bg-slate-900">⏳ Apenas Pendentes</option>
            <option value="overdue" className="bg-white dark:bg-slate-900">🚨 Apenas Vencidas</option>
            <option value="paid" className="bg-white dark:bg-slate-900">✅ Apenas Pagas</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Descrição</th>
                <th className="px-4 py-3.5">Vencimento</th>
                <th className="px-4 py-3.5 text-right">Valor Total</th>
                <th className="px-4 py-3.5 text-right">Saldo Restante</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    Nenhuma conta encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const remaining = item.amount - item.amount_paid;
                  const isOverdue = item.status === 'overdue';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-white">{item.customer_name}</p>
                        {item.customer_phone && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.customer_phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                        {item.description}
                        {item.sale_number && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                            Cupom: {item.sale_number}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {formatDate(item.due_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-black font-mono text-slate-900 dark:text-white">
                        {formatCurrency(remaining)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            item.status === 'paid'
                              ? 'success'
                              : item.status === 'overdue'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {item.status === 'paid'
                            ? 'PAGO'
                            : item.status === 'overdue'
                            ? 'VENCIDO'
                            : 'PENDENTE'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.customer_phone && item.status !== 'paid' && (
                            <a
                              href={getWhatsAppLink(
                                item.customer_phone,
                                `Olá ${item.customer_name}, tudo bem? Aqui é da ${store.name}. Consta um débito no valor de ${formatCurrency(remaining)} referente a "${item.description}" com vencimento em ${formatDate(item.due_date)}. Podemos ajudar com a chave PIX? Obrigado!`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                              title="Enviar Lembrete no WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {item.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenPayment(item)}
                            >
                              Dar Baixa
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: REGISTRAR PAGAMENTO / BAIXA */}
      <Modal
        isOpen={!!selectedReceivable}
        onClose={() => setSelectedReceivable(null)}
        title="Dar Baixa em Conta a Receber"
        subtitle={`Cliente: ${selectedReceivable?.customer_name} • Total da Conta: ${formatCurrency(selectedReceivable?.amount)}`}
        maxWidth="sm"
      >
        {selectedReceivable && (() => {
          const currentDebt = selectedReceivable.amount - selectedReceivable.amount_paid;
          const payAmountNum = parseFloat(payAmount.replace(',', '.')) || 0;
          const remainingDebt = Math.max(0, currentDebt - payAmountNum);

          return (
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* Resumo da Dívida e Restante */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Dívida Atual em Aberto:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(currentDebt)}</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Valor a Pagar Agora:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(payAmountNum)}</strong>
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Saldo Restante a Pagar:</span>
                  <span className={`text-base font-black ${
                    remainingDebt > 0 
                      ? 'text-rose-600 dark:text-rose-400 font-mono' 
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {remainingDebt > 0 ? formatCurrency(remainingDebt) : 'Quitado 100%'}
                  </span>
                </div>
              </div>

              <Input
                label="Valor do Recebimento (R$) *"
                type="number"
                step="0.01"
                min="0.01"
                max={currentDebt}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                required
                autoFocus
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="dinheiro">Dinheiro (Entra no Caixa)</option>
                  <option value="pix">PIX</option>
                  <option value="debito">Cartão de Débito</option>
                  <option value="credito">Cartão de Crédito</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReceivable(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
                  Confirmar Recebimento
                </Button>
              </div>
            </form>
          );
        })()}
      </Modal>

      {/* MODAL 2: NOVO LANÇAMENTO MANUAL */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo Lançamento de Fiado / Venda a Prazo"
        subtitle="Vincule uma pendência financeira ao cliente"
        maxWidth="md"
      >
        <form onSubmit={handleCreateManual} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cliente *
            </label>
            <select
              value={newCustomerId}
              onChange={(e) => setNewCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone || c.whatsapp || 'Sem telefone'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor da Conta (R$) *"
              type="number"
              step="0.01"
              min="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              required
            />
            <Input
              label="Data de Vencimento *"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Descrição do Débito *"
            placeholder="Ex: Compra de potes e faqueiro inox a prazo"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Criar Conta a Receber
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
