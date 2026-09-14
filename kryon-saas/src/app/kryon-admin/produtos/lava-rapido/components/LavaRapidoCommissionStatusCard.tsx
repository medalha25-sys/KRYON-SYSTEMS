'use client'

import React from 'react'
import {
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck2
} from 'lucide-react'
import { LavaRapidoStats } from '../types'

interface LavaRapidoCommissionStatusCardProps {
  stats: LavaRapidoStats
  selectedPeriodLabel?: string
}

export function LavaRapidoCommissionStatusCard({
  stats,
  selectedPeriodLabel = 'Este mês'
}: LavaRapidoCommissionStatusCardProps) {
  return (
    <section className="p-6 rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0E1528] to-[#0A0D18] border border-blue-500/25 shadow-2xl shadow-black/50 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileCheck2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                Controle Comercial de Comissões: Gerada x Recebida x Em Aberto
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase">
                Auditoria Estrita
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Distinção transparente entre o valor faturável calculado pelas ordens concluídas e o status de liquidação.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Comissão Gerada */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} />
              1. Comissão Gerada
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Cálculo Real
            </span>
          </div>

          <div>
            <p className="text-2xl font-black text-white">
              {stats.kryonCommissionGenerated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.completedOrdersInPeriod} lavagens com status <code>completed</code> registradas em {selectedPeriodLabel.toLowerCase()}.
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.05] text-[11px] text-emerald-300/80 flex items-center gap-1">
            <CheckCircle2 size={12} className="shrink-0" />
            <span>Valor estritamente auditado server-side (R$ 2,00/ordem).</span>
          </div>
        </div>

        {/* 2. Comissão Recebida */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} />
              2. Comissão Recebida
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              Status Atual
            </span>
          </div>

          <div>
            <p className="text-lg font-bold text-amber-300">
              Não informado
            </p>
            <p className="text-xs text-slate-400 mt-1">
              O banco de dados atual não possui módulo de liquidação ou baixa financeira cadastrado.
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.05] text-[11px] text-slate-500 flex items-center gap-1">
            <Info size={12} className="shrink-0 text-amber-400" />
            <span>Nenhum dado financeiro fictício é gerado ou simulado.</span>
          </div>
        </div>

        {/* 3. Comissão em Aberto */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-blue-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} />
              3. Comissão em Aberto
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 text-[10px] font-bold border border-blue-500/30">
              Controle Futuro
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-300">
              Não disponível até existir controle de liquidação
            </p>
            <p className="text-xs text-slate-400 mt-1">
              O saldo em aberto depende do cruzamento entre ordens concluídas e confirmação de repasse bancário.
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.05] text-[11px] text-slate-500 flex items-center gap-1">
            <AlertCircle size={12} className="shrink-0 text-blue-400" />
            <span>Preparado para integração na etapa financeira.</span>
          </div>
        </div>
      </div>

      {/* Informative Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Transparência Zero-Trust da Kryon Systems:</p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            A Central de Controle Kryon Admin exibe exclusivamente dados comprováveis no banco de dados. A comissão gerada reflete fielmente as lavagens concluídas registradas pelos estabelecimentos. A baixa de pagamento será integrada com o futuro módulo de conciliação bancária sem afetar as regras operacionais existentes.
          </p>
        </div>
      </div>
    </section>
  )
}
