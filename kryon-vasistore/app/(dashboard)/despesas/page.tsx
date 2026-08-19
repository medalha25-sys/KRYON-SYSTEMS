'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowDownCircle, Plus, Search, DollarSign, Calendar, 
  Check, Trash2, CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Expense, ExpenseCategory } from '../../../lib/db/types';
import { formatCurrency, formatDate } from '../../../lib/formatters';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export default function ExpensesPage() {
  const { store } = useStore();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('aluguel');
  const [amount, setAmount] = useState('250.00');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setExpenses(db.getExpenses(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    if (!description || val <= 0) {
      error('Preencha os campos', 'Informe a descrição e o valor da despesa.');
      return;
    }

    try {
      db.addExpense({
        store_id: store.id,
        description,
        category,
        amount: val,
        due_date: dueDate,
        payment_method: paymentMethod,
        status: 'pending',
        notes,
      });

      success('Despesa cadastrada com sucesso!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao cadastrar despesa', err.message);
    }
  };

  const handlePayExpense = (exp: Expense) => {
    try {
      db.payExpense(
        exp.id,
        exp.payment_method || 'pix',
        user?.id || 'admin',
        user?.full_name || 'Operador'
      );
      success('Despesa marcada como paga!');
      loadData();
    } catch (err: any) {
      error('Erro ao pagar despesa', err.message);
    }
  };

  const handleDelete = (exp: Expense) => {
    if (confirm(`Deseja excluir a despesa "${exp.description}"?`)) {
      db.deleteExpense(exp.id);
      success('Despesa excluída!');
      loadData();
    }
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [expenses, categoryFilter, searchQuery]);

  const totalPending = expenses
    .filter((e) => e.status === 'pending')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalPaid = expenses
    .filter((e) => e.status === 'paid')
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Controle de Despesas & Custos Fixos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestão de contas a pagar: energia, aluguel, compras de mercadoria, água e manutenções.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => {
            setDescription('');
            setAmount('150.00');
            setIsModalOpen(true);
          }}
          className="shadow-emerald-600/30"
        >
          Nova Despesa
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-amber-50 dark:bg-amber-950/60 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-sm">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Despesas a Pagar (Pendentes)</p>
          <h3 className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-1 font-display">
            {formatCurrency(totalPending)}
          </h3>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Despesas Pagas (Liquidadas)</p>
          <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1 font-display">
            {formatCurrency(totalPaid)}
          </h3>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Buscar por descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all" className="bg-white dark:bg-slate-900">Todas as Categorias ({expenses.length})</option>
            <option value="aluguel" className="bg-white dark:bg-slate-900">Aluguel</option>
            <option value="energia" className="bg-white dark:bg-slate-900">Energia Elétrica</option>
            <option value="agua" className="bg-white dark:bg-slate-900">Água</option>
            <option value="internet" className="bg-white dark:bg-slate-900">Internet</option>
            <option value="salarios" className="bg-white dark:bg-slate-900">Salários / Pró-labore</option>
            <option value="compras" className="bg-white dark:bg-slate-900">Compras de Mercadoria</option>
            <option value="manutencao" className="bg-white dark:bg-slate-900">Manutenção</option>
            <option value="outros" className="bg-white dark:bg-slate-900">Outros</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Descrição</th>
                <th className="px-4 py-3.5">Categoria</th>
                <th className="px-4 py-3.5">Vencimento</th>
                <th className="px-4 py-3.5">Pagamento</th>
                <th className="px-4 py-3.5 text-right">Valor</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    Nenhuma despesa cadastrada.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{exp.description}</p>
                      {exp.notes && <p className="text-[10px] text-slate-400 dark:text-slate-500">{exp.notes}</p>}
                    </td>
                    <td className="px-4 py-3 uppercase font-semibold text-slate-600 dark:text-slate-300">
                      {exp.category}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{formatDate(exp.due_date)}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                      {exp.payment_date ? formatDate(exp.payment_date) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-black font-mono text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={exp.status === 'paid' ? 'success' : 'warning'} size="sm">
                        {exp.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {exp.status !== 'paid' && (
                          <Button size="sm" variant="primary" onClick={() => handlePayExpense(exp)}>
                            Pagar
                          </Button>
                        )}
                        <button
                          onClick={() => handleDelete(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Excluir Despesa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: NOVA DESPESA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Nova Despesa"
        subtitle="Contas fixas, compras e despesas operacionais"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Descrição da Conta / Despesa *"
            placeholder="Ex: Conta de Energia Elétrica (Enel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold"
              >
                <option value="aluguel">Aluguel do Ponto</option>
                <option value="energia">Energia Elétrica</option>
                <option value="agua">Água & Esgoto</option>
                <option value="internet">Internet & Telefone</option>
                <option value="salarios">Salários / Pró-labore</option>
                <option value="compras">Compra de Mercadorias</option>
                <option value="transporte">Transporte & Frete</option>
                <option value="manutencao">Manutenção & Reparos</option>
                <option value="impostos">Impostos & Taxas</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <Input
              label="Valor (R$) *"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Vencimento *"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro (Saída do Caixa)</option>
                <option value="debito">Cartão de Débito</option>
                <option value="boleto">Boleto Bancário</option>
              </select>
            </div>
          </div>

          <Input
            label="Observações"
            placeholder="Ex: Nota fiscal nº 456 ou código de barras"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Cadastrar Despesa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
