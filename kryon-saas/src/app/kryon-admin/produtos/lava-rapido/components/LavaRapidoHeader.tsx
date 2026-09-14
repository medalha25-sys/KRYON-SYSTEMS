'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Car,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Percent,
  Layers
} from 'lucide-react'
import { LavaRapidoPeriodFilter } from '../types'

interface LavaRapidoHeaderProps {
  currentPeriod?: LavaRapidoPeriodFilter
}

const periods: { id: LavaRapidoPeriodFilter; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7dias', label: '7 dias' },
  { id: 'este-mes', label: 'Este mês' },
  { id: '30dias', label: '30 dias' },
  { id: 'este-ano', label: 'Este ano' },
]

export function LavaRapidoHeader({
  currentPeriod = 'este-mes'
}: LavaRapidoHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (periodId: LavaRapidoPeriodFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodo', periodId)
    router.push(`/kryon-admin/produtos/lava-rapido?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/kryon-admin" className="hover:text-blue-400 transition-colors flex items-center gap-1">
          <ShieldCheck size={13} className="text-blue-500" />
          <span>Kryon Admin</span>
        </Link>
        <ChevronRight size={12} className="text-slate-600" />
        <Link href="/kryon-admin/produtos" className="hover:text-blue-400 transition-colors flex items-center gap-1">
          <Layers size={13} className="text-purple-400" />
          <span>Produtos</span>
        </Link>
        <ChevronRight size={12} className="text-slate-600" />
        <span className="text-blue-300 font-semibold flex items-center gap-1">
          <Car size={13} className="text-blue-400" />
          <span>Kryon Lava Rápido</span>
        </span>
      </nav>

      {/* Main Header Box */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-3xl bg-gradient-to-r from-[#0C1222] via-[#0E152B] to-[#0A0E1A] border border-blue-500/20 shadow-xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-2 ring-white/10 shrink-0">
            <Car size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Kryon Lava Rápido
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Percent size={11} />
                Modelo: Por Uso (R$ 2,00 / lavagem)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                Operação Ativa
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Central de Gestão Comercial, Acompanhamento Operacional de Lavagens e Controle de Comissões.
            </p>
          </div>
        </div>

        {/* Period Selector Filter */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-black/40 p-1.5 rounded-2xl border border-white/[0.08]">
          <Calendar size={14} className="text-blue-400 ml-2 shrink-0" />
          <div className="flex gap-1">
            {periods.map((p) => {
              const active = currentPeriod === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handlePeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
