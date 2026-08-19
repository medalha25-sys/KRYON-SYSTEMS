'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, ArrowDownRight, ArrowUpLeft, Lock, Unlock, 
  DollarSign, Check, AlertTriangle, FileText, History, 
  Calendar, User, PlusCircle, MinusCircle, RefreshCw
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useCash } from '../../../contexts/CashContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { CashRegister, CashMovement } from '../../../lib/db/types';
import { formatCurrency, formatDateTime } from '../../../lib/formatters';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export default function CashRegisterPage() {
  const { store } = useStore();
  const { user } = useAuth();
  const { openRegister, isOpen, cashBalance, movements, openCash, closeCash, addMovement, refreshCash } = useCash();
  const { success, error, warning } = useToast();

  const [historyRegisters, setHistoryRegisters] = useState<CashRegister[]>([]);
  const [tab, setTab] = useState<'current' | 'history'>('current');

  // Modais
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);

  // Form states
  const [initialFloat, setInitialFloat] = useState('150.00');
  const [openNotes, setOpenNotes] = useState('Troco inicial');

  const [closingCountedCash, setClosingCountedCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  const [movType, setMovType] = useState<'sangria' | 'suprimento'>('sangria');
  const [movAmount, setMovAmount] = useState('50.00');
  const [movDescription, setMovDescription] = useState('Sangria para depósito bancário');

  const loadHistory = () => {
    setHistoryRegisters(db.getCashRegisters(store.id));
  };

  useEffect(() => {
    loadHistory();
  }, [store.id, isOpen]);

  // Atalhos de Teclado Globais do Módulo de Caixa (Ctrl+A para Abrir Caixa, Ctrl+F para Fechar Caixa)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em campos de texto de modais abertos
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      const key = e.key.toLowerCase();

      // Ctrl + A: Abrir Caixa
      if (key === 'a') {
        e.preventDefault();
        if (!isOpen) {
          setShowOpenModal(true);
        } else {
          warning('Caixa já aberto', `O caixa atual já está aberto com saldo de ${formatCurrency(cashBalance)}.`);
        }
      }

      // Ctrl + F: Fechar Caixa
      if (key === 'f') {
        e.preventDefault();
        if (isOpen) {
          setClosingCountedCash(cashBalance.toFixed(2));
          setShowCloseModal(true);
        } else {
          warning('Caixa já fechado', 'O caixa já se encontra fechado no momento.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, cashBalance, warning]);

  const handleConfirmOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialFloat) || 0;
    try {
      openCash(val, openNotes);
      setShowOpenModal(false);
      success('Caixa aberto com sucesso!', `Fundo inicial: ${formatCurrency(val)}`);
      loadHistory();
    } catch (err: any) {
      error('Erro ao abrir caixa', err.message);
    }
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = parseFloat(closingCountedCash) || 0;
    try {
      const closed = closeCash(counted, closeNotes);
      setShowCloseModal(false);
      if (closed.difference && Math.abs(closed.difference) > 0.01) {
        warning(
          'Caixa fechado com diferença!',
          `Diferença apurada: ${formatCurrency(closed.difference)}`
        );
      } else {
        success('Caixa fechado perfeitamente!', 'Valores conferidos com sucesso.');
      }
      loadHistory();
    } catch (err: any) {
      error('Erro ao fechar caixa', err.message);
    }
  };

  const handleConfirmMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(movAmount) || 0;
    if (val <= 0) {
      error('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    try {
      addMovement(movType, val, 'dinheiro', movDescription);
      setShowMovementModal(false);
      success(
        movType === 'sangria' ? 'Sangria realizada com sucesso!' : 'Suprimento adicionado!',
        `Valor: ${formatCurrency(val)}`
      );
    } catch (err: any) {
      error('Erro ao registrar movimentação', err.message);
    }
  };

  // Totais por tipo de movimentação
  const summary = useMemo(() => {
    let salesTotal = 0;
    let sangriaTotal = 0;
    let suprimentoTotal = 0;
    let despesasTotal = 0;

    movements.forEach((m) => {
      if (m.type === 'venda') salesTotal += m.amount;
      else if (m.type === 'sangria') sangriaTotal += m.amount;
      else if (m.type === 'suprimento') suprimentoTotal += m.amount;
      else if (m.type === 'despesa') despesasTotal += m.amount;
    });

    return { salesTotal, sangriaTotal, suprimentoTotal, despesasTotal };
  }, [movements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Controle de Caixa & Frente de Loja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestão de fundo de troco, sangrias, reforços e fechamento cego com auditoria de quebra de caixa.
          </p>
        </div>

        <div className="flex gap-2">
          {isOpen ? (
            <>
              <Button
                variant="outline"
                leftIcon={<MinusCircle className="w-4 h-4 text-amber-600" />}
                onClick={() => {
                  setMovType('sangria');
                  setMovDescription('Sangria de caixa');
                  setShowMovementModal(true);
                }}
                size="sm"
              >
                Sangria
              </Button>
              <Button
                variant="outline"
                leftIcon={<PlusCircle className="w-4 h-4 text-emerald-600" />}
                onClick={() => {
                  setMovType('suprimento');
                  setMovDescription('Reforço de troco');
                  setShowMovementModal(true);
                }}
                size="sm"
              >
                Suprimento
              </Button>
              <Button
                variant="danger"
                leftIcon={<Lock className="w-4 h-4" />}
                onClick={() => {
                  setClosingCountedCash(cashBalance.toFixed(2));
                  setShowCloseModal(true);
                }}
                size="sm"
                title="Fechar Caixa (Atalho: Ctrl + F)"
              >
                <span>Fechar Caixa</span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-700/60 text-[10px] font-mono font-bold">
                  Ctrl + F
                </span>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              leftIcon={<Unlock className="w-5 h-5" />}
              onClick={() => setShowOpenModal(true)}
              className="shadow-emerald-600/30"
              title="Abrir Caixa Agora (Atalho: Ctrl + A)"
            >
              <span>Abrir Caixa Agora</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-700/60 text-emerald-100 text-[10px] font-mono font-bold">
                Ctrl + A
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setTab('current')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            tab === 'current'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" /> Caixa do Dia {isOpen && '(Aberto)'}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            tab === 'history'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Histórico de Sessões ({historyRegisters.length})
        </button>
      </div>

      {tab === 'current' && (
        <>
          {/* Caixa Status Card */}
          <div
            className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
              isOpen
                ? 'bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-emerald-500/30 shadow-emerald-950/30'
                : 'bg-gradient-to-r from-rose-950 to-slate-900 text-white border-rose-500/30 shadow-rose-950/30'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {isOpen ? 'Caixa Ativo & Operacional' : 'Caixa Fechado'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {openRegister
                  ? `Aberto por ${openRegister.user_name} em ${formatDateTime(openRegister.opened_at)}`
                  : 'Nenhum operador com caixa aberto no momento.'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 font-display">
                {isOpen ? formatCurrency(cashBalance) : 'R$ 0,00'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Saldo físico estimado em Dinheiro no gaveteiro</p>
            </div>

            {isOpen && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Fundo Inicial</p>
                  <p className="text-sm font-black text-white">{formatCurrency(openRegister?.initial_float)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Vendas Dinheiro</p>
                  <p className="text-sm font-black text-emerald-300">{formatCurrency(summary.salesTotal)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Sangrias</p>
                  <p className="text-sm font-black text-rose-300">- {formatCurrency(summary.sangriaTotal)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Suprimentos</p>
                  <p className="text-sm font-black text-blue-300">+ {formatCurrency(summary.suprimentoTotal)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Extrato de Movimentações */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Extrato de Movimentações do Caixa Atual</h3>
              <Badge variant="default" size="sm">
                {movements.length} lançamentos
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 dark:text-slate-500">
                        Nenhuma movimentação realizada nesta sessão de caixa.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                      const isPositive = m.type === 'venda' || m.type === 'suprimento' || m.type === 'recebimento';
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{formatDateTime(m.created_at)}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                m.type === 'venda'
                                  ? 'success'
                                  : m.type === 'sangria'
                                  ? 'danger'
                                  : m.type === 'suprimento'
                                  ? 'info'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {m.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{m.description}</td>
                          <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{m.payment_method}</td>
                          <td
                            className={`px-4 py-3 text-right font-black font-mono ${
                              isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : '-'} {formatCurrency(m.amount)}
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
        </>
      )}

      {tab === 'history' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Abertura</th>
                  <th className="px-4 py-3.5">Fechamento</th>
                  <th className="px-4 py-3.5">Operador</th>
                  <th className="px-4 py-3.5 text-right">Fundo Inicial</th>
                  <th className="px-4 py-3.5 text-right">Esperado</th>
                  <th className="px-4 py-3.5 text-right">Contado</th>
                  <th className="px-4 py-3.5 text-center">Diferença</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyRegisters.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{formatDateTime(reg.opened_at)}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {reg.closed_at ? formatDateTime(reg.closed_at) : 'Em aberto'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{reg.user_name}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(reg.initial_float)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
                      {reg.closing_cash_expected !== undefined ? formatCurrency(reg.closing_cash_expected) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {reg.closing_cash_counted !== undefined ? formatCurrency(reg.closing_cash_counted) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.difference !== undefined ? (
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md ${
                            Math.abs(reg.difference) < 0.01
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.difference < 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {formatCurrency(reg.difference)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={reg.status === 'open' ? 'success' : 'default'} size="sm">
                        {reg.status === 'open' ? 'Aberto' : 'Fechado'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: ABRIR CAIXA */}
      <Modal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        title="Abrir Sessão de Caixa"
        subtitle="Informe o valor inicial disponibilizado para troco"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmOpen} className="space-y-4">
          <Input
            label="Fundo de Troco Inicial (R$) *"
            type="number"
            step="0.01"
            min="0"
            value={initialFloat}
            onChange={(e) => setInitialFloat(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            required
            autoFocus
          />

          <Input
            label="Observações da Abertura"
            placeholder="Ex: Cédulas miúdas e moedas conferidas"
            value={openNotes}
            onChange={(e) => setOpenNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowOpenModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Unlock className="w-4 h-4" />}>
              Abrir Caixa
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: FECHAR CAIXA (CONFERÊNCIA CEGA) */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Fechamento de Caixa (Conferência Cega)"
        subtitle="Conte o dinheiro físico presente no gaveteiro e informe o valor apurado"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmClose} className="space-y-4">
          <Input
            label="Valor Total em Dinheiro Contado (R$) *"
            type="number"
            step="0.01"
            min="0"
            value={closingCountedCash}
            onChange={(e) => setClosingCountedCash(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            required
            autoFocus
          />

          <Input
            label="Observações do Fechamento"
            placeholder="Ex: Turno da manhã finalizado sem pendências"
            value={closeNotes}
            onChange={(e) => setCloseNotes(e.target.value)}
          />

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            ℹ️ O sistema calculará automaticamente eventuais sobras ou quebras de caixa com base em todas as vendas e sangrias do período.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCloseModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" size="sm" leftIcon={<Lock className="w-4 h-4" />}>
              Confirmar Fechamento
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: SANGRIA / SUPRIMENTO */}
      <Modal
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        title={movType === 'sangria' ? 'Registrar Sangria (Retirada)' : 'Registrar Suprimento (Reforço)'}
        subtitle="Movimentação direta no saldo físico do caixa"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmMovement} className="space-y-4">
          <Input
            label="Valor da Movimentação (R$) *"
            type="number"
            step="0.01"
            min="0.01"
            value={movAmount}
            onChange={(e) => setMovAmount(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            required
            autoFocus
          />

          <Input
            label="Motivo / Justificativa *"
            placeholder={movType === 'sangria' ? 'Ex: Depósito bancário / Pagamento de frete' : 'Ex: Troco adicional'}
            value={movDescription}
            onChange={(e) => setMovDescription(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowMovementModal(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={movType === 'sangria' ? 'danger' : 'primary'}
              size="sm"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirmar Lançamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
