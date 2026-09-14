'use client'

import React from 'react'
import { PieChart } from 'lucide-react'
import { ProductRevenueItem, mockProductRevenue } from '../mock-data'

interface ProductRevenueChartProps {
  items?: ProductRevenueItem[]
  isLoading?: boolean
}

export function ProductRevenueChart({
  items = mockProductRevenue,
  isLoading = false
}: ProductRevenueChartProps) {
  const totalRevenue = items.reduce((acc, p) => acc + p.revenue, 0)

  if (isLoading) {
    return (
      <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded"></div>
        <div className="h-4 w-full bg-white/5 rounded-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl"></div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] relative overflow-hidden shadow-xl shadow-black/40 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <PieChart size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">Receita por Produto</h2>
            <p className="text-xs text-slate-400">Participação de cada produto do ecossistema no faturamento.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400">Faturamento Total</span>
          <p className="text-lg font-black text-white">
            {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* Multi-segment distribution bar */}
      <div className="space-y-2">
        <div className="w-full h-4 rounded-full bg-slate-800/80 overflow-hidden flex gap-1 p-0.5 border border-white/[0.05]">
          {totalRevenue > 0 ? (
            items.map((item) => {
              const pct = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : item.percentage
              if (pct <= 0) return null
              return (
                <div
                  key={item.slug}
                  title={`${item.name}: ${pct.toFixed(1)}%`}
                  className="h-full rounded-full transition-all duration-500 hover:opacity-90"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color
                  }}
                />
              )
            })
          ) : (
            <div className="h-full w-full bg-slate-800/50 rounded-full"></div>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>0%</span>
          <span>{totalRevenue > 0 ? '100% da Receita Gerada' : 'Aguardando faturamento'}</span>
        </div>
      </div>

      {/* Product breakdown grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const itemPct = totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : item.percentage

          return (
            <div
              key={item.slug}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">{itemPct}% do total</p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-2">
                <p className="text-xs font-extrabold text-slate-200">
                  {item.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
