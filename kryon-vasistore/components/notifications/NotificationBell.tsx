'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bell, BellRing, Package, CreditCard, 
  Wallet, CheckCheck, X, ChevronRight, AlertTriangle,
  Info, TrendingUp, Sparkles
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useCash } from '../../contexts/CashContext';
import { db } from '../../lib/db';
import { formatCurrency, formatDateTime } from '../../lib/formatters';

interface NotificationItem {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  description: string;
  time?: string;
  link: string;
  read: boolean;
}

export function NotificationBell() {
  const { store } = useStore();
  const { isOpen, cashBalance } = useCash();
  const [isOpenPanel, setIsOpenPanel] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Carrega IDs dispensados do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vasistore_dismissed_notifications');
        if (saved) {
          setDismissedIds(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  // Gera notificações em tempo real baseadas no estado da loja
  const notifications = useMemo(() => {
    if (typeof window === 'undefined') return [];

    const list: NotificationItem[] = [];

    try {
      // 1. Alertas de Estoque Baixo ou Zerado
      const products = db.getProducts(store.id);
      const outOfStock = products.filter((p) => p.current_stock <= 0);
      const lowStock = products.filter((p) => p.current_stock > 0 && p.current_stock <= p.min_stock);

      if (outOfStock.length > 0) {
        list.push({
          id: 'stock-out-' + outOfStock.length,
          type: 'danger',
          title: outOfStock.length + ' produto(s) sem estoque (zerados)',
          description: 'Ex: ' + outOfStock.slice(0, 2).map((p) => p.name).join(', ') + (outOfStock.length > 2 ? '...' : ''),
          link: '/estoque',
          read: dismissedIds.includes('stock-out-' + outOfStock.length),
        });
      }

      if (lowStock.length > 0) {
        list.push({
          id: 'stock-low-' + lowStock.length,
          type: 'warning',
          title: lowStock.length + ' produto(s) em estoque crítico',
          description: 'Reposição recomendada para manter as vendas do PDV ativas.',
          link: '/estoque',
          read: dismissedIds.includes('stock-low-' + lowStock.length),
        });
      }

      // 2. Alertas de Contas a Receber (Fiado)
      const receivables = db.getAccountsReceivable(store.id);
      const overdue = receivables.filter((r) => r.status === 'overdue');
      const pending = receivables.filter((r) => r.status === 'pending');

      if (overdue.length > 0) {
        const totalOverdue = overdue.reduce((sum, r) => sum + r.amount, 0);
        list.push({
          id: 'rec-overdue-' + overdue.length,
          type: 'danger',
          title: overdue.length + ' conta(s) a receber vencida(s)',
          description: 'Total de ' + formatCurrency(totalOverdue) + ' aguardando cobrança de clientes.',
          link: '/contas-receber',
          read: dismissedIds.includes('rec-overdue-' + overdue.length),
        });
      } else if (pending.length > 0) {
        const totalPending = pending.reduce((sum, r) => sum + r.amount, 0);
        list.push({
          id: 'rec-pending-' + pending.length,
          type: 'info',
          title: pending.length + ' conta(s) a receber em aberto',
          description: 'Total a receber previsto: ' + formatCurrency(totalPending) + '.',
          link: '/contas-receber',
          read: dismissedIds.includes('rec-pending-' + pending.length),
        });
      }

      // 3. Alerta de Caixa
      if (!isOpen) {
        list.push({
          id: 'cash-closed',
          type: 'warning',
          title: 'Caixa Fechado',
          description: 'Abra o turno no módulo de Caixa antes de iniciar as vendas no PDV.',
          link: '/caixa',
          read: dismissedIds.includes('cash-closed'),
        });
      } else {
        list.push({
          id: 'cash-open',
          type: 'success',
          title: 'Caixa Aberto & Operando',
          description: 'Saldo atual em caixa: ' + formatCurrency(cashBalance) + '.',
          link: '/caixa',
          read: dismissedIds.includes('cash-open'),
        });
      }

      // 4. Resumo de Vendas do Dia
      const todayStr = new Date().toISOString().split('T')[0];
      const sales = db.getSales(store.id).filter((s) => s.created_at.startsWith(todayStr) && s.status === 'completed');
      if (sales.length > 0) {
        const todayTotal = sales.reduce((acc, s) => acc + s.total, 0);
        list.push({
          id: 'sales-today-' + sales.length,
          type: 'info',
          title: sales.length + ' venda(s) realizada(s) hoje',
          description: 'Faturamento do dia: ' + formatCurrency(todayTotal) + '.',
          link: '/vendas',
          read: dismissedIds.includes('sales-today-' + sales.length),
        });
      }
    } catch {}

    return list;
  }, [store.id, isOpen, cashBalance, dismissedIds]);

  // Contagem de notificações não lidas
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const newDismissed = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(newDismissed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vasistore_dismissed_notifications', JSON.stringify(newDismissed));
    }
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newDismissed = Array.from(new Set([...dismissedIds, id]));
    setDismissedIds(newDismissed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vasistore_dismissed_notifications', JSON.stringify(newDismissed));
    }
  };

  return (
    <div className="relative">
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpenPanel(!isOpenPanel)}
        className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm group"
        title="Notificações e Alertas do Sistema"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
        ) : (
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform" />
        )}

        {/* Badge contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-rose-500 text-white font-black text-[10px] shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Painel Dropdown de Notificações */}
      {isOpenPanel && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpenPanel(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-40 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Cabeçalho do Painel */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Central de Notificações</h4>
                {unreadCount > 0 && (
                  <span className="bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} nova(s)
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar lidas
                </button>
              )}
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tudo em dia!</p>
                  <p className="text-[11px] mt-0.5">Nenhuma notificação ou alerta pendente no momento.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  return (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setIsOpenPanel(false)}
                      className={`block p-3.5 transition-colors group relative ${
                        n.read
                          ? 'opacity-70 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          : 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone de status */}
                        <div className="mt-0.5 flex-shrink-0">
                          {n.type === 'danger' && (
                            <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'warning' && (
                            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                              <Package className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'info' && (
                            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <TrendingUp className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'success' && (
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <Wallet className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                            {n.description}
                          </p>
                        </div>

                        {/* Ação rápida / Fechar */}
                        <button
                          onClick={(e) => dismissNotification(n.id, e)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                          title="Dispensar alerta"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Rodapé do Painel */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center">
              <Link
                href="/dashboard"
                onClick={() => setIsOpenPanel(false)}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold inline-flex items-center gap-1"
              >
                Ver visão geral no Dashboard <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
