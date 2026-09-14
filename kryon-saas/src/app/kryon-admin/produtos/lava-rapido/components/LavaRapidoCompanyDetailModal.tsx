'use client'

import React from 'react'
import {
  X,
  Building2,
  Car,
  Calendar,
  Layers,
  Percent,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  DollarSign,
  Sparkles
} from 'lucide-react'
import { LavaRapidoCompanyItem } from '../types'

interface LavaRapidoCompanyDetailModalProps {
  company: LavaRapidoCompanyItem | null
  onClose: () => void
}

export function LavaRapidoCompanyDetailModal({
  company,
  onClose
}: LavaRapidoCompanyDetailModalProps) {
  if (!company) return null

  const isVinculado = company.vinculoStatus === 'vinculado'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0C111D] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Car size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {company.shopName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                  {company.storeType}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  company.status === 'Ativo'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                }`}>
                  {company.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Identificador Operacional: <code className="text-slate-300">{company.shopSlug}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 360° Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {/* Organização Vinculada */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Building2 size={12} className="text-blue-400" />
              Organização Kryon
            </span>
            <p className="font-bold text-white text-sm">
              {company.organizationName}
            </p>
            <div className="pt-1">
              {isVinculado ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <CheckCircle2 size={10} />
                  Vínculo formal ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                  <AlertCircle size={10} />
                  Vínculo pendente
                </span>
              )}
            </div>
          </div>

          {/* Modelo Comercial */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Percent size={12} className="text-purple-400" />
              Modelo Comercial
            </span>
            <p className="font-bold text-purple-300 text-sm">
              {company.commercialModel}
            </p>
            <p className="text-[11px] text-slate-400">
              {company.commercialRule}
            </p>
          </div>

          {/* Data de Entrada / Trial */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Calendar size={12} className="text-cyan-400" />
              Data de Cadastro
            </span>
            <p className="font-bold text-white text-sm">
              {company.createdAt}
            </p>
            <p className="text-[11px] text-slate-400">
              {company.trialAte ? `Trial até: ${company.trialAte}` : 'Sem período de teste'}
            </p>
          </div>

          {/* Total de Lavagens */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Car size={12} className="text-blue-400" />
              Total de Lavagens (Período)
            </span>
            <p className="font-bold text-white text-lg">
              {company.totalOrdersInPeriod} ordens
            </p>
            <p className="text-[11px] text-slate-500">
              {company.inProgressOrdersInPeriod} em lavagem • {company.pendingOrdersInPeriod} na fila
            </p>
          </div>

          {/* Lavagens Concluídas */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" />
              Lavagens Concluídas
            </span>
            <p className="font-bold text-emerald-400 text-lg">
              {company.completedOrdersInPeriod} concluídas
            </p>
            <p className="text-[11px] text-slate-500">
              Total geral acumulado: {company.lifetimeCompletedOrders}
            </p>
          </div>

          {/* Comissão Gerada */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-400" />
              Comissão Kryon Gerada
            </span>
            <p className="font-black text-emerald-300 text-lg">
              {company.commissionInPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[11px] text-emerald-400/80">
              Total acumulado: {company.lifetimeCommission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Histórico Recente de Ordens de Serviço
            </h3>
            <span className="text-[10px] text-slate-500">
              {company.recentOrders.length} ordens exibidas
            </span>
          </div>

          {company.recentOrders.length > 0 ? (
            <div className="overflow-x-auto border border-white/[0.06] rounded-2xl bg-black/30">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-400 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Ordem</th>
                    <th className="py-2.5 px-3">Serviço</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                    <th className="py-2.5 px-3 text-right">Comissão Kryon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {company.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-slate-300">{order.date} {order.time}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{order.orderNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400">{order.serviceName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                          order.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}>
                          {order.statusLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {order.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {order.commission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center text-xs text-slate-400">
              Nenhuma ordem de serviço registrada para este estabelecimento no período.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
          >
            Fechar Visão 360°
          </button>
        </div>
      </div>
    </div>
  )
}
