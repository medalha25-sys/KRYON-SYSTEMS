'use client'

import React, { useState } from 'react'
import { FileText, ArrowDownRight, ArrowUpRight, Calendar, Clock, CheckCircle2 } from 'lucide-react'
import { ObligationItem, mockObligations } from '../mock-data'

interface ObligationsSectionProps {
  obligations?: {
    contasPagar: number
    contasReceber: number
    despesasPrevistas: number
    proximosVencimentos: ObligationItem[]
  }
  isLoading?: boolean
}

export function ObligationsSection({
  obligations = mockObligations,
  isLoading = false
}: ObligationsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'payable' | 'receivable'>('all')

  if (isLoading) {
    return (
      <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded"></div>
        <div className="h-20 w-full bg-white/5 rounded-2xl"></div>
      </section>
    )
  }

  const items = obligations.proximosVencimentos.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] relative overflow-hidden shadow-xl shadow-black/40 space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">Contas e Obrigações</h2>
            <p className="text-xs text-slate-400">Previsão financeira de entradas, saídas e compromissos fiscais.</p>
          </div>
        </div>

        {/* Mini Summary Strip */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
            <ArrowDownRight size={14} />
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-400/80">Contas a Pagar</p>
              <p className="text-xs font-black">
                {obligations.contasPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
            <ArrowUpRight size={14} />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-400/80">Contas a Receber</p>
              <p className="text-xs font-black">
                {obligations.contasReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center gap-2">
            <Clock size={14} className="text-blue-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Despesas Previstas</p>
              <p className="text-xs font-black">
                {obligations.despesasPrevistas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-2">Próximos Vencimentos:</span>
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('payable')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'payable' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            A Pagar
          </button>
          <button
            onClick={() => setFilter('receivable')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'receivable' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            A Receber
          </button>
        </div>
      </div>

      {/* Upcoming List or Empty State */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => {
            const isReceivable = item.type === 'receivable'
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isReceivable
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isReceivable ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        Vencimento: {item.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                  <span
                    className={`text-xs font-black ${
                      isReceivable ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {isReceivable ? '+' : '-'}{' '}
                    {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center space-y-2">
          <CheckCircle2 size={28} className="mx-auto text-emerald-400/80" />
          <p className="text-xs font-bold text-slate-300">Nenhuma obrigação pendente no período</p>
          <p className="text-[11px] text-slate-500">Todas as contas e recebíveis estão em dia ou não há lançamentos futuros programados.</p>
        </div>
      )}
    </section>
  )
}
