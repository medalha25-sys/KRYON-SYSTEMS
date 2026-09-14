'use client'

import React, { useState } from 'react'
import { BrainCircuit, Sparkles, ArrowRight, X, ChevronRight } from 'lucide-react'
import { mockIntelligenceInsights } from '../mock-data'

interface InsightItem {
  id: string
  type: 'positive' | 'recommendation' | 'highlight'
  tag: string
  title: string
  description: string
  actionText: string
}

interface KryonIntelligenceCardProps {
  insights?: InsightItem[]
  isLoading?: boolean
}

export function KryonIntelligenceCard({
  insights = mockIntelligenceInsights,
  isLoading = false
}: KryonIntelligenceCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  if (isLoading) {
    return (
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0C111D] border border-blue-500/20 animate-pulse space-y-4">
        <div className="h-8 w-64 bg-white/10 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl"></div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0D1527] via-[#0F1026] to-[#0A0D18] border border-blue-500/30 shadow-2xl shadow-blue-950/40 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-2 ring-white/20">
                <BrainCircuit size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>🧠 Kryon Intelligence</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                    IA Estratégica
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-300/80 font-medium italic mt-0.5">
                  &ldquo;Dados reais que viram decisões.&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <span>Ver análises</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Insights Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            {insights.map((insight) => (
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
            ))}
          </div>

          <p className="text-[10px] text-slate-500 text-center sm:text-left">
            * Análises dinâmicas calculadas em tempo real com base nos registros do Supabase.
          </p>
        </div>
      </section>

      {/* Modal de Análises */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0C111D] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Central de Inteligência Kryon</h2>
                  <p className="text-xs text-slate-400">Relatório Analítico Consolidado em Tempo Real</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              {insights.map((ins, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-300">
                    {ins.tag}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{ins.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{ins.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
