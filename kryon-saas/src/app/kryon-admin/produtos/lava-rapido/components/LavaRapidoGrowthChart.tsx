'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { LavaRapidoGrowthPoint } from '../types'

interface LavaRapidoGrowthChartProps {
  data?: LavaRapidoGrowthPoint[]
  isLoading?: boolean
}

export function LavaRapidoGrowthChart({
  data = [],
  isLoading = false
}: LavaRapidoGrowthChartProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] animate-pulse h-72"></div>
    )
  }

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl shadow-black/40 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Evolução Temporal do Lava Rápido
            </h2>
            <p className="text-xs text-slate-400">
              Histórico de lavagens e comissões geradas no ecossistema Kryon.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span className="text-slate-300 font-medium">Lavagens Concluídas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-300 font-medium">Comissão Kryon (R$)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
            />
            <Bar dataKey="concluidas" name="Lavagens Concluídas" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="comissao" name="Comissão Kryon (R$)" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
