'use client'

import React from 'react'
import {
  Car,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  DollarSign,
  Percent,
  Building2,
  Sparkles
} from 'lucide-react'
import { LavaRapidoStats } from '../types'

interface LavaRapidoExecutiveCardsProps {
  stats: LavaRapidoStats
  selectedPeriodLabel?: string
  isLoading?: boolean
}

export function LavaRapidoExecutiveCards({
  stats,
  selectedPeriodLabel = 'Este mês',
  isLoading = false
}: LavaRapidoExecutiveCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-3xl bg-[#0B0F19] border border-white/[0.08] animate-pulse h-32"></div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      id: 'comissao-gerada',
      title: 'Comissão Kryon Gerada',
      value: stats.kryonCommissionGenerated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      subtext: `${stats.completedOrdersInPeriod} lavagens × R$ 2,00 (${selectedPeriodLabel})`,
      badge: 'Regra R$ 2,00',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: Sparkles,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      highlight: true
    },
    {
      id: 'lavagens-concluidas',
      title: 'Lavagens Concluídas',
      value: `${stats.completedOrdersInPeriod.toLocaleString('pt-BR')} ordens`,
      subtext: `Total acumulado: ${stats.lifetimeCompletedOrders} lavagens finalizadas`,
      badge: 'Faturável',
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      icon: CheckCircle2,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'receita-gmv',
      title: 'Receita Bruta Movimentada',
      value: stats.totalGmvInPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      subtext: `Volume financeiro total das ordens concluídas (${selectedPeriodLabel})`,
      badge: 'GMV Lojas',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      icon: DollarSign,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      id: 'empresas-lava-rapido',
      title: 'Estabelecimentos Ativos',
      value: `${stats.totalCompanies} lojas`,
      subtext: 'Estabelecimentos parceiros cadastrados na base',
      badge: 'Multi-Tenant',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      icon: Building2,
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'em-lavagem',
      title: 'Em Lavagem (No Box)',
      value: `${stats.inProgressOrdersInPeriod} ordens`,
      subtext: 'Serviços sendo executados no momento',
      badge: 'Operação',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      icon: Car,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'fila-pendente',
      title: 'Na Fila / Pendentes',
      value: `${stats.pendingOrdersInPeriod} ordens`,
      subtext: 'Aguardando início do atendimento',
      badge: 'Fila',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: Clock,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'canceladas',
      title: 'Lavagens Canceladas',
      value: `${stats.canceledOrdersInPeriod} ordens`,
      subtext: 'Ordens canceladas geram R$ 0,00 de comissão',
      badge: 'Zero Comissão',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: XCircle,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'total-ordens-periodo',
      title: 'Total de Ordens Registradas',
      value: `${stats.totalOrdersInPeriod} ordens`,
      subtext: `Volume total de transações em ${selectedPeriodLabel.toLowerCase()}`,
      badge: 'Volume',
      badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
      icon: Percent,
      iconColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  ]

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Indicadores Executivos do Lava Rápido ({selectedPeriodLabel})
        </h2>
        <span className="text-[11px] text-slate-400">Dados auditados no servidor</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.id}
              className={`p-5 rounded-3xl bg-[#0B0F19] border transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col justify-between ${
                c.highlight
                  ? 'border-emerald-500/40 bg-gradient-to-br from-[#0B0F19] via-[#0A1616] to-[#0A0F1D] shadow-emerald-950/20'
                  : 'border-white/[0.08] hover:border-blue-500/30 shadow-black/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${c.iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-medium">{c.title}</p>
                <p className={`text-xl sm:text-2xl font-black tracking-tight mt-1 ${c.highlight ? 'text-emerald-400' : 'text-white'}`}>
                  {c.value}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.04]">
                <p className="text-[11px] text-slate-500 leading-tight">{c.subtext}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
