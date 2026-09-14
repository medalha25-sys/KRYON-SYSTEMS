'use client'

import React from 'react'
import { Activity, Car, Calendar, PawPrint, Smartphone, ArrowUpRight } from 'lucide-react'
import { mockProductActivities } from '../mock-data'

const productIcons: Record<string, React.ElementType> = {
  'Kryon Lava Rápido': Car,
  'Kryon Agenda': Calendar,
  'Kryon Pet': PawPrint,
  'Kryon Celular': Smartphone,
}

export function ProductActivityCards() {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Atividade Operacional dos Produtos
        </h2>
        <span className="text-[11px] text-slate-400">Desempenho por vertical</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {mockProductActivities.map((product) => {
          const Icon = productIcons[product.productName] || Activity

          return (
            <div
              key={product.productName}
              className="p-5 rounded-3xl bg-[#0B0F19] border border-white/[0.08] hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/20 group relative flex flex-col justify-between"
            >
              <div>
                {/* Header with Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <Icon size={18} className={product.iconColor} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white truncate max-w-[120px]">
                        {product.productName}
                      </h3>
                      <span className="text-[10px] text-purple-400/90 font-medium">Módulo Ativo</span>
                    </div>
                  </div>

                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300">
                    {product.badge}
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-3 py-2 border-y border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{product.metric1Label}</span>
                    <span className="text-sm font-extrabold text-white">{product.metric1Value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{product.metric2Label}</span>
                    <span className="text-sm font-extrabold text-emerald-400">{product.metric2Value}</span>
                  </div>
                </div>
              </div>

              {/* Trend Footer */}
              <div className="pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span className="text-emerald-400 font-semibold">{product.trend}</span>
                <ArrowUpRight size={13} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
