'use client'

import React from 'react'
import { TrendingUp, BarChart3, Users, DollarSign, Percent } from 'lucide-react'
import { mockGrowthData } from '../mock-data'

export function GrowthChart() {
  const maxRevenue = Math.max(...mockGrowthData.map(d => d.receita))

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] relative overflow-hidden shadow-xl shadow-black/40 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">Evolução e Crescimento</h2>
            <p className="text-xs text-slate-400">Tração histórica nos últimos 6 meses (Receita, Empresas e Comissões).</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Receita</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Empresas</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Comissões</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2 border-b border-white/[0.05]">
        {mockGrowthData.map((d) => {
          const heightPercent = Math.round((d.receita / maxRevenue) * 100)

          return (
            <div key={d.month} className="flex flex-col items-center gap-2 h-full justify-end group">
              {/* Tooltip on hover */}
              <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/10 px-2 py-1 rounded-lg text-[10px] text-white shadow-xl pointer-events-none mb-1">
                <p className="font-bold text-blue-400">R$ {(d.receita / 1000).toFixed(1)}k</p>
                <p className="text-purple-300">{d.empresas} empresas</p>
              </div>

              {/* Bar Stack */}
              <div className="w-full max-w-[48px] bg-slate-800/40 rounded-2xl p-1 flex flex-col justify-end gap-1 h-full border border-white/[0.04]">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-xl transition-all duration-500 group-hover:from-blue-500 group-hover:to-indigo-400 shadow-md shadow-blue-900/30"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Month Label */}
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">
                {d.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Highlights summary footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <DollarSign size={14} className="text-blue-400" />
            <span>Crescimento de Receita</span>
          </div>
          <span className="text-xs font-black text-emerald-400">+98.9% no semestre</span>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users size={14} className="text-purple-400" />
            <span>Expansão de Clientes</span>
          </div>
          <span className="text-xs font-black text-purple-300">12 → 24 Empresas</span>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Percent size={14} className="text-emerald-400" />
            <span>Comissões Operacionais</span>
          </div>
          <span className="text-xs font-black text-white">R$ 7.450,00</span>
        </div>
      </div>
    </section>
  )
}
