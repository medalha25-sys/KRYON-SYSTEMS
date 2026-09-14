'use client'

import React, { Suspense, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { PeriodFilter } from '../types'

interface KryonAdminHeaderProps {
  title?: string
  subtitle?: string
  currentPeriod?: PeriodFilter
}

const periods: { id: PeriodFilter; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7dias', label: '7 dias' },
  { id: 'este-mes', label: 'Este mês' },
  { id: '30dias', label: 'Últimos 30 dias' },
  { id: 'este-ano', label: 'Este ano' },
]

function PeriodSelector({ currentPeriod }: { currentPeriod?: PeriodFilter }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activePeriod: PeriodFilter =
    currentPeriod || (searchParams?.get('periodo') as PeriodFilter) || 'este-mes'

  const handlePeriodChange = (periodId: PeriodFilter) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      params.set('periodo', periodId)
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0E131F] border border-white/[0.08] shadow-inner overflow-x-auto max-w-full">
      {periods.map((period) => {
        const isSelected = activePeriod === period.id
        return (
          <button
            key={period.id}
            onClick={() => handlePeriodChange(period.id)}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {period.label}
          </button>
        )
      })}
    </div>
  )
}

export function KryonAdminHeader({
  title = 'Visão Geral',
  subtitle = 'Acompanhe a saúde, o crescimento e os resultados da Kryon Systems.',
  currentPeriod
}: KryonAdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/[0.08]">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Dados em Tempo Real
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* Period Selector com Suspense boundary para Next.js App Router */}
      <Suspense
        fallback={
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0E131F] border border-white/[0.08] h-9 w-64 animate-pulse"></div>
        }
      >
        <PeriodSelector currentPeriod={currentPeriod} />
      </Suspense>
    </div>
  )
}
