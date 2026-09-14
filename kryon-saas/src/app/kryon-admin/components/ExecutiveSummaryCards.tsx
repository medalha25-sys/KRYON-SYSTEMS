'use client'

import React from 'react'
import {
  DollarSign,
  Repeat,
  Percent,
  TrendingDown,
  TrendingUp,
  Building2,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { ExecutiveMetric } from '../types'

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  Repeat,
  Percent,
  TrendingDown,
  TrendingUp,
  Building2,
  Layers,
  Sparkles
}

interface ExecutiveSummaryCardsProps {
  metrics?: ExecutiveMetric[]
  selectedPeriodLabel?: string
  isLoading?: boolean
}

export function ExecutiveSummaryCards({
  metrics = [],
  selectedPeriodLabel = 'Este mês',
  isLoading = false
}: ExecutiveSummaryCardsProps) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Resumo Executivo
        </h2>
        <span className="text-[11px] text-slate-400">
          Período ativo: <strong className="text-blue-400">{selectedPeriodLabel}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08] animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-white/10 rounded"></div>
                <div className="w-8 h-8 rounded-xl bg-white/5"></div>
              </div>
              <div className="h-7 w-32 bg-white/10 rounded"></div>
              <div className="h-3 w-20 bg-white/5 rounded"></div>
            </div>
          ))
        ) : (
          metrics.map((item) => {
            const Icon = iconMap[item.iconName] || DollarSign

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08] hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/20 group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Subtle top glow line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 truncate pr-2">
                      {item.title}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/10 transition-colors shrink-0">
                      <Icon size={16} />
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {item.value}
                  </div>
                </div>

                {item.change && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    {item.isPositive ? (
                      <span className="text-emerald-400 flex items-center font-bold">
                        <ArrowUpRight size={13} className="shrink-0" />
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center">
                        <ArrowDownRight size={13} className="shrink-0" />
                      </span>
                    )}
                    <span className="truncate">{item.change}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
