'use client'

import React from 'react'
import { ShieldCheck, Target, Clock, Wallet, TrendingUp } from 'lucide-react'
import { FinancialHealthData, mockFinancialHealth } from '../mock-data'

interface FinancialHealthCardProps {
  data?: FinancialHealthData
  isLoading?: boolean
}

export function FinancialHealthCard({
  data = mockFinancialHealth,
  isLoading = false
}: FinancialHealthCardProps) {
  if (isLoading) {
    return (
      <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl"></div>
          ))}
        </div>
      </section>
    )
  }

  const isHealthy = data.healthStatus === 'saudavel'
  const isAttention = data.healthStatus === 'atencao'

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] relative overflow-hidden shadow-xl shadow-black/40">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header with Health Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">Saúde Financeira</h2>
            <p className="text-xs text-slate-400">Reserva de liquidez, metas de segurança e cobertura operacional.</p>
          </div>
        </div>

        {/* Status Badges Group */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
              isHealthy
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 opacity-60'
            }`}
          >
            {isHealthy && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
            {data.healthStatusLabel || 'Empresa saudável'}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
              isAttention
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold'
                : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 opacity-60'
            }`}
          >
            Atenção
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs opacity-60">
            Situação crítica
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-5">
        {/* Reserva de segurança */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <ShieldCheck size={14} className="text-blue-400" />
            <span>Reserva de segurança</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {data.securityReserve.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">Disponível em caixa líquido</p>
        </div>

        {/* Meta da reserva */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <Target size={14} className="text-purple-400" />
            <span>Meta da reserva</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-200">
            {data.reserveTarget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          {/* Progress Bar */}
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data.reserveProgressPercentage))}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right font-semibold">
              {data.reserveProgressPercentage}% atingida
            </p>
          </div>
        </div>

        {/* Cobertura das despesas */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <Clock size={14} className="text-amber-400" />
            <span>Cobertura das despesas</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300">
            {data.expenseCoverageMonths} meses
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Tranquilidade operacional</p>
        </div>

        {/* Reserva para investimentos */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <Wallet size={14} className="text-blue-400" />
            <span>Reserva para investimentos</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-400">
            {data.investmentReserve.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Expansão de sistemas</p>
        </div>

        {/* Resultado operacional */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Resultado operacional</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">
            {data.operatingResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Margem consolidada</p>
        </div>
      </div>
    </section>
  )
}
