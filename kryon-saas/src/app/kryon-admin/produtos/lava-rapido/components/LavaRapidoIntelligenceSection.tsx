'use client'

import React from 'react'
import { BrainCircuit, Sparkles, ChevronRight, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { LavaRapidoIntelligenceInsight } from '../types'

interface LavaRapidoIntelligenceSectionProps {
  insights?: LavaRapidoIntelligenceInsight[]
  isLoading?: boolean
}

export function LavaRapidoIntelligenceSection({
  insights = [],
  isLoading = false
}: LavaRapidoIntelligenceSectionProps) {
  if (isLoading) {
    return (
      <section className="p-6 rounded-3xl bg-[#0C111D] border border-blue-500/20 animate-pulse h-40"></section>
    )
  }

  return (
    <section className="p-6 rounded-3xl bg-gradient-to-br from-[#0D1527] via-[#0F1026] to-[#0A0D18] border border-blue-500/30 shadow-2xl shadow-blue-950/40 relative overflow-hidden space-y-5">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex items-center gap-3.5 relative z-10">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-2 ring-white/10 shrink-0">
          <BrainCircuit size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>🧠 Kryon Intelligence — Insights do Lava Rápido</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
              Análise Factual
            </span>
          </div>
          <p className="text-xs text-blue-300/80 italic mt-0.5">
            Diagnósticos e alertas derivados exclusivamente dos registros reais do Supabase.
          </p>
        </div>
      </div>

      {/* Grid of Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {insights.map((insight) => {
          return (
            <div
              key={insight.id}
              className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-400/40 transition-all duration-300 space-y-2 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300">
                    {insight.tag}
                  </span>
                  <Sparkles size={13} className="text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xs font-bold text-white leading-snug">
                  {insight.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  {insight.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                <span>{insight.actionText}</span>
                <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
